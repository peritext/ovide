/**
 * This module provides the layout for the main column of the editor
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import ContentsEditor from '../../../components/ContentsEditor';
import { createBibData, getResourceTitle } from '../../../helpers/resourcesUtils';
import SectionHeader from './SectionHeader';

import MainSectionAside from './MainSectionAside';

const MainSectionColumn = ( {
  mainColumnMode,
  newResourceMode,
  defaultSectionMetadata,

  uploadStatus,

  production,
  section,
  editedResourceId,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,
  previousEditorFocus,
  internalLinkModalFocusData,

  newResourceType,
  productionIsSaved,

  updateSection,

  setMainColumnMode,
  setShortcutsHelpVisible,
  onNewSectionSubmit,

  promptAssetEmbed,
  unpromptAssetEmbed,
  setEditorFocus,

  createContextualization,
  createContextualizer,
  createResource,
  uploadResource,
  createProductionObjects,

  setEditorPastingStatus,
  editorPastingStatus,

  updateDraftEditorState,
  updateDraftEditorsStates,
  setNewResourceMode,

  updateContextualizer,
  updateResource,
  deleteContextualization,
  deleteContextualizer,
  deleteContextualizationFromId,
  setEditedResourceId,

  setUploadStatus,

  setEditorBlocked,
  setProductionIsSaved,
  setErrorMessage,
  setAssetRequestContentId,
  startNewResourceConfiguration,
  startExistingResourceConfiguration,

  submitMultiResources,
  setInternalLinkModalFocusData,

  onOpenSectionSettings,

  summonAsset,

  selectedContextualizationId,
  setSelectedContextualizationId,

  previewMode,
  setPreviewMode,

  editedContextualizationId,
  handleCloseEditedContextualization,
  setEditedContextualizationId,
  setEditedContextualizationType,
  editedContextualizationType,

  createAsset,
  updateAsset,
  deleteAsset,

  createTag,
  updateTag,
  deleteTag,

  updateContextualization,

  onGoToResource,

  onResourceEditAttempt,

}, {
  t
} ) => {

  /**
   * Variables definition
   */
   const {
    resources,
  } = production;

  /**
   * Computed variables
   */
   const editorWidth = {
    mobile: mainColumnMode === 'edition' ? 10 : 12,
    tablet: mainColumnMode === 'edition' ? 10 : 12,
    widescreen: mainColumnMode === 'edition' ? 8 : 12
  };
  const editorX = {
    mobile: mainColumnMode === 'edition' ? 1 : 0,
    tablet: mainColumnMode === 'edition' ? 1 : 0,
    widescreen: mainColumnMode === 'edition' ? 2 : 0
  };

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );
  const guessTitle = ( title = '' ) => {
    const endNumberRegexp = /([0-9]+)$/;
    const numberMatch = title.match( endNumberRegexp );
    if ( numberMatch ) {
      const number = +numberMatch[1];
      if ( !isNaN( number ) ) {
        const newNumber = number + 1;
        const newTitle = title.replace( endNumberRegexp, `${newNumber }` );
        return newTitle;
      }
    }
    return '';
  };

  /**
   * Callbacks handlers
   */
  const handleUpdateSection = ( newSection, callback ) => {
    updateSection( newSection, callback );
  };
  const handleUpdateMetadata = ( metadata ) => {
    handleUpdateSection( {
      ...section,
      metadata: {
        ...section.metadata,
        ...metadata
      }
    } );
    setMainColumnMode( 'edition' );
  };
  const handleTitleBlur = ( title ) => {
    if ( title.length ) {
      let newSection;
      if ( section.metadata.type === 'bib' ) {
        newSection = {
          ...section,
          metadata: {
            ...section.metadata,
            title
          },
          data: {
            ...section.data,
            citations: [ {
              ...section.data.citations[0],
              title
            } ]
          }
        };
      }
 else {
        newSection = {
          ...section,
          metadata: {
            ...section.metadata,
            title
          }
        };
      }

      handleUpdateSection( newSection );
    }
  };
  const handleTitleFocus = () => {
    setEditorFocus( undefined );
  };
  const handleEditMetadataClick = () => {
    if ( section.metadata.type === 'section' && mainColumnMode !== 'editmetadata' ) {

      onOpenSectionSettings( section.id );
    }
    else if ( section.metadata.type !== 'section' && mainColumnMode !== 'editresource' ) {

      onResourceEditAttempt( section.id );
    }
    else {
      setMainColumnMode( 'edition' );
    }
  };
  const handleOpenShortcutsHelp = () => setShortcutsHelpVisible( true );

  const handleSetPreviewModeScreened = () => {
    setPreviewMode( 'screened' );
  };

  const handleSetPreviewModePaged = () => {
    setPreviewMode( 'paged' );
  };

  return (
    <Column
      isSize={ 'fullwidth' }
      isWrapper
    >
      <StretchedLayoutContainer
        isFluid
        isAbsolute
        isDirection={ 'horizontal' }
      >
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !editedResourceId && !editedContextualizationId ? 0 : 6 }>
          <MainSectionAside
            {
              ...{
                uploadResource,
                createBibData,
                production,
                uploadStatus,
                createResource,
                updateResource,
                editedResourceId,
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
                setEditedResourceId,
                guessTitle,
                submitMultiResources,
                editedContextualizationId,
                handleCloseEditedContextualization,
                setEditedContextualizationId,
                editedContextualizationType,

                previewMode,
                updateContextualizer,
                updateContextualization,
                onResourceEditAttempt,

                createAsset,
                updateAsset,
                deleteAsset,

                createTag,
                updateTag,
                deleteTag,

                onGoToResource,
              }
            }
          />
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !editedResourceId && !editedContextualizationId ? 12 : 6 }>
          <Column
            isWrapper
            isSize={ 12 }
            isOffset={ 0 }
          >
            <StretchedLayoutContainer
              isAbsolute
              isDirection={ 'vertical' }
            >
              <StretchedLayoutItem>
                <Column
                  isSize={ editorWidth }
                  isOffset={ editorX }
                  style={ { paddingBottom: 0 } }
                  isWrapper
                >
                  {/* editor header*/}
                  <StretchedLayoutContainer
                    style={ { overflow: 'visible' } }
                    isFluid
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem
                      style={ { overflow: 'visible' } }
                      isFlex={ 1 }
                    >
                      <SectionHeader
                        title={ getResourceTitle( section ) }
                        type={ section.metadata.type }
                        onEdit={ handleEditMetadataClick }
                        onBlur={ handleTitleBlur }
                        onFocus={ handleTitleFocus }
                        placeHolder={ translate( 'Section title' ) }

                        isDisabled={ ( mainColumnMode !== 'edition' && mainColumnMode !== 'editmetadata' ) }
                        isColor={ mainColumnMode === 'editmetadata' ? 'primary' : '' }
                        editTip={ section.metadata.type === 'section' ? translate( 'Edit section metadata' ) : translate( 'Edit resource' ) }
                        inputTip={ section.metadata.type === 'section' ? translate( 'Section title' ) : translate( 'Resource title' ) }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </StretchedLayoutItem>
              {/*editor*/}
              <StretchedLayoutItem isFlex={ 1 }>
                <Column isWrapper>
                  <ContentsEditor
                    editorWidth={ editorWidth }
                    editorOffset={ editorX }
                    style={ { height: '100%' } }
                    production={ production }
                    activeSection={ section }
                    sectionId={ section.id }
                    editorStates={ editorStates }
                    updateDraftEditorState={ updateDraftEditorState }
                    updateDraftEditorsStates={ updateDraftEditorsStates }
                    editorFocus={ editorFocus }
                    previousEditorFocus={ previousEditorFocus }
                    draggedResourceId={ draggedResourceId }
                    disablePaste={ ( mainColumnMode !== 'edit' ) && !editorFocus }

                    updateSection={ handleUpdateSection }

                    summonAsset={ summonAsset }

                    setEditorPastingStatus={ setEditorPastingStatus }
                    editorPastingStatus={ editorPastingStatus }

                    createContextualization={ createContextualization }
                    createContextualizer={ createContextualizer }
                    createResource={ createResource }

                    selectedContextualizationId={ selectedContextualizationId }
                    editedContextualizationId={ editedContextualizationId }
                    setSelectedContextualizationId={ setSelectedContextualizationId }

                    updateContextualizer={ updateContextualizer }
                    updateResource={ updateResource }

                    deleteContextualization={ deleteContextualization }
                    deleteContextualizationFromId={ deleteContextualizationFromId }
                    deleteContextualizer={ deleteContextualizer }

                    requestAsset={ promptAssetEmbed }
                    cancelAssetRequest={ unpromptAssetEmbed }

                    assetRequestState={ assetRequestState }
                    setAssetRequestContentId={ setAssetRequestContentId }
                    assetRequestPosition={ assetRequestState.selection }
                    assetRequestContentId={ assetRequestState.editorId }

                    startNewResourceConfiguration={ startNewResourceConfiguration }
                    startExistingResourceConfiguration={ startExistingResourceConfiguration }
                    setProductionIsSaved={ setProductionIsSaved }
                    setErrorMessage={ setErrorMessage }

                    setEditorBlocked={ setEditorBlocked }
                    setEditorFocus={ setEditorFocus }
                    renderingMode={ previewMode }

                    {
                      ...{
                        internalLinkModalFocusData,
                        setInternalLinkModalFocusData,
                        createProductionObjects,
                        setEditedContextualizationType,
                        createAsset,
                      }
                    }
                  />

                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem className={ 'editor-footer' }>
                <Column
                  style={ { paddingTop: 0 } }
                  isSize={ editorWidth }
                  isOffset={ editorX }
                >
                  <Column style={ { paddingTop: 0 } }>
                    <StretchedLayoutContainer
                      style={ {
                        alignItems: 'center',
                      } }
                      isDirection={ 'horizontal' }
                    >
                      <StretchedLayoutItem>
                        <a onClick={ handleOpenShortcutsHelp }>{t( 'shortcuts help' )}</a>
                      </StretchedLayoutItem>
                      <StretchedLayoutItem isFlex={ 1 }>
                        <StretchedLayoutContainer
                          style={ {
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '3rem'
                          } }
                          isDirection={ 'horizontal' }
                        >
                          <span style={ { marginRight: '1rem' } }>
                            {translate( 'preview mode' )}
                          </span>
                          <Button
                            isColor={ previewMode === 'screened' ? 'info' : undefined }
                            onClick={ handleSetPreviewModeScreened }
                          >
                            {translate( 'Screened' )}
                          </Button>
                          <Button
                            isColor={ previewMode === 'paged' ? 'info' : undefined }
                            onClick={ handleSetPreviewModePaged }
                          >
                            {translate( 'Paged' )}
                          </Button>
                        </StretchedLayoutContainer>
                      </StretchedLayoutItem>
                      <StretchedLayoutItem style={ { textAlign: 'right' } }>
                        <i>{productionIsSaved ? translate( 'All changes saved' ) : translate( 'Saving...' )}</i>
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>

        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

MainSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default MainSectionColumn;
