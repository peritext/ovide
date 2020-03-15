/**
 * This module exports logic-related elements for the home view
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/HomeView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { v4 as genId } from 'uuid';

import { createDefaultProduction, validateProduction, convertQuinoaStoryToProduction } from '../../helpers/schemaUtils';

import { parseImportedFile } from '../../helpers/bundlersUtils';
import { getStatePropFromActionSet } from '../../helpers/reduxUtils';

import {
  requestProductions,
  requestProductionCreation,
  requestProduction,
  requestProductionDeletion,
  requestAssetData,

  /*
   * requestProductionUpdate,
   * requestProductionUpdatePart,
   * requestChunkViewData,
   */
} from '../../helpers/dataClient';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * ui
 */
import { RESET_VIEWS_UI } from '../EditionUiWrapper/duck';

const SET_TAB_MODE = 'SET_TAB_MODE';
const SET_NEW_PRODUCTION_OPEN = 'SET_NEW_PRODUCTION_OPEN';
const SET_NEW_PRODUCTION_TAB_MODE = 'SET_NEW_PRODUCTION_TAB_MODE';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
const SET_SORTING_MODE = 'SET_SORTING_MODE';
const SET_PREVIEWED_PRODUCTION_ID = 'SET_PREVIEWED_PRODUCTION_ID';
const SET_EDITION_HIPRODUCTION = 'SET_EDITION_HIPRODUCTION';
const SET_PRODUCTION_DELETE_ID = 'SET_PRODUCTION_DELETE_ID';
const SET_OVERRIDE_IMPORT = 'SET_OVERRIDE_IMPORT';
const SET_OVERRIDE_PRODUCTION_MODE = 'SET_OVERRIDE_PRODUCTION_MODE';
const SET_DOWNLOAD_MODAL_VISIBLE = 'SET_DOWNLOAD_MODAL_VISIBLE';
const SET_IS_IMPORTING = 'SET_IS_IMPORTING';
const SET_IS_DELETING = 'SET_IS_DELETING';
const SET_EXAMPLES_OPEN = 'SET_EXAMPLES_OPEN';

export const FETCH_PRODUCTIONS = 'FETCH_PRODUCTIONS';
export const CREATE_PRODUCTION = 'CREATE_PRODUCTION';
export const OVERRIDE_PRODUCTION = 'OVERRIDE_PRODUCTION';
export const DUPLICATE_PRODUCTION = 'DUPLICATE_PRODUCTION';
export const DELETE_PRODUCTION = 'DELETE_PRODUCTION';
export const IMPORT_PRODUCTION = 'IMPORT_PRODUCTION';

/**
 * data
 */
const SET_NEW_PRODUCTION_METADATA = 'NEW_PRODUCTION_METADATA';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setTabMode = ( payload ) => ( {
  type: SET_TAB_MODE,
  payload
} );
export const setIsImporting = ( payload ) => ( {
  type: SET_IS_IMPORTING,
  payload
} );
export const setIsDeleting = ( payload ) => ( {
  type: SET_IS_DELETING,
  payload
} );
export const setNewProductionOpen = ( payload ) => ( {
  type: SET_NEW_PRODUCTION_OPEN,
  payload
} );
export const setNewProductionTabMode = ( payload ) => ( {
  type: SET_NEW_PRODUCTION_TAB_MODE,
  payload
} );
export const setSearchString = ( payload ) => ( {
  type: SET_SEARCH_STRING,
  payload
} );
export const setSortingMode = ( payload ) => ( {
  type: SET_SORTING_MODE,
  payload
} );
export const setPreviewedProductionId = ( payload ) => ( {
  type: SET_PREVIEWED_PRODUCTION_ID,
  payload
} );

export const setExamplesOpen = ( payload ) => ( {
  type: SET_EXAMPLES_OPEN,
  payload
} );

