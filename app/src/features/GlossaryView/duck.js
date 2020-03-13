/**
 * This module exports logic-related elements for the glossary view
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module ovide/features/GlossaryView
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

const SET_MAIN_COLUMN_MODE = 'SET_MAIN_COLUMN_MODE';
const SET_OPTIONS_VISIBLE = 'SET_OPTIONS_VISIBLE';
const SET_FILTER_VALUES = 'SET_FILTER_VALUES';
const SET_GLOSSARY_FILTER_VALUES = 'SET_GLOSSARY_FILTER_VALUES';
const SET_TAGS_FILTER_VALUES = 'SET_TAGS_FILTER_VALUES';
const SET_SORT_VALUE = 'SET_SORT_VALUE';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
const SET_PROMPTED_TO_DELETE_RESOURCE_ID = 'SET_PROMPTED_TO_DELETE_RESOURCE_ID';
const SET_SELECTED_RESOURCES_IDS = 'SET_SELECTED_RESOURCES_IDS';
const SET_STATUS_FILTER_VALUE = 'SET_STATUS_FILTER_VALUE';
const SET_RESOURCES_PROMPTED_TO_DELETE = 'SET_RESOURCES_PROMPTED_TO_DELETE';
const SET_IS_BATCH_DELETING = 'SET_IS_BATCH_DELETING';
const SET_RESOURCE_DELETE_STEP = 'SET_RESOURCE_DELETE_STEP';
const SET_UPLOAD_STATUS = 'SET_UPLOAD_STATUS';
const SET_EDITED_RESOURCE_ID = 'SET_EDITED_RESOURCE_ID';
const SET_MENTION_MODE = 'SET_MENTION_MODE';
const SET_MENTIONS_SEARCH_STRING = 'SET_MENTIONS_SEARCH_STRING';
const SET_MENTION_DELETE_STEP = 'SET_MENTION_DELETE_STEP';
const SET_IS_BATCH_CREATING = 'SET_IS_BATCH_CREATING';
const SET_MENTION_CREATION_STEP = 'SET_MENTION_CREATION_STEP';
const SET_MENTIONS_TO_DELETE_NUMBER = 'SET_MENTIONS_TO_DELETE_NUMBER';
const SET_MENTIONS_TO_CREATE_NUMBER = 'SET_MENTIONS_TO_CREATE_NUMBER';

/**
 * lock system
 */
/**
 * data
 */
/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setMainColumnMode = ( payload ) => ( {
  type: SET_MAIN_COLUMN_MODE,
  payload
} );
export const setOptionsVisible = ( payload ) => ( {
  type: SET_OPTIONS_VISIBLE,
  payload
} );
export const setSearchString = ( payload ) => ( {
  type: SET_SEARCH_STRING,
  payload,
} );
export const setFilterValues = ( payload ) => ( {
  type: SET_FILTER_VALUES,
  payload
} );
export const setGlossaryFilterValues = ( payload ) => ( {
  type: SET_GLOSSARY_FILTER_VALUES,
  payload
} );
export const setTagsFilterValues = ( payload ) => ( {
  type: SET_TAGS_FILTER_VALUES,
  payload
} );
export const setSortValue = ( payload ) => ( {
  type: SET_SORT_VALUE,
  payload
} );
export const setPromptedToDeleteResourceId = ( payload ) => ( {
  type: SET_PROMPTED_TO_DELETE_RESOURCE_ID,
  payload
} );
export const setSelectedResourcesIds = ( payload ) => ( {
  type: SET_SELECTED_RESOURCES_IDS,
  payload,
} );
export const setStatusFilterValue = ( payload ) => ( {
  type: SET_STATUS_FILTER_VALUE,
  payload,
} );
export const setResourcesPromptedToDelete = ( payload ) => ( {
  type: SET_RESOURCES_PROMPTED_TO_DELETE,
  payload,
} );
export const setIsBatchDeleting = ( payload ) => ( {
  type: SET_IS_BATCH_DELETING,
  payload,
} );
export const setResourceDeleteStep = ( payload ) => ( {
  type: SET_RESOURCE_DELETE_STEP,
  payload,
} );

export const setUploadStatus = ( payload ) => ( {
  type: SET_UPLOAD_STATUS,
  payload
} );

export const setEditedResourceId = ( payload ) => ( {
  type: SET_EDITED_RESOURCE_ID,
  payload,
} );

export const setMentionMode = ( payload ) => ( {
  type: SET_MENTION_MODE,
  payload,
} );

export const setMentionsSearchString = ( payload ) => ( {
  type: SET_MENTIONS_SEARCH_STRING,
  payload,
} );

export const setMentionDeleteStep = ( payload ) => ( {
  type: SET_MENTION_DELETE_STEP,
  payload,
} );

export const setIsBatchCreating = ( payload ) => ( {
  type: SET_IS_BATCH_CREATING,
  payload,
} );

export const setMentionCreationStep = ( payload ) => ( {
  type: SET_MENTION_CREATION_STEP,
  payload,
} );

export const setMentionsToDeleteNumber = ( payload ) => ( {
  type: SET_MENTIONS_TO_DELETE_NUMBER,
  payload,
} );

