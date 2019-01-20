/**
 * This module exports logic-related elements for the montages feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/Corpora
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { inElectron } from '../helpers/electronUtils';

let electronStore;
if ( inElectron ) {
  const electronStoreLib = require( 'electron-store' );
  electronStore = new electronStoreLib();
}

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

export const FORGET_DATA = '§ovide/ChunksEdition/FORGET_DATA';

const SET_RGPD_AGREEMENT_PROMPTED = '§ovide/ChunksEdition/SET_RGPD_AGREEMENT_PROMPTED';

export const forgetData = ( ) => ( {
  type: FORGET_DATA,
} );

export const setRgpdAgreementPrompted = ( payload ) => ( {
  type: SET_RGPD_AGREEMENT_PROMPTED,
  payload
} );

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
      electronStore.set( '§ovide-lang', action.lang );
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
 * The module exports a reducer
 */
export default combineReducers( {
  utils,
} );

/*
 * ===========
 * ===========
 * ===========
 * ===========
 * Selectors
 * ===========
 * ===========
 * ===========
 * ===========
 */
/**
 * Selectors related to the feature
 */

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
} );
