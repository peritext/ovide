/**
 * This module provides a connected component for handling error-related UI
 * @module ovide/features/ErrorMessage
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import approveBrowser from 'approved-browser';
import { connect } from 'react-redux';
// import { toastr } from 'react-redux-toastr';
import {
  ModalCard
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { getBrowserInfo } from '../../../helpers/misc';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as productionDuck from '../../ProductionManager/duck';
import {
  FETCH_PRODUCTIONS,
  CREATE_PRODUCTION,
  OVERRIDE_PRODUCTION,
  IMPORT_PRODUCTION,
  DUPLICATE_PRODUCTION,
  DELETE_PRODUCTION,
  CHANGE_PASSWORD
} from '../../HomeView/duck';
import {
  ACTIVATE_PRODUCTION,
  UPLOAD_RESOURCE,
  DELETE_UPLOADED_RESOURCE,
  DELETE_SECTION,
  DELETE_RESOURCE,
  SAVE_PRODUCTION,
} from '../../ProductionManager/duck';

/**
 * Shared variables
 */
const ACCEPTED_BROWSERS = {
  Chrome: 50,
  Firefox: 50,
  strict: true
};

@connect(
  ( state ) => ( {
    ...duck.selector( state.errorMessage ),
    ...productionDuck.selector( state.editedProduction ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...duck,
    }, dispatch )
  } )
)
class ErrorMessageContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
    store: PropTypes.object,
  }

  constructor( props ) {
    super( props );
  }

  componentDidMount = () => {
    const browserInfo = getBrowserInfo();
    approveBrowser( ACCEPTED_BROWSERS, ( approved ) => {
      if ( !approved ) {
        this.props.actions.setBrowserWarning( browserInfo );
      }
    } );
  }

  componentWillUnmount = () => {
    this.props.actions.clearErrorMessages( false );
  }

  messages = {
    [`${'SUBMIT_MULTI_RESOURCES_FAIL'}`]: {
      title: () => {
        const translate = translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' );
        return translate( 'Upload went wrong' );
      },
      details: ( payload ) => {
        const translate = translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' );
        switch ( payload.error ) {
          case 'Too many files uploaded':
            return translate( 'You tried to upload too many files at the same time. ' ) + translate( 'Please split your uploads in smaller groups !' );
          case 'Files extends maximum size to upload':
            return translate( 'The total length of the files you tried to upload extends maximum size to upload. ' ) + translate( 'Please split your uploads in smaller groups !' );
          case 'No valid files to upload':
            return translate( 'No valid files to upload, your files are either too big or not in the right format.' );
          case 'Some files larger than maximum size':
            return translate( 'Some files are larger than the maximum file size allowed, they were not added to the library.' );
          default:
            return undefined;
        }
      }
    },
    [`${'UPDATE_SECTION_FAIL'}`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The section could not be updated with your last changes' )
    },
    [`${'CREATE_CONTEXTUALIZATION_NOTE_FAIL'}`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'This type of item cannot be added into note' )
    },
    [`${FETCH_PRODUCTIONS}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The list of productions could not be retrieved' )
    },
    [`${CREATE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be created' )
    },
    [`${SAVE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be saved' )
    },
    [`${OVERRIDE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be overriden' )
    },
    [`${IMPORT_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be imported' ),
      details: ( payload = {} ) => {
        switch ( payload.error ) {
          case 'malformed json':
            return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The file format (JSON) of the imported production is not valid.' );
          case 'file is too large':
            return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'Your production file is larger than maximum file size allowed' );
          default:
            return undefined;
        }
      }
    },
    [`${DUPLICATE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be duplicated' )
    },
    [`${DELETE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be deleted' )
    },
    [`${CHANGE_PASSWORD}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The password could not be changed' )
    },
    [`${ACTIVATE_PRODUCTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The production could not be opened' )
    },
    [`${UPLOAD_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be uploaded' ),
      details: ( payload ) => {
        const fileName = payload.resource && payload.resource.metadata &&
          `${payload.resource.metadata.title}.${payload.resource.metadata.ext}`;
        return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( '{n} is too big', { n: fileName } );
      }
    },
    [`${DELETE_UPLOADED_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be deleted' )
    },
    [`${DELETE_SECTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'A section could not be deleted' )
    },
    [`${DELETE_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be deleted' )
    }
  }

  render() {

    /**
     * Variables definition
     */
    const {
      props: {
        children,
        needsReload,
        // lastError,
        malformedProductionError,
        browserWarning,
        actions: {
          setBrowserWarning
        }
      },
      context: { t }
    } = this;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.ErrorMessageContainer' );

    /**
     * Callbacks handlers
     */
    const handleCloseBrowserWarning = () => setBrowserWarning( undefined );

    return (
      <div>
        {children}
        <ModalCard
          isActive={ needsReload }
          headerContent={ translate( 'Something went wrong' ) }
          mainContent={
            <div>
              <p>
                {translate( 'An error happened, sorry. Please reload this page to continue editing!' )}
              </p>
              <p>
                {translate( 'Would you be kind enough to report what happened before this screen ' )}
                <a
                  target={ 'blank' }
                  href={ 'https://github.com/peritext/ovide/issues' }
                >
                  {translate( 'in this page' )}
                </a> ?
              </p>
            </div>
          }
        />
        <ModalCard
          isActive={ malformedProductionError }
          headerContent={ translate( 'Something went wrong' ) }
          mainContent={
            <div>
              <p>
                {translate( 'An error happened, sorry. It seems that the production you are trying to access is corrupted.' )}
              </p>
              <p>
                <a
                  target={ 'blank' }
                  href={ '/' }
                >
                  {translate( 'Come back to home' )}
                </a> ?
              </p>
            </div>
          }
        />
        <ModalCard
          isActive={ browserWarning }
          headerContent={ translate( 'Your browser is not supported' ) }
          onClose={ handleCloseBrowserWarning }
          mainContent={
            <div>
              <p>
                {translate( 'You are using {b} version {v} which was not tested for ovide.', { b: browserWarning && browserWarning.name, v: browserWarning && browserWarning.version } )}
              </p>
              <p>
                {translate( 'Please download the last version of firefox or chrome or use this tool at your risks !' )}
              </p>
            </div>
          }
        />
      </div>
    );
  }
}

export default ErrorMessageContainer;
