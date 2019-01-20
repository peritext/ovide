/**
 * This module provides the aside/secondary column for the main column of the editor
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import {
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
  Delete,
  DropZone,
  HelpPin,
  Tabs,
  TabList,
  Tab,
  TabLink,
  Level,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  base64ToBytesLength
} from '../../../helpers/misc';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';

/**
 * Imports Components
 */
import NewSectionForm from '../../../components/NewSectionForm';
import ResourceForm from '../../../components/ResourceForm';
import ContextualizationEditor from '../../../components/ContextualizationEditor';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );

const MainSectionAside = ( {
  createBibData,
  production = {},
  editedResourceId,
  uploadStatus,
  createResource,
  updateResource,
  setUploadStatus,
  resources,
  setMainColumnMode,
  mainColumnMode,
  setNewResourceMode,
  newResourceMode,
  defaultSectionMetadata,
  onNewSectionSubmit,
  handleUpdateMetadata,
  section,
  newResourceType,
  guessTitle,
  setEditedResourceId,
  submitMultiResources,

  createAsset,
  updateAsset,
  deleteAsset,

  editedContextualizationId,
  handleCloseEditedContextualization,

  previewMode,
  updateContextualization,
  updateContextualizer,

}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Computed variables
   */
  const { id: productionId, assets, contextualizations } = production;

  /**
   * Callbacks handlers
   */
  const handleSubmitExistingResource = ( resource, newAssets = {} ) => {
    const { id: resourceId } = resource;
    const payload = {
      resourceId,
      resource,
      productionId,
    };
    // console.log( 'submitting existing resource', resource, ', with new assets:', newAssets );

    /**
     * Handle assets
     */
    const relatedAssetsIds = getRelatedAssetsIds( resource.data );

    // spot created assets
    const assetsToCreateIds = Object.keys( newAssets ).filter( ( assetId ) => !assets[assetId] );

    /*
     * console.log( 'to create', assetsToCreateIds );
     * spot updated assets
     */
    const assetsToUpdateIds = Object.keys( newAssets ).filter( ( assetId ) => assets[assetId] && newAssets[assetId] && assets[assetId].lastUploadAt !== newAssets[assetId].lastUploadAt );

    /*
     * console.log( 'to update', assetsToUpdateIds );
     * spot deleted assets
     */
    const assetsToDeleteIds = relatedAssetsIds.filter( ( assetId ) => {
      if ( !newAssets[assetId] ) {
        return true;
      }
    } );

    assetsToCreateIds.reduce( ( cur, assetId ) => {
          return cur.then( () => {
            const asset = newAssets[assetId];
            // console.log( 'creating asset', assetId );
            return new Promise( ( resolve, reject ) => {
              createAsset( {
                productionId,
                assetId,
                asset,
              }, ( err ) => {
                if ( err ) {
                  reject( err );
                }
                else resolve();
              } );
            } );

          } );
        }, Promise.resolve() )
      .then( () =>
        assetsToUpdateIds.reduce( ( cur, assetId ) => {
            return cur.then( () => {
              const asset = newAssets[assetId];
              // console.log( 'updating asset', assetId );
              return new Promise( ( resolve, reject ) => {
                updateAsset( {
                  productionId,
                  assetId,
                  asset,
                }, ( err ) => {
                  if ( err ) {
                    reject( err );
                  }
                  else resolve();
                } );
              } );

            } );
          }, Promise.resolve() ) )
      .then( () =>
        assetsToDeleteIds.reduce( ( cur, assetId ) => {
            return cur.then( () => {
              const asset = production.assets[assetId];
              console.log( 'deleting asset', assetId );
              return new Promise( ( resolve, reject ) => {
                deleteAsset( {
                  productionId,
                  assetId,
                  asset,
                }, ( err ) => {
                  if ( err ) {
                    reject( err );
                  }
                  else resolve();
                } );
              } );

            } );
          }, Promise.resolve() ) )
      .then( () => {
        // console.log( 'now updating resource', resource );
        return new Promise( ( resolve, reject ) => {
          if ( resource.metadata.type === 'bib' ) {
            createBibData( resource, {
              editedProduction: production,
              uploadStatus,
              actions: {
                createResource,
                updateResource,
                setUploadStatus,
              },
            } )
            .then( resolve )
            .catch( reject );
          }
          else {
            updateResource( payload, ( err ) => {
              if ( err ) {
                reject( err );
              }
              else {
                resolve();
              }
            } );
          }
        } );
      } )
      .then( () => {
        setEditedResourceId( undefined );
      } );
  };

  const handleSubmitNewResource = ( resource, newAssets = {} ) => {
    const resourceId = genId();
    const title = ( ( !resource || !resource.metadata.title || !resource.metadata.title.length ) && Object.keys( newAssets ).length ) ?
                  newAssets[Object.keys( newAssets )[0]].filename
                  :
                  resource.metadata.title;
    const payload = {
      resourceId,
      resource: {
        ...resource,
        id: resourceId,
        metadata: {
          ...resource.metadata,
          title
        }
      },
      productionId,
    };
    if ( resource.metadata.type === 'bib' ) {
      // console.log( 'let us go for bib' );
      setUploadStatus( {
        status: 'initializing',
        errors: []
      } );
      setTimeout( () => {
          // console.log( 'create bib data', resource );
          createBibData( resource, {
            editedProduction: production,
            uploadStatus,
            actions: {
              createResource,
              updateResource,
              setUploadStatus
            },
          } )
          .then( () => {
            // console.log( 'done set upload status to undefined' );
            setUploadStatus( undefined );
            setMainColumnMode( 'edition' );

          } )
          .catch( ( e ) => {
            console.error( e );/* eslint no-console : 0 */
            setUploadStatus( undefined );
          } );
      }, 100 );

    }
    else {

   /**
    * Handle assets
    */

    // spot created assets
    const assetsToCreateIds = Object.keys( newAssets ).filter( ( assetId ) => !assets[assetId] );

    /*
     * spot updated assets
     * const assetsToUpdateIds = Object.keys( newAssets ).filter( ( assetId ) => assets[assetId] && newAssets[assetId] && assets[assetId].lastUploadAt !== newAssets[assetId].lastUploadAt );
     */

      assetsToCreateIds.reduce( ( cur, assetId ) => {
        return cur.then( () => {
          const asset = newAssets[assetId];
          return new Promise( ( resolve, reject ) => {
            createAsset( {
              productionId,
              assetId,
              asset,
            }, ( err ) => {
              if ( err ) {
                reject( err );
              }
              else {
                resolve();
              }
            } );
          } );

        } );
      }, Promise.resolve() )
      .then( () => {
        createResource( payload, ( err ) => {
          setMainColumnMode( 'edition' );
          if ( err ) {
            console.error( err );/* eslint no-console: 0 */
          }
        } );
      } )
      .catch( console.error );/* eslint no-console: 0 */
    }
  };
  const handleCancelResourceEdition = () => {
    setEditedResourceId( undefined );
  };
  const handleSetMainColumnModeEdition = () => setMainColumnMode( 'edition' );

  // CASE 1 : a resource is edited
  if ( editedResourceId ) {
    const editedResource = resources[editedResourceId];
    const relatedAssetsIds = getRelatedAssetsIds( editedResource.data );
    const relatedAssets = relatedAssetsIds.map( ( id ) => production.assets[id] ).filter( ( a ) => a );
    return (
      <Column style={ { position: 'relative', height: '100%', width: '100%', background: 'white', zIndex: 3 } }>
        <StretchedLayoutContainer isAbsolute>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column style={ { position: 'relative', height: '100%', width: '100%' } }>
              <ResourceForm
                onCancel={ handleCancelResourceEdition }
                onSubmit={ handleSubmitExistingResource }
                resource={ editedResource }
                existingAssets={ relatedAssets }
                asNewResource={ false }
                productionId={ productionId }
              />
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }
 else if ( editedContextualizationId ) {
    const editedContextualization = contextualizations[editedContextualizationId];
    return (
      <Column style={ { position: 'relative', height: '100%', width: '100%', background: 'white', zIndex: 3 } }>
        <StretchedLayoutContainer isAbsolute>
          <StretchedLayoutItem
            style={ { height: '100%' } }
            isFlex={ 1 }
          >
            <Column style={ { position: 'relative', height: '100%', width: '100%' } }>
              <ContextualizationEditor
                isActive={ editedContextualization !== undefined }
                contextualization={ editedContextualization }
                resource={ editedContextualization && production.resources[editedContextualization.resourceId] }
                contextualizer={ editedContextualization && production.contextualizers[editedContextualization.contextualizerId] }
                onClose={ handleCloseEditedContextualization }
                updateContextualizer={ updateContextualizer }
                updateContextualization={ updateContextualization }
                productionId={ productionId }
                assets={ production.assets }
                renderingMode={ previewMode }
              />
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }

  const handleSetNewResourceModeToManual = () => setNewResourceMode( 'manually' );
  const handleSetNewResourceModeToDrop = () => setNewResourceMode( 'drop' );

  switch ( mainColumnMode ) {
    // CASE 1 : a new resource is configured
    case 'newresource':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 2 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <StretchedLayoutItem>
                <Column>
                  <Title isSize={ 3 }>
                    <StretchedLayoutContainer isDirection={ 'horizontal' }>
                      <StretchedLayoutItem isFlex={ 10 }>
                        {translate( 'Add items to the library' )}
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <Delete onClick={ handleSetMainColumnModeEdition } />
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Title>
                </Column>
                <Level />
              </StretchedLayoutItem>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column>
                <Tabs isBoxed>
                  <TabList>
                    <Tab
                      onClick={ handleSetNewResourceModeToManual }
                      isActive={ newResourceMode === 'manually' }
                    >
                      <TabLink>
                        {translate( 'One item' )}
                      </TabLink>
                    </Tab>
                    <Tab
                      onClick={ handleSetNewResourceModeToDrop }
                      isActive={ newResourceMode === 'drop' }
                    >
                      <TabLink>
                        {translate( 'Several items' )}
                      </TabLink>
                    </Tab>
                  </TabList>
                </Tabs>
              </Column>
            </StretchedLayoutItem>
            {newResourceMode === 'manually' &&
              <StretchedLayoutItem isFlex={ 1 }>
                <Column isWrapper>
                  <ResourceForm
                    showTitle={ false }
                    resourceType={ newResourceType }
                    onCancel={ handleSetMainColumnModeEdition }
                    onSubmit={ handleSubmitNewResource }
                    asNewResource
                  />
                </Column>
              </StretchedLayoutItem>
            }
            {newResourceMode === 'drop' &&
              <StretchedLayoutItem>
                <Column>
                  <DropZone
                    accept={ '.jpeg,.jpg,.gif,.png,.csv,.tsv,.bib' }
                    style={ { height: '5rem' } }
                    onDrop={ submitMultiResources }
                  >
                    {translate( 'Drop files here to include in your library' )}
                    <HelpPin>
                      {`${translate( 'Accepted file formats: jpeg, jpg, gif, png, csv, tsv, bib' )}. ${translate( 'Up to {n} files, with a maximum size of {s} Mb each', {
                        n: maxBatchNumber,
                        s: Math.floor( realMaxFileSize / 1000000 )
                      } )}`}
                    </HelpPin>
                  </DropZone>
                </Column>
              </StretchedLayoutItem>
            }
          </StretchedLayoutContainer>
        </Column>
      );
  // CASE 3 : a new section is edited
    case 'newsection':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 1000 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <Column>
                <Title isSize={ 3 }>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 10 }>
                      {translate( 'New section' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ handleSetMainColumnModeEdition } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem
              isFlowing
              isFlex={ 1 }
            >
              <Column>
                <NewSectionForm
                  metadata={ {
                    ...defaultSectionMetadata,
                    title: guessTitle( section.metadata.title )
                  } }
                  onSubmit={ onNewSectionSubmit }
                  onCancel={ handleSetMainColumnModeEdition }
                />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    // CASE 4 : section metadata is edited
    case 'editmetadata':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 1000 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <Column>
                <Title isSize={ 3 }>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 10 }>
                      {translate( 'Edit section metadata' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ handleSetMainColumnModeEdition } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem
              isFlowing
              isFlex={ 1 }
            >
              <Column>
                <NewSectionForm
                  submitMessage={ translate( 'Save changes' ) }
                  metadata={ { ...section.metadata } }
                  onSubmit={ handleUpdateMetadata }
                  onCancel={ handleSetMainColumnModeEdition }
                />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    // CASE 5 : nothing is edited
    default:
      return null;
  }
};

MainSectionAside.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default MainSectionAside;
