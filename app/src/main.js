/**
 * Application Endpoint
 * ======================================
 *
 * Rendering the application.
 * @module ovide
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import I18n from 'redux-i18n';

import approveBrowser from 'approved-browser';

import { createBrowserHistory } from 'history';

import { inElectron } from './helpers/electronUtils';

import configureStore from './redux/configureStore';
import Application from './Application';

import translations from './translations';

let CurrentApplication = Application;

const initialState = {};

const store = configureStore( initialState );
window.store = store;

const basename = `/${ ( __PUBLIC_URL__ || '' ).split( '/' ).pop()}`;

const history = createBrowserHistory( {
  basename
} );

const mountNode = document.getElementById( 'mount' );

/**
 * Mounts the application to the given mount node
 */
export function renderApplication() {
  const group = (
    <Provider store={ store }>
      <I18n
        translations={ translations }
        initialLang={ 'fr' }
      >
        <CurrentApplication history={ history } />
      </I18n>
    </Provider>
  );
  render( group, mountNode );
}

renderApplication();

/**
 * Hot-reloading.
 */
if ( module.hot ) {
  module.hot.accept( './Application', function() {
    CurrentApplication = require( './Application' ).default;
    renderApplication();
  } );
}

export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let tem, M = ua.match( /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [];
  if ( /trident/i.test( M[1] ) ) {
    tem = /\brv[ :]+(\d+)/g.exec( ua ) || [];
    return { name: 'IE ', version: ( tem[1] || '' ) };
  }
  if ( M[1] === 'Chrome' ) {
    tem = ua.match( /\bOPR\/(\d+)/ );
    if ( tem != null ) { /* eslint eqeqeq : 0 */
      return { name: 'Opera', version: tem[1] };
    }
  }
  M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];
  if ( ( tem = ua.match( /version\/(\d+)/i ) ) != null ) { /* eslint eqeqeq : 0 */
    M.splice( 1, 1, tem[1] );
  }
  return {
    name: M[0],
    version: M[1]
  };
};

if ( !inElectron ) {
  const ACCEPTED_BROWSERS = {
    Chrome: 50,
    Firefox: 50,
    strict: true
  };
  approveBrowser( ACCEPTED_BROWSERS, ( approved ) => {
    if ( !approved && !localStorage.getItem( 'ovide:warning' ) ) {
      localStorage.setItem( 'ovide:warning', true );
      alert( 'Ovide is an experiment that has been only tested on latest chrome and firefox browsers. Please switch to one of these to use the tool !' );/* eslint no-alert: 0 */
    }
  } );
}

