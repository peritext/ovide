/**
 * This module exports logic-related elements for the summary view
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/SummaryView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { getStatePropFromActionSet } from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */

/**
 * ui
 */
const SET_NEW_SECTION_OPEN = 'SET_NEW_SECTION_OPEN';
const SET_METADATA_OPEN = 'SET_METADATA_OPEN';
const SET_IS_SORTING = 'SET_IS_SORTING';

/**
 * lock system
 */
/**
 * data
 */
const SET_PRODUCTION_METADATA = 'SET_PRODUCTION_METADATA';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */

export const setProductionMetadata = ( payload ) => ( {
  type: SET_PRODUCTION_METADATA,
  payload
} );

export const setMetadataOpen = ( payload ) => ( {
  type: SET_METADATA_OPEN,
  payload
} );

export const setNewSectionOpen = ( payload ) => ( {
  type: SET_NEW_SECTION_OPEN,
  payload
} );

export const setIsSorting = ( payload ) => ( {
  type: SET_IS_SORTING,
  payload
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
   * Whether new section dialog is open
   */
  newSectionOpen: false,
  isSorting: false,
  metadataOpen: false,
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
    case SET_NEW_SECTION_OPEN:
    case SET_IS_SORTING:
    case SET_METADATA_OPEN:
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

const newSectionOpen = ( state ) => state.ui.newSectionOpen;
const isSorting = ( state ) => state.ui.isSorting;
const metadataOpen = ( state ) => state.ui.metadataOpen;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  metadataOpen,
  newSectionOpen,
  isSorting,
} );
