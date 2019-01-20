import React from 'react';
import ReactDOM from 'react-dom';

import Application from './Application';

import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import I18n from 'redux-i18n';
import { ipcRenderer } from 'electron';

import configureStore from './redux/configureStore';

import translations from './translations';

import { Socket } from 'electron-ipc-socket';
import Store from 'electron-store';
const electronStore = new Store();

const socket = Socket( 'main-win', ipcRenderer );

socket.open();

global.ipcRequester = socket;

const syncHistoryWithStore = ( store, history ) => {
  const { routing } = store.getState();
  if ( routing && routing.location ) {
    history.replace( routing.location );
  }
};

const initialState = {};
const routerHistory = createMemoryHistory();
const store = configureStore( initialState );
syncHistoryWithStore( store, routerHistory );

/**
 * Getting default lang from browser or local storage
 */
let browserLang = ( navigator.language || navigator.userLanguage ).split( '-' )[0];
if ( browserLang !== 'en' || browserLang !== 'fr' ) {
  browserLang = 'en';
}
const initialLang = electronStore.get( 'ovide-lang' ) || browserLang;

const rootElement = document.getElementById( 'mount' );
ReactDOM.render(
  <Provider store={ store }>
    <I18n
      translations={ translations }
      initialLang={ initialLang || 'en-GB' }
    >
      <Application history={ routerHistory } />
    </I18n>
  </Provider>,
  rootElement
);

// console.log('hiding the element');
document.getElementById( 'loader' ).style.display = 'none';

