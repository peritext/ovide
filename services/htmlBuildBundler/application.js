/* eslint-disable */
const React = require('react');
const hydrate = require('react-dom').hydrate;
const peritextConfig = require('../../app/src/peritextConfig.render');
const config = require('config');

// Note: this module needs an html #mount element somewhere in the html in which
// it is invoked.
// todo: parametrize that as function parameter to be cleaner ?
const mountNode = document.getElementById('mount');

const templateId = "deucalion";

/**
 * Handles the rendering of a peritext single page html
 * @param {object} production - the production to render
 */
const renderProduction = function (production, editionId, preprocessedData, locale, useBrowserRouter) {

  // console.log('render', production, editionId, locale, useBrowserRouter);
  // console.log('config', peritextConfig);

  const template = peritextConfig.templates.find(t => t.meta.id === templateId);
  if (!production) {
    // console.error('production is not loaded yet');
    return;
  }
  if (template) {
    const Production = template.components.Edition;
    const edition = production.editions[editionId];
    console.log('hydrating', mountNode)
    hydrate(React.createElement(Production, {
      production: production, 
      edition: edition, 
      locale: locale, 
      previewMode: false, 
      contextualizers: peritextConfig.contextualizers,
      usedDocument: document,
      useBrowserRouter: useBrowserRouter,
      preprocessedData: preprocessedData,
    }, null), mountNode, function(){
      console.log('done hydrating')
      setTimeout(() => {
        const staticContainer = document.getElementById('static')
        if (staticContainer) {
          staticContainer.remove();
        }
      })
      
    }); 
  } else {
    console.error('template %s not found', templateId);/* eslint no-console: 0 */
  }
}
// this is used in all-in-one html representations
// in which production's data is stored as a js object
renderProduction(window.__production, window.__editionId, window.__preprocessedData, window.__locale, window.__useBrowserRouter);

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop, handler) {
      var
        oldval = this[prop]
      , newval = oldval;
      var getter = function () {
        return newval;
      }
      , setter = function (val) {
        oldval = newval;
        return newval = handler.call(this, prop, oldval, val);
      }
      ;
      
      if (delete this[prop]) { // can't watch constants
        Object.defineProperty(this, prop, {
            get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}

// object.unwatch
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
      enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}
console.log('in window to watch', window.watch);
if (window.watch) {
  window.watch("__production", function (id, oldval, production) {
  // console.log('changed', production);
    renderProduction(production, window.__editionId, window.__preprocessedData, window.__locale, window.__useBrowserRouter);
  });
}


module.exports = renderProduction;