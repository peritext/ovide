
import PQueue from 'p-queue';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import { templates, contextualizers } from '../peritextConfig.render';

const queue = new PQueue( { concurrency: 1 } );

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

const addToUpdateQueue = ( job ) => {
  return new Promise( ( resolve, reject ) => {
    queue.add( job )
    .then( function() {
      resolve( ...arguments );
    } )
    .catch( reject );
  } );
};

self.onmessage = ( { data } ) => {
  const { type, payload } = data;
  if ( type && payload ) {
    switch ( type ) {
      case 'RENDER_PAGED_EDITION_HTML':
        const { production, edition, locale, lang, preprocessedData } = payload;
        addToUpdateQueue( () => {
          return new Promise( ( resolve ) => {
            const template = templates.find( ( thatTemplate ) => thatTemplate.meta.id === edition.metadata.templateId );

            const Edition = template.components.Edition;

            const renderingMode = edition.metadata.type;
            const FinalComponent = () => (
              <ContextProvider
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
            const html = renderToStaticMarkup( <FinalComponent /> );
            self.postMessage( {
              type,
              response: {
                html
              }
            } );
            resolve();
          } );

        } );

        break;
      default:
        break;

    }
  }
};
