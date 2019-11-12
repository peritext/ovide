
export const findProspectionMatches = ( {
  contents,
  sectionId,
  contentId,
  searchTerm,
  contextualizations,
  resources,
} ) => {
  if ( !searchTerm.length ) {
      return [];
  }
  const regexp = new RegExp( searchTerm, 'gi' );
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
                  const endIndex = match.index + searchTerm.length;
                  let isLegit = true;
                  // verify that it is not an existing contextualization
                  if ( block.entityRanges && block.entityRanges.length ) {
                      block.entityRanges.find( ( entityRange ) => {
                          const { key } = entityRange;
                          const entity = contents.entityMap[key];
                          if ( entity && entity.type === 'INLINE_ASSET' ) {
                              if (
                                  // same indexes
                                  ( entityRange.offset === startIndex && entityRange.length === searchTerm.length ) ||
                                  // avoid overlap
                                  ( startIndex >= entityRange.offset && startIndex <= entityRange.offset + entityRange.length ) ||
                                  ( endIndex >= entityRange.offset && endIndex <= entityRange.offset + entityRange.length )

                              ) {
                                  const contextualizationId = entity.data.asset.id;
                                  const contextualization = contextualizations[contextualizationId];
                                  if ( contextualization && resources[contextualization.sourceId] ) {

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
                          length: searchTerm.length,
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

const updateProspections = ( {
  production,
  searchTerm,
  // resource
} ) => {

  const { contextualizations, resources } = production;
  const matches = Object.keys( production.resources )
  .filter( ( resourceId ) => production.resources[resourceId].data.contents && production.resources[resourceId].data.contents.contents && production.resources[resourceId].data.contents.contents.blocks )
  .reduce( ( result, resourceId ) => {
      const section = production.resources[resourceId];
      return [
          ...result,
          ...findProspectionMatches( {
              contents: section.data.contents.contents,
              sectionId: resourceId,
              contentId: 'main',
              searchTerm,
              contextualizations,
              resources,
          } ),
          ...section.data.contents.notesOrder.reduce( ( res, noteId ) =>
              [ ...res, ...findProspectionMatches( {
                  contents: section.data.contents.notes[noteId].contents,
                  sectionId: resourceId,
                  noteId,
                  searchTerm,
                  contextualizations,
                  resources,
              } ) ]
          , [] )
      ];
  }
  , [] );
  return matches;
};

self.onmessage = ( { data } ) => {
  const { type, payload } = data;
  if ( type && payload ) {
    switch ( type ) {
      case 'BUILD_PROSPECTIONS':
        const prospections = updateProspections( payload );
        self.postMessage( {
          type,
          response: {
            prospections
          }
        } );
        break;
      default:
        break;

    }
  }
};
