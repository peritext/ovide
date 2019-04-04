/**
 * This module helps for processes related to the exports of a production
 * @module ovide/utils/projectBundler
 */
import { uniq, flatten } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import TurndownService from 'turndown';
import { ReferencesManager } from 'react-citeproc';
import convert from 'xml-js';

import Renderer from 'peritext-template-pyrrah/dist/components/Renderer';
import { getRelatedAssetsIds } from './assetsUtils';
import { contextualizers } from '../peritextConfig.render';
import { buildCitations, getContextualizationsFromEdition } from 'peritext-utils';

import defaultCitationStyle from 'raw-loader!../sharedAssets/bibAssets/apa.csl';
import defaultCitationLocale from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';

const turn = new TurndownService();

/**
 * Prepares a production data for a clean version to export
 * @param {object} production - the input data to clean
 * @return {object} newProduction - the cleaned production
 */
export const cleanProductionForExport = ( production ) => {
  return production;
};

export const buildTEIMetadata = ( production = { metadata: {} } ) => {
  const { metadata } = production;
  return {
    fileDesc: {
      titleStmt: {
        title: metadata.title,
        author: metadata.authors.map( ( author ) => ( {
          name: `${author.given } ${ author.family}`,
          affiliation: author.affiliation,
          roleName: {
            _attributes: {
              type: 'function'
            },
            _text: author.role
          }
        } ) )
      }
    }
  };
};

export const buildHTMLMetadata = ( production = { metadata: {} } ) => {
  const title = production.metadata.title ? `
    <title>${production.metadata.title}</title>
    <meta name="DC.Title" content="${production.metadata.title}"/>
    <meta name="twitter:title" content="${production.metadata.title}" />
    <meta name="og:title" content="${production.metadata.title}" />
  ` : '<title>Quinoa production</title>';
  const description = production.metadata.abstract ? `
    <meta name="description" content="${production.metadata.abstract}"/>
    <meta name="DC.Description" content="${production.metadata.abstract}"/>
    <meta name="og:description" content="${production.metadata.abstract}" />
    <meta name="twitter:description" content="${production.metadata.abstract}" />
  ` : '';
  const authors = production.metadata.authors && production.metadata.authors.length
                  ?
                  production.metadata.authors.map( ( author ) => `
                    <meta name="DC.Creator" content="${`${author.given } ${ author.family}`}" />
                    <meta name="author" content="${`${author.given } ${ author.family}`}" />` )
                  : '';
  // todo: use cover image and convert it to the right base64 dimensions for the social networks
  return `
  <meta name    = "DC.Format"
          content = "text/html">
  <meta name    = "DC.Type"
          content = "data production">
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@peritext" />
  <meta property="og:url" content="http://www.peritext.github.io" />
  <meta name="og:type" content="website" />
  ${title}
  ${authors}
  ${description}
`;
};

export const loadAssetsForEdition = ( {
  production = {},
  edition = {},
  requestAssetData,
} ) => {
  return new Promise( ( resolveGlobal, rejectGlobal ) => {
      const finalAssets = {};

      const {

        /*
         * assets = {},
         * contextualizations,
         */
        resources,
        id: productionId,
      } = production;

      const contextualizations = getContextualizationsFromEdition( production, edition );

      /*
       * get resources used in edition
       * console.log('edition', edition);
       * const {plan = {}} = edition;
       * const {summary = {}} = plan;
       * get related assets ids
       * @todo get section-level assets when summary will be customizable in order to fetch only used assets
       */
      const relatedResources = uniq( contextualizations.map( ( obj ) => obj.contextualization.resourceId ) )
        .map( ( resourceId ) => resources[resourceId] );
      const relatedAssetsIds = uniq(
        flatten(
          relatedResources.map(
            ( resource ) => getRelatedAssetsIds( resource.data )
          )
        )
      );
      const relatedAssets = relatedAssetsIds.map( ( id ) => production.assets[id] ).filter( ( a ) => a );
      // for each asset get asset data if necessary
      relatedAssets.reduce( ( cur, asset ) => {
        return cur.then( () => {
          return new Promise( ( resolve, reject ) => {
            requestAssetData( productionId, asset )
              .then( ( data ) => {
                finalAssets[asset.id] = {
                  ...asset,
                  data
                };
                return resolve();
              } )
              .catch( reject );
          } );
        } );
      }, Promise.resolve() )
      .then( () => {
        resolveGlobal( finalAssets );
      } )
      .catch( rejectGlobal );
  } );
};

const loadAllAssets = ( {
  production = {},
  requestAssetData,
} ) => {
  return new Promise( ( resolveGlobal, rejectGlobal ) => {
      const finalAssets = {};

      const {
         assets = {},

        /*
         * contextualizations,
         * resources,
         */
        id: productionId,
      } = production;

      // for each asset get asset data if necessary
      Object.keys( assets ).map( ( assetId ) => assets[assetId] )
      .reduce( ( cur, asset ) => {
        return cur.then( () => {
          return new Promise( ( resolve, reject ) => {
            requestAssetData( productionId, asset )
              .then( ( data ) => {
                finalAssets[asset.id] = {
                  ...asset,
                  data
                };
                return resolve();
              } )
              .catch( reject );
          } );
        } );
      }, Promise.resolve() )
      .then( () => {
        resolveGlobal( finalAssets );
      } )
      .catch( rejectGlobal );
  } );
};

