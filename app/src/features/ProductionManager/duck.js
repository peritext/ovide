/**
 * This module exports logic-related elements for handling edited production state
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/ProductionManager
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

// import { post, put, delete as del } from 'axios';
import Ajv from 'ajv';

import productionSchema from 'peritext-schemas/production';
import resourceSchema from 'peritext-schemas/resource';

import { updateEditionHistoryMap } from '../../helpers/localStorageUtils';

import {
  requestProduction,
  requestProductionUpdatePart,
  requestCitationStyle,
  requestCitationLocale,
  requestAssetCreation,
  requestAssetUpdate,
  requestAssetDeletion,
} from '../../helpers/dataClient';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
export const ACTIVATE_PRODUCTION = 'ACTIVATE_PRODUCTION';

/**
 * Section small objects
 */
export const UPDATE_PRODUCTION_METADATA = 'UPDATE_PRODUCTION_METADATA';
export const UPDATE_PRODUCTION_SETTINGS = 'UPDATE_PRODUCTION_SETTINGS';
export const UPDATE_SECTIONS_ORDER = 'UPDATE_SECTIONS_ORDER';

/**
 * resources CRUD
 */
export const CREATE_RESOURCE = 'CREATE_RESOURCE';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const DELETE_RESOURCE = 'DELETE_RESOURCE';

export const CREATE_ASSET = 'CREATE_ASSET';
export const UPDATE_ASSET = 'UPDATE_ASSET';
export const DELETE_ASSET = 'DELETE_ASSET';

export const CREATE_CONTEXTUALIZER = 'CREATE_CONTEXTUALIZER';
export const UPDATE_CONTEXTUALIZER = 'UPDATE_CONTEXTUALIZER';
export const DELETE_CONTEXTUALIZER = 'DELETE_CONTEXTUALIZER';

export const CREATE_CONTEXTUALIZATION = 'CREATE_CONTEXTUALIZATION';
export const UPDATE_CONTEXTUALIZATION = 'UPDATE_CONTEXTUALIZATION';
export const DELETE_CONTEXTUALIZATION = 'DELETE_CONTEXTUALIZATION';

export const CREATE_PRODUCTION_OBJECTS = 'CREATE_PRODUCTION_OBJECTS';

export const CREATE_EDITION = 'CREATE_EDITION';
export const UPDATE_EDITION = 'UPDATE_EDITION';
export const DELETE_EDITION = 'DELETE_EDITION';

export const UPDATE_CITATION_STYLE = 'UPDATE_CITATION_STYLE';
export const UPDATE_CITATION_LOCALE = 'UPDATE_CITATION_LOCALE';

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const PRODUCTION_DEFAULT_STATE = {
  production: undefined
};

