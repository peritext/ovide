/**
 * This module provides a preview for paged content, thanks to the awesome pagedjs polyfill
 * @module ovide/components/returnlPreviewer
 * @todo find a way to do the same thing while having better manners
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import fetch from 'axios';

import LoadingScreen from '../LoadingScreen';

/**
 * Import project utils
 */
// import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * Imports Dependencies
 */
import addons from '!!raw-loader!./addons.paged.js';
import previewStyleData from '!!raw-loader!./previewStyle.paged.csx';
class PreviewWrapper extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      isInjecting: false,
    };
    this.frameRef = React.createRef();
  }

  componentDidMount = () => {
    // fetch( 'https://unpkg.com/pagedjs@0.1.30/dist/paged.polyfill.js' )
    fetch( 'https://unpkg.com/pagedjs@0.1.34/dist/paged.polyfill.js' )
      .then( ( { data } ) => {
        this.setState( {
          pagedScript: data,
        } );
        setTimeout( () => this.injectRenderer( this.frameDocument, this.props.additionalHTML ), 500 );
      } );
  }

  componentDidCatch = ( error, errorInfo ) => {
    console.error( 'previewer catched an error', error, errorInfo );
  }

  shouldComponentUpdate = ( { updateTrigger, html }, { pagedScript } ) => {
    return html !== this.props.html || updateTrigger !== this.props.updateTrigger || this.state.pagedScript !== pagedScript;
  }

  componentDidUpdate = () => {
    const { props: { additionalHTML = '' } } = this;
    if ( this.state.pagedScript && this.state.pagedScript.length && this.frameDocument ) {
      setTimeout( () => this.injectRenderer( this.frameDocument, additionalHTML ) );
    }
  }

  injectRenderer = ( thatDocument, additionalHTML ) => {
    if ( this.state.injecting || !thatDocument ) {
      return;
    }
    this.setState( { injecting: true } );

    /*
     * const translate = translateNameSpacer( this.context.t, 'Components.PagedPreviewer' );
     * const translations = {
     *   'Rendering pages': translate( 'Rendering pages' ),
     *   'Attaching footnotes to ${ pages.length } pages': translate( 'Attaching footnotes to ${ pages.length } pages' ),
     *   'Rendering finished !': translate( 'Rendering finished !' ),
     * };
     * const addons = Object.entries( translations ).reduce(
     *   ( str, [ exp, rep ] ) => str.replace( exp, rep ),
     *   addonsData
     * );
     */
    console.info( 'inject renderer' );/* eslint no-console: 0 */
    // 1. swap body content to have sections as direct children (paged js requirement)
    const container = thatDocument.body.children[0].querySelector( '.frame-content > div' );
    let additionalStyles = '';
    if ( container ) {
      let htmlContent = container.innerHTML;
      // thatDocument.body.innerHTML = htmlContent;

      // 2. extract styles from content
      const stylesRegexp = /<style.*>([\w\W\n]*)<\/style>/gm;
      let match;
        while ( ( match = stylesRegexp.exec( htmlContent ) ) !== null ) {
          additionalStyles += match[1];
          htmlContent = htmlContent.slice( 0, match.index ) + htmlContent.slice( match.index + match[0].length );
          match.index = -1;
      }
      thatDocument.body.innerHTML = htmlContent;
    }
    if ( thatDocument.body.lastChild && !thatDocument.body.lastChild.tagName ) {
      thatDocument.body.lastChild.remove();
    }

    // add toaster lib
    const toasterScript = thatDocument.createElement( 'script' );
    toasterScript.type = 'text/javascript';
    toasterScript.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
    thatDocument.getElementsByTagName( 'head' )[0].appendChild( toasterScript );
    const toasterStyle = thatDocument.createElement( 'link' );
    toasterStyle.rel = 'stylesheet';
    toasterStyle.type = 'text/css';
    toasterStyle.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
    thatDocument.getElementsByTagName( 'head' )[0].appendChild( toasterStyle );

    // load paged js lib
    const pagedLibScript = thatDocument.createElement( 'script' );
    pagedLibScript.type = 'text/javascript';
    pagedLibScript.innerHTML = this.state.pagedScript || '';
    // pagedLibScript.src = 'https://unpkg.com/pagedjs@0.1.30/dist/paged.polyfill.js';
    thatDocument.getElementsByTagName( 'head' )[0].appendChild( pagedLibScript );
    // load addons script
    const addonsScript = thatDocument.createElement( 'script' );
    addonsScript.type = 'text/javascript';
    addonsScript.innerHTML = addons;
    thatDocument.getElementsByTagName( 'head' )[0].appendChild( addonsScript );
    // load paged js preview
    const previewStyle = thatDocument.createElement( 'style' );
    previewStyle.innerHTML = `${previewStyleData}
        ${additionalStyles}`;
    thatDocument.getElementsByTagName( 'head' )[0].appendChild( previewStyle );

    thatDocument.head.innerHTML = thatDocument.head.innerHTML + additionalHTML;
    setTimeout( () => this.setState( { injecting: false } ) );

  };

  render = () => {

    const {
      props: {
        style,
        Component: RenderingComponent,
        html,
      },
      state: {
      }
    } = this;

    const dispatchContext = ( document/*, window*/ ) => {
      this.frameDocument = document;
    };
    if ( html ) {
      return (
        <div
          style={ style }
        >
          <LoadingScreen />
          <Frame
            name={ 'preview' }
            id={ 'preview' }
            style={ { width: '100%', height: '100%', position: 'absolute' } }
            ref={ this.frameRef }
          >
            <FrameContextConsumer>
              {( { document, window } ) => {
                setTimeout( () => dispatchContext( document, window ) );
                return (
                  <div
                    dangerouslySetInnerHTML={ {/* eslint react/no-danger : 0 */
                    __html: html
                  } }
                  />

                );
              }}
            </FrameContextConsumer>
          </Frame>

        </div>
      );

    }
    return (
      <div
        style={ style }
      >
        <LoadingScreen />
        <Frame
          name={ 'preview' }
          id={ 'preview' }
          style={ { width: '100%', height: '100%', position: 'absolute' } }
          ref={ this.frameRef }
        >
          <FrameContextConsumer>
            {( { document, window } ) => (
              <div>
                <RenderingComponent
                  { ...{ document, window } }
                  renderAdditionalHTML={ false }
                />
                {dispatchContext( document, window )}
                {
                    // setTimeout( () => this.injectRenderer( document, additionalHTML ) )
                  }
              </div>
              )}
          </FrameContextConsumer>
        </Frame>

      </div>
    );
  }
}

export default PreviewWrapper;

