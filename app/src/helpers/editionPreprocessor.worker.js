import {
  preprocessEditionData
} from 'peritext-utils';
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
    switch ( type ) {
      case 'PREPROCESS_EDITION_DATA':
        const { production, edition } = payload;
        addToUpdateQueue( () => {
          return new Promise( ( resolve ) => {
            const response = preprocessEditionData( { production, edition } );
            self.postMessage( {
              type,
              response
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