/**
 * This redux reducer handles the state of edited production
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function production( state = PRODUCTION_DEFAULT_STATE, action ) {
  const { result, payload } = action;
  let contextualizations;
  let contextualizers;
  let contextualizersToDeleteIds;
  let contextualizationsToDeleteIds;
  let newSectionsOrder;
  let editions;
  switch ( action.type ) {
    case `${ACTIVATE_PRODUCTION}_SUCCESS`:
      return {
        ...state,
        production: result.data.production
      };

    /**
     * PRODUCTION METADATA
     */
    case `${UPDATE_PRODUCTION_METADATA}`:
    case `${UPDATE_PRODUCTION_METADATA}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            metadata: { ...payload.metadata },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * PRODUCTION SETTINGS
     */
    case `${UPDATE_PRODUCTION_SETTINGS}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            settings: { ...payload.settings },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * SECTIONS ORDER
     */
    case `${UPDATE_SECTIONS_ORDER}`:
    case `${UPDATE_SECTIONS_ORDER}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      newSectionsOrder = [ ...payload.sectionsOrder ];
      const resolvedSectionsOrder = [ ...payload.sectionsOrder ];

      return {
          ...state,
          production: {
            ...state.production,
            sectionsOrder: [ ...resolvedSectionsOrder ],
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * PRODUCTION RESOURCES
     */
    case `${CREATE_RESOURCE}`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            resources: {
              ...state.production.resources,
              [payload.resourceId]: {
                ...payload.resource,
                lastUpdateAt: payload.lastUpdateAt,
                createdAt: payload.lastUpdateAt
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPDATE_RESOURCE}`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            resources: {
              ...state.production.resources,
              [payload.resourceId]: {
                ...payload.resource,
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    case `${DELETE_RESOURCE}`:
    case `${DELETE_RESOURCE}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      contextualizations = { ...state.production.contextualizations };
      contextualizers = { ...state.production.contextualizers };

      /*
       * for now as the app does not allow to reuse the same contextualizer for several resources
       * we will delete associated contextualizers as well as associated contextualizations
       * (forseeing long edition sessions in which user create and delete a large number of contextualizations
       * if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)
       */

      // we will store contextualizers id to delete here
      contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys( contextualizations )
        .forEach( ( contextualizationId ) => {
          if ( contextualizations[contextualizationId].resourceId === payload.resourceId ) {
            contextualizationsToDeleteIds.push( contextualizationId );
            contextualizersToDeleteIds.push( contextualizations[contextualizationId].contextualizerId );
          }
        } );
      // proceed to deletions
      contextualizersToDeleteIds.forEach( ( contextualizerId ) => {
        delete contextualizers[contextualizerId];
      } );
      contextualizationsToDeleteIds.forEach( ( contextualizationId ) => {
        delete contextualizations[contextualizationId];
      } );

      return {
          ...state,
          production: {
            ...state.production,
            resources: Object.keys( state.production.resources )
              .reduce( ( thatResult, thatResourceId ) => {
                if ( thatResourceId === payload.resourceId ) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatResourceId]: state.production.resources[thatResourceId]
                };
              }, {} ),
            contextualizers,
            contextualizations,
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * PRODUCTION ASSETS
     */
    case `${CREATE_ASSET}`:
    case `${CREATE_ASSET}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            assets: {
              ...state.production.assets,
              [payload.assetId]: {
                ...payload.asset,
                data: undefined,
                lastUpdateAt: payload.lastUpdateAt,
                createdAt: payload.lastUpdateAt
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPDATE_ASSET}`:
    case `${UPDATE_ASSET}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            assets: {
              ...state.production.assets,
              [payload.assetId]: {
                ...payload.asset,
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    case `${DELETE_ASSET}`:
    case `${DELETE_ASSET}_SUCCESS`:
      if ( !state.production ) {
        return state;
      }
      return {
          ...state,
          production: {
            ...state.production,
            assets: Object.keys( state.production.assets )
              .reduce( ( thatResult, thatAssetId ) => {
                if ( thatAssetId === payload.assetId ) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatAssetId]: state.production.assets[thatAssetId]
                };
              }, {} ),
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * CONTEXTUALIZATION RELATED
     */
    case CREATE_PRODUCTION_OBJECTS:
      if ( !state.production ) {
        return state;
      }
      const {
        contextualizations: newContextualizations,
        contextualizers: newContextualizers,
        lastUpdateAt,
      } = payload;
      return {
        ...state,
        production: {
          ...state.production,
          contextualizations: {
            ...state.production.contextualizations,
            ...newContextualizations,
          },
          contextualizers: {
            ...state.production.contextualizers,
            ...newContextualizers,
          },
          lastUpdateAt,
        }
      };
    // contextualizations CUD
    case UPDATE_CONTEXTUALIZATION:
    case CREATE_CONTEXTUALIZATION:
      if ( !state.production ) {
        return state;
      }
      const {
        contextualizationId,
        contextualization
      } = payload;
      return {
        ...state,
        production: {
          ...state.production,
          contextualizations: {
            ...state.production.contextualizations,
            [contextualizationId]: contextualization
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case DELETE_CONTEXTUALIZATION:
      contextualizations = { ...state.production.contextualizations };
      delete contextualizations[payload.contextualizationId];
      return {
        ...state,
        production: {
          ...state.production,
          contextualizations,
          lastUpdateAt: payload.lastUpdateAt,
        }
      };

    /**
     * CONTEXTUALIZER RELATED
     */
    // contextualizers CUD
    case CREATE_CONTEXTUALIZER:
    case UPDATE_CONTEXTUALIZER:
      if ( !state.production ) {
        return state;
      }
      // productionId = action.productionId;
      const {
        contextualizerId,
        contextualizer
      } = payload;
      return {
        ...state,
        production: {
          ...state.production,
          contextualizers: {
            ...state.production.contextualizers,
            [contextualizerId]: contextualizer
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case DELETE_CONTEXTUALIZER:
      if ( !state.production ) {
        return state;
      }
      contextualizers = { ...state.production.contextualizers };
      delete contextualizers[payload.contextualizerId];
      return {
        ...state,
        production: {
          ...state.production,
          contextualizers,
          lastUpdateAt: payload.lastUpdateAt,
        }
      };

    /**
     * EDITION RELATED
     */
    // editions CUD
    case CREATE_EDITION:
    case UPDATE_EDITION:
      if ( !state.production ) {
        return state;
      }
      const {
        editionId,
        edition
      } = payload;
      return {
        ...state,
        production: {
          ...state.production,
          editions: {
            ...state.production.editions,
            [editionId]: {
              ...edition,
              lastUpdateAt: payload.lastUpdateAt,
            }
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case DELETE_EDITION:
      if ( !state.production ) {
        return state;
      }
      editions = { ...state.production.editions };
      return {
        ...state,
        production: {
          ...state.production,
          editions: Object.keys( editions ).reduce( ( res, thatEditionId ) => {
            if ( thatEditionId !== payload.editionId ) {
              return {
                ...res,
                [thatEditionId]: editions[thatEditionId]
              };
            }
            return res;
          }, {} ),
          lastUpdateAt: payload.lastUpdateAt,
        }
      };

    default:
      return state;
  }
}

/**
 * ===================================================
 * ACTION PAYLOAD SCHEMA
 * ===================================================
 */
const ajv = new Ajv();

const DEFAULT_PAYLOAD_SCHEMA = {
  type: 'object',
  properties: {
    productionId: productionSchema.properties.id
  }
};

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const activateProduction = ( payload ) => ( {
  type: ACTIVATE_PRODUCTION,
  payload,
  promise: () => {
    const { productionId } = payload;
    return requestProduction( productionId );
  },
} );

/**
 * Template for all production change related actions
 */
export const updateProduction = ( TYPE, payload, callback ) => {
  updateEditionHistoryMap( payload.productionId );
  // TODO: refactor validation schema more modular
  let payloadSchema = DEFAULT_PAYLOAD_SCHEMA;
  const sectionSchema = productionSchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'];
  switch ( TYPE ) {
    case UPDATE_PRODUCTION_METADATA:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          metadata: productionSchema.definitions.metadata,
        }
      };
      break;
    case UPDATE_PRODUCTION_SETTINGS:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          settings: productionSchema.properties.settings
        }
      };
      break;
    case UPDATE_SECTIONS_ORDER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionsOrder: productionSchema.properties.sectionsOrder,
        }
      };
      break;
      case CREATE_PRODUCTION_OBJECTS:
        payloadSchema = {
          ...DEFAULT_PAYLOAD_SCHEMA,
          properties: {
            ...DEFAULT_PAYLOAD_SCHEMA.properties,
            contextualizations: productionSchema.properties.contextualizations,
            contextualizers: productionSchema.properties.contextualizers,
          },
          definitions: productionSchema.definitions,
        };
        break;
    case CREATE_CONTEXTUALIZATION:
    case UPDATE_CONTEXTUALIZATION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualization: productionSchema.definitions.contextualization
        }
      };
      break;
    case DELETE_CONTEXTUALIZATION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizationId: productionSchema.definitions.contextualization.properties.id
        }
      };
      break;
    case CREATE_CONTEXTUALIZER:
    case UPDATE_CONTEXTUALIZER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizer: productionSchema.definitions.contextualizer
        }
      };
      break;
    case DELETE_CONTEXTUALIZER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizerId: productionSchema.definitions.contextualizer.properties.id
        }
      };
      break;
    case CREATE_EDITION:
    case UPDATE_EDITION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          edition: productionSchema.definitions.edition
        }
      };
      break;
    case DELETE_EDITION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          asset: productionSchema.definitions.edition.properties.id
        }
      };
      break;
    case CREATE_ASSET:
    case UPDATE_ASSET:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          asset: productionSchema.definitions.asset
        }
      };
      break;
    case DELETE_ASSET:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          asset: productionSchema.definitions.asset.properties.id
        }
      };
      break;
    case CREATE_RESOURCE:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id,
          resource: {
            type: resourceSchema.type,
            properties: resourceSchema.properties,
          }
        },
        definitions: resourceSchema.definitions,
      };
      break;
    case UPDATE_RESOURCE:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id,
          resource: {
            type: resourceSchema.type,
            properties: resourceSchema.properties,
          }
        },
        definitions: resourceSchema.definitions,
      };
      break;
    case DELETE_RESOURCE:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id
        }
      };
      break;
    default:
      payloadSchema = DEFAULT_PAYLOAD_SCHEMA;
      break;
  }

  const finalAction = {
    type: TYPE,
    payload: {
      ...payload,
      lastUpdateAt: new Date().getTime(),
    },
    callback,
    meta: {

      /*
       * remote: true,
       * broadcast: true,
       * room: payload.productionId,
       * userId: payload.userId,
       * blockType,
       * blockId,
       */
      validator: {
        payload: {
          func: () => {
            const val = ajv.compile( payloadSchema );
            return val( payload );
          },
          msg: () => {
            const val = ajv.compile( payloadSchema );
            return val.errors;
          },
        },
      },
    },
  };
  return {
    ...finalAction,
    promise: () => {
      return new Promise( ( resolve, reject ) => {
        // console.log( 'request production update part', finalAction.type );
        requestProductionUpdatePart( finalAction, production )
          .then( ( res ) => {
            // console.log( 'in promised for', finalAction.type );
            if ( typeof callback === 'function' ) {
              // console.warn( 'in callback after requestProductionUpdatePart for ', finalAction.type );
              callback( null, res );
            }
            resolve( res );
          } )
          .catch( ( err ) => {
            if ( typeof callback === 'function' ) {
              callback( err );
            }
            reject( err );
          } );
      } );
    },
  };
};

