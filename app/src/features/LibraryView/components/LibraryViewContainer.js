/**
 * This module provides a connected component for handling the library view
 * @module ovide/features/LibraryView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Tooltip from 'react-tooltip';

/**
 * Imports Project utils
 */
import { createResourceData, validateFiles } from '../../../helpers/resourcesUtils';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';

/**
 * Import Ducks
 */
import * as duck from '../duck';
import * as editedProductionDuck from '../../ProductionManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import LibraryViewLayout from './LibraryViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';
import DataUrlProvider from '../../../components/DataUrlProvider';
import UploadModal from '../../../components/UploadModal';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber } = config;

@connect(
  ( state ) => ( {
    ...duck.selector( state.library ),
    ...editedProductionDuck.selector( state.editedProduction ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...editedProductionDuck,
      ...sectionsManagementDuck,
      ...errorMessageDuck,
      ...duck
    }, dispatch )
  } )
)
class LibraryViewContainer extends Component {

  constructor( props ) {
    super( props );
  }

  componentDidMount = () => {
    const productionId = this.props.match.params.productionId;
    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( !this.props.editedResourceId !== nextProps.editedResourceId ) {
      Tooltip.hide();
    }
  }

  shouldComponentUpdate = () => true;

  /**
   * Leave locked blocks when leaving the view
   */
  componentWillUnmount = () => {
    this.props.actions.resetViewsUi();
  }

  /**
   * @todo refactor this redundant cont with SectionViewContainer
   */
  submitMultiResources = ( files ) => {

    this.props.actions.setUploadStatus( {
      status: 'initializing',
      errors: []
    } );
    setTimeout( () => {
      this.props.actions.setOpenTabId( 'resources' );
      const { setErrorMessage } = this.props.actions;
      if ( files.length > maxBatchNumber ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Too many files uploaded' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      const validFiles = validateFiles( files );
      if ( validFiles.length === 0 ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'No valid files to upload' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      if ( validFiles.length < files.length ) {
        const invalidFiles = files.filter( ( f ) => validFiles.find( ( oF ) => oF.name === f.name ) === undefined );
        this.props.actions.setUploadStatus( {
          ...this.props.uploadStatus,
          errors: invalidFiles.map( ( file ) => ( {
            fileName: file.name,
            reason: 'too big'
          } ) )
        } );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Some files larger than maximum size' } );
      }
      const errors = [];
      validFiles.reduce( ( curr, next ) => {
        return curr.then( () => {
          this.props.actions.setUploadStatus( {
            status: 'uploading',
            currentFileName: next.name,
            errors: this.props.uploadStatus.errors
          } );
          return createResourceData( next, this.props )
          .then( ( res ) => {
            if ( res && !res.success ) errors.push( res );
          } );
        } );
      }, Promise.resolve() )
      .then( () => {
        if ( errors.length > 0 ) {
          setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: errors } );
        }
        this.props.actions.setMainColumnMode( 'edition' );
        this.props.actions.setUploadStatus( undefined );
      } )
      .catch( ( error ) => {
        this.props.actions.setUploadStatus( undefined );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error } );
      } );
    }, 100 );
  }

  deleteResource = ( payload, callback ) => {
    const { actions: { deleteResource: deleteResourceAction, deleteAsset } } = this.props;
    const relatedAssetsIds = getRelatedAssetsIds( payload.resource );
    if ( relatedAssetsIds.length ) {
      relatedAssetsIds.reduce( ( cur, assetId ) => {
        return cur.then( () => new Promise( ( resolve, reject ) => {
          const thatPayload = {
            assetId,
            productionId: payload.productionId,
            asset: this.props.editedProduction.assets[assetId]
          };
          deleteAsset( thatPayload, ( err ) => {
            if ( err ) {
              return reject( err );
            }
 else {
              return resolve();
            }
          } );
        } ) );

      }, Promise.resolve() )
      .then( () => {
        deleteResourceAction( payload, callback );
      } )
      .catch( callback );
    }

    else deleteResourceAction( payload, callback );
  }

  handleGoToResource = ( resourceId ) => {
    const {
      props: {
        history,
        match: {
          params: {
            productionId
          }
        }
      }
    } = this;
    history.push( `/productions/${productionId}/resources/${resourceId}` );
  }

  render() {
    const {
      props: {
        uploadStatus,
        editedProduction,
      },
      submitMultiResources,
      deleteResource,
    } = this;
    return editedProduction ?
          (
            <DataUrlProvider
              productionId={ editedProduction.id }
              serverUrl={ config.apiUrl }
            >
              <EditionUiWrapper>
                <LibraryViewLayout
                  { ...this.props }
                  submitMultiResources={ submitMultiResources }
                  deleteResource={ deleteResource }
                  onGoToResource={ this.handleGoToResource }
                />

                <UploadModal uploadStatus={ uploadStatus } />
              </EditionUiWrapper>
            </DataUrlProvider>
          )
          : null;
  }
}

export default LibraryViewContainer;
