/**
 * This module provides a asset preview element component
 * @module ovide/components/AssetPreview
 */
/* eslint react/no-danger : 0 */
/* eslint react/no-set-state : 0 */

/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import {
  Box,
  Column,
  Columns,
  Content,
  Image,
  Level,
  Title,
  Icon,
} from 'quinoa-design-library/components';

import { translateNameSpacer } from '../../helpers/translateUtils';
import { resourceToCslJSON } from 'peritext-utils';

/**
 * Imports Project utils
 */

// import { translateNameSpacer } from '../../helpers/translateUtils';
import { abbrevString, silentEvent } from '../../helpers/misc';
// import { requestAssetData } from '../../helpers/dataClient';
import { getResourceTitle } from '../../helpers/resourcesUtils';

/**
 * Imports Components
 */
// import QuinoaPresentationPlayer from 'quinoa-presentation-player';
import BibliographicPreview from '../BibliographicPreview';
import { contextualizers } from '../../peritextConfig.render';

/**
 * Imports Assets
 */
import 'react-table/react-table.css';
import './AssetPreview.scss';

class AssetsWrapper extends Component {

  static childContextTypes = {
    productionAssets: PropTypes.object,
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ( {
    productionAssets: this.props.assets
  } )

  render = () => <div onClick={ ( e ) => e.stopPropagation() }>{this.props.children}</div>;
}

/**
 * EmbedContainer class for building react component instances
 * that wrap an embed/iframe element
 * (it is just aimed at preventing intempestuous reloading of embed code)
 */
class EmbedContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
  }

  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate( nextProps ) {
    return this.props.html !== nextProps.html;
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      html
    } = this.props;
    return (
      <div
        style={ { background: '#FFF' } }
        dangerouslySetInnerHTML={ {
              __html: html
            } }
      />
    );
  }
}

/**
 * Component's properties types
 */
EmbedContainer.propTypes = {

  /**
   * Raw html code to embed
   */
  html: PropTypes.string,
};

