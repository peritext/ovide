import get from 'axios';
import { inElectron, default as requestToMain } from './electronUtils';
import { b64toBlob, convertBlobAssetToPreviewData } from './assetsUtils';
import { buildHTMLMetadata, loadAssetsForEdition } from 'peritext-utils';
import peritextConfig from '../peritextConfig.render';
import downloadFile from './fileDownloader';
import PQueue from 'p-queue';
import { v4 as genId } from 'uuid';
import preprocessEditionData from 'peritext-utils/dist/preprocessEditionData';

const webAppPrefix = window.location.href.includes( 'ovide' ) ? `${window.location.href.split( 'ovide' )[0] }ovide/` : `${window.location.href.split( '/' ).slice( 0, 3 ).join( '/' ) }/`;

const queue = new PQueue( { concurrency: 1 } );

/**
 * Adds modification to queue of operations to process
 * to prevent concurrency issues
 * @param {function} job - the function that must return a promise
 */
const addToUpdateQueue = ( job ) => {
  return new Promise( ( resolve, reject ) => {
    queue.add( job )
    .then( function() {
      resolve( ...arguments );
    } )
    .catch( reject );
  } );
};

/**
 * ========================
 * Local utils
 * ========================
 */
const queryPouchDb = ( method, query, key ) => {
  return new Promise( ( resolve, reject ) => {
    db[method]( query )
      .then( ( data ) => {
        resolve( {
          data: {
            [key]: data,
            success: true
          }
        } );
      } )
      .catch( reject );
  } );
};

/**
 * ========================
 * Assets transactions
 * ========================
 */

/**
 * Pouchdb specifics
 */

export const createAssetInDb = ( asset ) => {
  // console.log( 'create asset in db', asset );
  return new Promise( ( resolve, reject ) => {
    // console.log( 'creating the asset object' );
    db.put( {
      ...asset,
      data: undefined,
      _id: asset.id
    } )
    .then( () => db.get( asset.id ) )
    .then( ( { _rev } ) => {
        let blob;
        switch ( asset.mimetype ) {
          case 'image/png':
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/gif':
          case 'image/tiff':
            blob = b64toBlob( ( asset.data || '' ).split( 'base64,' )[1] );
            break;
          case 'application/json':
          case 'text/csv':
          case 'text/tsv':
          case 'text/comma-separated-values':
          case 'text/tab-separated-values':
            blob = new Blob( [ JSON.stringify( asset.data ) ], { type: asset.mimetype } );
            break;
          case 'text/html':
          case 'text/plain':
          default:
            blob = new Blob( [ asset.data ], { type: asset.mimetype } );
        }

        /*
         * console.log('blob was created', blob);
         * console.log('attaching with rev', _rev);
         */
        return db.putAttachment( asset.id, asset.filename, _rev, blob, asset.mimetype );
      } )
      .then( resolve )
      .catch( reject );
  } );
};

export const updateAssetInDb = ( asset ) => {
  return new Promise( ( resolve, reject ) => {
    let existingFilename;
    db.get( asset.id )
    .then( ( { _rev, filename } ) => {
      existingFilename = filename;
      // remove existing attachment if needed
      if ( existingFilename !== asset.filename ) {
        return db.removeAttachment( asset.id, existingFilename, _rev );
      }
 else return Promise.resolve();
    } )
    .then( () => db.get( asset.id ) )
    .then( ( { _rev } ) => {
        let blob;
        switch ( asset.mimetype ) {
          case 'image/png':
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/gif':
          case 'image/tiff':
            blob = b64toBlob( ( asset.data || '' ).split( `data:${asset.mimetype};base64,` )[1] );
            break;
          case 'application/json':
          case 'text/csv':
          case 'text/tsv':
          case 'text/comma-separated-values':
          case 'text/tab-separated-values':
            blob = new Blob( [ JSON.stringify( asset.data ) ], { type: asset.mimetype } );
            break;
          case 'text/html':
          case 'text/plain':
          default:
            blob = asset.data;
            break;
        }

        /*
         * const attachment = new Buffer(blob, {type: asset.mimetype});
         * console.log('attach new asset', asset.filename);
         */
        return db.putAttachment( asset.id, asset.filename, _rev, blob, asset.mimetype );
      } )
      .then( () => db.get( asset.id ) )
      .then( ( { _rev, _attachments } ) => {
        return db.put( {
          ...asset,
          data: undefined,
          _rev,
          _id: asset.id,
          _attachments,
        } );
      } )
      .then( resolve )
      .catch( reject );
  } );
};

