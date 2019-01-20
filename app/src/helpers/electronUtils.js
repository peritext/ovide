
/**
 * Wraps a request to electron main process
 */
export default function request( type, payload ) {
  return new Promise( ( resolve, reject ) => {
    global.ipcRequester.send( type, payload, ( err, data ) => {
      if ( err ) {
        reject( err );
        return;
      }
      resolve( { data } );
    } );
  } );
}

export const inElectron = window.process && window.process.versions.hasOwnProperty( 'electron' );