/**
 * Cleans and serializes a production representation
 * @param {object} production - the production to bundle
 * @return {string} result - the resulting serialized production
 */
export const bundleProjectAsJSON = ( { production, requestAssetData } ) => {
  return new Promise( ( resolve, reject ) => {
    loadAllAssets( {
      production,
      requestAssetData
    } )
    .then( ( assets ) => {
      const assetsProduction = {
        ...production,
        assets
      };
      resolve( assetsProduction );
    } )
    .catch( reject );
  } );
};

class SectionRenderer extends Component {
  static childContextTypes = {
    renderingMode: PropTypes.string,
    productionAssets: PropTypes.object,
    contextualizers: PropTypes.object,
    production: PropTypes.object,
    notes: PropTypes.object,
  }
  getChildContext = () => ( {
    renderingMode: 'paged',
    productionAssets: this.props.production.assets,
    contextualizers,
    production: this.props.production,
    notes: this.props.section.notes,
  } )

  render = () => {
    const {
      props: {
        section,
        // production
      }
    } = this;
    return (
      <div id={ `section-${section.id}` }>
        <div>
          <Renderer
            raw={ section.contents }
            notesPosition={ 'sidenotes' }
            containerId={ '' }
          />
        </div>
        {section.notesOrder.length > 0 &&
          <div>
            <h3>
              Notes
            </h3>
            <ol>
              {
                section.notesOrder.map( ( id ) => {
                  const note = section.notes[id];
                  return (
                    <li
                      id={ `note-content-${id}` }
                      key={ id }
                    >
                      <Renderer
                        raw={ note.contents }
                        notesPosition={ 'footnotes' }
                        containerId={ '' }
                      />
                    </li>
                  );
                } )
              }
            </ol>
          </div>
        }
      </div>
    );
  }
}

/**
 * Cleans and serializes a production representation to HTML
 * @param {object} production - the production to bundle
 * @return {string} result - the resulting HTML production
 */
export const bundleProjectAsHTML = ( { production, requestAssetData } ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsJSON( { production, requestAssetData } )
      .then( ( productionJSON ) => {
        const headContent = buildHTMLMetadata( productionJSON );
        const citations = buildCitations( productionJSON );

        const contents = renderToStaticMarkup(
          production.sectionsOrder.map( ( sectionId ) => {
            return (
              <ReferencesManager
                key={ sectionId }
                style={ defaultCitationStyle }
                locale={ defaultCitationLocale }
                items={ citations.citationItems }
                citations={ citations.citationData }
              >
                <SectionRenderer
                  production={ productionJSON }
                  section={ productionJSON.sections[sectionId] }
                />
              </ReferencesManager>
            );
         } )
        );
        resolve( `<!DOCTYPE html>
<html>
  <head>
    ${headContent}
  </head>
  <body>
    ${contents}
  </body>
</html>` );
      } )
      .catch( reject );
  } );
};

export const bundleProjectAsMarkdown = ( { production, requestAssetData } ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsHTML( { production, requestAssetData } )
      .then( ( productionHTML ) => {
        const markdown = turn.turndown( productionHTML );
        resolve( markdown );
      } )
      .catch( reject );
  } );
};


/**
 * @todo finish TEI exports
 * doc : https://github.com/OpenEdition/tei.openedition/wiki/Composer-un-document-en-TEI-pour-Lodel-1.0#teiheader
 * remaining :
 * - abstract language to infer from ovide lang
 * - notes handling
 * - check that contextualizations are rendered properly
 * - add feedback in UI (this one can be long)
 */
export const bundleProjectAsTEI = ( { production, requestAssetData } ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsJSON( { production, requestAssetData } )
      .then( ( productionJSON ) => {
        const citations = buildCitations( productionJSON );
        const js = {
          _declaration: {
            _attributes: {
              version: '1.0',
              encoding: 'utf-8'
            },
          },

            TEI: {
              _attributes: {
                'xmlns': 'http://www.tei-c.org/ns/1.0',
                'xmlns:rng': 'http://relaxng.org/ns/structure/1.0'
              },
              teiHeader: buildTEIMetadata( production ),
              text: {
                front: {
                  div: {
                    _attributes: {
                      'type': 'abstract',
                      'xml:lang': 'fr'
                    },
                    p: ( production.metadata.abstract || '' ).split( '\n\n' )
                  }
                },
                body: {
                  div: productionJSON.sectionsOrder.map( ( sectionId ) => {
                    const section = productionJSON.sections[sectionId];
                    const contents = renderToStaticMarkup(
                          <ReferencesManager
                            key={ sectionId }
                            style={ defaultCitationStyle }
                            locale={ defaultCitationLocale }
                            items={ citations.citationItems }
                            citations={ citations.citationData }
                          >
                            <SectionRenderer
                              production={ productionJSON }
                              section={ productionJSON.sections[sectionId] }
                            />
                          </ReferencesManager>
                    );
                    const contentsJS = convert.xml2js( `<div>${ contents }</div>`, { compact: true, spaces: 4 } );
                    return {
                      head: {
                        _attributes: {
                          subtype: 'level1',
                        },
                        _text: section.metadata.title,
                      },
                      contents: contentsJS
                    };
                  } )
                }
              }
            }
        };
        const xml = convert.js2xml( js, { compact: true } );
        resolve( xml );
      } )
      .catch( reject );
  } );

};