/**
 * Entry points
 */
export const requestAssetCreation = ( productionId, asset ) => {
  // console.log( 'request asset creation', productionId, asset );
  return addToUpdateQueue( () => {
    // console.log( 'execute asset creation' );
    if ( inElectron ) {
      return requestToMain( 'create-asset', { productionId, asset } );
    }
    else {
      // console.log( 'create asset in db', asset );
      return createAssetInDb( asset );
    }
  } );

};

export const requestAssetUpdate = ( productionId, asset ) => {
  return addToUpdateQueue( () => {
    if ( inElectron ) {
      return requestToMain( 'update-asset', { productionId, asset } );
    }
    else {
      return updateAssetInDb( asset );
    }
  } );

};

export const requestAssetDeletion = ( productionId, asset ) => {
  // console.log( 'asset deletion before update queue' );
  if ( !asset ) {
    return Promise.resolve();
  }
  return addToUpdateQueue( () => {
    if ( inElectron ) {
      return requestToMain( 'delete-asset', { productionId, asset } );
    }
    else {
      // console.log( 'asset deletion in client' );
      return new Promise( ( resolve, reject ) => {
        db.get( asset.id )
          .then( ( { _rev } ) => {
            // console.log( 'remove attachement', asset.id, asset.filename, _rev );
            return db.removeAttachment( asset.id, asset.filename, _rev );
          } )
          .then( () => db.get( asset.id ) )
          .then( ( { _rev } ) => {
            return db.remove( asset.id, _rev );
          } )
          .then( resolve )
          .catch( reject );
      } );
    }
  } );
};

/**
 * Requests data in a preview-ready format
 * @param {string} productionId
 * @param {object} asset
 * @return {Promise} response promise
 */
export const requestAssetData = ( { productionId, asset } ) => {
  if ( inElectron ) {
    return new Promise( ( resolve, reject ) => {
      requestToMain( 'get-asset-data', { productionId, asset } )
        .then( ( { data } ) => {
          resolve( data );
        } )
        .catch( reject );
    } );
  }
  else {
    return new Promise( ( resolve, reject ) => {
      if ( asset && asset.id ) {
        db.getAttachment( asset.id, asset.filename )
        .then( ( blobBuffer ) => {
              return convertBlobAssetToPreviewData( blobBuffer, asset.mimetype );
          } )
        .then( resolve )
        .catch( reject );
      }
      // else reject( 'no asset' );
      else {
        console.warn( 'asked to retrieve an inexisting asset' );
        resolve( undefined );
      }

    } );
  }
};

/**
 * ========================
 * Productions transactions
 * ========================
 */

/**
 * Pouchdb specifics
 */

