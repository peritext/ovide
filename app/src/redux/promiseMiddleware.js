/**
 * Promise middleware
 * ===================================
 * If a promise is passed in an action,
 * this middleware will resolve it and dispatch related actions names
 * (ACTION_NAME when started, then ACTION_NAME_SUCCESS or ACTION_NAME_FAIL depending on promise outcome)
 */
import getConfig from '../helpers/getConfig';
const config = getConfig();
// const config = require('../../config');
const resetTime = config.resetTimeMs;

export default () => ( { dispatch, getState } ) => ( next ) => ( action ) => {
  // If the action is a function, execute it
  if ( typeof action === 'function' ) {
    return action( dispatch, getState );
  }

  const { promise, type, ...rest } = action;

  // If there is no promise in the action, ignore it
  if ( !promise ) {
    // pass the action to the next middleware
    return next( action );
  }
  // build constants that will be used to dispatch actions
  const REQUEST = type;
  const SUCCESS = `${REQUEST }_SUCCESS`;
  const FAIL = `${REQUEST }_FAIL`;
  const RESET = `${REQUEST }_RESET`;

  /*
   * Trigger the action once to dispatch
   * the fact promise is starting resolving (for loading indication for instance)
   */
  next( { ...rest, type: REQUEST } );

  // resolve promise
  return promise( dispatch, getState ).then(
    ( result ) => {
      if ( result.data && result.data.success !== undefined && result.data.success === false ) {
        return next( { ...rest, errorMessage: result.message, type: FAIL } );
      }

      /*
       * success -> dispatch action name + '_SUCCESS', promise result wrapped
       * in a 'result' action's prop
       */
      next( { ...rest, result, type: SUCCESS } );

      if ( action.callback ) {
        action.callback( null );
      }

      setTimeout( () =>
        next( { ...rest, result, type: RESET } )
        , resetTime );

      return true;
    }
    // error --> dispatch action name + '_FAIL'
  ).catch( ( error ) => {
    setTimeout( () =>
      next( { ...rest, type: RESET } )
      , resetTime );
    if ( action.callback ) {
      action.callback( error );
    }
    next( { ...rest, ...error, errorMessage: error, type: FAIL } );
  } );
};
