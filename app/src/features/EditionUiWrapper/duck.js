/**
 * This module exports logic-related elements for edition views UI
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/EditionUiWrapper
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { inElectron } from '../../helpers/electronUtils';

let electronStore;
if ( inElectron ) {
  const electronStoreLib = require( 'electron-store' );
  electronStore = new electronStoreLib();
}

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */

const TOGGLE_NAVBAR_OPEN = 'TOGGLE_NAVBAR_OPEN';

export const RESET_VIEWS_UI = 'RESET_VIEWS_UI';

const SET_RGPD_AGREEMENT_PROMPTED = 'ovide/ChunksEdition/SET_RGPD_AGREEMENT_PROMPTED';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const toggleNavbarOpen = () => ( {
  type: TOGGLE_NAVBAR_OPEN,
} );

export const resetViewsUi = () => ( {
  type: RESET_VIEWS_UI
} );

export const setRgpdAgreementPrompted = ( payload ) => ( {
  type: SET_RGPD_AGREEMENT_PROMPTED,
  payload
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const UI_DEFAULT_STATE = {
  exportModalOpen: false,
  navbarOpen: false,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  switch ( action.type ) {

    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;

    case TOGGLE_NAVBAR_OPEN:
      return {
        ...state,
        navbarOpen: !state.navbarOpen,
      };
    default:
      return state;
  }
}

/*
 * ===========
 * ===========
 * ===========
 * ===========
 * Exported reducer
 * ===========
 * ===========
 * ===========
 * ===========
 */
const utils = ( state = {}, action ) => {
  switch ( action.type ) {
  case 'REDUX_I18N_SET_LANGUAGE':
    if ( inElectron ) {
      electronStore.set( 'ovide-lang', action.lang );
    }
    return state;
  case SET_RGPD_AGREEMENT_PROMPTED:
    return {
      rgpdAgreementPrompted: action.payload,
    };
  default:
    return state;
  }
};

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers( {
  ui,
  utils,
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */
const navbarOpen = ( state ) => state.ui.navbarOpen;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  navbarOpen,
} );