const updateProductionPartInDb = ( action, reducer ) => {
  // console.log('will update', action.type);
  return new Promise( ( resolve, reject ) => {
    let newProductionsList;
    let newProduction;
    // console.log('updateProductionPartInDb', action.type, 'now');

    db.get( action.payload.productionId )
      .then( ( updatedProduction ) => {
        const state = {
          production: updatedProduction
        };
        // console.log('updated production', updatedProduction);
        const newState = reducer( state, action );
        newProduction = newState.production;// [updatedProduction.id];
        // console.log('new production', newProduction);
        return db.put( newProduction );
      } )
      .then( () => {
        return new Promise( ( res1, rej1 ) => {
          // update production metadata -> update productions list
            db.get( 'productions-list' )
              .then( ( productionsList ) => {
                newProductionsList = {
                  ...productionsList,
                  [newProduction.id]: { metadata: newProduction.metadata, lastUpdateAt: newProduction.lastUpdateAt }
                };
                db.put( newProductionsList )
                  .then( res1 )
                  .catch( rej1 );

              } )
              .catch( () => {
                newProductionsList = {
                  _id: 'productions-list',
                  [newProduction.id]: newProduction
                };
                db.put( newProductionsList )
                  .then( res1 )
                  .catch( rej1 );
              } );

        } );
      } )
      .then( () => {
        // console.log('done updateProductionPartInDb', action.type);;
        return resolve( { data: {
          success: true,
          id: newProduction.id,
          production: newProduction,
        } } );
      } )
      .catch( ( error ) => {
        console.error( 'error ', action.type, error );/* eslint no-console : 0 */
        reject( error );
      } );
  } );
};

/**
 * Entrypoints
 */
export const requestProductions = () => {
  if ( inElectron ) {
    return requestToMain( 'get-productions' );
  }
  else {
    return queryPouchDb( 'get', 'productions-list', 'productions' );
  }
};

export const requestProduction = ( productionId ) => {
  if ( inElectron ) {
    return requestToMain( 'get-production', { productionId } );
  }
  else {
    return queryPouchDb( 'get', productionId, 'production' );
  }
};

/**
 * @todo move that elsewhere
 */
const transformResourceData = ( data, correspondanceMap ) => {
  return Object.keys( data ).reduce( ( res, key ) => {
    let val = data[key];
    if (
      ( key.includes( 'AssetId' ) )
      // correspondanceMap[val]
    ) {
      val = correspondanceMap[val];
    }
    else if ( Array.isArray( val ) ) {
      val = val.map( ( item ) => transformResourceData( item, correspondanceMap ) );
    }
    return {
      ...res,
      [key]: val,
    };
  }, {} );
};

export const requestProductionCreation = ( production ) => {
  const assets = { ...production.assets };
  let toDb;

  /*
   * reattribute a new id to each asset (and to its references in corresponding resource props)
   * to avoid side effects when two productions share the same assets in pouchdb
   * and to avoid update conflicts when trying to create the assets
   */
  const assetsCorrespondanceMap = Object.keys( assets ).reduce( ( result, assetId ) => ( {
    ...result,
    [assetId]: genId()
  } ), {} );
  const assetsToCreate = Object.keys( assets ).reduce( ( result, assetId ) => ( {
    ...result,
    [assetsCorrespondanceMap[assetId]]: {
      ...assets[assetId],
      _id: assetsCorrespondanceMap[assetId],
      id: assetsCorrespondanceMap[assetId],
      _rev: undefined,
    },
  } ), {} );
  const transformedProduction = {
    ...production,
    resources: Object.keys( production.resources ).reduce( ( result, resourceId ) => {
      const resource = production.resources[resourceId];
      const transformedResource = {
        ...resource,
        data: transformResourceData( resource.data, assetsCorrespondanceMap )
      };
      return {
        ...result,
        [resourceId]: transformedResource
      };
    }, {} ),
    assets: assetsToCreate,
  };
  if ( inElectron ) {
    return addToUpdateQueue( () => {
      return requestToMain( 'create-production', { productionId: production.id, production } );
    } );
  }
  return addToUpdateQueue( () => {
      toDb = {
        ...transformedProduction,
        assets: Object.keys( assetsToCreate ).reduce( ( res, assetId ) => ( {
          ...res,
          [assetId]: {
            ...assetsToCreate[assetId],
            data: undefined
          }
        } ), {} ),
        _id: transformedProduction.id,
      };
      delete toDb._rev;
      return new Promise( ( resolve, reject ) => {
        Promise.resolve()
          .then( () => db.put( toDb ) )
          .then( () => {
            // console.log('updating productions list');
            return new Promise( ( res1, rej1 ) => {
              db.get( 'productions-list' )
                .then( ( productionsList ) => {
                  const newProductionsList = {
                    ...productionsList,
                    [production.id]: toDb
                  };
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );

                } )
                .catch( () => {
                  const newProductionsList = {
                    _id: 'productions-list',
                    [production.id]: toDb
                  };
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );
                } );
            } );
          } )

          .then( () => {
            return resolve( { data: {
              production: toDb,
              success: true
            } } );
          } )
          .catch( ( err ) => {
            console.error( 'error during prodution creation', err );/* eslint no-error: 0 */
            reject( err );
          } );

      } );
  } )
  .then( () => {
          if ( Object.keys( assetsToCreate ).length ) {
            return Object.keys( assetsToCreate ).reduce( ( cur, assetId ) =>
                cur.then( () => {
                    return requestAssetCreation( production.id, assetsToCreate[assetId] );
                } )
              , Promise.resolve() )
              .then( () =>
                 new Promise( ( res ) => res( { data: { production: toDb, success: true } } ) )
              );

          }
          else {
            return new Promise( ( res ) => res( { data: { production: toDb, success: true } } ) );
          }
        } );

};