/**
 * Renders the AssetPreview component as a react component instances
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
class AssetPreview extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      data: undefined,
      loading: false,
      columns: [],
      isInfoShown: false,
      assets: {}
    };
    this.onClickEdit = this.onClickEdit.bind( this );
    this.onClickDelete = this.onClickDelete.bind( this );
    // this.refreshAssets( props );
  }

  componentDidMount() {
    // this.updateResource();
  }

  componentWillReceiveProps( ) {

  }

  renderPreview() {
    const {
      resource,
      contextualization = {},
      contextualizer,
      renderingMode = 'screened',
      // assets = []
      assets = {},
    } = this.props;

    const {
      data = {},
      metadata,
    } = resource;
    const { type } = contextualization;
    const realType = type || metadata.type;

    /*
     * const { getResourceDataUrl } = this.context;
     * const translate = translateNameSpacer( this.context.t, 'Components.AssetPreview' );
     */
    switch ( realType ) {
      case 'webpage':
        return (
          <iframe
            renderingMode={ renderingMode }
            src={ data.url }
          />
        );
      case 'bib':
        const bibData = resourceToCslJSON( resource );
        if ( bibData.length > 0 ) {
          const items = bibData.reduce( ( result, item ) => ( {
            ...result,
            [item.id]: item
          } ), {} );
          return (
            <BibliographicPreview
              renderingMode={ renderingMode }
              items={ items }
            />
          );
        }
        else return null;
      default:
        const ContextualizerComponent = contextualizers[realType] && contextualizers[realType].Block;
        if ( ContextualizerComponent ) {
          return (
            <AssetsWrapper
              assets={ assets }
            >
              <ContextualizerComponent
                renderingMode={ renderingMode }
                resource={ resource }
                contextualization={ contextualization }
                contextualizer={ contextualizer }
                assets={ assets }
              />
            </AssetsWrapper>
          );
        }
        return null;

    }
  }

  onClickEdit () {
    const { onEditRequest } = this.props;
    if ( typeof onEditRequest === 'function' ) {
      onEditRequest();
    }
  }

  onClickDelete () {
    const { onDeleteRequest } = this.props;
    if ( typeof onDeleteRequest === 'function' ) {
      onDeleteRequest();
    }
  }

  onClickBox = ( e ) => {
    silentEvent( e ); //cause lockingMap state not be updated
    if ( typeof this.props.onClick === 'function' ) {
      this.props.onClick( e );
    }
  }

  shouldComponentUpdate = ( nextProps, nextState ) => {
    return (
      this.state.isInfoShown !== nextState.isInfoShown
      ||
        (
          this.props.contextualization
          && nextProps.contextualization
          && this.props.contextualization.contextualizerId !== nextProps.contextualization.contextualizerId
        )
      ||
      [
        'showPannel',
        'resource',
        'isActive',
        'silentPreviewClick',
        'isGhostMode',
      ].find( ( key ) => this.props[key] !== nextProps[key] ) !== undefined
    );
  }
  render() {

    /**
     * Variables definition
     */
    const {
      showPannel,
      resource,
      style = {},
      isActive,
      silentPreviewClick = true,
      contextualization = {},
      isGhostMode = false,
    } = this.props;
    const { metadata, data } = resource;
    const { isInfoShown } = this.state;

    /**
     * Computed variables
     */
    const handleClickBox = this.onClickBox;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( this.context.t, 'Components.AssetPreview' );

    /**
     * Callbacks handlers
     */
    const handlePreviewClick = ( event ) => {
      if ( silentPreviewClick ) {
        silentEvent( event );
      }
    };
    return (
      showPannel ?
        <Box
          onClick={ handleClickBox }
          style={ {
            background: isActive ? '#3F51B5' : 'rgb(240,240,240)',
            color: isActive ? '#FFF' : '#333',
            padding: 0,
            paddingBottom: '.3rem',
            ...style,
            opacity: isGhostMode ? 0.4 : 1
          } }
          className={ 'ovide-AssetPreview' }
        >
          <div className={ 'preview-container' }>
            {data && this.renderPreview()}
          </div>
          <div>
            <Level style={ { margin: '1rem', marginBottom: 0 } }>
              <Columns isMobile>
                <Column isSize={ 1 }>
                  <Image
                    isSize={ '24x24' }
                    className={ 'type-icon' }
                    src={ icons[metadata.type].black.svg }
                  />
                </Column>
                <Column isSize={ 11 }>
                  <Title
                    style={ { paddingTop: '.2rem', color: 'inherit' } }
                    isSize={ 6 }
                  >
                    {contextualization.title || getResourceTitle( resource ) || translate( 'Unnamed resource' )}
                    {
                      isGhostMode &&
                      <Icon
                        className={ 'fa fa-eye-slash' }
                        data-for={ 'tooltip' }
                        data-tip={ translate( 'Figure not visible for this rendering mode' ) }
                      />
                    }
                  </Title>
                </Column>
              </Columns>
            </Level>
            {
              ( metadata.description || metadata.source ) && isInfoShown &&
              <Level>
                <Columns>
                  <Column>
                    {metadata.description &&
                      <div>
                        <Title isSize={ 5 }>{translate( 'Description' )}</Title>
                        <Content>{abbrevString( metadata.description, 500 )}</Content>
                      </div>
                    }
                  </Column>
                  {
                    metadata.source &&
                    <Column>
                      <div>
                        <Title isSize={ 5 }>{translate( 'Source' )}</Title>
                        <Content>{abbrevString( metadata.source, 500 )}</Content>
                      </div>
                    </Column>
                  }
                </Columns>
              </Level>
            }

          </div>
        </Box> :
        <div className={ 'ovide-AssetPreview' }>
          <div
            onClick={ handlePreviewClick }
            className={ 'preview-container' }
          >
            {data && this.renderPreview()}
          </div>
        </div>
    );
  }
}

/**
 * Component's properties types
 */
AssetPreview.propTypes = {

  /**
   * Data of the asset
   */
  data: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array, PropTypes.string ] ),

  /**
   * Metadata of the asset
   */
  metadata: PropTypes.object,

  /**
   * Callbacks when asset is asked for edition from component
   */
  onEditRequest: PropTypes.func,

  /**
   * Whether to show the pannel displaying asset metadata
   */
  showPannel: PropTypes.bool,

  /**
   * Type of the asset
   */
  type: PropTypes.string,
};

/**
 * Component's context used properties
 */
AssetPreview.contextTypes = {

  /**
   * translation function
   */
  t: PropTypes.func.isRequired,

  /**
   * getResourceDataUrl in DataUrlProvider
   */
  getResourceDataUrl: PropTypes.func,

};

export default AssetPreview;
