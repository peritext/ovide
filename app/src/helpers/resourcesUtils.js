/**
 * This module provides helpers to handle resource-related operations
 * @module bulgur/utils/resourcesUtils
 */

import { get } from 'axios';
import { csvParse, tsvParse } from 'd3-dsv';
import { v4 as genId } from 'uuid';
import Fuse from 'fuse.js';
import mime from 'mime-types';

import objectPath from 'object-path';

import resourceSchema from 'peritext-schemas/resource';

import React from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import { Bibliography } from 'react-citeproc';
import english from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';
import apa from 'raw-loader!../sharedAssets/bibAssets/apa.csl';

import config from '../config';

import { base64ToBytesLength } from './misc';

import { validateResource, createDefaultResource } from './schemaUtils';
import { loadImage, inferMetadata, parseBibTeXToCSLJSON } from './assetsUtils';
import { getFileAsText } from './fileLoader';

const { restUrl, maxResourceSize, maxFolderSize } = config;

const realMaxFileSize = base64ToBytesLength( maxResourceSize );

/**
 * Returns from server a list of all csl citation styles available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStylesListFromServer = () => {
  const endPoint = `${restUrl }/citation-styles/`;
  return get( endPoint );
};

/**
 * Returns from server the data associated with a given csl style
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStyleFromServer = ( styleId ) => {
  const endPoint = `${restUrl }/citation-styles/${ styleId}`;
  return get( endPoint );
};

/**
 * Returns from server a list of all csl citation languages available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocalesListFromServer = () => {
  const endPoint = `${restUrl }/citation-locales/`;
  return get( endPoint );
};

/**
 * Returns from server a specific locale data
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocaleFromServer = ( localeId ) => {
  const endPoint = `${restUrl }/citation-locales/${ localeId}`;
  return get( endPoint );
};

/**
 * Get title path for different resource by type from resource schema
 */

export const getResourceTitle = ( resource ) => {
  const titlePath = objectPath.get( resourceSchema, [ 'definitions', resource.metadata.type, 'titlePath' ] );
  const title = titlePath ? objectPath.get( resource, titlePath ) : resource.metadata.title;
  return title || '';
};

/**
 * fuzzy search resource object
 */
export const searchResources = ( items, string ) => {
  const options = {
    keys: [ 'metadata.title', 'data.name', 'data.title', 'metadata.type' ],
    threshold: 0.5
  };
  const fuse = new Fuse( items, options );
  return fuse.search( string );
};

/**
 * resource files size validation
 */
export const validateFiles = ( files ) => {
  const batchSize = files.map( ( file ) => file.size ).reduce( ( fileA, fileB ) => {
    return fileA + fileB;
  }, 0 );
  let validFiles = [];
  if ( batchSize < maxFolderSize ) {
    validFiles = files.filter( ( file ) => file.size < realMaxFileSize );
  }
  return validFiles;
};

/**
 * Generate and submit bib resource
 */
export const createBibData = (
  resource,
  props
) =>
  new Promise( ( resolve, reject ) => {
    const {
      editedProduction: production,
      uploadStatus = { errors: [] },
      actions: {
        setUploadStatus
      }
    } = props;
    const {
      id: productionId
    } = production;
    resource.data.citations.reduce( ( cur, datum ) => {
      return cur.then( () => {
        return new Promise( ( resolve1, reject1 ) => {
          const id = resource.id ? resource.id : genId();
          const bibData = {
            [datum.id]: datum
          };
          const htmlPreview = renderToStaticMarkup(
            <Bibliography
              items={ bibData }
              style={ apa }
              locale={ english }
            />
          );
          const item = {
            ...resource,
            id,
            data: {
              ...resource.data,
              citations: [ { ...datum, htmlPreview } ]
            },
          };
          const payload = {
            resourceId: id,
            resource: item,
            productionId,
          };

          if ( validateResource( item ).valid ) {
            if ( resource.id ) {
              props.actions.updateResource( payload, ( err ) => {
                if ( err ) {
                  reject1( err );
                }
                else resolve1();
              } );
            }
            else {
              if ( typeof setUploadStatus === 'function' ) {
                const title = item.data && item.data.citations && item.data.citations[0] && item.data.citations[0].title;
                setUploadStatus( {
                  status: 'uploading',
                  currentFileName: title,
                  errors: uploadStatus.errors
                } );
              }
              props.actions.createResource( payload, ( err ) => {
                if ( err ) {
                  reject1( err );
                }
                else {
                  resolve1();
                }
              } );
            }
          }
          else reject1( validateResource.errors );
        } );

      } );

    }, Promise.resolve() )
    .then( resolve )
    .catch( reject );
  } );

/**
 * Generate resource data from file and props
 */
