const electron = require( 'electron' );
const path = require( 'path' );
const {
  ensureDir,
  writeFile,
  readdir,
  readFile,
  remove,
  lstatSync,
  createWriteStream,
  copy,
} = require( 'fs-extra' );
const stringify = require( 'fast-json-stable-stringify' );
const archiver = require( 'archiver' );
const createAsset = require( './assetsTransactions' ).createAsset;

const reducer = require( './productionsDuck' );

const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

const contentPath = path.join( userDataPath, '/productions' );

ensureDir( contentPath );

const getProductions = () => {
  return new Promise( ( resolve, reject ) => {
      ensureDir( contentPath )
      .then( () => readdir( contentPath ) )
      .then( ( files ) => {
        const parseFile = ( dirName ) => {
          const jsonPath = path.join( contentPath, `${dirName}/${dirName}.json` );
          return new Promise( ( resolveThat, rejectThat ) => {
            return readFile( jsonPath, 'utf8' )
              .then( ( str ) => {
                try {
                  return resolveThat( [ dirName, JSON.parse( str ) ] );
                }
                catch ( error ) {
                  rejectThat( error );
                }
              } )
              .catch( rejectThat );
          } );
        };
        const filesToParse = files.filter( ( f ) => f !== 'undefined' && lstatSync( `${contentPath}/${f}` ).isDirectory() );
        return Promise.all( filesToParse.map( parseFile ) );
      } )
      .then( ( couples ) => {
        const productions = couples.reduce( ( result, couple ) => Object.assign( result, {
          [couple[0]]: couple[1]
        } ), {} );

        resolve( { productions } );
      } )
      .catch( ( e ) => {
        console.log( e );/* eslint no-console: 0 */
        reject( e );
      } );
  } );
};

const createProduction = ( { productionId, production } ) => {
  return new Promise( ( resolve, reject ) => {

    const assets = production.assets;
    const finalProduction = {
      ...production,
      assets: Object.keys( assets ).reduce( ( res, assetId ) => ( {
        ...res,
        [assetId]: {
          ...assets[assetId],
          data: undefined
        }
      } ), {} )
    };

    const dirPath = `${contentPath}/${productionId}`;
    ensureDir( dirPath )
      .then( () =>
        writeFile( `${dirPath}/${productionId}.json`, stringify( finalProduction ), 'utf8' )
      )
      .then( () =>
          Object.keys( assets ).reduce( ( cur, assetId ) =>
            cur.then( () =>
              createAsset( { productionId: finalProduction.id, asset: assets[assetId] } )
            )
          , Promise.resolve() )
        )
      .then( () => {
        resolve( { productionId, production: finalProduction } );
      } )
      .catch( ( error ) => reject( { productionId, error } ) );
  } );
};

const getProduction = ( { productionId } ) =>
  new Promise( ( resolve, reject ) => {
    const jsonPath = path.join( contentPath, `${productionId}/${productionId}.json` );
    return readFile( jsonPath, 'utf8' )
      .then( ( str ) => {
        try {
          return resolve( { production: JSON.parse( str ) } );
        }
        catch ( error ) {
          return reject( error );
        }
      } )
      .catch( reject );
  } );

const updateProduction = ( { productionId, production } ) => {
  return new Promise( ( resolve, reject ) => {
    const thatPath = `${contentPath}/${productionId}/${productionId}.json`;
    writeFile( thatPath, stringify( production ), 'utf8' )
      .then( () => {
        return resolve( { productionId, production } );
      } )
      .catch( ( error ) =>
        reject( { productionId, error } )
      );
  } );
};

const updateProductionPart = ( { action } ) => {
  return new Promise( ( resolve, reject ) => {
    const productionId = action.payload.productionId;
    let newProduction;
    console.log( 'update production part', action );
    getProduction( { productionId } )
      .then( ( { production } ) => {
        const state = {
          [production.id]: production
        };
        const newState = reducer( state, action );
        newProduction = newState[production.id];
        const thatPath = `${contentPath}/${productionId}/${productionId}.json`;
        // console.log( 'write file after action', action.type, newProduction.resources );
        return writeFile( thatPath, stringify( newProduction ), 'utf8' );
      } )
      .then( () => {
        return resolve( { productionId, production: newProduction } );
      } )
      .catch( ( error ) => {
        reject( { productionId, error } );
      }
      );
  } );
};

const deleteProduction = ( { productionId } ) => {
  return new Promise( ( resolve, reject ) => {
    const thatPath = `${contentPath}/${productionId}`;
    remove( thatPath )
      .then( () => getProductions() )
      .then( ( data ) => resolve( data ) )
      // .then( () => resolve( { productionId } ) )
      .catch( ( error ) => reject( { productionId, error } ) );
  } );
};

const packProduction = ( {
  html = '',
  filename = 'peritext-production.zip',
  mediasToSave = [],
} ) => new Promise( ( resolve ) => {
  const tempPath = path.join( userDataPath, '/temp' );
  ensureDir( tempPath )
    .then( () => ensureDir( `${tempPath}/medias` ) )
    .then( () => writeFile( `${tempPath}/index.html`, html, 'utf8' ) )
    .then( () => {
      return mediasToSave.reduce( ( cur, mediaPath ) => {
        const mediaFileName = mediaPath.split( '/' ).pop();
        const source = mediaPath.slice( 'file://'.length );
        const target = `${tempPath}/medias/${mediaFileName}`;
        return cur
          .then( () => copy( source, target ) );
      }
        , Promise.resolve() );
    } )
    .then( () => {
      return new Promise( ( resolve1, reject1 ) => {
        const output = createWriteStream( filename );
        const archive = archiver( 'zip', {
          zlib: { level: 9 } // Sets the compression level.
        } );

        output.on( 'finish', function() {
          return resolve1();
        } );

        /*
         * listen for all archive data to be written
         * 'close' event is fired only when a file descriptor is involved
         */
        output.on( 'close', function() {

        /*
         * console.log(archive.pointer() + ' total bytes');
         * console.log('archiver has been finalized and the output file descriptor has closed.');
         */
          return resolve1();
        } );

        /*
         * This event is fired when the data source is drained no matter what was the data source.
         * It is not part of this library but rather from the NodeJS Stream API.
         * @see: https://nodejs.org/api/stream.html#stream_event_end
         */
        output.on( 'end', function() {
        // console.log('Data has been drained');
          return resolve1();
        } );

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on( 'warning', function( err ) {
          if ( err.code === 'ENOENT' ) {
          // log warning
            console.warn( err );/* eslint no-console : 0 */
          }
          else {
          // throw error
            reject1( err );
          }
        } );

        // good practice to catch this error explicitly
        archive.on( 'error', function( err ) {
          reject1( err );
        } );

        // pipe archive data to the file
        archive.pipe( output );

        archive.directory( tempPath, false );
        archive.finalize();
      } );

    } )

    .then( () => remove( tempPath ) )
    .then( resolve )
    .catch( ( e ) => console.log( e ) );/* eslint no-console : 0 */
} );

module.exports = {
  getProduction,
  createProduction,
  updateProduction,
  updateProductionPart,
  deleteProduction,
  getProductions,
  packProduction,
};
