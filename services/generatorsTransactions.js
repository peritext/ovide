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

const peritextConfigMain = require( '../app/src/peritextConfig.main' );
const peritextConfigRender = require( '../app/src/peritextConfig.render' );
const peritextConfig = Object.assign( peritextConfigRender, peritextConfigMain );

const { getAssetData } = require( './assetsTransactions' );
const { preprocessEditionData } = require( 'peritext-utils' );
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
  urlPrefix = '',
  html
}, socket, mainWindow ) => {
  return new Promise( ( resolve, reject ) => {

    if ( generatorId === 'single-page-html' && html ) {
      writeFile( outputPath, html )
        .then( resolve )
        .catch( reject );
      return;
    }

    const generator = peritextConfig.generators[generatorId];
    const onFeedback = ( payload ) => {
      mainWindow.webContents.send( 'MAIN_ACTION', { type: 'GENERATOR_MESSAGE', payload } );
    };
    const preprocessedData = preprocessEditionData( { production, edition } );
    generator.generateOutput( {
      production,
      edition,
      templateId,
      preprocessedData,
      // contextualizers,
      locale,
      outputPath,
      tempDirPath,
      urlPrefix,
      peritextConfig,
      onFeedback,
      assetsPath: `${contentPath}/${production.id}/assets/`,
      requestAssetData: getAssetData,
      templatesBundlesPath: path.resolve( `${__dirname }/../app/htmlBuilds/single-page-html/` ),
      config: {
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