/**
 * Action creators related to edited production data edition
 */

export const createAsset = ( payload, callback ) => {
  return ( dispatch ) => new Promise( ( resolve, reject ) => {
    requestAssetCreation( payload.productionId, payload.asset )
      .then( ( ) => {
        dispatch(
          updateProduction( CREATE_ASSET, payload, callback )
        );
        resolve();
      } )
      .catch( ( err ) => {
        if ( typeof callback === 'function' ) {
          callback( err );
        }
        reject( err );
      } );
    } );
};

export const updateAsset = ( payload, callback ) => {
  return ( dispatch ) => new Promise( ( resolve, reject ) => {
    requestAssetUpdate( payload.productionId, payload.asset )
      .then( ( ) => {
        dispatch(
          updateProduction( UPDATE_ASSET, payload, callback )
        );
        resolve();
      } )
      .catch( ( err ) => {
        if ( callback ) {
          callback( err );
        }
        reject( err );
      } );/* eslint no-console : 0 */
    } );
};

export const deleteAsset = ( payload, callback ) => {
  return ( dispatch ) => new Promise( ( resolve, reject ) => {
    requestAssetDeletion( payload.productionId, payload.asset )
      .then( ( ) => {
        dispatch(
          updateProduction( DELETE_ASSET, payload, callback )
        );
        resolve();
      } )
      .catch( ( err ) => {
        if ( typeof callback === 'function' ) {
          callback( err );
        }
        reject( err );
      } );/* eslint no-console : 0 */
    } );
};