export const createResourceData = ( file, props ) =>
  new Promise( ( resolve ) => {
    const {
      editedProduction: production,
      actions: {
        setUploadStatus,

        /*
         * createResource,
         * createAsset,
         */
      },
      uploadStatus = { errors: [] }
    } = props;
    const {
      id: productionId
    } = production;
    let id = genId();
    const extension = file.name.split( '.' ).pop();
    let metadata;
    let data;
    let type;
    let resource;
    let payload;
    switch ( extension ) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        type = 'image';
        return loadImage( file )
          .then( ( result ) => {
            data = result;
            const newAsset = {
              data,
              filename: file.name,
              id: genId(),
              mimetype: mime.lookup( file.name )
            };
            metadata = inferMetadata( { ...newAsset }, type );
            const defaultResource = createDefaultResource();
            resource = {
              ...defaultResource,
              id,
              metadata: {
                ...metadata,
                type,
              },
              data: {
                ...defaultResource.data,
                images: [
                  {
                    rgbImageAssetId: newAsset.id
                  }
                ]
              },
            };

            if ( validateResource( resource ).valid ) {
              return new Promise( ( resa, reja ) => {
                props.actions.createAsset( {
                  productionId,
                  assetId: newAsset.id,
                  asset: newAsset,
                }, ( error ) => {
                  if ( error ) {
                    reja( error );
                  }
                  else {
                    resa();
                  }
                } );
              } );
            }
            else resolve( {
              id,
              success: false,
              error: validateResource( resource ).errors
            } );
          } )
          .then( () => {
            return new Promise( ( res1, rej1 ) => {
              props.actions.createResource( {
                resourceId: id,
                resource,
                productionId,
              }, ( err ) => {
                if ( err ) {
                  rej1( err );
                }
                else {
                  res1();
                }
              } );
            } );
          } )
          .then( () => resolve( { id, success: true } ) )
          .catch( ( error ) => resolve( { id, success: false, error } ) );

      case 'csv':
      case 'tsv':
        type = 'table';
        return getFileAsText( file )
          .then( ( text ) => {
            try {
              const parser = extension === 'csv' ? csvParse : tsvParse;
              data = parser( text );
            }
            catch ( e ) {
              data = [];
            }
            const newAsset = {
              data,
              filename: file.name,
              id: genId(),
              mimetype: mime.lookup( file.name )
            };

            metadata = inferMetadata( { ...newAsset }, type );
            resource = {
              ...createDefaultResource(),
              id,
              metadata: {
                ...metadata,
                type,
              },
              data: {
                dataAssetId: newAsset.id
              },
            };

            if ( validateResource( resource ).valid ) {
              return new Promise( ( resa, reja ) => {
                props.actions.createAsset( {
                  productionId,
                  assetId: newAsset.id,
                  asset: newAsset,
                }, ( error ) => {
                  if ( error ) {
                    reja( error );
                  }
                  else {
                    resa();
                  }
                } );
              } );
            }
            else resolve( { id, success: false, error: validateResource( resource ).errors } );
          } )
          .then( () => {
            return new Promise( ( res1, rej1 ) => {
              props.actions.createResource( {
                resourceId: id,
                resource,
                productionId,
              }, ( err ) => {
                if ( err ) {
                  rej1( err );
                }
                else res1();
              } );
            } );
          } )
          .then( () => resolve( { id, success: true } ) )
          .catch( ( error ) => resolve( { id, success: false, error } ) );
      case 'bib':
      default:
        return getFileAsText( file )
          .then( ( text ) => {
            data = parseBibTeXToCSLJSON( text );
            return data.reduce( ( cur, datum ) => {
              return cur.then( () => new Promise( ( resolve1 ) => {
                id = genId();
                const bibData = {
                  [datum.id]: datum
                };
                const htmlPreview = renderToStaticMarkup(
                  <Bibliography
                    items={ bibData }
                    style={ apa }
                    locale={ english }
                  />
                );
                resource = {
                  ...createDefaultResource(),
                  id,
                  metadata: {
                    ...createDefaultResource().metadata,
                    type: 'bib',
                  },
                  data: {
                    citations: [ { ...datum, htmlPreview } ],
                    contents: {
                      contents: {},
                      notes: {},
                      notesOrder: []
                    }
                  },
                };
                payload = {
                  resourceId: id,
                  resource,
                  productionId,
                };
                if ( validateResource( resource ).valid ) {
                  if ( typeof setUploadStatus === 'function' ) {
                    const title = datum && datum.title;
                    setUploadStatus( {
                      status: 'uploading',
                      currentFileName: title,
                      errors: uploadStatus.errors
                    } );
                  }
                  props.actions.createResource( payload, ( err ) => {
                    if ( err ) {
                      resolve1();
                    }
                    else {
                      resolve1();
                    }
                  } );
                }
                else resolve( { id, success: false, error: validateResource( resource ).errors } );
              } ) );
            }, Promise.resolve() );
          } )
          .then( () => resolve( { id, success: true } ) )
          .catch( ( error ) => resolve( { id, success: false, error } ) );
    }
  } );

