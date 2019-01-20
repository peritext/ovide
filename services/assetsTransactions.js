const electron = require( 'electron' );
const join = require( 'path' ).join;
const {
  ensureDir,
  writeFile,
  readFile,
  remove,
} = require( 'fs-extra' );
// const {csvParse, tsvParse} = require('d3-dsv');

const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

const contentPath = join( userDataPath, '/productions' );

ensureDir( contentPath );

const createAsset = ( { productionId, asset } ) => {
  return new Promise( ( resolve, reject ) => {
    const { id, filename } = asset;
    const dirPath = `${contentPath}/${productionId}/assets/${id}`;
    const address = `${dirPath}/${filename}`;
    ensureDir( dirPath )
      .then( () => {

        switch ( asset.mimetype ) {
          case 'image/png':
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/gif':
          case 'image/tiff':

            const ext = asset.mimetype.split( '/' ).pop();
            const regex = new RegExp( `^data:image\/${ext};base64,` );
            const data = asset.data.replace( regex, '' );
            return writeFile( address, data, 'base64' );

          case 'application/json':
          // also csv because stored as json
          case 'text/csv':/* eslint no-fallthrough : 0 */
          case 'text/tsv':
          case 'text/comma-separated-values':
          case 'text/tab-separated-values':
            return writeFile( address, JSON.stringify( asset.data ), 'utf8' );

          case 'text/plain':
          case 'text/html':
            return writeFile( address, asset.data, 'utf8' );

          default:
            return writeFile( address, asset.data, 'binary' );
        }
      } )
      .then( () => resolve( { productionId, asset, id: asset.id } ) )
      .catch( ( error ) => reject( { productionId, asset, error } ) );
  } );
};

const updateAsset = createAsset;

const deleteAsset = ( { productionId, asset } ) => {
  return new Promise( ( resolve, reject ) => {
    const { id } = asset;
    const dirPath = `${contentPath}/${productionId}/assets/${id}`;
    remove( dirPath )
      .then( () => resolve( { productionId, asset } ) )
      .catch( ( error ) => reject( { productionId, asset, error } ) );
  } );
};

const getAssetData = ( { productionId, asset = {} } ) => {
  return new Promise( ( resolve, reject ) => {
    // console.log( 'request asset data in get asset data, asset is', asset );
    const { id, filename } = asset;
    const dirPath = `${contentPath}/${productionId}/assets/${id}`;
    const address = `${dirPath}/${filename}`;
    ensureDir( dirPath )
      .then( () => {
        switch ( asset.mimetype ) {
          case 'image/png':
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/gif':
          case 'image/tiff':
            return readFile( address, 'base64' )
              .then( ( base64 ) => {
                const data = `data:${asset.mimetype};base64,${base64}`;
                resolve( data );
              } )
              .catch( reject );
          case 'application/json':
          // also csv because stored as json
          case 'text/csv':/* eslint no-fallthrough : 0 */
          case 'text/tsv':
          case 'text/comma-separated-values':
          case 'text/tab-separated-values':
            return readFile( address, 'utf8' )
                    .then( ( str ) => {
                      try {
                        const data = JSON.parse( str );
                        resolve( data );
                      }
                      catch ( error ) {
                        reject( error );
                      }
                    } )
                    .catch( reject );

          case 'text/plain':
          case 'text/html':
            return readFile( address, 'utf8' )
              .then( resolve )
              .catch( reject );
          default:
            return readFile( address, asset.data, 'binary' )
                      .then( resolve ).catch( reject );
        }
      } );
  } );
};

module.exports = {
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetData,
};