export const updateProductionMetadata = ( payload, callback ) => updateProduction( UPDATE_PRODUCTION_METADATA, payload, callback );
export const updateProductionSettings = ( payload, callback ) => updateProduction( UPDATE_PRODUCTION_SETTINGS, payload, callback );
export const updateSectionsOrder = ( payload, callback ) => updateProduction( UPDATE_SECTIONS_ORDER, payload, callback );

export const createResource = ( payload, callback ) => updateProduction( CREATE_RESOURCE, payload, callback );
export const updateResource = ( payload, callback ) => updateProduction( UPDATE_RESOURCE, payload, callback );
export const deleteResource = ( payload, callback ) => updateProduction( DELETE_RESOURCE, payload, callback );

export const createContextualizer = ( payload, callback ) => updateProduction( CREATE_CONTEXTUALIZER, payload, callback );
export const updateContextualizer = ( payload, callback ) => updateProduction( UPDATE_CONTEXTUALIZER, payload, callback );
export const deleteContextualizer = ( payload, callback ) => updateProduction( DELETE_CONTEXTUALIZER, payload, callback );

export const createContextualization = ( payload, callback ) => updateProduction( CREATE_CONTEXTUALIZATION, payload, callback );
export const updateContextualization = ( payload, callback ) => updateProduction( UPDATE_CONTEXTUALIZATION, payload, callback );
export const deleteContextualization = ( payload, callback ) => updateProduction( DELETE_CONTEXTUALIZATION, payload, callback );