export const setMentionsToCreateNumber = ( payload ) => ( {
  type: SET_MENTIONS_TO_CREATE_NUMBER,
  payload,
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */
/**
 * Default/fallback state of the ui state
 */

/*
 * const defaultFilterValues = Object.keys(resourceSchema.definitions)
 *   .reduce((result, type) => ({
 *     ...result,
 *     [type]: true
 *   }), {});
 */

const UI_DEFAULT_STATE = {
  mainColumnMode: 'list',
  sortVisible: false,
  filterVisible: false,
  searchString: '',
  filterValues: [],
  glossaryFilterValues: [],
  tagsFilterValues: [],
  sortValue: 'edited recently',
  promptedToDeleteResourceId: undefined,
  selectedResourcesIds: [],
  statusFilterValue: 'all',
  resourcesPromptedToDelete: [],
  isBatchDeleting: false,
  mentionDeleteStep: 0,
  uploadStatus: undefined,
  editedResourceId: undefined,
  mentionMode: 'add',
  mentionsSearchString: '',
  mentionCreatingStep: 0,
  isBatchCreating: false,
  mentionsToDeleteNumber: 0,
  mentionsToCreateNumber: 0,
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
    case SET_MAIN_COLUMN_MODE:
    case SET_OPTIONS_VISIBLE:
    case SET_SEARCH_STRING:
    case SET_FILTER_VALUES:
    case SET_GLOSSARY_FILTER_VALUES:
    case SET_TAGS_FILTER_VALUES:
    case SET_SORT_VALUE:
    case SET_PROMPTED_TO_DELETE_RESOURCE_ID:
    case SET_SELECTED_RESOURCES_IDS:
    case SET_STATUS_FILTER_VALUE:
    case SET_RESOURCES_PROMPTED_TO_DELETE:
    case SET_IS_BATCH_DELETING:
    case SET_RESOURCE_DELETE_STEP:
    case SET_UPLOAD_STATUS:
    case SET_EDITED_RESOURCE_ID:
    case SET_MENTION_MODE:
    case SET_MENTIONS_SEARCH_STRING:
    case SET_MENTION_DELETE_STEP:
    case SET_MENTION_CREATION_STEP:
    case SET_IS_BATCH_CREATING:
    case SET_MENTIONS_TO_CREATE_NUMBER:
    case SET_MENTIONS_TO_DELETE_NUMBER:
      const propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };

    /*
     * case `${ENTER_BLOCK}_SUCCESS`:
     *   if (payload.location === 'productionMetadata') {
     *     return {
     *       ...state,
     *       metadataOpen: true
     *     };
     *   }
     *   return state;
     * case `${ENTER_BLOCK}_FAIL`:
     * case `${LEAVE_BLOCK}`:
     *   if (payload.location === 'productionMetadata') {
     *     return {
     *       ...state,
     *       metadataOpen: false
     *     };
     *   }
     *   return state;
     */
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
const mainColumnMode = ( state ) => state.ui.mainColumnMode;
const optionsVisible = ( state ) => state.ui.optionsVisible;
const searchString = ( state ) => state.ui.searchString;
const filterValues = ( state ) => state.ui.filterValues;
const glossaryFilterValues = ( state ) => state.ui.glossaryFilterValues;
const tagsFilterValues = ( state ) => state.ui.tagsFilterValues;
const sortValue = ( state ) => state.ui.sortValue;
const promptedToDeleteResourceId = ( state ) => state.ui.promptedToDeleteResourceId;
const selectedResourcesIds = ( state ) => state.ui.selectedResourcesIds;
const statusFilterValue = ( state ) => state.ui.statusFilterValue;
const resourcesPromptedToDelete = ( state ) => state.ui.resourcesPromptedToDelete;
const isBatchDeleting = ( state ) => state.ui.isBatchDeleting;
const resourceDeleteStep = ( state ) => state.ui.resourceDeleteStep;
const uploadStatus = ( state ) => state.ui.uploadStatus;
const editedResourceId = ( state ) => state.ui.editedResourceId;
const mentionMode = ( state ) => state.ui.mentionMode;
const mentionsSearchString = ( state ) => state.ui.mentionsSearchString;
const mentionDeleteStep = ( state ) => state.ui.mentionDeleteStep;
const mentionCreationStep = ( state ) => state.ui.mentionCreationStep;
const isBatchCreating = ( state ) => state.ui.isBatchCreating;
const mentionsToCreateNumber = ( state ) => state.ui.mentionsToCreateNumber;
const mentionsToDeleteNumber = ( state ) => state.ui.mentionsToDeleteNumber;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  mainColumnMode,
  optionsVisible,
  searchString,
  filterValues,
  glossaryFilterValues,
  tagsFilterValues,
  sortValue,
  promptedToDeleteResourceId,
  selectedResourcesIds,
  statusFilterValue,
  resourcesPromptedToDelete,
  isBatchDeleting,
  resourceDeleteStep,
  uploadStatus,
  editedResourceId,
  mentionMode,
  mentionsSearchString,
  mentionDeleteStep,
  isBatchCreating,
  mentionCreationStep,
  mentionsToCreateNumber,
  mentionsToDeleteNumber,
} );