export const requestProductionDeletion = ( productionId, production ) => {
  const assets = { ...production.assets };
  let newProductionsList;
  // console.log('assets to delete', assets);
  if ( inElectron ) {
    return addToUpdateQueue( () => {
      return requestToMain( 'delete-production', { productionId } );
    } );
  }
  return addToUpdateQueue( () => {
      return new Promise( ( resolve, reject ) => {
        db.get( productionId )
          .then( ( { _rev } ) => db.remove( productionId, _rev ) )
          .then( () => {
            return new Promise( ( res1, rej1 ) => {
              db.get( 'productions-list' )
                .then( ( productionsList ) => {
                  newProductionsList = Object.keys( productionsList ).reduce( ( res, id ) => {
                    if ( id === productionId ) {
                      return res;
                    }
                    return {
                      ...res,
                      [id]: productionsList[id]
                    };
                  }, {} );
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );

                } )
                .catch( () => {
                  newProductionsList = {
                    _id: 'productions-list',
                  };
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );
                } );
            } );
          } )

        .then( () => {
            return resolve( { data: {
              success: true,
              productions: newProductionsList
            } } );
          } )
          .catch( reject );
      } );
  } )
  .then( () => {
            if ( Object.keys( assets ).length ) {
              return Object.keys( assets ).reduce( ( cur, assetId ) =>
                cur.then( () => {

                   // * return addToUpdateQueue(() => {

                    return requestAssetDeletion( production.id, assets[assetId] );
                  // });
                } )
              , Promise.resolve() )
              .then( () =>
                Promise.resolve( { data: { success: true, productions: newProductionsList } } )
              );
            }
            else {
              return Promise.resolve( { data: { success: true, productions: newProductionsList } } );
            }
          } );

};

export const requestProductionUpdatePart = ( action, reducer ) => {
  return addToUpdateQueue( () => {
    // console.warn( 'add %s to queue of actions to perform', action.type );
    if ( inElectron ) {
      return requestToMain( 'update-production-part', { action } );
    }
    else {
      return updateProductionPartInDb( action, reducer );
    }
  } );
};

export const requestProductionUpdate = ( productionId, production ) => {
  return addToUpdateQueue( () => {
    if ( inElectron ) {
      return requestToMain( 'update-production', { productionId, production } );
    }
    else {
      return new Promise( ( resolve, reject ) => {
        let newProductionsList;
        let newProduction;
        db.get( productionId )
          .then( ( { _rev } ) => {
            newProduction = {
              ...production,
              _id: productionId,
              _rev,
            };
            return db.put( newProduction );
          } )
          .then( () => {
            return new Promise( ( res1, rej1 ) => {
              db.get( 'productions-list' )
                .then( ( productionsList ) => {
                  newProductionsList = {
                    ...productionsList,
                    [newProduction.id]: newProduction
                  };
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );

                } )
                .catch( () => {
                  newProductionsList = {
                    _id: 'productions-list',
                    [newProduction.id]: newProduction
                  };
                  db.put( newProductionsList )
                    .then( res1 )
                    .catch( rej1 );
                } );
            } );
          } )
          .then( () => {
            return resolve( { data: {
              success: true,
              id: newProduction.id,
              production: newProduction,
            } } );
          } )
          .catch( reject );
      } );
    }
  } );
};

