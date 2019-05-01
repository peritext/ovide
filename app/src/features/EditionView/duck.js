/**
 * This module exports logic-related elements for the edition view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/EditionView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { getStatePropFromActionSet } from '../../helpers/reduxUtils';
import {
  requestCitationStylesList,
  requestCitationLocalesList,
} from '../../helpers/dataClient';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * UI
 */
import { RESET_VIEWS_UI } from '../EditionUiWrapper/duck';

const SET_EDITION_ASIDE_TAB_MODE = 'SET_EDITION_ASIDE_TAB_MODE';
const SET_EDITION_ASIDE_TAB_COLLAPSED = 'SET_EDITION_ASIDE_TAB_COLLAPSED';
const SET_LOADED_ASSET = 'SET_LOADED_ASSET';
const SET_DOWNLOAD_MODAL_OPEN = 'SET_DOWNLOAD_MODAL_OPEN';
const SET_SUMMARY_EDITED = 'SET_SUMMARY_EDITED';

const GET_CITATION_STYLES_LIST = 'GET_CITATION_STYLES_LIST';
const GET_CITATION_LOCALES_LIST = 'GET_CITATION_LOCALES_LIST';

const GENERATOR_MESSAGE = 'GENERATOR_MESSAGE';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setEditionAsideTabMode = ( payload ) => ( {
  type: SET_EDITION_ASIDE_TAB_MODE,
  payload,
} );

export const setEditionAsideTabCollapsed = ( payload ) => ( {
  type: SET_EDITION_ASIDE_TAB_COLLAPSED,
  payload,
} );

export const getCitationStylesList = () => ( {
  type: GET_CITATION_STYLES_LIST,
  promise: () => {
    return requestCitationStylesList();
  }
} );

export const getCitationLocalesList = () => ( {
  type: GET_CITATION_LOCALES_LIST,
  promise: () => {
    return requestCitationLocalesList();
  }
} );

export const setLoadedAsset = ( payload ) => ( {
  type: SET_LOADED_ASSET,
  payload,
} );

export const setDownloadModalOpen = ( payload ) => ( {
  type: SET_DOWNLOAD_MODAL_OPEN,
  payload,
} );

export const setSummaryEdited = ( payload ) => ( {
  type: SET_SUMMARY_EDITED,
  payload,
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const UI_DEFAULT_STATE = {
  editionAsideTabMode: 'settings',
  editionAsideTabCollapsed: false,
  referenceTypesVisible: false,
  downloadModalOpen: false,
  summaryEdited: false,
  lastGeneratorMessage: undefined,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {
    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;
    case SET_EDITION_ASIDE_TAB_MODE:
    case SET_EDITION_ASIDE_TAB_COLLAPSED:
    case SET_DOWNLOAD_MODAL_OPEN:
    case SET_SUMMARY_EDITED:
      const propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };
    case GENERATOR_MESSAGE:
      return {
        ...state,
        lastGeneratorMessage: payload
      };
    default:
      return state;
  }
}

const DATA_DEFAULT_STATE = {
  citationStylesList: [],
  citationLocalesList: [],
  loadedAssets: {}
};

/**
 * This redux reducer handles the state of temp data
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function data( state = DATA_DEFAULT_STATE, action ) {
  const { payload, result } = action;
  switch ( action.type ) {
    case SET_LOADED_ASSET:
      return {
        ...state,
        loadedAssets: {
          ...state.loadedAssets,
          [payload.id]: payload
        }
      };
    case `${GET_CITATION_LOCALES_LIST}_SUCCESS`:
      return {
        ...state,
        citationLocalesList: result.data,
      };
    case `${GET_CITATION_STYLES_LIST}_SUCCESS`:
      return {
        ...state,
        citationStylesList: result.data,
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
  data,
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const editionAsideTabMode = ( state ) => state.ui.editionAsideTabMode;
const editionAsideTabCollapsed = ( state ) => state.ui.editionAsideTabCollapsed;
const downloadModalOpen = ( state ) => state.ui.downloadModalOpen;
const summaryEdited = ( state ) => state.ui.summaryEdited;
const lastGeneratorMessage = ( state ) => state.ui.lastGeneratorMessage;

const citationStylesList = ( state ) => state.data.citationStylesList;
const citationLocalesList = ( state ) => state.data.citationLocalesList;
const loadedAssets = ( state ) => state.data.loadedAssets;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  editionAsideTabMode,
  editionAsideTabCollapsed,
  citationStylesList,
  citationLocalesList,
  loadedAssets,
  downloadModalOpen,
  summaryEdited,
  lastGeneratorMessage
} );
