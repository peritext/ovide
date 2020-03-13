const { readFile, writeFile, copy } = require( 'fs-extra' );
const homepage = require( './package.json' ).homepage;
const version = require( './package.json' ).version;
const repository = require( './package.json' ).repository;
const config = require( 'config' );

const inputIndexPath = `${__dirname}/app/index.html`;
const input404Path = `${__dirname}/app/404.html`;
const inputNoJekyllPath = `${__dirname}/app/.nojekyll`;
// const inputBundles = `${__dirname}/app/bundles`;

const outputIndexPath = `${__dirname}/docs/index.html`;
const output200Path = `${__dirname}/docs/index.html`;
const output404Path = `${__dirname}/docs/404.html`;
const outputNoJekyllPath = `${__dirname}/docs/.nojekyll`;
// const outputBundles = `${__dirname}/docs/bundles`;

let fixed;
let fixed404;

readFile( inputIndexPath, 'utf8' )
  .then( ( str ) => {
    fixed = str
      .replace( /="\//g, `="${homepage}/` )
      .replace( 'window.__PUBLIC_URL__ = \'\';', `window.__PUBLIC_URL__ = '${homepage}';` )
      .replace( 'window.__OVIDE_VERSION__ = \'\';', `window.__OVIDE_VERSION__ = '${version}';` )
      .replace( 'window.__SOURCE_REPOSITORY__ = \'\';', `window.__SOURCE_REPOSITORY__ = '${repository}';` )
      .replace( 'window.OVIDE_CONFIG = {};', `window.OVIDE_CONFIG = ${JSON.stringify( config )};` )
      .replace( '/build/bundle.js', `${homepage}/build/bundle.js` );
    return writeFile( outputIndexPath, fixed, 'utf8' );
  } )
  .then( () => writeFile( output200Path, fixed, 'utf8' ) )
  .then( () => readFile( input404Path, 'utf8' ) )
  .then( ( str404 ) => {
    fixed404 = str404
      .replace( /="\//g, `="${homepage}/` );
    return writeFile( output404Path, fixed404, 'utf8' );
  } )
  .then( () => copy( inputNoJekyllPath, outputNoJekyllPath ) )
  // .then(() => copy(inputBundles, outputBundles))
  .catch( console.error );
