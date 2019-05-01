/**
 * This module provides a layout component for displaying design view main column layout
 * @module ovide/features/EditionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import {
  Button,
  Icon,
  Column,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */

import { loadAssetsForEdition } from '../../../helpers/projectBundler';
import { requestAssetData } from '../../../helpers/dataClient';
import PagedPreviewer from '../../../components/PagedPreviewer';
import SummaryEditor from './SummaryEditor';

// import { processCustomCss } from '../../../helpers/postcss';

class ContextProvider extends Component {

  static childContextTypes = {
    renderingMode: PropTypes.string,
  }

  getChildContext = () => ( {
    renderingMode: this.props.renderingMode,
  } )
  render = () => {
    return this.props.children;
  }
}

class PreviewWrapper extends Component {

  static contextTypes = {
    getResourceDataUrl: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      assets: {}
    };
  }

  componentDidMount = () => {
    this.loadAssets( this.props );
    setTimeout( () => this.update( this.props, this.state ) );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if (
      this.props.production !== nextProps.production
      || this.props.lang !== nextProps.lang
      || this.props.edition !== nextProps.edition
    ) {
      this.loadAssets( nextProps )
      .then( () => this.update( this.props, this.state ) );
    }
  }

  shouldComponentUpdate = ( nextProps, nextState ) => {
    const vals = [
      'production',
      'edition',
      'template',
      'contextualizers',
      'lang'
    ];
    return vals.find( ( key ) => this.props[key] !== nextProps[key] ) || this.state.assets !== nextState.assets;
  }

  loadAssets = ( props ) => {
    const {
      production = {},
      edition = {},
    } = props;

    return new Promise( ( resolve, reject ) => {

      loadAssetsForEdition( {
        production,
        edition,
        requestAssetData
      } )
      .then( ( assets ) => {
        this.setState( {
            assets
          } );
      } )
      .then( resolve )
      .catch( reject );
    } );
  }

  update = ( /*props, state*/ ) => {

  }
  render = () => {
    const { props, state } = this;

    const {
      production: initialProduction,
      edition = {},
      template,
      contextualizers,
      lang,
      locale,
    } = props;

    const {
      assets = {}
    } = state;

    if ( !template || !initialProduction ) {
      return null;
    }

    const production = {
      ...initialProduction,
      assets: {
        ...( initialProduction.assets || {} ),
        ...assets
      }
    };

    const Edition = template.components.Edition;

    const { getResourceDataUrl } = this.context;

    const renderingMode = edition.metadata.type;

    let FinalComponent = () => (
      <ContextProvider
        getResourceDataUrl={ getResourceDataUrl }
        renderingMode={ renderingMode }
      >
        <Edition
          {
            ...{
              production,
              edition,
              lang,
              contextualizers,
              previewMode: true,
              locale,
            }
          }
        />
      </ContextProvider>
    );

    if ( renderingMode === 'paged' ) {
      return (
        <PagedPreviewer
          style={ { width: '100%', height: '100%', position: 'absolute', left: 0,
          top: 0, } }
          Component={ FinalComponent }
          additionalHTML={ edition.data.additionalHTML }
          updateTrigger={ production }
        />
      );
    }
    setTimeout( () => {
      const contentDocument = this.iframe && this.iframe.contentDocument;
      FinalComponent = (
        <ContextProvider
          getResourceDataUrl={ getResourceDataUrl }
          renderingMode={ renderingMode }
        >
          <Edition
            {
              ...{
                production,
                edition,
                lang,
                locale,
                contextualizers,
                previewMode: true,
                usedDocument: contentDocument,
              }
            }
          />
        </ContextProvider>
      );
      // const contentWindow = this.iframe && this.iframe.contentWindow;
      if ( contentDocument ) {
        let mount = contentDocument.getElementById( 'mount' );
        if ( !mount ) {
          mount = contentDocument.createElement( 'div' );
          mount.id = 'mount';
          contentDocument.body.appendChild( mount );
        }
        render(
          FinalComponent
        , mount );
      }
    } );

    const bindRef = ( iframe ) => {
      this.iframe = iframe;
    };

    return (
      <iframe
        name={ 'preview' }
        id={ 'preview' }
        style={ { width: '100%', height: '100%' } }
        ref={ bindRef }
      />
    );
  }
}

const MainEditionColumn = ( {
  production,
  lang,
  edition,
  template,
  contextualizers,
  availableGenerators,
  onClickOnDownload: handleClickOnDownload,
  translate,
  summaryEdited,
  setSummaryEdited,
  onEditionChange,
  locale,
} ) => {

  const handleSummaryChange = ( newSummary ) => {
    onEditionChange( {
      ...edition,
      data: {
        ...edition.data,
        plan: {
          ...edition.data.plan,
          summary: newSummary,
        }
      }
    } );
  };

   const handleClickOnPrint = () => {
     window.frames.preview.focus();
     window.frames.preview.print();
   };

  if ( summaryEdited ) {
    return (
      <SummaryEditor
        {
          ...{
            template,
            edition,
            translate,
            setSummaryEdited,
            summaryEdited,
            onSummaryChange: handleSummaryChange,
          }
        }
      />
    );
  }

  return (
    <Column
      isSize={ 'fullwidth' }
      style={ { position: 'relative' } }
    >
      {
        <PreviewWrapper
          {
            ...{
              production,
              edition,
              lang,
              template,
              contextualizers,
              locale
            }
          }
        />
      }
      <div
        style={ {
          position: 'absolute',
          right: '1.5rem',
          bottom: '1.5rem'
        } }
      >
        {availableGenerators.length > 0 &&
        <Button
          className={ 'is-rounded' }
          onClick={ handleClickOnDownload }
          data-for={ 'tooltip' }
          data-tip={ translate( 'download this edition' ) }
        >
          <Icon
            isSize={ 'small' }
            isAlign={ 'left' }
            className={ 'fa fa-download' }
          />
        </Button>
        }
        {
          // edition.metadata.type === 'paged' &&
          <Button
            className={ 'is-rounded' }
            onClick={ handleClickOnPrint }
            data-for={ 'tooltip' }
            data-tip={ translate( 'print this edition' ) }
          >
            <Icon
              isSize={ 'small' }
              isAlign={ 'left' }
              className={ 'fa fa-print' }
            />
          </Button>
        }

      </div>
    </Column>
  );
};

export default MainEditionColumn;
