/**
 * This module provides a connected component for displaying the section view
 * @module ovide/features/LibraryView
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import { debounce, uniq } from 'lodash';
import {
  Button,
  Column,
  Container,
  Content,
  DropZone,
  HelpPin,
  Level,
  ModalCard,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';
import { createBibData } from '../../../helpers/resourcesUtils';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';
import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  base64ToBytesLength
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import PaginatedList from '../../../components/PaginatedList';
import ConfirmBatchDeleteModal from './ConfirmBatchDeleteModal';
import LibraryFiltersBar from './LibraryFiltersBar';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import ResourceForm from '../../../components/ResourceForm';
import ResourceCard from './ResourceCard';

/**
 * Imports Assets
 */
import config from '../../../config';
import { resourcesSchemas } from '../../../peritextConfig.render';

/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );
const resourceTypes = Object.keys( resourcesSchemas );

class LibraryViewLayout extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce( this.setResourceSearchString, 500 );
  }

  componentDidMount = () => {
    const { searchString } = this.props;
    this.setState( {
      searchString
    } );
  }

  componentWillReceiveProps = ( ) => {
  }

  setResourceSearchString = ( value ) => this.props.actions.setSearchString( value )

  setResourceSearchStringDebounce = ( value ) => {
    this.setState( {
      searchString: value
    } );
    this.setResourceSearchString( value );
  }

  renderMainColumn = () => {

    /**
     * Variables definition
     */
    const {
      editedProduction: production = {},

      mainColumnMode,
      optionsVisible,
      filterValues,
      sortValue,
      statusFilterValue,
      searchString,
      promptedToDeleteResourceId,
      selectedResourcesIds,
      resourcesPromptedToDelete,
      editedResourceId,
      actions: {
        setOptionsVisible,
        setMainColumnMode,
        // setSearchString,
        setFilterValues,
        setSortValue,
        setStatusFilterValue,
        setPromptedToDeleteResourceId,
        setUploadStatus,

        createResource,
        updateResource,

        /*
         * deleteResource,
         * uploadResource,
         */

        createAsset,
        updateAsset,
        deleteAsset,

        updateSection,
        setSelectedResourcesIds,
        setResourcesPromptedToDelete,
        setIsBatchDeleting,
        setResourceDeleteStep,
        setEditedResourceId,
      },
      deleteResource,
    } = this.props;
    const { t } = this.context;
    const {
      resources = {},
      id: productionId,
      metadata: {
        coverImage = {}
      },
      assets
    } = production;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Computed variables
     */
    const coverImageId = coverImage.resourceId;

    const activeFilters = Object.keys( filterValues ).filter( ( key ) => filterValues[key] );
    const statusFilterValues = [
      {
        id: 'all',
        label: translate( 'all items' )
      },
      {
        id: 'unused',
        label: translate( 'only unused items (not mentionned anywhere in the production)' )
      }
    ];

    const actualResourcesPromptedToDelete = resourcesPromptedToDelete;

    const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );

    let visibleResources = searchString.length === 0 ? resourcesList : searchResources( resourcesList, searchString );

    const resourcesNumberOfMentionsMap = {};
    const citedResources = uniq( Object.keys( production.contextualizations )
              .map( ( contextualizationId ) => {
                const thisResourceId = production.contextualizations[contextualizationId].resourceId;
                resourcesNumberOfMentionsMap[thisResourceId] = resourcesNumberOfMentionsMap[thisResourceId] ?
                  resourcesNumberOfMentionsMap[thisResourceId] + 1 : 1;
                return thisResourceId;
              } ) );

    visibleResources = visibleResources
      .filter( ( resource ) => {
        if ( activeFilters.length ) {
          return activeFilters.indexOf( resource.metadata.type ) > -1;
        }
        return true;
      } )
      .filter( ( resource ) => {
        switch ( statusFilterValue ) {
          case 'unused':
            return citedResources.indexOf( resource.id ) === -1;
          case 'all':
          default:
            return true;
        }
      } )
      .sort( ( a, b ) => {
          switch ( sortValue ) {
            case 'edited recently':
              if ( !b.lastUpdateAt || a.lastUpdateAt > b.lastUpdateAt ) {
                return -1;
              }
              return 1;
            case 'most mentioned':
              if ( ( resourcesNumberOfMentionsMap[a.id] || 0 ) > ( resourcesNumberOfMentionsMap[b.id] || 0 ) ) {
                return -1;
              }
              return 1;
            case 'title':
            default:
              const aTitle = getResourceTitle( a );
              const bTitle = getResourceTitle( b );
              if ( ( aTitle && bTitle ) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim() ) {
                return 1;
              }
              return -1;
          }
        } );
    let endangeredContextualizationsLength = 0;
    if ( actualResourcesPromptedToDelete.length ) {
      endangeredContextualizationsLength = actualResourcesPromptedToDelete.reduce( ( sum, resourceId ) => {
        return sum + Object.keys( production.contextualizations )
                .filter( ( contextualizationId ) => production.contextualizations[contextualizationId].resourceId === resourceId )
                .length;
      }, 0 );
    }

    /**
     * Callbacks handlers
     */
    const handleFilterToggle = ( type ) => {
      setFilterValues( {
        ...filterValues,
        [type]: filterValues[type] ? false : true
      } );
    };

    const handleDeleteResourceConfirm = ( thatResourceId ) => {
      const realResourceId = typeof thatResourceId === 'string' ? thatResourceId : promptedToDeleteResourceId;
      const resource = resources[realResourceId];
      if ( !resource ) {
        return;
      }
      const payload = {
        productionId,
        resourceId: resource.id,
        resource
      };
      // deleting entities in content states
      const relatedContextualizations = Object.keys( production.contextualizations ).map( ( c ) => production.contextualizations[c] )
        .filter( ( contextualization ) => contextualization.resourceId === realResourceId );

      const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
      const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.sectionId ) );

      if ( relatedContextualizationsIds.length ) {
        const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
          const section = tempSections[sectionId] || production.sections[sectionId];
          const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.sectionId === sectionId );
          let sectionChanged;
          const newSection = {
            ...section,
            contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
              }
              return result;
            }, { ...section.contents } ),
            notes: Object.keys( section.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...section.notes[noteId],
                contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                  }
                  return result;
                }, { ...section.notes[noteId].contents } )
              }
            } ), {} )
          };
          if ( sectionChanged ) {
            return {
              ...tempSections,
              [sectionId]: newSection
            };
          }
          return tempSections;
        }, {} );
        Object.keys( changedSections ).forEach( ( sectionId ) => {
          updateSection( {
            sectionId,
            productionId: production.id,
            section: changedSections[sectionId],
          } );
        } );

       setPromptedToDeleteResourceId( undefined );
      }

      /*
       * deleting the resource
       * if ( resource.metadata.type === 'image' || resource.metadata.type === 'table' ) {
       *   deleteUploadedResource( payload );
       * }
       * else {
       */
        deleteResource( payload );
      // }
      setPromptedToDeleteResourceId( undefined );
    };

    const handleDeleteResourcesPromptedToDelete = () => {
      setIsBatchDeleting( true );

      /*
       * cannot mutualize with single resource deletion for now
       * because section contents changes must be done all in the same time
       * @todo try to factor this
       * actualResourcesPromptedToDelete.forEach(handleDeleteResourceConfirm);
       * 1. delete entity mentions
       * we need to do it all at once to avoid discrepancies
       */
      const finalChangedSections = actualResourcesPromptedToDelete.reduce( ( tempFinalSections, resourceId ) => {
        const resource = resources[resourceId];
        if ( !resource ) {
          return;
        }
        // deleting entities in content states
        const relatedContextualizations = Object.keys( production.contextualizations ).map( ( c ) => production.contextualizations[c] )
          .filter( ( contextualization ) => {
            return contextualization.resourceId === resourceId;
          } );

        const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
        const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.sectionId ) );

        if ( relatedContextualizationsIds.length ) {
          const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
            const section = tempSections[sectionId] || production.sections[sectionId];
            const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.sectionId === sectionId );
            let sectionChanged;
            const newSection = {
              ...section,
              contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                if ( changed && !sectionChanged ) {
                  sectionChanged = true;
                }
                return result;
              }, { ...( section.contents || {} ) } ),
              notes: Object.keys( section.notes ).reduce( ( temp1, noteId ) => ( {
                ...temp1,
                [noteId]: {
                  ...section.notes[noteId],
                  contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                    const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                    if ( changed && !sectionChanged ) {
                      sectionChanged = true;
                    }
                    return result;
                  }, { ...section.notes[noteId].contents } )
                }
              } ), {} )
            };
            if ( sectionChanged ) {
              return {
                ...tempSections,
                [sectionId]: newSection
              };
            }
            return tempSections;
          }, tempFinalSections );

          if ( Object.keys( changedSections ).length ) {
            return {
              ...tempFinalSections,
              ...changedSections
            };
          }
        }
        return tempFinalSections;
      }, {} );

      Object.keys( finalChangedSections || {} ).reduce( ( cur, sectionId ) => {
        return cur.
        then( () => new Promise( ( resolve, reject ) => {
          updateSection( {
            sectionId,
            productionId: production.id,
            section: finalChangedSections[sectionId],
          }, ( err ) => {
            if ( err ) {
              reject( err );
            }
            else resolve();
          } );
        } ) );

      }, Promise.resolve() )
      // 2. delete the resources
      .then( () => {
        return actualResourcesPromptedToDelete.reduce( ( cur, resourceId, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve ) => {
              const resource = production.resources[resourceId];
              const payload = {
                productionId,
                resourceId,
                resource,
              };
              setResourceDeleteStep( index );
              // deleting the resource
              deleteResource( payload, ( err ) => {
                if ( err ) {
                  console.error( err );/* eslint no-console : 0*/
                  // reject(err);
                }
                resolve();
              } );
              // }
            } );
          } );
        }, Promise.resolve() );
      } )
      .then( () => {
        setResourceDeleteStep( 0 );
        setResourcesPromptedToDelete( [] );
        setSelectedResourcesIds( [] );
        setIsBatchDeleting( false );
        setPromptedToDeleteResourceId( undefined );
      } )
      .catch( ( err ) => {
        setResourceDeleteStep( 0 );
        setResourcesPromptedToDelete( [] );
        setSelectedResourcesIds( [] );
        setIsBatchDeleting( false );
        setPromptedToDeleteResourceId( undefined );
        console.error( err );/* eslint no-console : 0 */
      } );

    };

    /**
     * UI case 1 : user edits a resource
     */
    if ( editedResourceId ) {
      const resource = resources[editedResourceId];

      const relatedAssetsIds = getRelatedAssetsIds( resource.data );

      const relatedAssets = relatedAssetsIds.map( ( id ) => production.assets[id] ).filter( ( a ) => a );

      const handleSubmit = ( newResource, newAssets ) => {
        const { id: resourceId } = newResource;
        const payload = {
          resourceId,
          resource: newResource,
          productionId,
        };
        if ( newResource.metadata.type === 'bib' ) {
          createBibData( newResource, this.props );
        }
        else {
          updateResource( payload );
        }

        /**
         * Handle assets
         */
        // spot deleted assets
        const assetsToDeleteIds = relatedAssetsIds.filter( ( assetId ) => {
          if ( !newAssets[assetId] ) {
            return true;
          }
        } );

        // spot created assets
        const assetsToCreateIds = Object.keys( newAssets ).filter( ( assetId ) => !assets[assetId] );
        // spot updated assets
        const assetsToUpdateIds = Object.keys( newAssets ).filter( ( assetId ) => assets[assetId] && newAssets[assetId] && assets[assetId].lastUploadAt !== newAssets[assetId].lastUploadAt );

        // console.log( 'assets to create', assetsToCreateIds, 'assets to update', assetsToUpdateIds, 'assets to delete', assetsToDeleteIds );
        assetsToCreateIds.reduce( ( cur, assetId ) => {
              return cur.then( () => {
                const asset = newAssets[assetId];
                // console.log( 'will ask to create asset', asset );
                return createAsset( {
                  productionId,
                  assetId,
                  asset,
                } );
              } );
            }, Promise.resolve() )
          .then( () =>
            assetsToUpdateIds.reduce( ( cur, assetId ) => {
                return cur.then( () => {
                  const asset = newAssets[assetId];
                  return updateAsset( {
                    productionId,
                    assetId,
                    asset,
                  } );
                } );
              }, Promise.resolve() ) )
          .then( () =>
            assetsToDeleteIds.reduce( ( cur, assetId ) => {
                return cur.then( () => {
                  const asset = production.assets[assetId];
                  // console.log( 'order to delete asset', asset );
                  return deleteAsset( {
                    productionId,
                    assetId,
                    asset,
                  } );
                } );
              }, Promise.resolve() ) )
          .then( () => {
            setEditedResourceId( undefined );
          } );
      };
      const handleCancel = () => {
        setEditedResourceId( undefined );
      };

      return (
        <ResourceForm
          onCancel={ handleCancel }
          onSubmit={ handleSubmit }
          bigSelectColumnsNumber={ 3 }
          productionId={ productionId }
          resource={ resource }
          existingAssets={ relatedAssets }
          asNewResource={ false }
        />
      );
    }
    switch ( mainColumnMode ) {

      /**
       * UI case 2 : user creates a new resource
       */
      case 'new':
        const handleSubmit = ( resource, newAssets ) => {
          const resourceId = genId();
          let title;
          if ( resource.metadata.type === 'bib' ) {
            title = resource.data && resource.data.length && resource.data[0].title;
          }
 else {
            title = ( !resource.metadata.title.length && Object.keys( newAssets ).length ) ?
                  newAssets[Object.keys( newAssets )[0]].filename
                  :
                  resource.metadata.title;
          }
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
            setUploadStatus( {
              status: 'initializing',
              errors: []
            } );
            setTimeout( () => {
              createBibData( resource, this.props )
                .then( () => {
                  setUploadStatus( undefined );
                } )
                .catch( ( e ) => {
                  console.error( e );/* eslint no-console : 0 */
                  setUploadStatus( undefined );
                } );
            }, 100 );
          }
          else {
            // spot created assets
            const assetsToCreateIds = Object.keys( newAssets ).filter( ( assetId ) => !assets[assetId] );

            /*
             * spot updated assets
             * const assetsToUpdateIds = Object.keys(newAssets).filter(assetId => assets[assetId]);
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
              createResource( payload, ( err ) => console.log( 'done creating', err ) );
            } )
            .catch( console.error );
          }
          setMainColumnMode( 'list' );
        };
        const handleSetMainColumnToList = () => setMainColumnMode( 'list' );
        return (
          <ResourceForm
            onCancel={ handleSetMainColumnToList }
            onSubmit={ handleSubmit }
            bigSelectColumnsNumber={ 3 }
            asNewResource
          />
        );

      /**
       * UI case 3 : user browses list of resources
       */
      case 'list':
      default:
        const handleFiltersChange = ( option, optionDomain ) => {
          if ( optionDomain === 'filter' ) {
            handleFilterToggle( option );
          }
          else if ( optionDomain === 'sort' ) {
            setSortValue( option );
            setOptionsVisible( false );
          }
          else if ( optionDomain === 'status' ) {
            setStatusFilterValue( option );
            setOptionsVisible( false );
          }
        };
        const handleResourceSearchChange = ( e ) => this.setResourceSearchStringDebounce( e.target.value );
        const handleToggleOptionsVisibility = () => {
          setOptionsVisible( !optionsVisible );
        };
        const handleSelectAllVisibleResources = () => setSelectedResourcesIds( visibleResources.map( ( res ) => res.id ) );
        const handleDeselectAllVisibleResources = () => setSelectedResourcesIds( [] );
        const handleDeleteSelection = () => setResourcesPromptedToDelete( [ ...selectedResourcesIds ] );
        const renderNoResource = () => <div>{translate( 'No item in your library yet' )}</div>;
        const renderResourceInList = ( resource ) => {
          // console.log('get related assets ids');
          const relatedAssetsIds = getRelatedAssetsIds( resource.data );
          // console.log('related assets ids', relatedAssetsIds, 'assets', assets);
          const relatedAssets = relatedAssetsIds.map( ( id ) => production.assets[id] ).filter( ( a ) => a );
          const handleEdit = ( e ) => {
            e.stopPropagation();
            setEditedResourceId( resource.id );
          };
          const handleDelete = () => {
            setPromptedToDeleteResourceId( resource.id );
          };
          const isSelected = selectedResourcesIds.indexOf( resource.id ) > -1;
          const handleClick = () => {
            let newSelectedResourcesIds;
              if ( isSelected ) {
                newSelectedResourcesIds = selectedResourcesIds.filter( ( id ) => id !== resource.id );
              }
              else {
                newSelectedResourcesIds = [ ...selectedResourcesIds, resource.id ];
              }
              setSelectedResourcesIds( newSelectedResourcesIds );
          };
          // console.log('related assets', relatedAssets);
          return (
            <ResourceCard
              isActive={ isSelected }
              onClick={ handleClick }
              onEdit={ handleEdit }
              onDelete={ handleDelete }
              coverImageId={ coverImageId }
              numberOfMentions={ resourcesNumberOfMentionsMap[resource.id] }
              resource={ resource }
              assets={ relatedAssets }
              productionId={ productionId }
              getTitle={ getResourceTitle }
              key={ resource.id }
            />
          );
        };
        const handleAbortResourceDeletion = () => setPromptedToDeleteResourceId( undefined );
        const handleAbortResourcesDeletion = () => setResourcesPromptedToDelete( [] );
        return (
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column style={ { paddingRight: 0 } }>
                <LibraryFiltersBar
                  filterValues={ filterValues }
                  onDeleteSelection={ handleDeleteSelection }
                  onDeselectAllVisibleResources={ handleDeselectAllVisibleResources }
                  onSearchStringChange={ handleResourceSearchChange }
                  searchString={ this.state.searchString }
                  onSelectAllVisibleResources={ handleSelectAllVisibleResources }
                  onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                  optionsVisible={ optionsVisible }
                  resourceTypes={ resourceTypes }
                  selectedResourcesIds={ selectedResourcesIds }
                  onChange={ handleFiltersChange }
                  sortValue={ sortValue }
                  statusFilterValue={ statusFilterValue }
                  statusFilterValues={ statusFilterValues }
                  translate={ translate }
                  visibleResources={ visibleResources }
                />
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={ 1 }>
              <StretchedLayoutContainer
                isAbsolute
                isDirection={ 'vertical' }
              >
                <PaginatedList
                  items={ visibleResources }
                  itemsPerPage={ 30 }
                  style={ { height: '100%' } }
                  renderNoItem={ renderNoResource }
                  renderItem={ renderResourceInList }
                />
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
            <ConfirmToDeleteModal
              isActive={ promptedToDeleteResourceId !== undefined }
              deleteType={ 'resource' }
              production={ production }
              id={ promptedToDeleteResourceId }
              onClose={ handleAbortResourceDeletion }
              onDeleteConfirm={ handleDeleteResourceConfirm }
            />
            <ConfirmBatchDeleteModal
              translate={ translate }
              isActive={ actualResourcesPromptedToDelete.length > 0 }
              actualResourcesPromptedToDelete={ actualResourcesPromptedToDelete }
              resourcesPromptedToDelete={ resourcesPromptedToDelete }
              endangeredContextualizationsLength={ endangeredContextualizationsLength }
              onDelete={ handleDeleteResourcesPromptedToDelete }
              onCancel={ handleAbortResourcesDeletion }
            />
          </StretchedLayoutContainer>
      );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      mainColumnMode,
      resourcesPromptedToDelete,
      isBatchDeleting,
      resourceDeleteStep,
      actions: {
        setMainColumnMode,
      },
      submitMultiResources,
    } = this.props;
    const { t } = this.context;

    /**
     * Computed variables
     */
    const actualResourcesPromptedToDelete = resourcesPromptedToDelete;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Callbacks handlers
     */
    const handleNewResourceClick = () => {
      if ( mainColumnMode === 'new' ) {
        setMainColumnMode( 'list' );
      }
      else setMainColumnMode( 'new' );
    };

    return (
      <Container style={ { position: 'relative', height: '100%' } }>
        <StretchedLayoutContainer
          isFluid
          isDirection={ 'horizontal' }
          style={ { paddingLeft: '1rem' } }
          isAbsolute
        >
          <StretchedLayoutItem
            className={ 'is-hidden-mobile' }
            isFlex={ '1' }
          >
            <Column>
              <Title
                isSize={ 5 }
                style={ { paddingTop: '.5rem' } }
              >
                {translate( 'Production library' )}
              </Title>
              <Level>
                <Content>
                  {translate( 'Your library contains all the items that can be used within the production.' )}
                </Content>
              </Level>
              <Level>
                <Button
                  isFullWidth
                  onClick={ handleNewResourceClick }
                  isColor={ mainColumnMode === 'new' ? 'primary' : 'primary' }
                >
                  {translate( 'New item' )}
                </Button>
              </Level>
              <Level>
                <DropZone
                  onDrop={ submitMultiResources }
                  accept={ '.jpeg,.jpg,.gif,.png,.csv,.tsv,.bib' }
                >
                  {translate( 'Drop files to include in your library' )}
                  <HelpPin place={ 'right' }>
                    {`${translate( 'Accepted file formats: jpeg, jpg, gif, png, csv, tsv, bib' )}. ${translate( 'Up to {n} files, with a maximum size of {s} Mb each', {
                        n: maxBatchNumber,
                        s: Math.floor( realMaxFileSize / 1000000 )
                      } )}`}
                  </HelpPin>
                </DropZone>
              </Level>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ '3' }>
            <Column isWrapper>
              {this.renderMainColumn()}
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

        <ModalCard
          isActive={ isBatchDeleting }
          headerContent={ translate( [ 'Deleting an item', 'Deleting {n} items', 'n' ], { n: actualResourcesPromptedToDelete.length } ) }
          mainContent={
            <div>
              {translate( 'Deleting item {k} of {n}', { k: resourceDeleteStep + 1, n: actualResourcesPromptedToDelete.length } )}
            </div>
          }
        />
      </Container>
    );
  }
}

LibraryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default LibraryViewLayout;
