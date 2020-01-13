
import defaultStyle from 'raw-loader!../sharedAssets/bibAssets/apa.csl';
import defaultLocale from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';

import { resourceToCslJSON, buildCitationRepresentations } from 'peritext-utils';

import { computeAssetsForProduction } from './misc';

const INLINE_ASSET = 'INLINE_ASSET';
const BLOCK_ASSET = 'BLOCK_ASSET';

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

export const buildCitationsForProduction = ( { production } ) => {
  const assets = computeAssetsForProduction( { production } );
  const { style, locale } = getCitationModels( production );
  const {
      contextualizations,
      resources,
      contextualizers,
      sectionsOrder,
  } = production;

    /*
     * Citations preparation
     */
    // isolate all contextualizations quoted inside editors
    const quotedEntities = sectionsOrder.reduce( ( finalResult, { resourceId } ) => {
        const activeSection = resources[resourceId];
        return activeSection.data.contents.notesOrder.reduce( ( contents, noteId ) => [
          ...contents,
          activeSection.data.contents && activeSection.data.contents.notes[noteId].contents,
      ], [ activeSection.data.contents.contents ] )
      .filter( ( c ) => c )
      .reduce( ( entities, contents ) =>
          [
          ...entities,
          ...Object.keys( contents && contents.entityMap || {} ).reduce( ( localEntities, entityId ) => {
              const entity = contents.entityMap[entityId];
              const isContextualization = entity.type === 'INLINE_ASSET' || entity.type === 'BLOCK_ASSET';
              if ( isContextualization && assets && assets[entity.data.asset.id] ) {
              return [ ...localEntities, entity.data.asset.id ];
              }
              return localEntities;
          }, [] )
          ],
      finalResult );
    }, [] );

    // isolate bib contextualizations
    const bibContextualizations = quotedEntities
    .filter( ( assetKey ) =>
        assets[assetKey].type === 'bib'
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
    const citationComponents = buildCitationRepresentations( { style, locale, items: citationItems, citations: citationData } );

    return { citationItems, citationData, citationComponents };
};

/**
 * Builds citation data for react-citeproc
 * @return {object} formatted data
 */
export const buildCitationsForResourceContents = ( {
  production,
  resourceId
} ) => {
  const assets = computeAssetsForProduction( { production } );
  const activeSection = production.resources[resourceId];

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

    const citationComponents = buildCitationRepresentations( { style, locale, items: citationItems, citations: citationData } );

    return { citationItems, citationData, citationComponents };
};
