/**
 * This module exports logic-related elements for handling errors in the application
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/ErrorMessage
 */
import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { FETCH_PRODUCTIONS,
  CREATE_PRODUCTION,
  OVERRIDE_PRODUCTION,
  IMPORT_PRODUCTION,
  DUPLICATE_PRODUCTION,
  DELETE_PRODUCTION,
} from '../HomeView/duck';
import {
  ACTIVATE_PRODUCTION,
  CREATE_RESOURCE,
  UPDATE_RESOURCE,
  DELETE_RESOURCE,
  UPDATE_PRODUCTION_METADATA,
  UPDATE_PRODUCTION_SETTINGS,
  UPDATE_SECTIONS_ORDER,
  CREATE_CONTEXTUALIZATION,
  UPDATE_CONTEXTUALIZATION,
  DELETE_CONTEXTUALIZATION,
  CREATE_CONTEXTUALIZER,
  UPDATE_CONTEXTUALIZER,
  DELETE_CONTEXTUALIZER
} from '../ProductionManager/duck';

export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';

export const SET_BROWSER_WARNING = 'SET_BROWSER_WARNING';

const CLEAR_ERROR_MESSAGES = 'CLEAR_ERROR_MESSAGES';

export const setErrorMessage = ( payload ) => ( {
  type: SET_ERROR_MESSAGE,
  payload
} );

export const clearErrorMessages = () => ( {
  type: CLEAR_ERROR_MESSAGES
} );

export const setBrowserWarning = ( payload ) => ( {
  type: SET_BROWSER_WARNING,
  payload
} );

const FAIL_DEFAULT_STATE = {
  requestFail: undefined,
  needsReload: false,
  lastError: undefined,
  malformedProductionError: undefined,
  browserWarning: undefined,
};
const fails = ( state = FAIL_DEFAULT_STATE, action ) => {
  const { payload } = action;
  let needsReload = false;
  switch ( action.type ) {
    case CLEAR_ERROR_MESSAGES:
      return FAIL_DEFAULT_STATE;

    /**
     * Errors and failures management
     */
    case SET_ERROR_MESSAGE:
      return {
        ...state,
        requestFail: payload.type,
        needsReload,
        lastError: action.payload,
        lastErrorTime: new Date().getTime()
      };
    case 'SAVE_PRODUCTION_FAIL':
      needsReload = true; /* eslint no-fallthrough : 0 */
    case `${FETCH_PRODUCTIONS}_FAIL`:
    case `${CREATE_PRODUCTION}_FAIL`:
    case `${OVERRIDE_PRODUCTION}_FAIL`:
    case `${IMPORT_PRODUCTION}_FAIL`:
    case `${DUPLICATE_PRODUCTION}_FAIL`:
    case `${DELETE_PRODUCTION}_FAIL`:
    // case `${LOGIN_PRODUCTION}_FAIL`:
    case `${CREATE_RESOURCE}_FAIL`:
    case `${UPDATE_RESOURCE}_FAIL`:
    case `${UPDATE_PRODUCTION_METADATA}_FAIL`:
    case `${UPDATE_PRODUCTION_SETTINGS}_FAIL`:
    case `${UPDATE_SECTIONS_ORDER}_FAIL`:
    case `${CREATE_CONTEXTUALIZATION}_FAIL`:
    case `${UPDATE_CONTEXTUALIZATION}_FAIL`:
    case `${DELETE_CONTEXTUALIZATION}_FAIL`:
    case `${CREATE_CONTEXTUALIZER}_FAIL`:
    case `${UPDATE_CONTEXTUALIZER}_FAIL`:
    case `${DELETE_CONTEXTUALIZER}_FAIL`:
      // TODO: Need to find a better way to display this validation error in toaster
      console.error( action );/* eslint no-console : 0 */
      return {
        ...state,
        requestFail: action.type,
        needsReload,
        lastError: action.payload || { error: action.error },
        lastErrorTime: new Date().getTime()
      };

    case `${DELETE_RESOURCE}_FAIL`:
      return {
        ...state,
      };
    case `${ACTIVATE_PRODUCTION}_FAIL`:
      if ( action.error && action.error.response && action.error.response.status === 422 ) {
        return {
          ...state,
          malformedProductionError: true
        };
      }
      return state;
    case SET_BROWSER_WARNING:
      return {
        ...state,
        browserWarning: payload
      };
    default:
      return state;
  }
};

const requestFail = ( state ) => state.fails.requestFail;
const needsReload = ( state ) => state.fails.needsReload;
const lastError = ( state ) => state.fails.lastError;
const lastErrorTime = ( state ) => state.fails.lastErrorTime;
const malformedProductionError = ( state ) => state.fails.malformedProductionError;
const browserWarning = ( state ) => state.fails.browserWarning;

export default combineReducers( {
  fails,
} );

export const selector = createStructuredSelector( {
  requestFail,
  needsReload,
  lastError,
  lastErrorTime,
  malformedProductionError,
  browserWarning,
} );

