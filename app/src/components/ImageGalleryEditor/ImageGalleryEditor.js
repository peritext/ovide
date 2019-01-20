/**
 * This module provides a modal for managing an image gallery
 * @module ovide/components/ImageGalleryEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mime from 'mime-types';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import {
  Column,
  Columns,
  DropZone,
  Image,

  Tabs,
  TabList,
  TabLink,
  Tab,
} from 'quinoa-design-library/components/';
import defaults from 'json-schema-defaults';
import { v4 as generateId } from 'uuid';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import {
  loadImage,
} from '../../helpers/assetsUtils';

/**
 * Import assets
 */
import './ImageGalleryEditor.scss';

const ImageThumbnail = ( {
  addMode = false,

  imageMode,
  assets = {},

  value: image = {},
  images,
  data,

  setCurrentAssetIndex,
  onAssetChange,
  onAfterChange,
  currentAssetIndex,
  itemIndex,
  schema,
} ) => {
  const assetId = image[`${imageMode}ImageAssetId`];
  const asset = assets[assetId];
  const isActive = itemIndex === currentAssetIndex;
  const handleCreateImage = ( e ) => {
    e.stopPropagation();
    e.preventDefault();
    const newElement = defaults( schema.properties.images.items );
    const newImages = [ ...images, newElement ];
    const newData = {
      ...data,
      images: newImages
    };
    onAfterChange( newData );
    setCurrentAssetIndex( images.length );
  };
  const handleClick = ( e ) => {
    if ( addMode ) {
      return handleCreateImage( e );
    }
    e.stopPropagation();
    setCurrentAssetIndex( itemIndex );
  };
  const handleDelete = ( e ) => {
    e.stopPropagation();
    // update index
    let newIndex;
    if ( currentAssetIndex === itemIndex ) {
      if ( itemIndex > 0 ) {
        newIndex = itemIndex - 1;
      }
      else {
        newIndex = 0;
      }
    }
    if ( newIndex ) {
      setCurrentAssetIndex( newIndex );
    }
    // update resource
    const newImages = images.filter( ( i, thatIndex ) => thatIndex !== itemIndex );
    const newData = {
      ...data,
      images: newImages
    };
    onAfterChange( newData );
    // delete related assets
    const relatedAssets = Object.keys( image ).map( ( key ) => image[key] ).filter( ( i ) => i );
    relatedAssets.forEach( ( thatAssetId ) => {
      onAssetChange( thatAssetId, undefined );
    } );

  };
  return (
    <div
      onClick={ handleClick }
      className={ `image-thumbnail ${addMode ? 'add-mode' : ''} ${isActive ? 'is-active' : ''}` }
    >
      <div className={ 'content-container' }>
        {asset && !addMode &&
        <img src={ asset.data } />
    }
        {addMode && <Image src={ icons.asset.black.svg } />}
      </div>
      {!addMode &&
      <div
        onClick={ handleDelete }
        className={ 'remove-btn' }
      >
        <Image src={ icons.asset.black.svg } />
      </div>
    }
    </div>
);
};

const SortableImageThumbnail = SortableElement( ( props ) => <ImageThumbnail { ...props } /> );

const SortableThumbnails = SortableContainer( ( {
  items,
  ...props
} ) => {
  return (
    <div>
      {items
        .map( ( image, index ) => {
          return (
            <SortableImageThumbnail
              { ...props }
              key={ index }
              index={ index }
              itemIndex={ index }
              value={ image }
            />
          );
        }
      )}
    </div>
  );
} );

