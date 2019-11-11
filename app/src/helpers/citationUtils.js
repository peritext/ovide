import {
  constants
} from 'scholar-draft';

import CSL from 'citeproc';
import { Parser } from 'html-to-react';

const htmlToReactParser = new Parser();

import defaultStyle from 'raw-loader!../sharedAssets/bibAssets/apa.csl';
import defaultLocale from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';

import { resourceToCslJSON } from 'peritext-utils';

const { INLINE_ASSET, BLOCK_ASSET } = constants;

/**
 * Retrieve proper citation styling models from a production
 * @return {object} proper models
 */
export const getCitationModels = ( production ) => {
  const style = ( production &&
                          production.settings &&
                          production.settings.citationStyle &&
                          production.settings.citationStyle.data
                        )
                          || defaultStyle;
    const locale = ( production &&
                          production.settings &&
                          production.settings.citationLocale &&
                          production.settings.citationLocale.data
                        )
                          || defaultLocale;
  return { style, locale };
};

const buildCitationComponents = ( { style, locale, citationItems, citationData } ) => {
  const sys = {
    retrieveLocale: () => {
      return locale;
    },
    retrieveItem: ( id ) => {
      return citationItems[id];
    },
    variableWrapper: ( params, prePunct, str, postPunct ) => {
      if ( params.variableNames[0] === 'title'
          && params.itemData.URL
          && params.context === 'bibliography' ) {
        return `${prePunct
            }<a href="${
              params.itemData.URL
            }" target="blank">${
              str
            }</a>${
              postPunct}`;
      }
      else if ( params.variableNames[0] === 'URL' ) {
        return `${prePunct
            }<a href="${
              str
            }" target="blank">${
              str
            }</a>${
              postPunct}`;
      }
      else {
        return ( prePunct + str + postPunct );
      }
    }
  };

  const processor = new CSL.Engine( sys, style );
  return citationData.reduce( ( inputCitations, thatCitationData ) => {
    const citations = { ...inputCitations };
    const citation = thatCitationData[0];
    const citationsPre = thatCitationData[1];
    const citationsPost = thatCitationData[2];
    let citationObjects;
    try {
      citationObjects = processor.processCitationCluster( citation, citationsPre, citationsPost );
      citationObjects = citationObjects[1];
      citationObjects.forEach( ( cit ) => {
        const order = cit[0];
        const html = cit[1];
        const ThatComponent = htmlToReactParser.parse( cit[1] );
        const citationId = cit[2];
        citations[citationId] = {
          order,
          html,
          Component: ThatComponent
        };
      } );
    }
 catch ( e ) {
      console.error( e );/* eslint no-console : 0 */
    }
    return citations;
  }, {} );
};

/**
 * Builds citation data for react-citeproc
 * @return {object} formatted data
 */
export const buildCitations = ( assets, props ) => {
  const {
    production,
    activeSection
  } = props;

  const {
    contextualizations,
    resources,
    contextualizers
  } = production;
  const { style, locale } = getCitationModels( production );
  const { data = {} } = activeSection;
  const {
    contents = {
      contents: {},
      notes: {},
      notesOrder: []
    }
  } = data;

    /*
     * Citations preparation
     */
    // isolate all contextualizations quoted inside editors
    const quotedEntities = contents.notesOrder.reduce( ( theseContents, noteId ) => [
      ...theseContents,
      contents.notes[noteId] ? contents.notes[noteId].contents : undefined,
    ], [ contents.contents ] )
    .filter( ( c ) => c )
    .reduce( ( entities, theseContents ) =>
      [
        ...entities,
        ...Object.keys( theseContents && theseContents.entityMap || {} ).reduce( ( localEntities, entityId ) => {
          const entity = theseContents.entityMap[entityId];
          const isContextualization = entity.type === INLINE_ASSET || entity.type === BLOCK_ASSET;
          if ( isContextualization && assets && assets[entity.data.asset.id] ) {
            return [ ...localEntities, entity.data.asset.id ];
          }
          return localEntities;
        }, [] )
      ],
    [] );
    // isolate bib contextualizations
    const bibContextualizations = quotedEntities
    .filter( ( assetKey ) =>
        assets[assetKey].type === 'bib'
        && assets[assetKey].targetId === activeSection.id
      )
    .map( ( assetKey ) => assets[assetKey] );

    // build citations items data
    const citationItems = Object.keys( bibContextualizations )
      .reduce( ( finalCitations, key1 ) => {
        const bibCit = bibContextualizations[key1];
        const citations = resourceToCslJSON( bibCit.resource );
        const newCitations = citations.reduce( ( final2, citation ) => {
          return {
            ...final2,
            [citation.id]: citation
          };
        }, {} );
        return {
          ...finalCitations,
          ...newCitations,
        };
      }, {} );

    // build citations's citations data
    const citationInstances = bibContextualizations // Object.keys(bibContextualizations)
      .map( ( bibCit, index ) => {
        const key1 = bibCit.id;
        const contextualization = contextualizations[key1];

        const contextualizer = contextualizers[contextualization.contextualizerId];
        const resource = resources[contextualization.sourceId];
        return {
          citationID: key1,
          citationItems: resourceToCslJSON( resource ).map( ( ref ) => ( {
            locator: contextualizer.parameters ? contextualizer.parameters.locator : contextualizer.locator,
            prefix: contextualizer.parameters ? contextualizer.parameters.prefix : contextualizer.prefix,
            suffix: contextualizer.parameters ? contextualizer.parameters.suffix : contextualizer.suffix,
            // ...contextualizer,
            id: ref.id,
          } ) ),
          properties: {
            noteIndex: index + 1
          }
        };
      } ).filter( ( c ) => c );

    /*
     * map them to the clumsy formatting needed by citeProc
     * todo: refactor the citationInstances --> citeProc-formatted data as a util
     */
    const citationData = citationInstances.map( ( instance, index ) => [
      instance,
      // citations before
      citationInstances.slice( 0, ( index === 0 ? 0 : index ) )
        .map( ( oCitation ) => [
            oCitation.citationID,
            oCitation.properties.noteIndex
          ]
        ),
      []

      /*
       * citations after (not using it seems to work anyway)
       * citationInstances.slice(index)
       *   .map((oCitation) => [
       *       oCitation.citationID,
       *       oCitation.properties.noteIndex
       *     ]
       *   ),
       */
    ] );

    const citationComponents = buildCitationComponents( { style, locale, citationItems, citationData } );

    return { citationItems, citationData, citationComponents };
};
