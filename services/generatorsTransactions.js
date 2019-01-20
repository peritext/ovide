const electron = require( 'electron' );
const path = require( 'path' );
const {
  ensureDir,
  writeFile,

  /*
   * writeFile,
   * readdir,
   * readFile,
   */
  remove,
} = require( 'fs-extra' );
const config = require( 'config' );

const peritextConfigMain = require( '../app/src/peritextConfig.main' );
const peritextConfigRender = require( '../app/src/peritextConfig.render' );
const peritextConfig = Object.assign( peritextConfigRender, peritextConfigMain );

const { getAssetData } = require( './assetsTransactions' );
// const peritextConfigPath = path.resolve( `${__dirname }/../app/src/peritextConfig.render` );

const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

const contentPath = path.join( userDataPath, '/productions' );
const tempDirPath = path.join( userDataPath, '/temp' );

ensureDir( contentPath );
ensureDir( tempDirPath );

const generateEdition = ( {
  production,
  edition,
  templateId,
  locale,
  outputPath,
  generatorId,
  html
} ) => {
  return new Promise( ( resolve, reject ) => {

    if ( generatorId === 'single-page-html' && html ) {
      writeFile( outputPath, html )
        .then( resolve )
        .catch( reject );
      return;
    }

    const generator = peritextConfig.generators[generatorId];

    generator.generateOutput( {
      production,
      edition,
      templateId,
      // contextualizers,
      locale,
      outputPath,
      tempDirPath,
      peritextConfig,
      assetsPath: `${contentPath}/${production.id}/assets/`,
      requestAssetData: getAssetData,
      basePath: path.resolve( `${__dirname }/../` ),
      config: {
        googleApiKey: config.googleApiKey
      }
    } )
    // clean temp files
    .then( () => {
      return remove( tempDirPath );
    } )
    .then( () => {
      // console.log( 'done generating, recreating temp dir' );
      return ensureDir( tempDirPath );
    } )
    .then( resolve )
    .catch( reject );
  } );
};

module.exports = {
  generateEdition
};
