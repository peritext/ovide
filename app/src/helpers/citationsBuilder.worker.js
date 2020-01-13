import buildCitationRepresentations from 'peritext-utils/dist/buildCitationRepresentations';
import { buildCitationsForResourceContents, buildCitationsForProduction } from './citationUtils';
import PQueue from 'p-queue';

const queue = new PQueue( { concurrency: 1 } );

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
    let citations;
    switch ( type ) {
      case 'BUILD_CITATION_REPRESENTATIONS':
          addToUpdateQueue( () => {
          return new Promise( ( resolve ) => {
            const representations = buildCitationRepresentations( payload );
            self.postMessage( {
              type,
              response: {
                representations
              }
            } );
            resolve();
          } );
        } );

        break;
      case 'BUILD_CITATIONS_FOR_RESOURCE_CONTENTS':
          addToUpdateQueue( () => {
          return new Promise( ( resolve ) => {
            citations = buildCitationsForResourceContents( payload );
            self.postMessage( {
              type,
              payload,
              response: { citations }
            } );
            resolve();
          } );
        } );

        break;
      case 'BUILD_CITATIONS_FOR_PRODUCTION':
          addToUpdateQueue( () => {
            return new Promise( ( resolve ) => {
              citations = buildCitationsForProduction( payload );
              self.postMessage( {
                type,
                payload,
                response: { citations }
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