export default class ImageGalleryEditor extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );

    this.state = {
      currentAssetIndex: 0,
      imageMode: 'rgb'
    };
  }

  getFileFromUpload = ( file, callback ) => {
    loadImage( file )
          .catch( callback )
          .then( ( base64 ) => callback( null, base64 ) );
  }

  onDrop = ( files, assetId, imageMode ) => {
    const {
      onAssetChange,
      data = {},
      onAfterChange,
    } = this.props;

    const {
      currentAssetIndex = 0,
    } = this.state;

    const { images = [] } = data;

    // const currentAsset = assets && assets[assetId];

    const file = files[0];
    // const data = new FormData();
    const filename = file.name;
    // data.append('file', file);
    const id = assetId || generateId();
    const mimetype = mime.lookup( filename );
    // constitute data
    this.getFileFromUpload( file, ( err, newData ) => {
      if ( !err ) {
        // create/update data
        onAssetChange( id, {
          id,
          filename,
          data: newData,
          mimetype,
          lastUploadAt: new Date().getTime()
        } );
        // update resource
        const newImages = [ ...images ];
        if ( newImages[currentAssetIndex] ) {
          const key = `${imageMode}ImageAssetId`;
          newImages[currentAssetIndex][key] = id;
          const newNewData = {
            images: newImages,
          };
          onAfterChange( newNewData );
        }
      }
    } );
  }

  render = () => {
    const {
      props: {
        data = {},
        assets = {},
        schema,

        onAfterChange,
        onAssetChange,
      },
      state: {
        currentAssetIndex = 0,
        imageMode = 'rgb',
      },
      context: {
        t
      },
      onDrop
    } = this;

    const { images = [] } = data;
    const translate = translateNameSpacer( t, 'Components.ImageGalleryEditor' );

    const currentImage = currentAssetIndex < images.length && images[currentAssetIndex];

    let displayedImage;
    let acceptDrops = '';
    let visibleAssetId;

    if ( currentImage && currentImage[`${imageMode}ImageAssetId`] ) {
      visibleAssetId = currentImage[`${imageMode}ImageAssetId`];
      acceptDrops = schema.properties.images.items.properties[`${imageMode}ImageAssetId`] && schema.properties.images.items.properties[`${imageMode}ImageAssetId`].acceptMimetypes.join( ',' );
      displayedImage = assets[visibleAssetId];
    }

    const handleSetImage = ( newImageMode ) => {
      this.setState( { imageMode: newImageMode } );
    };
    const handleSetImageTypeRgb = () => handleSetImage( 'rgb' );
    const handleSetImageTypeCmyb = () => handleSetImage( 'cmyb' );

    const handleDrop = ( files ) => {
      onDrop( files, visibleAssetId, imageMode );
    };

    const setCurrentAssetIndex = ( newCurrentAssetIndex ) => {
      this.setState( { currentAssetIndex: newCurrentAssetIndex } );
    };

    const handleSortEnd = ( { oldIndex, newIndex } ) => {
      const newImages = arrayMove( images, oldIndex, newIndex );
      const newData = {
        ...data,
        images: newImages
      };
      onAfterChange( newData );
      setCurrentAssetIndex( newIndex );
    };

    const handleCaptionChange = ( e ) => {
      const caption = e.target.value;
      const newData = {
        images: images.map( ( image, imageIndex ) => {
          if ( imageIndex === currentAssetIndex ) {
            return {
              ...image,
              caption
            };
          }
          return image;
        } )
      };
      onAfterChange( newData );
    };

    return (
      <div className={ 'ovide-ImageGalleryEditor' }>
        <Columns className={ 'main-row' }>

          <Column isSize={ 6 }>
            {displayedImage ?
              <img src={ displayedImage.data } />
              :
              <div>
                {translate( 'No image yet' )}
              </div>
            }
            {
              displayedImage ?
                <input
                  className={ 'input' }
                  value={ currentImage.caption || '' }
                  placeholder={ translate( 'Image specific caption' ) }
                  onChange={ handleCaptionChange }
                />
              : null
            }
          </Column>
          <Column
            isSize={ 6 }
            style={ { marginTop: 0 } }
          >
            <Tabs>
              <TabList>
                <Tab
                  onClick={ handleSetImageTypeRgb }
                  isActive={ imageMode === 'rgb' }
                >
                  <TabLink>
                    <span>{translate( 'web' )}</span>
                  </TabLink>
                </Tab>
                <Tab
                  onClick={ handleSetImageTypeCmyb }
                  isActive={ imageMode === 'cmyb' }
                >
                  <TabLink>
                    <span>{translate( 'print' )}</span>
                  </TabLink>
                </Tab>
              </TabList>
            </Tabs>
            <div>
              <DropZone
                accept={ acceptDrops }
                onDrop={ handleDrop }
              >
                {
                  displayedImage ?
                    translate( 'update asset' )
                    :
                    translate( 'add a new asset' )
                }
              </DropZone>

            </div>
          </Column>
        </Columns>
        <div className={ 'list-row' }>
          <SortableThumbnails
            items={ images }
            assets={ assets }
            imageMode={ imageMode }
            onAfterChange={ onAfterChange }
            onAssetChange={ onAssetChange }
            setCurrentAssetIndex={ setCurrentAssetIndex }
            images={ images }
            data={ data }
            currentAssetIndex={ currentAssetIndex }
            onSortEnd={ handleSortEnd }
            axis={ 'x' }
            pressDelay={ 100 }
          />
          <ImageThumbnail
            addMode
            setCurrentAssetIndex={ setCurrentAssetIndex }
            onAfterChange={ onAfterChange }
            schema={ schema }
            itemIndex={ 'none' }
            images={ images }
            data={ data }
          />
        </div>
      </div>
    );

  }
}