export const setNewProductionMetadata = ( payload ) => ( {
  type: SET_NEW_PRODUCTION_METADATA,
  payload
} );
export const setEditionHistory = ( payload ) => ( {
  type: SET_EDITION_HIPRODUCTION,
  payload
} );
export const setProductionDeleteId = ( payload ) => ( {
  type: SET_PRODUCTION_DELETE_ID,
  payload
} );
export const setOverrideProductionMode = ( payload ) => ( {
  type: SET_OVERRIDE_PRODUCTION_MODE,
  payload,
} );

export const setDownloadModalVisible = ( payload ) => ( {
  type: SET_DOWNLOAD_MODAL_VISIBLE,
  payload,
} );

export const fetchProductions = () => ( {
  type: FETCH_PRODUCTIONS,
  promise: () => {
    return requestProductions();
  },
} );

export const createProduction = ( { payload }, callback ) => ( {
  type: CREATE_PRODUCTION,
  payload,
  promise: () => {
    return requestProductionCreation( {
      id: genId(),
      ...payload,
    } );
  },
  callback,
} );

export const overrideProduction = ( { payload } ) => ( {
  type: OVERRIDE_PRODUCTION,
  payload,
  promise: () => {
    // return put( serverRequestUrl, payload, options );
  },
} );

export const importProduction = ( file, callback ) => ( {
  type: IMPORT_PRODUCTION,
  promise: () =>
    new Promise( ( resolve, reject ) => {
      return new Promise( ( res, rej ) => {
                if ( typeof file === 'string' ) {
                  try {
                    const parsed = JSON.parse( file.trim() );
                    res( parsed );
                  }
 catch ( e ) {
                    rej( e );
                  }
                }
                else if ( file.name ) {
                  parseImportedFile( file )
                  .then( res ).catch( rej );
                }
                else {
                  res( file );
                }
              } )
             .then( ( production ) => {

                /**
                 *  add a fonio story import hook here
                 * - transform data-intensive resources according to the assets system
                 * - map metadata of objects (sections, resources, authors)
                 */
                if ( production.type === 'quinoa-story' ) {
                  production = convertQuinoaStoryToProduction( production );
                }
                const validation = validateProduction( production );
                if ( validation.valid ) {
                  // resolve( production );
                  requestProductionCreation( {
                    ...production,
                    id: genId()
                  } )
                  .then( ( res ) => {
                    if ( typeof callback === 'function' ) {
                      callback( null, res );
                    }
                    resolve( res );
                  } )
                  .catch( ( err ) => {
                    if ( typeof callback === 'function' ) {
                      callback( {
                        error: err,
                        type: 'data-creation-error'
                      } );
                    }
                    reject( err );
                  } );
                }
                else {
                  reject( validation.errors );
                  if ( typeof callback === 'function' ) {
                    callback( {
                      error: validation.errors,
                      type: 'validation-error'
                     } );
                   }
                }
             } )
             .catch( ( e ) => {
               if ( typeof callback === 'function' ) {
                callback( {
                  error: e,
                  type: 'parsing-error'
                 } );
               }
               reject( e );
            } );
    } ),
} );

/**
 * Displays an override warning when user tries to import
 * a production that has the same id as an existing one
 * @param {object} candidate - the data of the production waiting to be imported or not instead of existing one
 * @return {object} action - the redux action to dispatch
 */
export const setOverrideImport = ( payload ) => ( {
  type: SET_OVERRIDE_IMPORT,
  payload
} );

export const duplicateProduction = ( payload ) => ( {
  type: DUPLICATE_PRODUCTION,
  payload,
  promise: () => {

    return new Promise( ( resolve, reject ) => {
      requestProduction( payload.production.id )
        .then( ( { data: { production } } ) => {
          return Object.keys( production.assets )
          .reduce( ( cur, assetId ) =>
            cur.then( ( activeProduction ) => {
              return new Promise( ( res1, rej1 ) => {
                const asset = activeProduction.assets[assetId];
                requestAssetData( { productionId: activeProduction.id, asset } )
                .then( ( assetData ) => {
                  const newAsset = {
                    ...asset,
                    data: assetData
                  };
                  const newProduction = {
                    ...activeProduction,
                    assets: {
                      ...activeProduction.assets,
                      [asset.id]: newAsset
                    }
                  };
                  res1( newProduction );
                } )
                .catch( rej1 );
              } );
            } )
          , Promise.resolve( production ) );
        } )
        .then( ( production ) => {
          return requestProductionCreation( {
           ...production,
            id: genId()
          } );
        } )
        .then( resolve )
        .catch( reject );
    } );
  },
} );

