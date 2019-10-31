/**
 * This module provides a function for building (transpile/bundle/minify/...)
 * the code of the application to use for providing all-in-one html representations
 * of production documents
 * ==========
 * @module ovide/routes/productionAppBuilder
 */
const webpack = require( 'webpack' );
const webpackConfig = require( '../../webpack.web.prod.js' );
const { ensureDir, remove, readFile, writeFile } = require( 'fs-extra' );
const path = require( 'path' );

/**
 * Builds a js bundle of the production player application
 * in the builds/production project
 */
const jsTemplate = path.resolve( `${__dirname }/application.js.template` );
const jsTemp = path.resolve( `${__dirname }/application.js` );
const outputBase = path.resolve( `${__dirname }/../../app/htmlBuilds` );
// const htmlTemplatePath = path.resolve( `${__dirname }/template.html` );

const buildProductionApplication = ( { templateId, generatorId } ) => {
  return new Promise( ( resolve, reject ) => {
    const outputFolder = `${outputBase}/${generatorId}/${templateId}`;
    console.log( 'build production application for', templateId, 'to', outputFolder );/*eslint no-console: 0 */
    const outputTempJS = `${outputFolder}/bundle.js`;
    const outputHTML = `${outputFolder}/index.html`;
    let bundle;
    ensureDir( outputFolder )
      .then( () => readFile( jsTemplate, 'utf8' ) )
      .then( ( template ) => {
        const templated = template.replace( '${templateId}', templateId );
        return writeFile( jsTemp, templated, 'utf8' );
      } )
      .then( () => {
        const finalWebpackConf = Object.assign( {}, webpackConfig, {
          entry: jsTemp,
          output: {
            filename: 'bundle.js',
            path: outputFolder,
          },
        } );
        // console.log( 'launching webpack build' );
        return new Promise( ( res, rej ) => {
          webpack( finalWebpackConf, ( err ) => {
            if ( err ) {
              rej( err );
            }
            else {
              // console.log( 'webpack: done' );
              res();
            }
          } );
        } );
      } )
      .then( () => readFile( outputTempJS, 'utf8' ) )
      .then( ( str ) => {
        bundle = str;
        return Promise.resolve(); // readFile( htmlTemplatePath, 'utf8' );
      } )
      .then( ( ) => {

        /*
         * console.log( 'writing html' );
         * const finalHTML = templateHTML.replace(/<script id="bundle"><\/script>/gm, '<script type="text/javascript" id="bundle">' + bundle + '</script>');
         */
        const finalHTML = `<!DOCTYPE html>
  <html>
  <head>
    \${metadata}
  </head>
  <body>
    <div id="mount"></div>
    <script>
        var __production = \${productionJSON};
        var __editionId = \${editionId};
        var __locale = \${locale} || {};
    </script>
    <script id="bundle">
${bundle}
    </script>
    <script src="https://cdn.jsdelivr.net/npm/css-vars-ponyfill@1"></script>
  </body>
</html>
    `;
        return writeFile( outputHTML, finalHTML, 'utf8' );
      } )
      // .then( () => remove( outputTempJS ) )
      .then( () => remove( jsTemp ) )
      .then( () => {
        return resolve();
      } )
      .catch( reject );
  } );
};

module.exports = buildProductionApplication;
