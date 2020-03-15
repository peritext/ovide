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
import { arrayMove } from 'react-sortable-hoc';
import ReactTooltip from 'react-tooltip';
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
  Tabs,
  TabList,
  Tab,
  TabLink,
  Delete,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';
import { createBibData } from '../../../helpers/resourcesUtils';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';
import { createDefaultSection } from '../../../helpers/schemaUtils';
import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  base64ToBytesLength,
  genRandomHex
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import PaginatedList from '../../../components/PaginatedList';
import ConfirmBatchDeleteModal from './ConfirmBatchDeleteModal';
import LibraryResourcesFilterBar from './LibraryResourcesFilterBar';
import LibrarySectionsFilterBar from './LibrarySectionsFilterBar';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import ResourceForm from '../../../components/ResourceForm';
import SectionForm from '../../../components/SectionForm';
import ResourceCard from './ResourceCard';
import SortableSectionsList from './SortableSectionsList';

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
const resourceTypes = Object.keys( resourcesSchemas ).filter( ( key ) => key !== 'section' );

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
      tagSelectionVisible,
      filterValues,
      tagsFilterValues,
      sortValue,
      sectionsSortValue,
      statusFilterValue,
      searchString,
      promptedToDeleteResourceId,
      selectedResourcesIds,
      resourcesPromptedToDelete,
      editedResourceId,
      openTabId,
      isSorting,
      searchTagString,
      actions: {
        setOptionsVisible,
        setTagSelectionVisible,
        setMainColumnMode,
        // setSearchString,
        setFilterValues,
        setTagsFilterValues,
        setSortValue,
        setSectionsSortValue,
        setStatusFilterValue,
        setPromptedToDeleteResourceId,
        setUploadStatus,
        setSearchTagString,

        createResource,
        updateResource,

        /*
         * deleteResource,
         * uploadResource,
         */

        createAsset,
        updateAsset,
        deleteAsset,

        setResourceSortValue,

        createTag,
        updateTag,
        deleteTag,

        setSelectedResourcesIds,
        setResourcesPromptedToDelete,
        setIsBatchDeleting,
        setResourceDeleteStep,
        setEditedResourceId,

        setOpenTabId,

        setIsSorting,

        updateSectionsOrder,
      },
      deleteResource,
      onGoToResource,
    } = this.props;
    const { t } = this.context;
    const {
      resources = {},
      id: productionId,
      assets,
      sectionsOrder,
    } = production;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Computed variables
     */

    const activeFilters = Object.keys( filterValues ).filter( ( key ) => filterValues[key] );
    const activeTagsFilters = Object.keys( tagsFilterValues ).filter( ( key ) => tagsFilterValues[key] );
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

    const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] ).filter( ( r ) => r.metadata.type !== 'section' );

    let visibleResources = searchString.length === 0 ? resourcesList : searchResources( resourcesList, searchString );

    const resourcesNumberOfMentionsMap = {};
    const citedResources = uniq( Object.keys( production.contextualizations )
              .map( ( contextualizationId ) => {
                const thisResourceId = production.contextualizations[contextualizationId].sourceId;
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
        if ( activeTagsFilters.length ) {
          return activeTagsFilters.find( ( id ) => ( resource.metadata.tags || [] ).includes( id ) ) !== undefined;
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
                .filter( ( contextualizationId ) => production.contextualizations[contextualizationId].sourceId === resourceId )
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
    const handleTagsToggle = ( tagId ) => {
      setTagsFilterValues( {
        ...tagsFilterValues,
        [tagId]: tagsFilterValues[tagId] ? false : true
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
        .filter( ( contextualization ) => contextualization.sourceId === realResourceId );

      const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
      const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.targetId ) );

      if ( relatedContextualizationsIds.length ) {
        const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
          const section = tempSections[sectionId] || production.resources[sectionId];
          const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.targetId === sectionId );
          let sectionChanged;
          const newSection = {
            ...section,
            contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
              }
              return result;
            }, { ...section.data.contents.contents } ),
            notes: Object.keys( section.data.contents.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...section.data.contents.notes[noteId],
                contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                  }
                  return result;
                }, { ...section.data.contents.notes[noteId].contents } )
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
          updateResource( {
            resourceId: sectionId,
            productionId: production.id,
            resource: changedSections[sectionId],
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
            return contextualization.sourceId === resourceId;
          } );

        const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
        const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.targetId ) );

        if ( relatedContextualizationsIds.length ) {
          const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
            const section = tempSections[sectionId] || production.resources[sectionId];
            const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.targetId === sectionId );
            let sectionChanged;
            const newSection = {
              ...section,
              contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                if ( changed && !sectionChanged ) {
                  sectionChanged = true;
                }
                return result;
              }, { ...( section.data.contents.contents || {} ) } ),
              notes: Object.keys( section.data.contents.notes ).reduce( ( temp1, noteId ) => ( {
                ...temp1,
                [noteId]: {
                  ...section.data.contents.notes[noteId],
                  contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                    const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                    if ( changed && !sectionChanged ) {
                      sectionChanged = true;
                    }
                    return result;
                  }, { ...section.data.contents.notes[noteId].contents } )
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
          updateResource( {
            resourceId: sectionId,
            productionId: production.id,
            resource: finalChangedSections[sectionId],
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
      const handleGoToResource = () => onGoToResource( resource.id );

      return (
        <ResourceForm
          onCancel={ handleCancel }
          onSubmit={ handleSubmit }
          bigSelectColumnsNumber={ 3 }
          productionId={ productionId }
          resource={ resource }
          onGoToResource={ handleGoToResource }
          allowGoToResource={ false }
          existingAssets={ relatedAssets }
          asNewResource={ false }
          tags={ production.tags }
          createTag={ createTag }
          updateTag={ updateTag }
          deleteTag={ deleteTag }
        />
      );
    }
    switch ( mainColumnMode ) {

      /**
       * UI case 2 : user creates a new resource
       */
      case 'newResource':
        const handleSubmit = ( resource, newAssets ) => {
          const resourceId = genId();

          let title;
          if ( resource.metadata.type === 'bib' ) {
            title = resource.data && resource.data.citations && resource.data.citations.length && resource.data.citations[0].title;
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
          setOpenTabId( 'resources' );
        };
        const handleSetMainColumnToList = () => setMainColumnMode( 'list' );
        return (
          <ResourceForm
            onCancel={ handleSetMainColumnToList }
            onSubmit={ handleSubmit }
            bigSelectColumnsNumber={ 3 }
            tags={ production.tags }
            createTag={ createTag }
            updateTag={ updateTag }
            deleteTag={ deleteTag }
            productionId={ production.id }
            asNewResource
          />
        );

      /**
       * UI case 2 : user creates a new resource
       */
      case 'newSection':

        const defaultSection = createDefaultSection();
        const defaultSectionMetadata = defaultSection.metadata;

        const handleCloseNewSection = () => {
          setMainColumnMode( 'sections' );
        };
        const handleNewSectionSubmit = ( metadata ) => {
          const newSection = {
            ...defaultSection,
            metadata,
            id: genId()
          };
          createResource( {
            resourceId: newSection.id,
            resource: newSection,
            productionId,
          }, ( err ) => {
            if ( !err ) {
              const newSectionsOrder = [
                ...sectionsOrder,
                {
                  resourceId: newSection.id,
                  level: 0
                }
              ];
              updateSectionsOrder( {
                productionId,
                sectionsOrder: newSectionsOrder
              }, ( thatErr ) => {
                if ( !thatErr ) {
                  onGoToResource( newSection.id );
                  setResourceSortValue( 'summary' );
              }
              } );

            }
          } );
        };
        return (
          <StretchedLayoutItem
            isFluid
            isFlex={ 2 }
            isFlowing
            style={ { height: '100%' } }
          >
            <StretchedLayoutContainer
              isAbsolute
              isDirection={ 'vertical' }
            >
              <StretchedLayoutItem>
                <Title isSize={ 2 }>
                  <StretchedLayoutContainer
                    style={ { paddingTop: '1rem' } }
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem isFlex={ 11 }>
                      {translate( 'Add a section' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ handleCloseNewSection } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
                <Level />
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlex={ 1 }>
                <SectionForm
                  metadata={ { ...defaultSectionMetadata } }
                  onSubmit={ handleNewSectionSubmit }
                  onCancel={ handleCloseNewSection }
                  tags={ production.tags }
                  createTag={ createTag }
                  updateTag={ updateTag }
                  deleteTag={ deleteTag }
                  productionId={ production.id }
                />
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        );

      /**
       * UI case 4 : user browses list of resources
       */
      case 'list':
      default:
        const handleFiltersChange = ( option, optionDomain ) => {
          if ( optionDomain === 'filter' ) {
            handleFilterToggle( option );
          }
          else if ( optionDomain === 'tags' ) {
            handleTagsToggle( option );
          }
          else if ( optionDomain === 'sort' ) {
            setSortValue( option );
            setOptionsVisible( false );
          }
          else if ( optionDomain === 'sectionsSort' ) {
            setSectionsSortValue( option );
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
        const handleTagSelectionVisibility = () => {
          setTagSelectionVisible( !tagSelectionVisible );
        };

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
          const handleGoToResource = () => onGoToResource( resource.id );

          return (
            <ResourceCard
              isActive={ isSelected }
              onClick={ handleClick }
              onEdit={ handleEdit }
              onGoToResource={ handleGoToResource }
              onDelete={ handleDelete }
              numberOfMentions={ resourcesNumberOfMentionsMap[resource.id] }
              resource={ resource }
              assets={ relatedAssets }
              productionId={ productionId }
              getTitle={ getResourceTitle }
              key={ resource.id }
              tags={ production.tags }
            />
          );
        };
        const handleAbortResourceDeletion = () => setPromptedToDeleteResourceId( undefined );
        const handleAbortResourcesDeletion = () => setResourcesPromptedToDelete( [] );
        const renderOpenTab = () => {

            const handleBatchUntag = ( { tagId, resourcesIds } ) => {
                resourcesIds.reduce( ( cur, resourceId ) =>
                  cur.then( () => {
                    return new Promise( ( res, rej ) => {
                      const prevResource = resources[resourceId];
                      const resource = {
                        ...prevResource,
                        metadata: {
                          ...prevResource.metadata,
                          tags: ( prevResource.metadata.tags || [] ).filter( ( thatTagId ) => thatTagId !== tagId )
                        }
                      };
                      updateResource( {
                        productionId,
                        resourceId,
                        resource
                      }, ( err ) => {
                        if ( err ) {
                          rej( err );
                        }
                        else res();
                      } );
                    } );
                  } )
                , Promise.resolve() );
              };
              const handleBatchTag = ( { tagId, resourcesIds } ) => {
                resourcesIds.reduce( ( cur, resourceId ) =>
                  cur.then( () => {
                    return new Promise( ( res, rej ) => {
                      const prevResource = resources[resourceId];
                      const resource = {
                        ...prevResource,
                        metadata: {
                          ...prevResource.metadata,
                          tags: ( prevResource.metadata.tags || [] ).includes( tagId ) ? ( prevResource.metadata.tags || [] ) : [ ...( prevResource.metadata.tags || [] ), tagId ]
                        }
                      };
                      updateResource( {
                        productionId,
                        resourceId,
                        resource
                      }, ( err ) => {
                        if ( err ) {
                          rej( err );
                        }
                        else res();
                      } );
                    } );
                  } )
                , Promise.resolve() );
              };
              const handleSearchTagStringChange = ( e ) => {
                setSearchTagString( e.target.value );
              };
              const handleCreateTagFromSearch = () => {
                setSearchTagString( '' );
                const newTag = {
                  id: genId(),
                  color: genRandomHex(),
                  name: searchTagString
                };
                createTag( {
                  tag: newTag,
                  tagId: newTag.id,
                  productionId
                }, ( err ) => {
                  if ( !err ) {
                    handleBatchTag( {
                      tagId: newTag.id,
                      resourcesIds: selectedResourcesIds,
                    } );
                  }
                } );
              };
          let handleSelectAllVisibleResources;
          switch ( openTabId ) {
            case 'sections':
              const sectionsList = sectionsOrder
              .filter( ( { resourceId } ) => resources[resourceId] )
              .map( ( { resourceId, level } ) => ( {
                resource: resources[resourceId],
                level
              } ) )
              .filter( ( { resource } ) => {
                if ( searchString.length > 2 ) {
                  const title = resource.metadata.title.toLowerCase();
                  return title.includes( searchString.toLowerCase() );
                }
                return true;
              } )
              .filter( ( { resource } ) => {
                if ( activeTagsFilters.length ) {
                  return activeTagsFilters.find( ( id ) => ( resource.metadata.tags || [] ).includes( id ) ) !== undefined;
                }
                return true;
              } )
              .sort( ( { resource: resource1 }, { resource: resource2 } ) => {
                switch ( sectionsSortValue ) {
                  case 'editedRecently':
                    return ( !resource2.lastUpdateAt || resource1.lastUpdateAt > resource2.lastUpdateAt ) ? -1 : 1;
                  case 'title':
                    return resource1.metadata.title > resource2.metadata.title ? 1 : -1;
                  case 'summary':
                  default:
                    return -1;
                }
              } );
              const handleDeleteSection = ( thatSectionId ) => {
                setPromptedToDeleteResourceId( thatSectionId );
              };
              const handleDeleteSectionExecution = ( thatSectionId ) => {
                const newSectionsOrder = sectionsOrder.filter( ( { resourceId } ) => resourceId !== thatSectionId );
                updateSectionsOrder( {
                  productionId,
                  sectionsOrder: newSectionsOrder
                }, () => {
                  deleteResource( {
                    resourceId: thatSectionId,
                    productionId,
                  } );
                } );
              };

              const handleDeleteSectionConfirm = () => {
                handleDeleteSectionExecution( promptedToDeleteResourceId );
                setPromptedToDeleteResourceId( undefined );
              };

              const handleSortEnd = ( { oldIndex, newIndex } ) => {

                setIsSorting( false );
                const levelsMap = sectionsOrder.reduce( ( res, { resourceId, level } ) => ( {
                  ...res,
                  [resourceId]: level
                } ), {} );
                const sectionsIds = sectionsOrder.map( ( { resourceId } ) => resourceId );

                const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex ).map( ( resourceId ) => ( {
                  resourceId,
                  level: levelsMap[resourceId]
                } ) );

                updateSectionsOrder( {
                  productionId,
                  sectionsOrder: newSectionsOrder
                } );
                ReactTooltip.rebuild();
              };
              const goToSection = ( id ) => onGoToResource( id );
              const handleActiveIsSorting = () => setIsSorting( true );
              const handleSectionIndexChange = ( oldIndex, newIndex ) => {
                const levelMaps = sectionsOrder.reduce( ( res, item ) => ( {
                  ...res,
                  [item.resourceId]: item.level
                } ), {} );
                const sectionsIds = sectionsOrder.map( ( { resourceId } ) => resourceId );

                const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex ).map( ( resourceId ) => ( {
                  resourceId,
                  level: levelMaps[resourceId]
                } ) );
                updateSectionsOrder( {
                  productionId,
                  sectionsOrder: newSectionsOrder
                } );
                setIsSorting( false );
              };
              const handleSetSectionLevel = ( { sectionId, level } ) => {
                const newSectionsOrder = sectionsOrder.map( ( { resourceId: thatResourceId, level: thatLevel } ) => {
                  if ( thatResourceId === sectionId ) {
                    return {
                      resourceId: thatResourceId,
                      level
                    };
                  }
                  return {
                    resourceId: thatResourceId,
                    level: thatLevel
                  };
                } );
                updateSectionsOrder( {
                  productionId,
                  sectionsOrder: newSectionsOrder
                } );
              };
              handleSelectAllVisibleResources = () => setSelectedResourcesIds(
                sectionsList.map( ( { resource } ) => resource.id )
              );
              const handleToggleSectionSelection = ( resourceId ) => {
                let newSelectedResourcesIds;
                const isSelected = selectedResourcesIds.includes( resourceId );
                  if ( isSelected ) {
                    newSelectedResourcesIds = selectedResourcesIds.filter( ( id ) => id !== resourceId );
                  }
                  else {
                    newSelectedResourcesIds = [ ...selectedResourcesIds, resourceId ];
                  }
                  setSelectedResourcesIds( newSelectedResourcesIds );
              };
              return (
                <StretchedLayoutContainer
                  isAbsolute
                  isDirection={ 'vertical' }
                >
                  <StretchedLayoutItem
                    style={ { paddingRight: 0 } }
                  >
                    <Column>
                      <LibrarySectionsFilterBar
                        sectionsSortValue={ sectionsSortValue }
                        filterValues={ filterValues }
                        tagsFilterValues={ tagsFilterValues }
                        onSearchStringChange={ handleResourceSearchChange }
                        searchString={ this.state.searchString }
                        onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                        optionsVisible={ optionsVisible }
                        onChange={ handleFiltersChange }
                        sortValue={ sortValue }
                        statusFilterValue={ statusFilterValue }
                        statusFilterValues={ statusFilterValues }
                        translate={ translate }
                        tags={ production.tags }

                        searchTagString={ searchTagString }
                        onCreateTagFromSearch={ handleCreateTagFromSearch }
                        onSearchTagStringChange={ handleSearchTagStringChange }
                        onDeleteSelection={ handleDeleteSelection }
                        onDeselectAllVisibleResources={ handleDeselectAllVisibleResources }

                        onSelectAllVisibleResources={ handleSelectAllVisibleResources }
                        onToggleTagSelectionVisibility={ handleTagSelectionVisibility }
                        tagSelectionVisible={ tagSelectionVisible }
                        onBatchUntag={ handleBatchUntag }
                        onBatchTag={ handleBatchTag }
                        resourceTypes={ resourceTypes }
                        selectedResourcesIds={ selectedResourcesIds }
                        resources={ resources }
                        visibleResources={ sectionsList }
                      />
                    </Column>
                  </StretchedLayoutItem>
                  <StretchedLayoutItem
                    isFlex={ 2 }
                    style={ {
                    position: 'relative'
                  } }
                  >
                    <div style={ {
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                  } }
                    >

                      <SortableSectionsList
                        items={ sectionsList }
                        production={ production }
                        onToggleSectionSelection={ handleToggleSectionSelection }
                        allowMove={ sectionsSortValue === 'summary' }
                        onSortEnd={ handleSortEnd }
                        selectedResourcesIds={ selectedResourcesIds }
                        renderNoItem={ () => <div>{translate( 'No sections to display' )}</div> }
                        goToSection={ goToSection }
                        setSectionIndex={ handleSectionIndexChange }
                        onSortStart={ handleActiveIsSorting }
                        isSorting={ isSorting }
                        onDelete={ handleDeleteSection }
                        setSectionLevel={ handleSetSectionLevel }
                        useDragHandle
                      />
                    </div>
                    <ConfirmToDeleteModal
                      isActive={ promptedToDeleteResourceId !== undefined }
                      deleteType={ 'section' }
                      production={ production }
                      id={ promptedToDeleteResourceId }
                      onClose={ () => setPromptedToDeleteResourceId( undefined ) }
                      onDeleteConfirm={ handleDeleteSectionConfirm }
                    />
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
              );
            case 'resources':
              handleSelectAllVisibleResources = () => setSelectedResourcesIds(
                visibleResources.map( ( res ) => res.id )
              );
              return (
                <StretchedLayoutContainer isAbsolute>
                  <StretchedLayoutItem style={ { paddingRight: 0 } }>
                    <Column>
                      <LibraryResourcesFilterBar
                        searchTagString={ searchTagString }
                        onCreateTagFromSearch={ handleCreateTagFromSearch }
                        onSearchTagStringChange={ handleSearchTagStringChange }
                        filterValues={ filterValues }
                        tagsFilterValues={ tagsFilterValues }
                        onDeleteSelection={ handleDeleteSelection }
                        onDeselectAllVisibleResources={ handleDeselectAllVisibleResources }
                        onSearchStringChange={ handleResourceSearchChange }
                        searchString={ this.state.searchString }
                        onSelectAllVisibleResources={ handleSelectAllVisibleResources }
                        onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                        onToggleTagSelectionVisibility={ handleTagSelectionVisibility }
                        tagSelectionVisible={ tagSelectionVisible }
                        optionsVisible={ optionsVisible }
                        onBatchUntag={ handleBatchUntag }
                        onBatchTag={ handleBatchTag }
                        resourceTypes={ resourceTypes }
                        selectedResourcesIds={ selectedResourcesIds }
                        onChange={ handleFiltersChange }
                        sortValue={ sortValue }
                        statusFilterValue={ statusFilterValue }
                        statusFilterValues={ statusFilterValues }
                        translate={ translate }
                        resources={ resources }
                        visibleResources={ visibleResources }
                        tags={ production.tags }

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

                </StretchedLayoutContainer>
              );
            default:
              return null;
          }
        };
        return (
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column style={ { paddingRight: 0, marginTop: '.5rem' } }>
                <Tabs
                  isBoxed
                  isFullWidth
                  style={ { overflow: 'hidden' } }
                >
                  <TabList>
                    <Tab
                      onClick={ () => {
                        setOpenTabId( 'sections' );
                        setTagsFilterValues( [] );
                        setSelectedResourcesIds( [] );
                        this.setState( {
                          searchString: '',
                        } );
                      } }
                      isActive={ openTabId === 'sections' }
                    >
                      <TabLink>
                        <Title isSize={ 5 }>{translate( 'Sections' )}</Title>
                      </TabLink>
                    </Tab>
                    <Tab
                      onClick={ () => {
                        setOpenTabId( 'resources' );
                        setTagsFilterValues( [] );
                        setSelectedResourcesIds( [] );
                        this.setState( {
                          searchString: ''
                        } );
                       } }
                      isActive={ openTabId === 'resources' }
                    >
                      <TabLink>
                        <Title isSize={ 5 }>{translate( 'Other materials' )}</Title>
                      </TabLink>
                    </Tab>
                  </TabList>
                </Tabs>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem
              isFlex={ 1 }
              style={ { position: 'relative' } }
            >
              {renderOpenTab()}
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
      if ( mainColumnMode === 'newResource' ) {
        setMainColumnMode( 'list' );
      }
      else setMainColumnMode( 'newResource' );
    };

    const handleOpenNewSection = () => {
      setMainColumnMode( 'newSection' );
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
                  onClick={ handleOpenNewSection }
                  isFullWidth
                  isColor={ 'primary' }
                >
                  {translate( 'New section' )}
                </Button>
              </Level>

              <Level>
                <Button
                  isFullWidth
                  onClick={ handleNewResourceClick }
                  isColor={ mainColumnMode === 'newResource' ? 'primary' : 'primary' }
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
