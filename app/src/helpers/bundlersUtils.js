/**
 * This module helps for processes related to the exports of a production
 * @module ovide/utils/bundlersUtils
 */
import { uniq, flatten } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import TurndownService from 'turndown';
import { ReferencesManager } from 'react-citeproc';
import convert from 'xml-js';
import JSZip from 'jszip';
import stringify from 'fast-json-stable-stringify';
import { saveAs } from 'file-saver';

import Renderer from 'peritext-template-pyrrah/dist/components/Renderer';
import { getRelatedAssetsIds } from './assetsUtils';
import { getFileAsText, getFileAsBinary } from './fileLoader';
import {
  buildCitations,
  getContextualizationsFromEdition,
  preprocessEditionData,
  buildResourceSectionsSummary,
} from 'peritext-utils';
import { getResourceTitle } from './resourcesUtils';

import { templates, contextualizers as contextualizerModules } from '../peritextConfig.render';
import defaultCitationStyle from 'raw-loader!../sharedAssets/bibAssets/apa.csl';
import defaultCitationLocale from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';

/**
 * @todo put in shared assets
 */
import pagedAddons from '!!raw-loader!../components/PagedPreviewer/addons.paged.js';
import previewStyleData from '!!raw-loader!../components/PagedPreviewer/previewStyle.paged.csx';

const turn = new TurndownService();

/**
 * =====================
 * PRIVATE UTILS
 * =====================
 */

/**
 * Gets a static summary of representable contents
 * from an edition or a production default summary
 * @param {*} params
 * @return {array} list of {resourceId, level}
 */
