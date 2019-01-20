/**
 * This module provides a asset preview & selection widget element component
 * @module ovide/components/AssetWidget
 */
import React, { Component } from 'react';
import { v4 as generateId } from 'uuid';
import mime from 'mime-types';
import {
  csvParse,
  tsvParse,
} from 'd3-dsv';

import {
  loadImage,
} from '../../helpers/assetsUtils';

// import * as editedProductionDuck from '../../features/ProductionManager/duck';

import AssetPreview from '../PrimitiveAssetPreview';

import {
  Button,
  DropZone
} from 'quinoa-design-library/components';

import { getFileAsBinary, getFileAsText } from '../../helpers/fileLoader';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
/*
 * @connect(
 *   state => ({
 *     ...editedProductionDuck.selector(state.editedProduction),
 *   }),
 *   dispatch => ({
 *     actions: bindActionCreators({
 *       ...editedProductionDuck,
 *     }, dispatch)
 *   })
 * )
 */
class AssetWidget extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
  }

  shouldComponentUpdate() {
    return true;
  }

  getFileFromUpload = ( file, mimetype, callback ) => {
    switch ( mimetype ) {
      case 'text/plain':
      case 'text/html':
        return getFileAsText( file )
                .then( ( str ) => callback( null, str ) )
                .catch( callback );
      case 'application/json':
        getFileAsText( file )
          .catch( callback )
          .then( ( str ) => {
            try {
              const json = JSON.parse( str );
              callback( null, json );
            }
            catch ( error ) {
              callback( error );
            }
          } );
        break;
      case 'text/csv':
      case 'text/tsv':
      case 'text/comma-separated-values':
      case 'text/tab-separated-values':
        getFileAsText( file )
          .catch( callback )
          .then( ( str ) => {
            try {
              let json;
              if ( mimetype === 'text/comma-separated-values' || mimetype === 'text/csv' ) {
                json = csvParse( str );
              }
              else {
                json = tsvParse( str );
              }
              callback( null, json );
            }
            catch ( error ) {
              callback( error );
            }
          } );
        break;
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/gif':
      case 'image/tiff':
        loadImage( file )
          .catch( callback )
          .then( ( base64 ) => callback( null, base64 ) );
        break;

      default:
        return getFileAsBinary( file, callback );
    }
  }

  onDrop = ( files ) => {
    const {
      assetId,
      // assets,
      onAssetChange,
    } = this.props;

    // const currentAsset = assets && assets[assetId];

    const file = files[0];
    // const data = new FormData();
    const filename = file.name;
    // data.append('file', file);
    const id = assetId || generateId();
    const mimetype = mime.lookup( filename );
    this.getFileFromUpload( file, mimetype, ( err, data ) => {
      if ( !err ) {
        onAssetChange( id, {
          id,
          filename,
          data,
          mimetype,
          lastUploadAt: new Date().getTime()
        } );
      }
    } );
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      // name,
      assetId,
      assets = {},
      // onChange,
      onDelete,

      /*
       * editedProduction: production,
       * mimetype accepted
       */
      accept = [],
      translate
    } = this.props;

    const currentAsset = assets && assets[assetId];

    const handleDrop = this.onDrop;

    if ( assets ) {
      return (
        <div className={ 'ovide-AssetWidget' }>
          <div className={ 'column' }>
            <DropZone
              accept={ accept }
              onDrop={ handleDrop }
            >
              {
                currentAsset ?
                  translate( 'update asset' )
                  :
                  translate( 'add a new asset' )
              }
            </DropZone>
          </div>
          <div className={ 'column' }>
            <AssetPreview
              asset={ currentAsset }
            />
          </div>
          {currentAsset &&
            <div>
              <Button onClick={ onDelete }>
                {translate( 'Delete asset' )}
              </Button>
            </div>
          }
        </div>
      );
    }
    else {
      return (
        <div>
          {translate( 'loading' )}
        </div>
      );
    }
  }
}

export default AssetWidget;