/**
 * ========================
 * Static resources retrieval
 * ========================
 */
export const requestCitationStylesList = () => {
  if ( inElectron ) {
    return requestToMain( 'get-citation-styles' );
  }
  else {
    // console.log( 'web app prefix', webAppPrefix, 'url', `${webAppPrefix}resources/citation-styles-list.json` );
    return get( `${webAppPrefix}resources/citation-styles-list.json` );
  }
};

export const requestCitationLocalesList = () => {
  if ( inElectron ) {
    return requestToMain( 'get-citation-locales' );
  }
  else {
    return get( `${webAppPrefix}resources/citation-locales-list.json` );
  }
};

export const requestCitationStyle = ( styleId ) => {
  if ( inElectron ) {
    return requestToMain( 'get-citation-style', { styleId } );
  }
  else {
    return get( `${webAppPrefix}resources/styles/${styleId}.csl` );
  }
};

export const requestCitationLocale = ( localeId ) => {
  if ( inElectron ) {
    return requestToMain( 'get-citation-locale', { localeId } );
  }
  else {
    return get( `${webAppPrefix}resources/locales/locales-${localeId}.xml` );
  }
};

export const requestHTMLBuild = ( { generatorId, templateId } ) => {
  if ( inElectron ) {
    return requestToMain( 'get-html-build', { generatorId, templateId } );
  }
  else {
    // console.log( 'get html template at', `${webAppPrefix}htmlBuilds/${generatorId}/${templateId}/index.html` );
    return get( `${webAppPrefix}htmlBuilds/${generatorId}/${templateId}/index.html` );
  }
};

/**
 * ========================
 * Edition generation driver
 * ========================
 */
export const requestEditionDownload = ( {
  ...props
} ) => {
  const {
    edition,
    production,
    generatorId,
    locale = {},
  } = props;
  const templateId = edition && edition.metadata && edition.metadata.templateId;
  const editionId = edition && edition.id;
  const title = production.metadata.title;

  if ( !inElectron && generatorId === 'single-page-html' && peritextConfig.htmlBuilds && peritextConfig.htmlBuilds[generatorId] && peritextConfig.htmlBuilds[generatorId][templateId] ) {
    return new Promise( ( resolve, reject ) => {
      let productionBundle;
      loadAssetsForEdition( {
        production,
        edition,
        requestAssetData,
      } )
      .then( ( loadedAssets ) => {
        productionBundle = {
          ...production,
          assets: loadedAssets
        };
        return requestHTMLBuild( { generatorId, templateId } );
      } )
      .then( ( { data: template } ) => {
        const preprocessedData = preprocessEditionData( { production, edition } );
        const HTMLMetadata = buildHTMLMetadata( production, edition );
        const html = template
          .replace( '${metadata}', HTMLMetadata )
          .replace( '${productionJSON}', JSON.stringify( productionBundle ) )
          .replace( '${preprocessedDataJSON}', JSON.stringify( preprocessedData ) )
          .replace( '${editionId}', `"${editionId}"` )
          .replace( '${locale}', JSON.stringify( locale ) );

          downloadFile( html, 'html', title );
          resolve();
        // }

      } )
      .catch( reject );
    } );

  }
  else if ( inElectron ) {
    return requestToMain( 'generate-edition', {
      ...props
    } );
  }
  else {
    console.warn( 'no download available for %s', generatorId );/* eslint no-console: 0 */
    return Promise.reject();
  }
};

