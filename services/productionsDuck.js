
/*
 * ===========
 * ===========
 * ===========
 * ===========
 * Action names
 * ===========
 * ===========
 * ===========
 * ===========
 */

const validCollections = [ 'resources', 'contextualizations', 'contextualizers', 'assets', 'editions', 'tags' ];
const validActionTypes = [ 'create', 'update', 'delete' ];

/*
 * ===========
 * ===========
 * ===========
 * ===========
 * Reducers
 * ===========
 * ===========
 * ===========
 * ===========
 */

const STORIES_DEFAULT_STATE = {
};

/**
 * This redux reducer handles the ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
module.exports = function( state = STORIES_DEFAULT_STATE, action ) {
  const payload = action.payload;

  /**
   * 1.Handling simple, standardized CRUD on production collections objects
   */
  const typeParts = action.type.toLowerCase().split( '_' );
  const actionType = typeParts[0];
  const target = typeParts[1];
  const collection = `${target }s`;
  let newState;
  const production = state[payload.productionId];

  if ( validActionTypes.includes( actionType ) && validCollections.includes( collection ) ) {
    switch ( actionType ) {
      case 'create':
      case 'update':
        newState = Object.assign(
          {},
          state,
          {
            [payload.productionId]: Object.assign(
              {},
              production,
              {
                [collection]: Object.assign(
                  {},
                  production[collection],
                  {
                    [payload[target].id]: payload[target],
                  }
                ),
                lastUpdateAt: payload.lastUpdateAt,
              }
            )
          }
        );
        return newState;
      case 'delete':
        newState = Object.assign( {}, state, {
        [payload.productionId]: Object.assign(
          {},
          state[payload.productionId],
          {
            [collection]: Object.keys( state[payload.productionId][collection] )
              .reduce( ( result, thatObjectId ) => {
                if ( thatObjectId !== payload[`${target }Id`] ) {
                  return Object.assign( {}, result, {
                    [thatObjectId]: state[payload.productionId][collection][thatObjectId]
                  } );
                }
                return result;
              }, {} ),
          }
        )
      } );
      if ( action.type === 'DELETE_RESOURCE' ) {
        const contextualizations = Object.assign( {}, production.contextualizations );
        const contextualizers = Object.assign( {}, production.contextualizers );

        const contextualizationsToDeleteIds = Object.keys( contextualizations )
        .filter( ( id ) => {
          return contextualizations[id].sourceId === payload.resourceId;
        } );
        const contextualizersToDeleteIds = [];

        contextualizationsToDeleteIds
        .forEach( ( id ) => {
          contextualizersToDeleteIds.push( contextualizations[id].contextualizerId );
        } );

        contextualizersToDeleteIds.forEach( ( contextualizerId ) => {
          delete contextualizers[contextualizerId];
        } );
        contextualizationsToDeleteIds.forEach( ( contextualizationId ) => {
          delete contextualizations[contextualizationId];
        } );
        const newSectionsOrder = production.sectionsOrder.filter( ( { resourceId } ) => resourceId !== payload.resourceId );
        newState[payload.productionId].sectionsOrder = newSectionsOrder;
        newState[payload.productionId].contextualizers = contextualizers;
        newState[payload.productionId].contextualizations = contextualizations;
      }
 else if ( action.type === 'DELETE_TAG' ) {

        let resources = Object.assign( {}, production.resources );

        resources = Object.keys( resources ).reduce( ( res, resourceId ) => {
          const resource = resources[resourceId];
          if ( resource.metadata.tags && resource.metadata.tags.includes( payload.tagId ) ) {
            resource.metadata.tags = resource.metadata.tags.filter( ( t ) => t !== payload.tagId );
          }
          return Object.assign( res, resource );
        }, {} );
        newState[payload.productionId].resources = resources;
      }
      return newState;
      default:
        return state;
    }
  }

  /**
   * 2.Handling more custom actions
   */
  switch ( action.type ) {
    case 'CREATE_PRODUCTION_OBJECTS':
      return Object.assign(
        {},
        state,
        {
          [payload.productionId]: Object.assign(
            {},
            state[payload.productionId],
            {
              contextualizations: Object.assign( {}, state[payload.productionId].contextualizations, payload.contextualizations ),
              contextualizers: Object.assign( {}, state[payload.productionId].contextualizers, payload.contextualizers ),
              lastUpdateAt: payload.lastUpdateAt,
            }
          ),
        }
      );
    case 'UPDATE_PRODUCTION_METADATA':
    return Object.assign(
      {},
      state,
      {
        [payload.productionId]: Object.assign(
          {},
          state[payload.productionId],
          {
            metadata: payload.metadata,
            lastUpdateAt: payload.lastUpdateAt,
          }
        )
      }
    );
    case 'UPDATE_PRODUCTION_SETTINGS':
    return Object.assign(
      {},
      state,
      {
        [payload.productionId]: Object.assign(
          {},
          state[payload.productionId],
          {
            settings: payload.settings,
            lastUpdateAt: payload.lastUpdateAt,
          }
        )
      }
    );
    case 'UPDATE_SECTIONS_ORDER':
    const oldSectionsOrder = [ ...state[payload.productionId].production.sectionsOrder ];
    const newSectionsOrder = [ ...payload.sectionsOrder ];
    let resolvedSectionsOrder = [ ...payload.sectionsOrder ];

      /*
       * new order is bigger than older order
       * (probably because a user deleted a section in the meantime)
       * --> we filter the new order with only existing sections
       */
      if ( newSectionsOrder.length > oldSectionsOrder.length ) {
          resolvedSectionsOrder = newSectionsOrder.filter(
            ( newSectionId ) => oldSectionsOrder.indexOf( newSectionId ) > -1
          );

      /*
       * new order is smaller than older order
       * (probably because a user created a section in the meantime)
       * --> we add created sections to the new sections order
       */
      }
      else if ( newSectionsOrder.length < oldSectionsOrder.length ) {
        resolvedSectionsOrder = [
          ...newSectionsOrder,
          ...oldSectionsOrder.slice( newSectionsOrder.length )
        ];
      }
      return Object.assign(
        {},
        state,
        {
          [payload.productionId]: Object.assign(
            {},
            state[payload.productionId],
            {
              sectionsOrder: resolvedSectionsOrder,
              lastUpdateAt: payload.lastUpdateAt,
            }
          )
        }
      );
    default:
      return state;
    }
};
