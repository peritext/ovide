/**
 * This module provides a reusable block contextualization for the editor component
 * @module ovide/components/ContentsEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';
import { getRelatedAssetsIds } from '../../helpers/assetsUtils';
import { requestAssetData } from '../../helpers/dataClient';

/**
 * Imports Components
 */
import AssetPreview from '../AssetPreview';
import CenteredIcon from '../../components/CenteredIcon';

/**
 * BlockContainer class for building react component instances
 */
class BlockContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props, context ) {
    super( props );

    this.state = {
      assets: {}
    };

    this.refreshAssets( props, context );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.resource !== nextProps.resource || this.props.customContext !== nextProps.customContext || this.props.contextualizer !== nextProps.contextualizer ) {
      this.refreshAssets( nextProps );
    }
  }

  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize here
    return true;
  }

  refreshAssets = ( props ) => {
    const {
      asset,
      customContext = {}
    } = props;

    const {
      resource = {},
    } = asset;

    const {
      productionId,
      productionAssets: assets = {},
    } = customContext;

    const relatedAssetsIds = getRelatedAssetsIds( resource.data );
    // const relatedAssets = relatedAssetsIds.map( ( thatId ) => assets[thatId] ).filter( ( a ) => a );
    const relatedAssets = relatedAssetsIds
    .map( ( thatId ) => assets[thatId] ).filter( ( a ) => a );

    relatedAssets.reduce( ( cur, thatAsset ) => {
      return cur.then( () => {
        return new Promise( ( resolve, reject ) => {
          requestAssetData( { productionId, asset: thatAsset } )
            .then( ( data ) => {
              this.setState( {
                assets: {
                  ...this.state.assets,
                  [thatAsset.id]: {
                    ...thatAsset,
                    data
                  }
                }
              } );
              return resolve();
            } )
            .catch( reject );
        } );
      } );
    }, Promise.resolve() );
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {

    /**
     * Variables definition
     */
    const {
      asset,
      customContext = {},
    } = this.props;

    const {
      assets,
    } = this.state;

    const {
      selectedContextualizationId,
      renderingMode,
      // productionAssets = {},
    } = customContext;

    const {
      startExistingResourceConfiguration,
      deleteContextualizationFromId,
      setSelectedContextualizationId,
      setEditedContextualizationId,
      setEditedContextualizationType,
      onGoToResource,
      production = {},
      t,
      // selectedContextualizationId,
    } = this.context;

    const {
      resource = {},
      id,
      contextualizer = {},
      ...contextualization
    } = asset;

    const {
      id: productionId,
    } = production;

    const {
      visibility = {
        screened: true,
        paged: true
      }
    } = contextualization;

    /**
     * Computed variables
     */
    const isActive = selectedContextualizationId === asset.id;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.BlockContextualization' );

    /**
     * Callbacks handlers
     */
    const handleEditRequest = ( event ) => {
      silentEvent( event );

      if ( typeof startExistingResourceConfiguration === 'function' ) {
        setSelectedContextualizationId( undefined );
        startExistingResourceConfiguration( resource.id );
      }
    };

    const handleEditContextualizationRequest = ( event ) => {
      silentEvent( event );

      if ( typeof setEditedContextualizationId === 'function' ) {
        setEditedContextualizationId( id );
        setEditedContextualizationType( 'block' );
      }
    };
    const handleGoToRequest = ( event ) => {
      silentEvent( event );

      if ( typeof onGoToResource === 'function' ) {
        onGoToResource( resource.id );
      }
    };

    const handleDeleteRequest = ( event ) => {
      silentEvent( event );
      if ( typeof deleteContextualizationFromId === 'function' ) {
        deleteContextualizationFromId( id );
      }
    };

    const handleClickOnPreview = ( event ) => {
      if ( event ) {
        silentEvent( event );
      }
      if ( /*!['video', 'table', 'embed'].includes(type) &&*/ typeof setSelectedContextualizationId === 'function' ) {
        if ( selectedContextualizationId === asset.id ) {
          setSelectedContextualizationId( undefined );
        }
        else {
          setSelectedContextualizationId( asset.id );
        }
      }
    };

    return ( resource.data ?
      [
        <div
          contentEditable={ false }
          className={ `block-asset-side-toolbar ${isActive ? 'is-active' : ''}` }
          key={ 0 }
        >
          <Button
            isRounded
            isColor={ 'danger' }
            onClick={ handleDeleteRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'float' }
            data-tip={ translate( 'delete mention (the item will not be deleted from the library)' ) }
          >
            <Icon className={ 'fa fa-trash' } />
          </Button>
          <Button
            isRounded
            onClick={ handleEditRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'float' }
            data-tip={ translate( 'edit resource parameters' ) }
          >
            <CenteredIcon src={ icons.settings.black.svg } />
          </Button>
          <Button
            isRounded
            isColor={ 'info' }
            onClick={ handleEditContextualizationRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'float' }
            data-tip={ translate( 'edit mention parameters' ) }
          >
            <i className={ 'fa fa-comment' } />
          </Button>
          
          <Button
            isRounded
            isColor={ 'primary' }
            onClick={ handleGoToRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'float' }
            data-tip={ translate( 'edit contents' ) }
          >
            <Icon className={ 'fa fa-pencil-alt' } />
          </Button>
        </div>,
        <AssetPreview
          key={ 1 }
          resource={ resource }
          productionId={ productionId }
          assets={ assets }
          contextualization={ contextualization }
          contextualizer={ contextualizer }
          handleEditRequest={ handleEditRequest }
          onDeleteRequest={ handleDeleteRequest }
          style={ { cursor: 'pointer' } }
          isActive={ isActive }
          onClick={ handleClickOnPreview }
          renderingMode={ renderingMode }
          isGhostMode={ !visibility[renderingMode] }
          showPannel
          showOnlyIfVisible
        />

      ] : null
      );
  }
}

/**
 * Component's properties types
 */
BlockContainer.propTypes = {

  /*
   * the asset to render
   */
  asset: PropTypes.shape( {
    resource: PropTypes.object,
  } )
};

/**
 * Component's context used properties
 */
BlockContainer.contextTypes = {

  /**
   * Callbacks when resource configuration is asked from
   * within the asset component
   */
  startExistingResourceConfiguration: PropTypes.func,
  deleteContextualizationFromId: PropTypes.func,
  setSelectedContextualizationId: PropTypes.func,
  setEditedContextualizationId: PropTypes.func,
  selectedContextualizationId: PropTypes.string,
  setEditedContextualizationType: PropTypes.func,
  onGoToResource: PropTypes.func,
  production: PropTypes.object,
  t: PropTypes.func,
};
export default BlockContainer;
