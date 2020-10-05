/**
 * This module provides a layout component for displaying design view main column layout
 * @module ovide/features/EditionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Column,
} from 'quinoa-design-library/components/';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import debounceRender from 'react-debounce-render';

import './MainEditionColumn.scss';

/**
 * Imports Project utils
 */

import { loadAssetsForEdition } from '../../../helpers/bundlersUtils';
import { requestAssetData } from '../../../helpers/dataClient';
import PagedPreviewer from '../../../components/PagedPreviewer';
import SummaryEditor from '../../../components/SummaryEditor';
import LoadingScreen from '../../../components/LoadingScreen';
import EditionPreprocessor from '../../../helpers/editionPreprocessor.worker';
import Renderer from '../../../helpers/editionRenderer.worker';
import getContextualizationsFromEdition from 'peritext-utils/dist/getContextualizationsFromEdition';

// import { processCustomCss } from '../../../helpers/postcss';

import peritextConfig from '../../../peritextConfig.render';

const contextualizerModules = peritextConfig.contextualizers;

class ContextProvider extends Component {

  static childContextTypes = {
    renderingMode: PropTypes.string,
    preprocessedContextualizations: PropTypes.object,
  }

  getChildContext = () => ( {
    renderingMode: this.props.renderingMode,
    preprocessedContextualizations: this.props.preprocessedContextualizations,
  } )
  render = () => {
    return this.props.children;
  }
}

class PreviewWrapperInitial extends Component {

  static contextTypes = {
    getResourceDataUrl: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      assets: undefined,
      activeViewId: undefined,
    };
    this.editionPreprocessor = new EditionPreprocessor();
    this.editionPreprocessor.onmessage = this.onWorkerMessage;

