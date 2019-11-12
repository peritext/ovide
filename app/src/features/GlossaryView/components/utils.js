import {
    constants
} from 'scholar-draft';

import { resourceToCslJSON } from 'peritext-utils';

import defaultStyle from 'raw-loader!./assets/apa.csl';
import defaultLocale from 'raw-loader!./assets/english-locale.xml';

const { INLINE_ASSET } = constants;

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
