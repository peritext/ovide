/**
 * This module exports logic-related elements for the library view
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/LibraryView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { getStatePropFromActionSet } from '../../helpers/reduxUtils';

// import resourceSchema from 'quinoa-schemas/resource';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */

/**
 * ui
 */
import { RESET_VIEWS_UI } from '../EditionUiWrapper/duck';

const SET_NEW_EDITION_PROMPTED = 'SET_NEW_EDITION_PROMPTED';
const SET_PROMPTED_TO_DELETE_EDITION_ID = 'SET_PROMPTED_TO_DELETE_EDITION_ID';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
const SET_OPTIONS_VISIBILITY = 'SET_OPTIONS_VISIBILITY';
const SET_SORT_VALUE = 'SET_SORT_VALUE';
const SET_FILTER_VALUES = 'SET_FILTER_VALUES';

/**
 * data
 */
/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setNewEditionPrompted = ( payload ) => ( {
  type: SET_NEW_EDITION_PROMPTED,
  payload,
} );
export const setPromptedToDeleteEditionId = ( payload ) => ( {
  type: SET_PROMPTED_TO_DELETE_EDITION_ID,
  payload,
} );
export const setSearchString = ( payload ) => ( {
  type: SET_SEARCH_STRING,
  payload,
} );
export const setOptionsVisibility = ( payload ) => ( {
  type: SET_OPTIONS_VISIBILITY,
  payload,
} );
export const setSortValue = ( payload ) => ( {
  type: SET_SORT_VALUE,
  payload,
} );
export const setFilterValues = ( payload ) => ( {
  type: SET_FILTER_VALUES,
  payload,
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const UI_DEFAULT_STATE = {
  newEditionPrompted: false,
  promptedToDeleteEditionId: undefined,
  searchString: '',
  optionsVisibility: false,
  sortValue: 'title',
  filterValues: {}
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {

    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;

    case SET_NEW_EDITION_PROMPTED:
    case SET_PROMPTED_TO_DELETE_EDITION_ID:
    case SET_SEARCH_STRING:
    case SET_OPTIONS_VISIBILITY:
    case SET_SORT_VALUE:
    case SET_FILTER_VALUES:
      const propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };

    default:
      return state;
  }
}

export default combineReducers( {
  ui,
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
const newEditionPrompted = ( state ) => state.ui.newEditionPrompted;
const promptedToDeleteEditionId = ( state ) => state.ui.promptedToDeleteEditionId;
const searchString = ( state ) => state.ui.searchString;
const optionsVisibility = ( state ) => state.ui.optionsVisibility;
const sortValue = ( state ) => state.ui.sortValue;
const filterValues = ( state ) => state.ui.filterValues;

export const selector = createStructuredSelector( {
  newEditionPrompted,
  promptedToDeleteEditionId,
  optionsVisibility,
  sortValue,
  filterValues,
  searchString,
} );