const getStaticSummary = ( { production, edition } ) => {
  if ( edition && edition.data && edition.data.plan && edition.data.plan.summary ) {
    return edition.data.plan.summary.reduce( ( res, element ) => {
      const {
        data = {}
      } = element;
      switch ( element.type ) {

        /**
         * Todo unhandled blocks:
          * case 'customPage':
          * case 'glossary':
          * case 'references':
          */
        case 'sections':
        case 'resourceSections':
          const { customSummary = { active: false } } = data;
          if ( customSummary.active ) {
            const { summary: thatCustomSummary } = customSummary;
            return [
              ...res,
              ...thatCustomSummary
            ];
          }
          else if ( element.type === 'resourceSections' ) {
            return [
              ...res,
              ...buildResourceSectionsSummary( { production, option: data } )
            ];
          }
          return [
            ...res,
            ...production.sectionsOrder
          ];

        default:
          return res;
      }
    }, [] );
  }
  return production.sectionsOrder;
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
            requestAssetData( { productionId, asset } )
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

const getPreprocessedContextualizations = ( {
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
    contextualizers: contextualizerModules,
    production: this.props.production,
    notes: this.props.section.data.contents.notes,
  } )

  render = () => {
    const {
      props: {
        section,
        level = 0
        // production
      }
    } = this;
    const TitleTag = `h${level + 2}`;
    return (
      <div id={ `section-${section.id}` } className={`section is-level-${level}`}>
        <TitleTag>
          {getResourceTitle( section )}
        </TitleTag>
        <div>
          <Renderer
            raw={ section.data.contents.contents }
            notesPosition={ 'sidenotes' }
            containerId={ '' }
          />
        </div>
        {section.data.contents.notesOrder.length > 0 &&
          <div>
            <h3>
              Notes
            </h3>
            <ol>
              {
                section.data.contents.notesOrder.map( ( id ) => {
                  const note = section.data.contents.notes[id];
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
 * ======================
 * PUBLIC VARIOUS UTILS
 * ======================
 */

/**
 * Prepares a production data for a clean version to export
 * @param {object} production - the input data to clean
 * @return {object} newProduction - the cleaned production
 */
export const cleanProductionForExport = ( production ) => {
  return production;
};

export const buildTEIMetadata = ( production = { metadata: {} }, edition ) => {
  const { metadata } = production;
  let editionMetadata;
  if ( edition && edition.metadata ) {
    editionMetadata = edition.metadata;
  }
  return {
    fileDesc: {
      titleStmt: {
        title: editionMetadata && editionMetadata.title.length ? editionMetadata.title : metadata.title,
        author: ( editionMetadata && editionMetadata.authors.length ? editionMetadata : metadata )
        .authors.map( ( author ) => ( {
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

export const buildHTMLMetadata = ( production = { metadata: {} }, edition ) => {
  let metadata = production.metadata;
  if ( edition ) {
    metadata = edition.metadata;
  }
  let authors = production.metadata.authors;
  if ( edition && edition.metadata && edition.metadata.authors && edition.metadata.authors.length ) {
    authors = edition.metadata.authors;
  }
  const title = metadata.title ? `
    <title>${metadata.title}</title>
    <meta name="DC.Title" content="${metadata.title}"/>
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="og:title" content="${metadata.title}" />
  ` : '<title>Quinoa production</title>';
  const description = metadata.abstract ? `
    <meta name="description" content="${metadata.abstract || metadata.description}"/>
    <meta name="DC.Description" content="${metadata.abstract || metadata.description}"/>
    <meta name="og:description" content="${metadata.abstract || metadata.description}" />
    <meta name="twitter:description" content="${metadata.abstract}" />
  ` : '';
  authors = authors && authors.length
                  ?
                  authors.map( ( author ) => `
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
      const relatedResources = uniq( contextualizations.map( ( obj ) => obj.contextualization.sourceId ) )
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
            requestAssetData( { productionId, asset } )
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

export const parseImportedFile = ( file ) => new Promise( ( resolve, reject ) => {
  const ext = file.name.split( '.' ).pop();
  let zip;
  if ( ext === 'json' ) {
    getFileAsText( file )
    .then( ( text ) => {
      let production;
      try {
        production = JSON.parse( text );
      }
      catch ( jsonError ) {
        return reject( 'malformed json' );
      }
      resolve( production );
    } )
    .catch( reject );
  }
    else if ( ext === 'zip' ) {
    getFileAsBinary( file, ( err, buff ) => {
      if ( err ) {
        reject( err );
      }
       else {
        JSZip.loadAsync( buff )
        .then( ( inputZip ) => {
          zip = inputZip;
          const production = zip.file( 'production.json' );
          if ( !production ) {
            reject( 'no production.json' );
          }
          else {
            return production.async( 'string' );
          }
        } )
        .then( ( text ) => {
          let production;
          try {
            production = JSON.parse( text );
          }
          catch ( jsonError ) {
            return reject( 'malformed json' );
          }

          return Object.keys( production.assets ).reduce( ( cur, assetId ) =>
            cur.then( ( activeProduction ) => {
              const asset = activeProduction.assets[assetId];

              return new Promise( ( res1, rej1 ) => {
                if ( asset.mimetype === 'text/csv' ) {
                  zip.file( `assets/${asset.id}/${asset.id}.json` ).async( 'string' )
                  .then( ( txt ) => {
                    let json;
                    try {
                      json = JSON.parse( txt );
                    }
                    catch ( e ) {
                      rej1( e );
                    }
                    activeProduction.assets[assetId].data = json;
                    res1( activeProduction );
                  } );
                }
                else if ( [ 'image/jpeg', 'image/jpg', 'image/png' ].includes( asset.mimetype ) ) {
                  zip.file( `assets/${asset.id}/${asset.filename}` ).async( 'base64' )
                  .then( ( base64 ) => {
                    activeProduction.assets[assetId].data = `data:${asset.mimetype};base64,${base64}`;
                    res1( activeProduction );
                  } );

                }
                else res1( activeProduction );
              } );
            } )
          , Promise.resolve( production ) );
        } )
        .then( resolve )
        .catch( reject );
      }
    } );
  }
} );

/**
 * ======================
 * PUBLIC BUNDLERS
 * ======================
 */

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

/**
 * Cleans and serializes a production representation
 * @param {object} production - the production to bundle
 * @return {string} result - the resulting serialized production
 */
export const bundleProjectAsZIP = ( { production, requestAssetData } ) => {
  const zip = new JSZip();
  return new Promise( ( resolve, reject ) => {
    loadAllAssets( {
      production,
      requestAssetData
    } )
    .then( ( assets ) => {
      zip.file( 'production.json', stringify( production, { space: '  ' } ) );
      const assetsContainer = zip.folder( 'assets' );
      Object.keys( assets ).forEach( ( assetId ) => {
        const asset = assets[assetId];
        const { data, mimetype, filename } = asset;
        if ( [ 'image/jpeg', 'image/jpg', 'image/png' ].includes( mimetype ) ) {
          const assetContainer = assetsContainer.folder( `${assetId}` );
          assetContainer.file( filename, data.split( ',' )[1], { base64: true } );
        }
        // case table
        else {
          const assetContainer = assetsContainer.folder( `${assetId}` );
          assetContainer.file( `${assetId}.json`, JSON.stringify( data ) );
        }
      } );
      zip.generateAsync( { type: 'blob' } ).then( function( content ) {
          // see FileSaver.js
          saveAs( content, `${production.metadata.title || 'peritext' }.zip` );
      } );
    } )
    .catch( reject );
  } );
};

/**
 * Cleans and serializes a production or edition representation to HTML
 * @param {object} production - the production to bundle
 * @return {string} result - the resulting HTML production
 */
export const bundleProjectAsHTML = ( { production, edition, requestAssetData } ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsJSON( { production, requestAssetData } )
      .then( ( productionJSON ) => {
        const headContent = buildHTMLMetadata( productionJSON, edition );
        const citations = buildCitations( { production: productionJSON, edition } );

        const contents = renderToStaticMarkup(
          getStaticSummary( { production, edition } )
          .map( ( { resourceId, level } ) => {
            return (
              <ReferencesManager
                key={ resourceId }
                style={ defaultCitationStyle }
                locale={ defaultCitationLocale }
                items={ citations.citationItems }
                citations={ citations.citationData }
              >
                <SectionRenderer
                  production={ productionJSON }
                  section={ productionJSON.resources[resourceId] }
                  level={level}
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

/*
 * Bundles a selection as a markdown file
 */
export const bundleProjectAsMarkdown = ( { production, requestAssetData }, edition ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsHTML( { production, requestAssetData }, edition )
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
export const bundleProjectAsTEI = ( { production, requestAssetData, edition } ) => {
  return new Promise( ( resolve, reject ) => {
    bundleProjectAsJSON( { production, requestAssetData, edition } )
      .then( ( productionJSON ) => {
        const citations = buildCitations( { production: productionJSON } );
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
              teiHeader: buildTEIMetadata( production, edition ),
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
                  div: getStaticSummary( { production: productionJSON, edition } )
                  .map( ( { resourceId } ) => {
                    const section = productionJSON.resources[resourceId];
                    const contents = renderToStaticMarkup(
                      <ReferencesManager
                        key={ resourceId }
                        style={ defaultCitationStyle }
                        locale={ defaultCitationLocale }
                        items={ citations.citationItems }
                        citations={ citations.citationData }
                      >
                        <SectionRenderer
                          production={ productionJSON }
                          section={ productionJSON.resources[resourceId] }
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

/**
 * Exports a printable static website
 * @param {object} params - necessary data for the export
 * @return {null}n
 */
export const bundleEditionAsPrintPack = ( {
  production,
  requestAssetData,
  edition,
  lang,
  locale,
} ) => {
  const zip = new JSZip();
  console.info( 'bundleEditionAsPrintPack :: starting' );
  return new Promise( ( resolve, reject ) => {
    let assets;
    let preprocessedData;
    // load assets
    console.info( 'bundleEditionAsPrintPack :: loading assets' );
    loadAllAssets( {
      production,
      requestAssetData
    } )
    // preprocess edition data
    .then( ( inputAssets ) => {
      console.info( 'bundleEditionAsPrintPack :: preprocessing edition data' );
      assets = inputAssets;
      return preprocessEditionData( { production, edition } );
    } )
    .then( ( input ) => {
      console.info( 'bundleEditionAsPrintPack :: building preprocessed contextualizations' );
      preprocessedData = input;
      const contextualizations = getContextualizationsFromEdition( production, edition );

      return getPreprocessedContextualizations( {
          production,
          edition,
          assets,
          contextualizations
        } );
    } )
    // render html
    .then( ( preprocessedContextualizations = {} ) => {
      console.info( 'bundleEditionAsPrintPack :: rendering html' );

      const template = templates.find( ( thatTemplate ) => thatTemplate.meta.id === edition.metadata.templateId );

      const Edition = template.components.Edition;

      const renderingMode = edition.metadata.type;
      const FinalComponent = () => (
        <ContextProvider
          renderingMode={ renderingMode }
          preprocessedContextualizations={ preprocessedContextualizations }
        >
          <Edition
            {
              ...{
                production,
                edition,
                lang,
                contextualizers: contextualizerModules,
                previewMode: true,
                preprocessedData,
                locale,
              }
            }
          />
        </ContextProvider>
      );
      let html = '';
      try {
        html = renderToStaticMarkup( <FinalComponent /> );
        console.info( 'html', html );
      }
      catch ( e ) {
        console.error( e );/* eslint no-console : 0 */
      }
      let htmlContent = html;
      let additionalStyles = '';
      // strip stypes
      const stylesRegexp = /<style.*>([\w\W\n]*)<\/style>/gm;
      let match;
        while ( ( match = stylesRegexp.exec( htmlContent ) ) !== null ) {
          additionalStyles += match[1];
          htmlContent = htmlContent.slice( 0, match.index ) + htmlContent.slice( match.index + match[0].length );
          match.index = -1;
      }
      const finalHtml = `
<html>
  <head>
    <title>${edition.metadata.title}</title>
    <script src="https://unpkg.com/pagedjs@0.1.34/dist/paged.polyfill.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
    <script src="paged_js_addons.js"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"></link>
    <link rel="stylesheet" href="preview_styles.css"></link>
    <link rel="stylesheet" href="main_styles.css"></link>
  </head>
  <body>
    ${htmlContent}
  </body>
</html>
      `.trim();

      zip.file( 'index.html', finalHtml );
      zip.file( 'main_styles.css', additionalStyles );
      zip.file( 'preview_styles.css', previewStyleData );
      zip.file( 'paged_js_addons.js', pagedAddons );
      zip.generateAsync( { type: 'blob' } ).then( function( content ) {
          // see FileSaver.js
          saveAs( content, `${edition.metadata.title || 'peritext' }.zip` );
      } );
    } )
    .catch( reject );
  } );
};
