/**
 * This module provides a connected component for handling the library view
 * @module ovide/features/GlossaryView
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
import GlossaryViewLayout from './GlossaryViewLayout';
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

@connect(
  ( state ) => ( {
    ...duck.selector( state.glossary ),
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
class GlossaryViewContainer extends Component {

  constructor( props ) {
    super( props );
  }

  componentDidMount = () => {
    const productionId = this.props.match.params.productionId;
    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }
    Tooltip.rebuild();
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

  onGoToResource = ( resourceId ) => {
    const { id: productionId } = this.props.editedProduction;
    this.props.history.push( `/productions/${productionId}/resources/${resourceId}` );
  }

  render() {
    const {
      props: {
        uploadStatus,
        editedProduction,
      },
      deleteResource,
      onGoToResource,
    } = this;
    return editedProduction ?
          (
            <DataUrlProvider
              productionId={ editedProduction.id }
              serverUrl={ config.apiUrl }
            >
              <EditionUiWrapper>
                <GlossaryViewLayout
                  { ...this.props }
                  deleteResource={ deleteResource }
                  onGoToResource={ onGoToResource }
                />

                <UploadModal uploadStatus={ uploadStatus } />
              </EditionUiWrapper>
            </DataUrlProvider>
          )
          : null;
  }
}

export default GlossaryViewContainer;
