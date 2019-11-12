/**
 * This module provides a reusable inline citation widget component
 * @module ovide/components/ContentsEditor
 */
/* eslint react/no-set-state: 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*
 * import {
 *   ModalCard,
 *   Button,
 *   Field,
 *   Label,
 *   Column,
 *   Control,
 *   HelpPin,
 * } from 'quinoa-design-library/components';
 */

import { getRelatedAssetsIds } from '../../helpers/assetsUtils';
import { requestAssetData } from '../../helpers/dataClient';
import { contextualizers } from '../../peritextConfig.render';

import { silentEvent } from '../../helpers/misc';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * InlineContextualizationContainer class for building react component instances
 */
class InlineContextualizationContainer extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {
    t: PropTypes.func.isRequired,
    editedContextualizationId: PropTypes.string,
    startExistingResourceConfiguration: PropTypes.func,
    setSelectedContextualizationId: PropTypes.func,
    setEditedContextualizationId: PropTypes.func,
    selectedContextualizationId: PropTypes.string,
    setEditedContextualizationType: PropTypes.func,
  }

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
  shouldComponentUpdate( ) {
    return true;

    /*
     * return (
     *   this.props.asset !== nextProps.asset
     *   || this.props.customContext !== nextProps.customContext
     * );
     */
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
          requestAssetData( productionId, thatAsset )
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
   * Opens the contextualization's details definition ui
   */

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {

    /**
     * Variables definition
     */
    const {
      children,
      asset,
      customContext = {},
    } = this.props;
    const {
      t,
      // startExistingResourceConfiguration,
      setEditedContextualizationId,
      setEditedContextualizationType,
      // citations,
    } = this.context;

    /**
     * Computed variables
     */
    const {
      editedContextualizationId,
      renderingMode,
    } = customContext;

    const {
      resource = {},
      contextualizer = {},
      ...contextualization
    } = asset;

    const {
      assets = {}
    } = this.state;

    const {
      visibility = {
        screened: true,
        paged: true
      }
    } = contextualization;

    // const representation = asset && citations && citations[asset.id];
    const representation = asset && customContext && customContext.citations
     && customContext.citations.citationComponents && customContext.citations.citationComponents[asset.id];
    // const representation = asset && citations && citations[asset.id];

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.InlineContextualizationContainer' );

    /**
     * Callbacks handlers
     */
    const onClick = ( event ) => {
      if ( event ) {
        silentEvent( event );
      }
      if ( typeof setEditedContextualizationId === 'function' ) {
        if ( editedContextualizationId === asset.id ) {
          setEditedContextualizationId( undefined );
          setEditedContextualizationType( undefined );
        }
        else {
          setEditedContextualizationId( asset.id );
          setEditedContextualizationType( 'inline' );
        }
      }
    };

    let ContextualizerComponent = contextualizers[contextualizer.type] && contextualizers[contextualizer.type].Inline || <span />;
    if ( contextualizer.type === 'bib' ) {
      ContextualizerComponent = () => {
        return representation ? <span className="citation-container" dangerouslySetInnerHTML={{__html: representation.html}} /> : <span>{translate( 'loading citation' )}</span>;
      };
    }

    return [
      <span
        onClick={ onClick }
        contentEditable={ false }
        className={ `is-clickable inline-contextualization-container ${visibility[renderingMode] ? 'visible' : 'hidden'} ${editedContextualizationId === asset.id ? 'is-active' : ''}` }
        style={ { color: '#00A99D' } }
        key={ 0 }
      >
        •
        <ContextualizerComponent
          renderingMode={ renderingMode }
          resource={ resource }
          contextualizer={ contextualizer }
          contextualization={ contextualization }
          assets={ assets }
        />
        •
      </span>,
      <span
        key={ 1 }
        style={ { display: 'none' } }
      >{children}
      </span>,
    ];
  }
}

/**
 * Component's properties types
 */
InlineContextualizationContainer.propTypes = {

  /**
   * The asset to consume for displaying the inline citation
   */
  asset: PropTypes.object,

  /**
   * Children react elements of the component
   */
  children: PropTypes.array,

  /**
   * Callbacks when an asset is blured
   */
  onAssetBlur: PropTypes.func,

  /**
   * Callbacks when an asset is changed
   */
  onAssetChange: PropTypes.func,

  /**
   * Callbacks when an asset is focused
   */
  onAssetFocus: PropTypes.func,
};

export default InlineContextualizationContainer;