    this.editionRenderer = new Renderer();
    this.editionRenderer.onmessage = this.onWorkerMessage;
  }

  componentDidMount = () => {
    this.loadAssets( this.props );
    this.preprocessEditionData( this.props );
    // setTimeout( () => this.update( this.props, this.state ) );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if (
      this.props.production !== nextProps.production
      || this.props.lang !== nextProps.lang
      || this.props.edition !== nextProps.edition
    ) {
      this.loadAssets( nextProps );
      if ( this.props.edition && nextProps.edition && this.props.edition.data.summary !== nextProps.edition.data.summary ) {
        this.preprocessEditionData( nextProps );
      }
      if ( nextProps.edition.metadata.type === 'paged' ) {

        const {
          production,
          edition,
          lang,
          locale
        } = nextProps;

        const contextualizations = getContextualizationsFromEdition( production, edition );

        this.getPreprocessedContextualizations( {
          production,
          edition,
          assets: this.state.assets || {},
          contextualizations
        } )
        .then( ( preprocessedContextualizations = {} ) => {
          this.editionRenderer.postMessage( {
            type: 'RENDER_PAGED_EDITION_HTML',
            payload: {
              edition,
              production,
              lang,
              locale,
              preprocessedData: this.state.preprocessedData,
              preprocessedContextualizations
            }
          } );
        } );

      }
    }
  }

  shouldComponentUpdate = ( nextProps, nextState ) => {
    const propsVals = [
      'production',
      'edition',
      'template',
      'contextualizers',
      'lang'
    ];
    const stateVals = [
      'assets',
      'isPrerendering',
      'preprocessedContextualizations',
      'editionHTML',
      'isPreprocessing'
    ];
    return propsVals.find( ( key ) => this.props[key] !== nextProps[key] ) !== undefined
    || stateVals.find( ( key ) => this.state[key] !== nextState[key] ) !== undefined;
  }

  componentDidUpdate = ( prevProps, prevState ) => {
    if ( this.state.assets !== prevState.assets ) {
      const { edition, production: initialProduction, lang, locale } = this.props;

      if ( edition.metadata.type === 'paged' ) {
        const production = {
          ...initialProduction,
          assets: {
            ...( initialProduction.assets || {} ),
            ...this.state.assets
          }
        };

        const contextualizations = getContextualizationsFromEdition( production, edition );
        this.getPreprocessedContextualizations( {
          production,
          edition,
          assets: this.state.assets || {},
          contextualizations
        } )
        .then( ( preprocessedContextualizations = {} ) => {
          this.setState( { preprocessedContextualizations } );
          this.editionRenderer.postMessage( {
            type: 'RENDER_PAGED_EDITION_HTML',
            payload: {
              edition,
              production,
              lang,
              locale,
              preprocessedData: this.state.preprocessedData,
              preprocessedContextualizations
            }
          } );
        } );
      }
    }
  }

  componentWillUnmount = () => {
    this.editionPreprocessor.terminate();
    this.editionRenderer.terminate();
  }

  componentDidCatch = ( error, errorInfo ) => {
    console.error( 'previewer catched an error', error, errorInfo );/* eslint no-console : 0  */
  }

  preprocessEditionData = ( props ) => {
    const { production, edition } = props;

    this.editionPreprocessor.postMessage( {
      type: 'PREPROCESS_EDITION_DATA',
      payload: {
        production,
        edition
      }
    } );
    this.setState( {
      isPreprocessing: true,
      preprocessedData: undefined,
    } );
  }

  getPreprocessedContextualizations = ( {
    production,
    // edition,
    assets,
    contextualizations
  } ) => {

    return contextualizations.reduce( ( cur, { contextualization, contextualizer } ) =>
    cur.then( ( result ) => {
      return new Promise( ( resolve, reject ) => {

        if ( contextualization && contextualizer ) {
          const thatModule = contextualizerModules[contextualizer.type];
          if ( thatModule && thatModule.meta && thatModule.meta.asyncPrerender ) {
            const resource = production.resources[contextualization.sourceId];
            thatModule.meta.asyncPrerender( {
              resource,
              contextualization,
              contextualizer,
              productionAssets: assets,
            } )
            .then( ( data ) => {
              resolve( {
                ...result,
                [contextualization.id]: data
              } );
            } )
            .catch( reject );
          }
          else resolve( result );
        }
        else resolve( result );
      } );
    } )
    , Promise.resolve( {} ) );
  }

  onWorkerMessage = ( event ) => {
    const { data } = event;
    const { type, response } = data;
    if ( type && response ) {
      switch ( type ) {
        case 'PREPROCESS_EDITION_DATA':
          const { edition, production: initialProduction, lang, locale } = this.props;

          this.setState( {
            preprocessedData: response,
            isPreprocessing: false,
            isPrerendering: edition.metadata.type === 'paged',
          } );

          if ( edition.metadata.type === 'paged' && this.state.assets !== undefined ) {
            const production = {
              ...initialProduction,
              assets: {
                ...( initialProduction.assets || {} ),
                ...this.state.assets
              }
            };
            const contextualizations = getContextualizationsFromEdition( initialProduction, edition );
            this.getPreprocessedContextualizations( {
              production,
              edition,
              assets: this.state.assets || {},
              contextualizations
            } )
            .then( ( preprocessedContextualizations = {} ) => {
              this.setState( { preprocessedContextualizations } );
              this.editionRenderer.postMessage( {
                type: 'RENDER_PAGED_EDITION_HTML',
                payload: {
                  edition,
                  production,
                  lang,
                  locale,
                  preprocessedData: response,
                  preprocessedContextualizations
                }
              } );
            } );

          }
          break;
        case 'RENDER_PAGED_EDITION_HTML':
            this.setState( {
              isPrerendering: false,
              editionHTML: response.html
            } );
          break;
        default:
          break;
      }
    }
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
      assets = {},
      viewClass,
      viewId,
      viewParams,
      isPreprocessing,
      isPrerendering,
      preprocessedData,
      editionHTML,
    } = state;

    const renderingMode = edition.metadata.type;

    if ( !template || !initialProduction ) {
      return null;
    }
    if ( isPreprocessing || isPrerendering ) {
      return <LoadingScreen />;
    }
    if ( renderingMode === 'paged' && editionHTML && editionHTML.length ) {
      return (
        <PagedPreviewer
          style={ { width: '100%', height: '100%', position: 'absolute', left: 0,
          top: 0, } }
          lang={lang}
          html={ editionHTML }
          additionalHTML={ edition.data.additionalHTML }
          updateTrigger={ JSON.stringify( edition ) }
        />
      );
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

    const onActiveViewChange = ( params ) => {
      this.setState( params );
    };

    const FinalComponent = () => (
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
              preprocessedData,
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
          lang={lang}
          additionalHTML={ edition.data.additionalHTML }
          updateTrigger={ JSON.stringify( edition ) }
        />
      );
    }
    return (
      <Frame
        name={ 'preview' }
        id={ 'preview' }
        style={ {
          width: '100%',
          height: '100%'
        } }
      >
        <FrameContextConsumer>
          {( { document/*, window*/ } ) => (

            <ContextProvider
              getResourceDataUrl={ getResourceDataUrl }
              renderingMode={ renderingMode }
            >
              <Edition
                {
                  ...{
                    production,
                    edition,
                    usedDocument: document,
                    lang,
                    contextualizers,
                    previewMode: true,
                    locale,

                    viewClass,
                    viewId,
                    viewParams,
                    onActiveViewChange,
                    preprocessedData,
                  }
                }
              />
            </ContextProvider>
            )}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

const PreviewWrapper = debounceRender( PreviewWrapperInitial, 2000, { leading: false } );

const MainEditionColumn = ( {
  production,
  lang,
  edition,
  template,
  contextualizers,
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

  if ( summaryEdited ) {
    return (
      <SummaryEditor
        {
          ...{
            template,
            production,
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
      style={ { position: 'relative', margin: '.5rem' } }
    >
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
    </Column>
  );
};

export default MainEditionColumn;
