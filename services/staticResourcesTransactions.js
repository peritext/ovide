const { ensureDir, readFile } = require( 'fs-extra' );
const path = require( 'path' );

const localesList = require( '../app/resources/citation-locales-list' );
const localesMap = require( '../app/resources/citation-locales-map' );

const stylesList = require( '../app/resources/citation-styles-list' );
const stylesMap = require( '../app/resources/citation-styles-map' );

const getCitationLocales = () => {
  return Promise.resolve( localesList );
};

const getCitationLocale = ( { localeId } ) => {
  return Promise.resolve( localesMap[localeId].data );
};

const getCitationStyles = () => {
  return Promise.resolve( stylesList );
};

const getCitationStyle = ( { styleId } ) => {
  return Promise.resolve( stylesMap[styleId].data );
};

const getHTMLBuild = ( { generatorId, templateId } ) => {
  const htmlFolder = path.resolve( `${__dirname}/../app/htmlBuilds/${generatorId}/${templateId}` );
  const htmlPath = path.resolve( `${htmlFolder}/index.html` );
  return new Promise( ( resolve, reject ) => {
    ensureDir( htmlFolder )
    .then( () => readFile( htmlPath, 'utf8' ) )
    .then( ( data ) => {
      resolve( data );
    } )
    .catch( reject );
  } );
};

const getJSBuild = ( { generatorId, templateId } ) => {
  const htmlFolder = path.resolve( `${__dirname}/../app/htmlBuilds/${generatorId}/${templateId}` );
  const htmlPath = path.resolve( `${htmlFolder}/bundle.js` );
  return new Promise( ( resolve, reject ) => {
    ensureDir( htmlFolder )
    .then( () => readFile( htmlPath, 'utf8' ) )
    .then( ( data ) => {
      resolve( data );
    } )
    .catch( reject );
  } );
};

module.exports = {
  getCitationLocales,
  getCitationLocale,
  getCitationStyles,
  getCitationStyle,
  getHTMLBuild,
  getJSBuild,
};