export const deleteProduction = ( payload, callback ) => ( {
  type: DELETE_PRODUCTION,
  payload,
  promise: () => {
    return new Promise( ( resolve, reject ) => {
      requestProductionDeletion( payload.productionId, payload.production )
        .then( ( result ) => {
          if ( typeof callback === 'function' ) {
            callback( null );
          }
          resolve( result );
        } )
        .catch( ( error ) => {
          if ( typeof callback === 'function' ) {
            callback( error );
          }
          reject( error );
        } );

    } );
  },
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */
/**
 * Default/fallback state of the ui state
 */
const UI_DEFAULT_STATE = {

  /**
   * Tab of the main view
   */
  tabMode: 'productions',

  /**
   * Whether a new production is being edited
   */
  newProductionOpen: false,

  /**
   * Mode for the production creation interface (['form', 'file'])
   */
  newProductionTabMode: 'form',

  /**
   * string for searching the productions
   */
  searchString: '',

  /**
   * sorting mode of the productions (['last modification', 'creation date', 'title'])
   */
  sortingMode: 'edited recently',

  /**
   * id of a production to display as a resume/readonly way
   */
  previewedProductionId: undefined,

  /**
   * id of a production to delete
   */
  productionDeleteId: undefined,

  /**
   * status of the import production process (['processing', 'fail', 'success'])
   */
  importProductionStatus: undefined,

  /**
   * status of the create production process (['processing', 'fail', 'success'])
   */
  createProductionStatus: undefined,

  /**
   * status of the override production process (['processing', 'fail', 'success'])
   */
  overrideProductionStatus: undefined,

  /**
   * status of the delete production process (['processing', 'fail', 'success'])
   */
  deleteProductionStatus: undefined,

  /**
   * message to show if imported production is exist
   */
  overrideImport: false,

  /**
   * mode of override production ['create', 'override']
   */
  overrideProductionMode: undefined,

  downloadModalVisible: false,

  isImporting: false,

  isDeleting: false,

  examplesOpen: false,
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  let propName;
  switch ( action.type ) {

    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;
    case SET_TAB_MODE:
    case SET_SEARCH_STRING:
    case SET_SORTING_MODE:
    case SET_PREVIEWED_PRODUCTION_ID:
    case SET_PRODUCTION_DELETE_ID:
    case SET_OVERRIDE_IMPORT:
    case SET_OVERRIDE_PRODUCTION_MODE:
    case SET_DOWNLOAD_MODAL_VISIBLE:
    case SET_IS_IMPORTING:
    case SET_IS_DELETING:
    case SET_EXAMPLES_OPEN:
      propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };
    case SET_NEW_PRODUCTION_OPEN:
    case SET_NEW_PRODUCTION_TAB_MODE:
      propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload,
        importProductionStatus: undefined,
        createProductionStatus: undefined,
        overrideProductionStatus: undefined,
        overrideImport: false,
      };
    case `${CREATE_PRODUCTION}_SUCCESS`:
      return {
        ...state,
        createProductionStatus: 'success'
      };
    case `${CREATE_PRODUCTION}_FAIL`:
      return {
        ...state,
        createProductionStatus: 'fail'
      };
    case `${OVERRIDE_PRODUCTION}_FAIL`:
      return {
        ...state,
        overrideProductionStatus: 'fail'
      };
    case `${DELETE_PRODUCTION}_SUCCESS`:
      return {
        ...state,
        deleteProductionStatus: 'success',
        productionDeleteId: undefined
      };
    case `${DELETE_PRODUCTION}_FAIL`:
      return {
        ...state,
        deleteProductionStatus: 'fail'
      };
    case `${IMPORT_PRODUCTION}_FAIL`:
      return {
        ...state,
        importProductionStatus: 'fail'
      };
    default:
      return state;
  }
}

