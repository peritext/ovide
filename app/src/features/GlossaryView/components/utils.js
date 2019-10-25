import {
    constants
} from 'scholar-draft';

import { resourceToCslJSON } from 'peritext-utils';

import defaultStyle from 'raw-loader!./assets/apa.csl';
import defaultLocale from 'raw-loader!./assets/english-locale.xml';

const { INLINE_ASSET } = constants;

/**
 *
 * @todo refactor the three next functions as they are redundant with sectioneditor citationUtils
 */
export const computeAssets = ( props ) => {
    const {
        production: {
          contextualizers,
          contextualizations,
          resources
      }
    } = props;
    const assets = Object.keys( contextualizations )
    .reduce( ( ass, id ) => {
      const contextualization = contextualizations[id];
      const contextualizer = contextualizers[contextualization.contextualizerId];
      const resource = resources[contextualization.sourceId];
      if ( contextualizer && resource ) {
        return {
          ...ass,
          [id]: {
            ...contextualization,
            resource,
            contextualizer,
            type: contextualizer ? contextualizer.type : INLINE_ASSET
          }
        };
      }
      return { ...ass };
    }, {} );

    return assets;
  };
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
  export const buildCitations = ( assets, props ) => {
    const {
      production: {
        contextualizations,
        resources,
        contextualizers,
        sectionsOrder,
      },
    } = props;

      /*
       * Citations preparation
       */
      // isolate all contextualizations quoted inside editors
      const quotedEntities = sectionsOrder.reduce( ( finalResult, { resourceId } ) => {
          const activeSection = resources[resourceId];
          return activeSection.data.contents.notesOrder.reduce( ( contents, noteId ) => [
            ...contents,
            activeSection.data.contents.notes[noteId].contents,
        ], [ activeSection.data.contents.contents ] )
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

      return { citationItems, citationData };
  };

export const findProspectionMatches = ( {
    contents,
    sectionId,
    contentId,
    value,
    contextualizations,
    resources,
} ) => {
    if ( !value.length ) {
        return [];
    }
    const regexp = new RegExp( value, 'gi' );
    let counter = 0;

    return contents.blocks.filter( ( b ) => b.type !== 'atomic' )
        .reduce( ( result, block ) => {
            const matches = [];
            let match = null;
            const text = block.text;
            do {
                match = regexp.exec( text );
                if ( match ) {
                    // console.log('its a match', match)
                    const startIndex = match.index;
                    const endIndex = match.index + value.length;
                    let isLegit = true;
                    // verify that it is not an existing contextualization
                    if ( block.entityRanges && block.entityRanges.length ) {
                        block.entityRanges.find( ( entityRange ) => {
                            const { key } = entityRange;
                            const entity = contents.entityMap[key];
                            if ( entity && entity.type === 'INLINE_ASSET' ) {
                                if (
                                    // same indexes
                                    ( entityRange.offset === startIndex && entityRange.length === value.length ) ||
                                    // avoid overlap
                                    ( startIndex >= entityRange.offset && startIndex <= entityRange.offset + entityRange.length ) ||
                                    ( endIndex >= entityRange.offset && endIndex <= entityRange.offset + entityRange.length )

                                ) {
                                    const contextualizationId = entity.data.asset.id;
                                    const contextualization = contextualizations[contextualizationId];
                                    if ( contextualization && resources[contextualization.sourceId] ) {

                                        /*
                                         * console.log('kill',
                                         *     entityRange.offset === startIndex && entityRange.length === value.length,
                                         *     startIndex >= entityRange.offset && startIndex <= entityRange.offset + entityRange.length,
                                         *     endIndex >= entityRange.offset && endIndex <= entityRange.offset + entityRange.length,
                                         *     contextualizationId,
                                         *     block.key,
                                         *     block.entityRanges,
                                         *     contents.entityMap
                                         * )
                                         */
                                        isLegit = false;
                                        return true;
                                    }
                                }
                            }
                        } );
                    }
                    if ( isLegit ) {
                        counter++;
                        matches.push( {
                            sectionId,
                            contentId,
                            blockKey: block.key,
                            offset: startIndex,
                            id: counter,
                            endIndex,
                            length: value.length,
                        } );
                    }
                }
            } while ( match );

            /*
             * if(matches.length)
             * console.log(matches.length, 'matches')
             */
            return [ ...result, ...matches ];
        }, [] );
};
