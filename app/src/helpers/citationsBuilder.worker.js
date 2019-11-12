import buildCitationRepresentations from 'peritext-utils/dist/buildCitationRepresentations';
import { buildCitationsForResourceContents, buildCitationsForProduction } from './citationUtils';

self.onmessage = ( { data } ) => {
  const { type, payload } = data;
  if ( type && payload ) {
    let citations;
    switch ( type ) {
      case 'BUILD_CITATION_REPRESENTATIONS':
        const representations = buildCitationRepresentations( payload );
        self.postMessage( {
          type,
          response: {
            representations
          }
        } );
        break;
      case 'BUILD_CITATIONS_FOR_RESOURCE_CONTENTS':
        citations = buildCitationsForResourceContents( payload );
        self.postMessage( {
          type,
          payload,
          response: { citations }
        } );
        break;
      case 'BUILD_CITATIONS_FOR_PRODUCTION':
          citations = buildCitationsForProduction( payload );
          self.postMessage( {
            type,
            payload,
            response: { citations }
          } );
          break;
      default:
        break;

    }
  }
};