export const createProductionObjects = ( payload, callback ) => updateProduction( CREATE_PRODUCTION_OBJECTS, payload, callback );

export const createEdition = ( payload, callback ) => updateProduction( CREATE_EDITION, payload, callback );
export const updateEdition = ( payload, callback ) => updateProduction( UPDATE_EDITION, payload, callback );
export const deleteEdition = ( payload, callback ) => updateProduction( DELETE_EDITION, payload, callback );

export const updateCitationStyle = ( payload ) => {
  return ( dispatch ) => {
    requestCitationStyle( payload.citationStyleId )
      .then( ( { data } ) => {
        const citationStyle = {
          data,
          title: payload.title,
          id: payload.citationStyleId,
        };
        const edition = {
          ...payload.edition,
          data: {
            ...payload.edition.data,
            citationStyle,
          }
        };
        const newPayload = {
          edition,
          productionId: payload.productionId,
          editionId: edition.id,
        };
        return dispatch(
          updateProduction( UPDATE_EDITION, newPayload )
        );
      } )
      .catch( console.error );/* eslint no-console : 0 */
  };
};

export const updateCitationLocale = ( payload ) => {
  return ( dispatch ) => {
    requestCitationLocale( payload.citationLocaleId )
      .then( ( { data } ) => {
        const citationLocale = {
          data,
          names: payload.names,
          id: payload.citationLocaleId,
        };
        const edition = {
          ...payload.edition,
          data: {
            ...payload.edition.data,
            citationLocale,
          }
        };
        const newPayload = {
          edition,
          productionId: payload.productionId,
          editionId: edition.id,
        };
        return dispatch(
          updateProduction( UPDATE_EDITION, newPayload )
        );
      } )
      .catch( console.error );/* eslint no-console : 0 */
  };
};

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers( {
  production
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const editedProduction = ( state ) => state.production.production;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  editedProduction
} );
