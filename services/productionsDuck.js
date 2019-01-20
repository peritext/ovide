
/*
 * const mapToArray = ( obj ) => Object.keys( obj )
 *   .reduce( ( arr, key ) =>
 *     arr.concat( obj[key] )
 *   , [] );
 */

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

const validCollections = [ 'resources', 'contextualizations', 'contextualizers', 'assets', 'editions', 'sections' ];
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

  if ( validActionTypes.includes( actionType ) && validCollections.includes( collection ) ) {
    switch ( actionType ) {
      case 'create':
      case 'update':
        return Object.assign(
          {},
          state,
          {
            [payload.productionId]: Object.assign(
              {},
              state[payload.productionId],
              {
                [collection]: Object.assign(
                  {},
                  state[payload.productionId][collection],
                  {
                    [payload[target].id]: payload[target]
                  }
                )
              }
            )
          }
        );
      case 'delete':
      return Object.assign( {}, state, {
        [payload.productionId]: Object.assign(
          {},
          state[payload.productionId],
          {
            [collection]: Object.keys( state[payload.productionId][collection] )
              .reduce( ( result, thatObjectId ) => {
                if ( thatObjectId !== payload[`${target }Id`] ) {
                  return Object.assign( {}, result, {
                    [payload[`${target }Id`]]: state[payload.productionId][collection][payload[`${target }Id`]]
                  } );
                }
                return result;
              }, {} ),
          }
        )
      } );
      default:
    }
  }

  /**
   * 2.Handling more custom actions
   */
  switch ( action.type ) {
    default:
      return state;
    }
};
