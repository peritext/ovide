/**
 * This module provides a layout component for displaying the section view
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import { arrayMove } from 'react-sortable-hoc';
import {
  convertToRaw,
  EditorState,
  convertFromRaw,
} from 'draft-js';
import {
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';

import { createDefaultSection } from '../../../helpers/schemaUtils';
import { deleteContextualizationFromId } from '../../../helpers/assetsUtils';
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';

/**
 * Imports Components
 */
import AsideSectionColumn from './AsideSectionColumn';
import MainSectionColumn from './MainSectionColumn';
import ShortcutsModal from './ShortcutsModal';

import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import LoadingScreen from '../../../components/LoadingScreen';
import LinkModal from '../../../components/LinkModal';
import GlossaryModal from '../../../components/GlossaryModal';
import InternalLinkModal from '../../../components/InternalLinkModal';

const SectionViewLayout = ( {
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  newResourceMode,
  resourceOptionsVisible,
  resourceFilterValues,
  resourceSortValue,
  resourceSearchString,
  linkModalFocusData,
  glossaryModalFocusData,
  previousEditorFocus,

  promptedToDeleteSectionId,
  promptedToDeleteResourceId,

  internalLinkModalFocusData,
  inactiveSections,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,
  shortcutsHelpVisible,
  editorPastingStatus,

  production,
  section,

  embedResourceAfterCreation,
  newResourceType,
  productionIsSaved,
  selectedContextualizationId,
  uploadStatus,
  editedResourceId,
  previewMode,
  editedContextualizationId,

  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
    setMainColumnMode,
    setResourceOptionsVisible,
    setResourceFilterValues,
    setResourceSortValue,
    setResourceSearchString,
    setNewResourceMode,
    setLinkModalFocusData,
    setGlossaryModalFocusData,
    setEditorPastingStatus,
    setInternalLinkModalFocusData,

    setPromptedToDeleteSectionId,
    setPromptedToDeleteResourceId,
    setUploadStatus,

    updateSection,
    createSection,
    deleteSection,

    updateContextualization,

    updateSectionsOrder,
    promptAssetEmbed,
    unpromptAssetEmbed,
    setEditorFocus,

    createContextualization,
    createContextualizer,
    createResource,
    // uploadResource,
    setCoverImage,
    setSectionLevel,

    updateDraftEditorState,
    updateDraftEditorsStates,

    updateContextualizer,
    updateResource,
    deleteContextualization,
    deleteContextualizer,
    // deleteResource,
    setPreviewMode,
    // deleteUploadedResource,

    setAssetRequestContentId,
    setShortcutsHelpVisible,
    setNewResourceType,
    setEmbedResourceAfterCreation,
    setProductionIsSaved,
    setErrorMessage,
    setSelectedContextualizationId,
    createProductionObjects,
    setEditedResourceId,

    createAsset,
    updateAsset,
    deleteAsset,

    setEditedContextualizationId,
  },
  goToSection,
  summonAsset,
  submitMultiResources,
  embedLastResource,
  onCreateHyperlink: handleCreateHyperlink,
  onContextualizeHyperlink: handleContextualizeHyperlink,

  onCreateGlossary: handleCreateGlossary,
  onContextualizeGlossary: handleContextualizeGlossary,

  onCreateInternalLink: handleCreateInternalLink,
  onResourceEditAttempt: handleResourceEditAttempt,
  deleteResource,
  history,
}, { t } ) => {

  /**
   * Variables definition
   */
  const {
    id: productionId,
    resources,
    sectionsOrder,
  } = production;
  const { id: sectionId } = section;

  /**
   * Computed variables
   */
  const defaultSection = createDefaultSection();

  const sectionsList = production.sectionsOrder.map( ( thatSectionId ) => production.sections[thatSectionId] );

  const activeFilters = Object.keys( resourceFilterValues ).filter( ( key ) => resourceFilterValues[key] );
  const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );

  let visibleResources = resourceSearchString.length === 0 ? resourcesList : searchResources( resourcesList, resourceSearchString );
  visibleResources = visibleResources
    .filter( ( resource ) => {
      if ( activeFilters.length ) {
        return activeFilters.indexOf( resource.metadata.type ) > -1;
      }
      return true;
    } )
    .sort( ( a, b ) => {
        switch ( resourceSortValue ) {
          case 'edited recently':
            if ( !b.lastUpdateAt || a.lastUpdateAt > b.lastUpdateAt ) {
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
  const hyperlinks = linkModalFocusData ? Object.keys( production.resources )
    .filter( ( resourceId ) => production.resources[resourceId].metadata.type === 'webpage' )
    .map( ( resourceId ) => production.resources[resourceId] ) : [];
  const glossaries = glossaryModalFocusData ? Object.keys( production.resources )
    .filter( ( resourceId ) => production.resources[resourceId].metadata.type === 'glossary' )
    .map( ( resourceId ) => production.resources[resourceId] ) : [];

  let editedContextualization;
  if ( editedContextualizationId && production.contextualizations[editedContextualizationId] ) {
    const candidate = production.contextualizations[editedContextualizationId];
    if ( production.resources[candidate.resourceId] ) {
      editedContextualization = candidate;
    }
  }

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Callbacks handlers
   */
  const handleNewSectionSubmit = ( metadata ) => {
    const newSection = {
      ...defaultSection,
      metadata: {
        ...metadata,
        level: section.metadata.level,
      },
      id: genId()
    };

    const currentSectionOrder = sectionsOrder.indexOf( section.id ) || 0;
    createSection( {
      section: newSection,
      sectionId: newSection.id,
      productionId,
      sectionOrder: currentSectionOrder + 1,
    }, ( err ) => {
      if ( !err ) {
        goToSection( newSection.id );
      }
    } );
    setMainColumnMode( 'edition' );
  };

  const handleDeleteSection = ( thatSectionId ) => {
    setPromptedToDeleteSectionId( thatSectionId );
  };

  const handleDeleteResource = ( thatResourceId ) => {
    setPromptedToDeleteResourceId( thatResourceId );
  };
  const handleDeleteSectionExecution = ( thatSectionId ) => {
    deleteSection( {
      sectionId: thatSectionId,
      productionId,
    } );
  };

  const handleDeleteSectionConfirm = () => {
    handleDeleteSectionExecution( promptedToDeleteSectionId );
    setPromptedToDeleteSectionId( undefined );
  };

  const handleDeleteResourceConfirm = () => {
    const resource = resources[promptedToDeleteResourceId];
    const payload = {
      productionId,
      resourceId: resource.id,
      resource
    };
    const relatedContextualizations = Object.keys( production.contextualizations ).map( ( c ) => production.contextualizations[c] )
        .filter( ( contextualization ) => {
          return contextualization.resourceId === promptedToDeleteResourceId;
        } );

    const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
    const relatedContextualizationsSectionIds = relatedContextualizations.map( ( c ) => c.sectionId );

    const changedContentStates = {};
    if ( relatedContextualizationsIds.length ) {
      relatedContextualizationsSectionIds.forEach( ( key ) => {
        const thatSection = production.sections[key];
        if ( !thatSection ) return;
        let sectionChanged;
        let newSection;
        // resource is cited in this section view
        if ( Object.keys( editorStates ).indexOf( key ) !== -1 ) {
          const sectionContents = editorStates[thatSection.id] ? { ...convertToRaw( editorStates[thatSection.id].getCurrentContent() ) } : thatSection.contents;
          const notesContents = Object.keys( thatSection.notes ).reduce( ( res, noteId ) => ( {
            ...res,
            [noteId]: editorStates[noteId] ? convertToRaw( editorStates[noteId].getCurrentContent() ) : thatSection.notes[noteId].contents
          } ), {} );

          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
                changedContentStates[key] = result;
              }
              return result;
            }, { ...sectionContents } ),
            notes: Object.keys( thatSection.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                    changedContentStates[noteId] = result;
                  }
                  return result;
                }, { ...notesContents[noteId] } )
              }
            } ), {} )
          };
          // updating live editor states
          const newEditorStates = Object.keys( editorStates || {} )
            .reduce( ( res, contentId ) => ( {
              ...res,
              [contentId]: changedContentStates[contentId] ?
                EditorState.push(
                  editorStates[contentId],
                  convertFromRaw( changedContentStates[contentId] ),
                  'remove-entity'
                )
                 :
                editorStates[contentId]
            } ), {} );
          updateDraftEditorsStates( newEditorStates );
        }
        // resource is cited in other sections
        else {
          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
              }
              return result;
            }, thatSection.contents ),
            notes: Object.keys( thatSection.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                  }
                  return result;
                }, thatSection.notes[noteId].contents )
              }
            } ), {} )
          };
        }
        if ( sectionChanged ) {
          updateSection( {
            sectionId: thatSection.id,
            productionId: production.id,
            section: newSection,
          } );
        }
      } );
    }

    /*
     * if ( resource.metadata.type === 'image' || resource.metadata.type === 'table' ) {
     *   deleteUploadedResource( payload );
     * }
     * else {
     */
      deleteResource( payload );
    // }
    setPromptedToDeleteResourceId( undefined );
  };

  const handleOpenSectionSettings = () => {
    setMainColumnMode( 'editmetadata' );
  };
  const handleCloseSectionSettings = () => {
    setMainColumnMode( 'edition' );
  };

  const handleCloseActiveResource = () => {
  };

  const handleCloseEditedContextualization = () => {
    setSelectedContextualizationId( undefined );
    setEditedContextualizationId( undefined );
    setEditorFocus( undefined );
  };

  const handleSectionsSortEnd = ( { oldIndex, newIndex } ) => {
    const sectionsIds = sectionsList.map( ( thatSection ) => thatSection.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );

    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder,
    } );
  };
  const handleSectionIndexChange = ( oldIndex, newIndex ) => {
    const sectionsIds = sectionsList.map( ( thatSection ) => thatSection.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );

    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder,
    } );
  };

  const handleUpdateSection = ( thatSection, callback ) => {
    if ( thatSection && !editedContextualizationId ) {
      updateSection( {
        sectionId,
        productionId,

        section: thatSection,
      }, callback );
    }
  };

  const handleSetCoverImage = ( resourceId ) => {
    setCoverImage( {
      productionId,
      resourceId,
    } );
  };
  const handleStartExistingResourceConfiguration = ( resourceId ) => handleResourceEditAttempt( resourceId );
  const handleStartNewResourceConfiguration = ( toEmbedResourceAfterCreation, resourceType ) => {
    setEmbedResourceAfterCreation( toEmbedResourceAfterCreation );
    setNewResourceType( resourceType );
    setMainColumnMode( 'newresource' );
  };

  /**
   * Delete all mentions of a contextualization
   * (and do not delete the contextualization itself to avoid inconsistencies
   * and breaking undo/redo stack)
   */
  const handleDeleteContextualizationFromId = ( contextualizationId ) => {
    deleteContextualizationFromId( {
      editorStates,
      contextualization: production.contextualizations[contextualizationId],
      updateDraftEditorState,
      updateSection: handleUpdateSection,
      section
    } );
  };

  const handleCreateResource = ( payload, callback ) => {
    createResource( payload, callback );
    if ( embedResourceAfterCreation ) {
      // setTimeout(() => {
          embedLastResource();
        // });
    }
  };

  const handleSetSectionLevel = ( { sectionId: thatSectionId, level } ) => {
    setSectionLevel( {
      productionId,
      sectionId: thatSectionId,
      level,
    } );
  };

  const handleSetEditorFocus = ( editorId ) => {
    if ( selectedContextualizationId ) {
      setTimeout( () => setSelectedContextualizationId( undefined ) );
    }
    setEditorFocus( editorId );
  };

  const handleSetSelectedContextualizationId = ( contextualizationId ) => {
    setEditorFocus( undefined );
    setSelectedContextualizationId( contextualizationId );
  };

  const handleAbortDeleteSection = () => setPromptedToDeleteSectionId( undefined );
  const handleAbortDeleteResource = () => setPromptedToDeleteResourceId( undefined );
  const handleAbortLinkCreation = () => setLinkModalFocusData( undefined );
  const handleAbortGlossaryCreation = () => setGlossaryModalFocusData( undefined );
   const handleAbortInternalLinkCreation = () => setInternalLinkModalFocusData( undefined );
  const handleCloseShortcuts = () => setShortcutsHelpVisible( false );
  return (
    <StretchedLayoutContainer
      isAbsolute
      isFluid
      isDirection={ 'horizontal' }
    >
      <StretchedLayoutItem
        className={ `aside-edition-container ${asideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile` }
        isFlex={ 1 }
      >
        <AsideSectionColumn
          {
            ...{
                  asideTabCollapsed,
                  asideTabMode,
                  getResourceTitle,
                  editedResourceId,
                  handleSectionIndexChange,
                  history,
                  mainColumnMode,
                  resourceFilterValues,
                  resourceOptionsVisible,
                  resourceSearchString,
                  resourceSortValue,
                  setAsideTabCollapsed,
                  setAsideTabMode,
                  setMainColumnMode,
                  setResourceFilterValues,
                  setResourceOptionsVisible,
                  setResourceSearchString,
                  setResourceSortValue,
                  section,
                  production,
                  submitMultiResources,
                  visibleResources,
            }
          }
          sections={ sectionsList }
          setEditorFocus={ handleSetEditorFocus }
          setSectionLevel={ handleSetSectionLevel }
          onCloseActiveResource={ handleCloseActiveResource }
          onCloseSectionSettings={ handleCloseSectionSettings }
          onDeleteResource={ handleDeleteResource }
          onDeleteSection={ handleDeleteSection }
          onOpenSectionSettings={ handleOpenSectionSettings }
          onResourceEditAttempt={ handleResourceEditAttempt }
          onSetCoverImage={ handleSetCoverImage }
          onSortEnd={ handleSectionsSortEnd }
        />
      </StretchedLayoutItem>
      <StretchedLayoutItem isFlex={ asideTabCollapsed ? 11 : 3 }>
        {section ?
          <MainSectionColumn
            {
              ...{

                handleCloseEditedContextualization,
                // uploadResource,
                assetRequestState,
                createAsset,
                createContextualization,
                createContextualizer,
                deleteAsset,
                deleteContextualization,
                deleteContextualizer,
                draggedResourceId,
                editedContextualization,
                editedResourceId,
                editorFocus,
                editorPastingStatus,
                editorStates,
                handleStartNewResourceConfiguration,
                internalLinkModalFocusData,
                mainColumnMode,
                newResourceMode,
                newResourceType,
                previewMode,
                previousEditorFocus,
                promptAssetEmbed,
                section,
                selectedContextualizationId,
                setAssetRequestContentId,
                setEditedResourceId,
                setEditorPastingStatus,
                setErrorMessage,
                setInternalLinkModalFocusData,
                setMainColumnMode,
                setNewResourceMode,
                setPreviewMode,
                setShortcutsHelpVisible,
                setProductionIsSaved,
                setUploadStatus,
                startExistingResourceConfiguration: handleStartExistingResourceConfiguration,
                production,
                productionIsSaved,
                submitMultiResources,
                summonAsset,
                unpromptAssetEmbed,
                updateAsset,
                updateContextualizer,
                updateDraftEditorsStates,
                updateDraftEditorState,
                updateResource,
                uploadStatus,
                createProductionObjects,

                updateContextualization,
                editedContextualizationId,
              }
            }

            setSelectedContextualizationId={ handleSetSelectedContextualizationId }
            defaultSectionMetadata={ defaultSection.metadata }
            onNewSectionSubmit={ handleNewSectionSubmit }
            updateSection={ handleUpdateSection }
            setEditorFocus={ handleSetEditorFocus }
            deleteContextualizationFromId={ handleDeleteContextualizationFromId }
            createResource={ handleCreateResource }
            onOpenSectionSettings={ handleOpenSectionSettings }
          />
            : <LoadingScreen />
        }
      </StretchedLayoutItem>

      {
          promptedToDeleteSectionId &&
          <ConfirmToDeleteModal
            isActive={ promptedToDeleteSectionId !== undefined }
            deleteType={ 'section' }
            production={ production }
            id={ promptedToDeleteSectionId }
            onClose={ handleAbortDeleteSection }
            onDeleteConfirm={ handleDeleteSectionConfirm }
          />
        }
      {
          promptedToDeleteResourceId &&
          <ConfirmToDeleteModal
            isActive={ promptedToDeleteResourceId !== undefined }
            deleteType={ 'resource' }
            production={ production }
            id={ promptedToDeleteResourceId }
            onClose={ handleAbortDeleteResource }
            onDeleteConfirm={ handleDeleteResourceConfirm }
          />
        }
      <LinkModal
        isActive={ linkModalFocusData !== undefined }
        focusData={ linkModalFocusData }
        onClose={ handleAbortLinkCreation }
        hyperlinks={ hyperlinks }
        onCreateHyperlink={ handleCreateHyperlink }
        onContextualizeHyperlink={ handleContextualizeHyperlink }
      />
      <GlossaryModal
        isActive={ glossaryModalFocusData !== undefined }
        focusData={ glossaryModalFocusData }
        onClose={ handleAbortGlossaryCreation }
        glossaries={ glossaries }
        onCreateGlossary={ handleCreateGlossary }
        onContextualizeGlossary={ handleContextualizeGlossary }
      />
      <InternalLinkModal
        isActive={ internalLinkModalFocusData !== undefined }
        focusData={ internalLinkModalFocusData }
        onClose={ handleAbortInternalLinkCreation }
        inactiveSections={ inactiveSections }
        onCreateInternalLink={ handleCreateInternalLink }
      />
      <ShortcutsModal
        isActive={ shortcutsHelpVisible }
        translate={ translate }
        onClose={ handleCloseShortcuts }
      />
    </StretchedLayoutContainer>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
