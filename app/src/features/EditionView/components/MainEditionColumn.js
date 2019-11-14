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
  Button,
  Icon,
  Column,
} from 'quinoa-design-library/components/';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import debounceRender from 'react-debounce-render';

/**
 * Imports Project utils
 */

import { loadAssetsForEdition } from '../../../helpers/projectBundler';
import { requestAssetData } from '../../../helpers/dataClient';
import PagedPreviewer from '../../../components/PagedPreviewer';
import SummaryEditor from '../../../components/SummaryEditor';
import LoadingScreen from '../../../components/LoadingScreen';
import EditionPreprocessor from '../../../helpers/editionPreprocessor.worker';

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

class PreviewWrapperInitial extends Component {

  static contextTypes = {
    getResourceDataUrl: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      assets: {},
      activeViewId: undefined,
    };
    this.editionPreprocessor = new EditionPreprocessor();
    this.editionPreprocessor.onmessage = this.onEditionPreprocessorMessage;
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
    return vals.find( ( key ) => this.props[key] !== nextProps[key] ) || this.state.assets !== nextState.assets || this.state.isPreprocessing !== nextState.isPreprocessing;
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

  onEditionPreprocessorMessage = ( event ) => {
    const { data } = event;
    const { type, response } = data;
    if ( type && response ) {
      switch ( type ) {
        case 'PREPROCESS_EDITION_DATA':
          this.setState( {
            preprocessedData: response,
            isPreprocessing: false
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
      preprocessedData,
    } = state;

    if ( !template || !initialProduction ) {
      return null;
    }
    if ( isPreprocessing ) {
      return <LoadingScreen />;
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
          additionalHTML={ edition.data.additionalHTML }
          updateTrigger={ JSON.stringify( edition ) }
        />
      );
    }
    return (
      <Frame
        name={ 'preview' }
        id={ 'preview' }
        style={ { width: '100%', height: '100%' } }
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
          <span style={ { paddingLeft: '.5rem' } }>{ translate( 'download this edition' ) }</span>
        </Button>
        }
        {
          // edition.metadata.type === 'paged' &&
          <Button
            className={ 'is-rounded' }
            onClick={ handleClickOnPrint }
            data-for={ 'tooltip' }
            data-tip={ translate( 'print this edition' ) }
            style={ { marginLeft: '.5rem' } }
          >
            <Icon
              isSize={ 'small' }
              isAlign={ 'left' }
              className={ 'fa fa-print' }
            />
            <span style={ { paddingLeft: '.5rem' } }>{ translate( 'print this edition' ) }</span>
          </Button>
        }

      </div>
    </Column>
  );
};

export default MainEditionColumn;