const DATA_DEFAULT_STATE = {

  /**
   * temp data of the new production form
   */
  newProduction: {},

  /**
   * list of productions metadata
   */
  productions: {},
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function data( state = DATA_DEFAULT_STATE, action ) {
  const { payload } = action;
  let production;
  let newProduction;
  switch ( action.type ) {
    case SET_NEW_PRODUCTION_OPEN:
      newProduction = createDefaultProduction();
      return {
        ...state,
        newProduction
      };
    case SET_NEW_PRODUCTION_TAB_MODE:
      if ( payload === 'form' ) {
        newProduction = createDefaultProduction();
        return {
          ...state,
          newProduction
        };
      }
      else return state;
    case SET_OVERRIDE_PRODUCTION_MODE:
      if ( payload === 'create' ) {
        return {
          ...state,
          newProduction: {
            ...state.newProduction,
            metadata: {
              ...state.newProduction.metadata,
              title: `${state.newProduction.metadata.title} - copy`
            }
          }
        };
      }
      else return state;
    case `${IMPORT_PRODUCTION}_SUCCESS`:
      return {
        ...state,
        newProduction: action.result,
      };
    case `${FETCH_PRODUCTIONS}_SUCCESS`:
      const { data: thatData } = action.result;
      const productionsList = thatData.productions;
      delete productionsList._id;
      delete productionsList._rev;
      return {
        ...state,
        productions: productionsList
      };
    case `${CREATE_PRODUCTION}_SUCCESS`:
    case `${DUPLICATE_PRODUCTION}_SUCCESS`:
      production = action.result.data && action.result.data.production;
      return {
        ...state,
        productions: {
          ...state.productions,
          [production.id]: production
        }
      };
    case `${OVERRIDE_PRODUCTION}_SUCCESS`:
      production = action.result.data;
      return {
        ...state,
        productions: {
          ...state.productions,
          [production.id]: production
        }
      };
    case `${DELETE_PRODUCTION}_SUCCESS`:
      const newProductions = { ...state.productions };
      delete newProductions[payload.productionId];
      return {
        ...state,
        productions: newProductions
      };
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers( {
  ui,
  data
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const tabMode = ( state ) => state.ui.tabMode;
const newProductionOpen = ( state ) => state.ui.newProductionOpen;
const newProductionTabMode = ( state ) => state.ui.newProductionTabMode;
const searchString = ( state ) => state.ui.searchString;
const sortingMode = ( state ) => state.ui.sortingMode;
const productionDeleteId = ( state ) => state.ui.productionDeleteId;
const importProductionStatus = ( state ) => state.ui.importProductionStatus;
const createProductionStatus = ( state ) => state.ui.createProductionStatus;
const overrideProductionStatus = ( state ) => state.ui.overrideProductionStatus;
const deleteProductionStatus = ( state ) => state.ui.deleteProductionStatus;
const overrideImport = ( state ) => state.ui.overrideImport;
const overrideProductionMode = ( state ) => state.ui.overrideProductionMode;
const downloadModalVisible = ( state ) => state.ui.downloadModalVisible;
const isImporting = ( state ) => state.ui.isImporting;
const isDeleting = ( state ) => state.ui.isDeleting;
const examplesOpen = ( state ) => state.ui.examplesOpen;

const newProduction = ( state ) => state.data.newProduction;
const productions = ( state ) => state.data.productions;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  tabMode,
  newProductionOpen,
  downloadModalVisible,
  newProductionTabMode,
  searchString,
  sortingMode,
  newProduction,
  productionDeleteId,
  createProductionStatus,
  overrideProductionStatus,
  deleteProductionStatus,
  importProductionStatus,
  overrideImport,
  overrideProductionMode,
  productions,
  isImporting,
  isDeleting,
  examplesOpen,
} );
