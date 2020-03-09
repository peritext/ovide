/**
 * This module provides a connected component for displaying the section view
 * @module ovide/features/GlossaryView
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

/**
 * Imports Components
 */
import PaginatedList from '../../../components/PaginatedList';
import ConfirmBatchDeleteModal from './ConfirmBatchDeleteModal';
import GlossaryFiltersBar from './GlossaryFiltersBar';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import ResourceForm from '../../../components/ResourceForm';
import ResourceCard from './ResourceCard';
import AsideGlossary from './AsideGlossary';

/**
 * Imports Assets
 */

/**
 * Shared variables
 */

class GlossaryViewLayout extends Component {

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

        setSelectedResourcesIds,
        setResourcesPromptedToDelete,
        setMentionsSearchString,
        setIsBatchDeleting,
        setResourceDeleteStep,
        setEditedResourceId,
        setMentionMode,

      },
      deleteResource,
      onGoToResource,
    } = this.props;
    const { t } = this.context;
    const {
      resources = {},
      id: productionId,
      assets
    } = production;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.GlossaryView' );

    /**
     * Computed variables
     */

    // const activeFilters = Object.keys( filterValues ).filter( ( key ) => filterValues[key] );
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
                const thisResourceId = production.contextualizations[contextualizationId].sourceId;
                resourcesNumberOfMentionsMap[thisResourceId] = resourcesNumberOfMentionsMap[thisResourceId] ?
                  resourcesNumberOfMentionsMap[thisResourceId] + 1 : 1;
                return thisResourceId;
              } ) );

    visibleResources = visibleResources
      .filter( ( resource ) => {
        return resource.metadata.type === 'glossary';
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

        assetsToCreateIds.reduce( ( cur, assetId ) => {
              return cur.then( () => {
                const asset = newAssets[assetId];
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
          onGoToResource={ () => onGoToResource( resource.id ) }
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
              createResource( payload, ( ) => {
                setSelectedResourcesIds( [ resourceId ] );
                setMentionMode( 'add' );
                setTimeout( () => {
                  setMentionsSearchString( resource.data.name || '' );
                } );
              } );
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
            resourceType={ 'glossary' }
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
        const renderNoResource = () => <Column>{translate( 'No item in your glossary yet' )}</Column>;
        const renderResourceInList = ( resource ) => {
          const relatedAssetsIds = getRelatedAssetsIds( resource.data );
          const relatedAssets = relatedAssetsIds.map( ( id ) => production.assets[id] ).filter( ( a ) => a );
          const handleEdit = ( e ) => {
            e.stopPropagation();
            setEditedResourceId( resource.id );
          };
          const handleDelete = () => {
            setPromptedToDeleteResourceId( resource.id );
          };
          const isSelected = selectedResourcesIds.indexOf( resource.id ) > -1;
          const handleGoTo = () => {
            onGoToResource( resource.id );
          };
          const handleClick = () => {
            let newSelectedResourcesIds;
              if ( isSelected ) {
                newSelectedResourcesIds = selectedResourcesIds.filter( ( id ) => id !== resource.id );
              }
              else {
                // newSelectedResourcesIds = [ ...selectedResourcesIds, resource.id ];
                newSelectedResourcesIds = [ resource.id ];
                if ( resourcesNumberOfMentionsMap[resource.id] ) {
                  setMentionMode( 'review' );
                  setMentionsSearchString( '' );
                }
                else {
                  setMentionMode( 'add' );
                  setMentionsSearchString( resource.data.name || '' );
              }
              }
              setSelectedResourcesIds( newSelectedResourcesIds );
          };
          return (
            <ResourceCard
              isActive={ isSelected }
              onClick={ handleClick }
              key={ resource.id }
              onGoToResource={ handleGoTo }
              onEdit={ handleEdit }
              onDelete={ handleDelete }
              numberOfMentions={ resourcesNumberOfMentionsMap[resource.id] }
              resource={ resource }
              assets={ relatedAssets }
              productionId={ productionId }
              getTitle={ getResourceTitle }
            />
          );
        };
        const handleAbortResourceDeletion = () => setPromptedToDeleteResourceId( undefined );
        const handleAbortResourcesDeletion = () => setResourcesPromptedToDelete( [] );
        const handleNewResourceClick = () => {
          if ( mainColumnMode === 'new' ) {
            setMainColumnMode( 'list' );
          }
          else setMainColumnMode( 'new' );
        };
        return (
          <StretchedLayoutContainer
            isAbsolute
            className={ 'column' }
            style={ { paddingLeft: '1rem' } }
          >
            <StretchedLayoutItem>
              <Column style={ { paddingLeft: 0 } }>
                <GlossaryFiltersBar
                  filterValues={ filterValues }
                  onDeleteSelection={ handleDeleteSelection }
                  onDeselectAllVisibleResources={ handleDeselectAllVisibleResources }
                  onSearchStringChange={ handleResourceSearchChange }
                  searchString={ this.state.searchString }
                  onSelectAllVisibleResources={ handleSelectAllVisibleResources }
                  onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                  optionsVisible={ optionsVisible }
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
                  defaultColumns={ 1 }
                  style={ { height: '100%' } }
                  renderNoItem={ renderNoResource }
                  renderItem={ renderResourceInList }
                />
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column>
                <Button
                  isFullWidth
                  onClick={ handleNewResourceClick }
                  isColor={ mainColumnMode === 'new' ? 'primary' : 'primary' }
                >
                  {translate( 'New glossary item' )}
                </Button>
              </Column>
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

  addProspect = ( prospect ) => {
    const {
      selectedResourcesIds,
      editedProduction: production = {},
      actions: {
        updateResource,
        createContextualization,
        createContextualizer,
      },
    } = this.props;
    const productionId = production.id;
    const resourceId = selectedResourcesIds[0];
    // create contextualizer
    const contextualizerId = genId();
    const contextualizer = {
      type: 'glossary',
      id: contextualizerId,
    };
    // create contextualization
    const contextualizationId = genId();
    const contextualization = {
      id: contextualizationId,
      contextualizerId,
      sourceId: resourceId,
      targetId: prospect.sectionId,
    };
    // update section
    const section = production.resources[prospect.sectionId];
    const { notes } = section;
    const contents = prospect.contentId === 'main' ? section.data.contents.contents : notes[prospect.contentId].contents;
    const key = +( Object.keys( contents.entityMap ).pop() || 0 ) + 1;

    const newContents = {
      ...contents,
      entityMap: {
        ...contents.entityMap,
        [key]: {
          type: 'INLINE_ASSET',
          data: {
            asset: {
              id: contextualizationId
            }
          }
        }
      },
      blocks: contents.blocks.map( ( block, index ) => {
        if ( index === prospect.blockIndex ) {
          return {
            ...block,
            entityRanges: [
              ...block.entityRanges
              .filter( ( r ) => r.key !== key && !( r.offset === prospect.offset && r.length === prospect.length ) ),
              {
                offset: prospect.offset,
                length: prospect.length,
                key,
              }
            ]
          };
        }
        return block;
      } )
    };
    const newSection = {
      ...section,
    };
    if ( prospect.contentId === 'main' ) {
      newSection.data.contents.contents = newContents;
    }
    else {
      newSection.data.contents.notes[prospect.contentId].contents = newContents;
    }
    // trigger the changes
    return new Promise( ( resolve, reject ) => {
      Promise.resolve()
      .then( () => new Promise( ( res, rej ) => {
        createContextualizer( {
          contextualizerId,
          contextualizer,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
        else res();
        } );
      } ) )
      .then( () => new Promise( ( res, rej ) => {
        createContextualization( {
          contextualizationId,
          contextualization,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
          else res();
        } );
      } ) )
      .then( () => new Promise( ( res, rej ) => {
        updateResource( {
          resourceId: prospect.sectionId,
          resource: newSection,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
          else res();
        } );
      } ) )
      .then( () => {
        resolve();
      } )
      .catch( ( error ) => {
        reject( error );
      } );
    } );
  }

  removeMention = ( mention ) => {
    const {
      editedProduction: production = {},
      actions: {
        updateResource,
        deleteContextualization,
        deleteContextualizer
      },
    } = this.props;
    const productionId = production.id;
    const {
      contextualizationId,
      sectionId,
      contentId,
    } = mention;
    const contextualizerId = production.contextualizations[contextualizationId].contextualizer;

    // update section
    const section = production.resources[sectionId];
    const newSection = {
      ...section,
    };
    if ( contentId ) {
      const contents = contentId === 'main' ? section.data.contents.contents : section.data.contents.notes[contentId].contents;
      const { result: newContents } = removeContextualizationReferenceFromRawContents( contents, contextualizationId );
      if ( contentId === 'main' ) {
        newSection.data.contents.contents = newContents;
      }
      else {
        newSection.data.contents.notes[contentId].contents = newContents;
      }
    }

    // trigger the changes
    return new Promise( ( resolve, reject ) => {
      Promise.resolve()
      .then( () => new Promise( ( res, rej ) => {
        updateResource( {
          resourceId: sectionId,
          resource: newSection,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
          else res();
        } );
      } ) )
      .then( () => new Promise( ( res, rej ) => {
        deleteContextualization( {
          contextualizationId,
          // contextualization,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
          else res();
        } );
      } ) )
      .then( () => new Promise( ( res, rej ) => {
        deleteContextualizer( {
          contextualizerId,
          // contextualizer,
          productionId
        }, ( err ) => {
          if ( err ) {
            rej( err );
          }
        else res();
        } );
      } ) )
      .then( () => {
        resolve();
      } )
      .catch( ( error ) => {
        reject( error );
      } );
    } );
  };

  render = () => {

    /**
     * Variables definition
     */
    const {
      mainColumnMode,
      editedResourceId,
      isBatchDeleting,
      mentionDeleteStep,
      selectedResourcesIds,
      editedProduction: production = {},
      mentionMode,
      mentionsSearchString,
      isBatchCreating,
      mentionCreationStep,
      mentionsToDeleteNumber,
      mentionsToCreateNumber,
      actions: {
        setMentionMode,
        setMentionsSearchString,
        setMentionDeleteStep,
        setIsBatchDeleting,
        setIsBatchCreating,
        setMentionCreationStep,
        setMentionsToDeleteNumber,
        setMentionsToCreateNumber,
      },

    } = this.props;
    const {
      addProspect,
      removeMention,
    } = this;
    const { t } = this.context;

    /**
     * Computed variables
     */

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.GlossaryView' );

    /**
     * Callbacks handlers
     */

    const addProspects = ( prospects ) => {
      setIsBatchCreating( true );
      setMentionsToCreateNumber( prospects.length );
      setTimeout( () => {
        return prospects.reduce( ( cur, prospect, index ) =>
          cur.then( () =>
            new Promise( ( resolve, reject ) => {
              setMentionCreationStep( index );
              addProspect( prospect )
                .then( () => {
                  setTimeout( resolve );
                } )
                .catch( reject );
            } )
          )
        , Promise.resolve() )
        .then( () =>
          setIsBatchCreating( false )
        )
        .catch( () =>
          setIsBatchCreating( false )
        );
      } );

    };

    const removeMentions = ( mentions ) => {
      setIsBatchDeleting( true );
      setMentionsToDeleteNumber( mentions.length );
      setTimeout( () => {
        return mentions.reduce( ( cur, mention, index ) =>
          cur.then( () =>
            new Promise( ( resolve, reject ) => {
              setMentionDeleteStep( index );
              removeMention( mention )
                .then( () => {
                  setTimeout( resolve );
                } )
                .catch( reject );
            } )
          )
        , Promise.resolve() )
        .then( () =>
          setIsBatchDeleting( false )
        )
        .catch( () =>
          setIsBatchDeleting( false )
        );
      } );

    };

    return (
      <Container style={ { position: 'relative', height: '100%' } }>
        <StretchedLayoutContainer
          isFluid
          isDirection={ 'horizontal' }
          isAbsolute
        >

          <StretchedLayoutItem isFlex={ '3' }>
            <Column
              style={ { paddingLeft: 0 } }
              isWrapper
            >
              {this.renderMainColumn()}
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem
            style={ {
              maxWidth: ( mainColumnMode !== 'new' && !editedResourceId ) ? '100%' : 0,
              overflowX: 'hidden'
            } }
            isFlex={ ( mainColumnMode !== 'new' && !editedResourceId ) ? '3' : 0 }
          >
            <StretchedLayoutContainer
              className={ 'column' }
              style={ { paddingRight: 0 } }
              isAbsolute
            >
              <Column
                style={ { paddingRight: 0 } }
                isWrapper
              >
                {
                selectedResourcesIds.length === 0 ?
                  <Column style={ {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                } }
                  >
                    <Title isSize={ 3 }>{
                    translate( 'Select a glossary entry in the list to edit its mentions' )
                  }
                    </Title>
                  </Column>
                :
                  <AsideGlossary
                    resource={ production.resources[selectedResourcesIds[0]] }
                    mentionMode={ mentionMode }
                    isBatchDeleting={ isBatchDeleting }
                    setIsBatchDeleting={ setIsBatchDeleting }
                    mentionDeleteStep={ mentionDeleteStep }
                    setMentionDeleteStep={ setMentionDeleteStep }
                    isBatchCreating={ isBatchCreating }
                    mentionCreationStep={ mentionCreationStep }
                    setMentionMode={ setMentionMode }
                    addProspect={ addProspect }
                    addProspects={ addProspects }
                    removeMention={ removeMention }
                    removeMentions={ removeMentions }
                    mentionsToDeleteNumber={ mentionsToDeleteNumber }
                    mentionsToCreateNumber={ mentionsToCreateNumber }
                    production={ production }
                    onSearchStringChange={ setMentionsSearchString }
                    searchString={ mentionsSearchString }
                  />
              }
              </Column>
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

      </Container>
    );
  }
}

GlossaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default GlossaryViewLayout;
