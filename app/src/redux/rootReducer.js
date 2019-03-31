/**
 * Ovide backoffice Application
 * =======================================
 * Combining the app's reducers
 * @module ovide
 */
import { combineReducers } from 'redux';
import { persistentReducer } from 'redux-pouchdb';
import { reducer as toastr } from 'react-redux-toastr';

import { i18nState } from 'redux-i18n';
import data from './duck';

import home from '../features/HomeView/duck';
import summary from '../features/SummaryView/duck';
import section from '../features/SectionView/duck';
import library from '../features/LibraryView/duck';
import glossary from '../features/GlossaryView/duck';
import editions from '../features/EditionsView/duck';
import edition from '../features/EditionView/duck';

import editionUiWrapper from '../features/EditionUiWrapper/duck';
import sectionsManagement from '../features/SectionsManager/duck';
import errorMessage from '../features/ErrorMessageManager/duck';
import editedProduction from '../features/ProductionManager/duck';

export default combineReducers( {
  data,
  i18nState: persistentReducer( i18nState, 'ovide-lang' ),
  toastr,

  home,
  summary,
  section,
  library,
  editions,
  edition,
  glossary,

  editionUiWrapper,
  editedProduction,
  sectionsManagement,
  errorMessage,
} );
