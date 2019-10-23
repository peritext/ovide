/**
 * This module provides a connected component for handling the section view
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { v4 as genId } from 'uuid';
import {
  withRouter,
} from 'react-router';
import {
  EditorState,
  convertToRaw,
  Modifier
} from 'draft-js';

/**
 * Imports Project utils
 */
import { constants } from 'peritext-schemas';

const {
  SECTION_POINTER,
} = constants.draftEntitiesNames;

import {
  summonAsset,
} from '../../../helpers/assetsUtils';

import { createResourceData, validateFiles } from '../../../helpers/resourcesUtils';
import { createDefaultResource } from '../../../helpers/schemaUtils';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as productionDuck from '../../ProductionManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as libarayViewDuck from '../../LibraryView/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import EditionUiWrapper from '../../EditionUiWrapper/components';
import UploadModal from '../../../components/UploadModal';
import PastingModal from '../../../components/PastingModal';
import DataUrlProvider from '../../../components/DataUrlProvider';
import SectionViewLayout from './SectionViewLayout';

/**
 * Imports Assets
 */
import config from '../../../config';
import peritextConfig from '../../../peritextConfig.render';

/**
 * Shared variables
 */
const { maxBatchNumber } = config;

@connect(
  ( state ) => ( {
    ...productionDuck.selector( state.editedProduction ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
    ...libarayViewDuck.selector( state.library ),
    ...duck.selector( state.section ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...productionDuck,
      ...sectionsManagementDuck,
      ...libarayViewDuck,
      ...errorMessageDuck,
      ...duck,
    }, dispatch )
  } )
)

class SectionViewContainer extends Component {

  static childContextTypes = {
    setDraggedResourceId: PropTypes.func,
    setLinkModalFocusData: PropTypes.func,
    setGlossaryModalFocusData: PropTypes.func,
    setInternalLinkModalFocusData: PropTypes.func,
    setEditedContextualizationId: PropTypes.func,
    editorFocus: PropTypes.string,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.confirmExit = this.confirmExit.bind( this );
  }

  getChildContext = () => ( {
    setDraggedResourceId: this.setDraggedResourceId,
    setLinkModalFocusData: this.setLinkModalFocusData,
    setGlossaryModalFocusData: this.setGlossaryModalFocusData,
    setInternalLinkModalFocusData: this.setInternalLinkModalFocusData,
    setEditedContextualizationId: this.setEditedContextualizationId,
    editorFocus: this.props.editorFocus,
  } )

  componentDidMount = () => {
    window.addEventListener( 'beforeunload', this.confirmExit );

    const productionId = this.props.match.params.productionId;
    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }

    this.props.actions.resetDraftEditorsStates();
    this.props.actions.setEditedSectionId( this.props.match.params.sectionId );
  }

  componentWillReceiveProps = ( nextProps ) => {

    /**
     * if section id or production id is changed leave previous section and try to lock on next section
     */
    const {
      match: {
        params: {
          sectionId: prevSectionId,
          productionId: prevProductionId
        }
      },
      editorStates,
    } = this.props;
    const {
      match: {
        params: {
          sectionId: nextSectionId,
          productionId: nextProductionId
        }
      },
      pendingContextualization,
      editedProduction,
    } = nextProps;

    // changing section
    if ( prevSectionId !== nextSectionId || prevProductionId !== nextProductionId ) {
      // updating active section id
      this.props.actions.setEditedSectionId( nextSectionId );
      // packing up : saving all last editor states
      const section = this.props.editedProduction.resources[prevSectionId];
      const newSection = {
        ...section,
        contents: editorStates[prevSectionId] ? convertToRaw( editorStates[prevSectionId].getCurrentContent() ) : section.data.contents.contents,
        notes: Object.keys( section.data.contents.notes || {} ).reduce( ( result, noteId ) => ( {
          ...result,
          [noteId]: {
            ...section.data.contents.notes[noteId],
            contents: editorStates[noteId] ? convertToRaw( editorStates[noteId].getCurrentContent() ) : section.data.contents.notes[noteId].contents,
          }
        } ), {} )
      };
      this.props.actions.updateResource( {
        resourceId: prevSectionId,
        productionId: prevProductionId,
        resource: newSection
      } );
      this.props.actions.resetDraftEditorsStates();
      this.props.actions.setEmbedResourceAfterCreation( false );
      this.props.actions.setNewResourceType( undefined );
      this.props.actions.setEditedSectionId( undefined );
    }

    if ( pendingContextualization ) {
      const {
        resourceId,
        contentId
      } = pendingContextualization;
      if ( editedProduction && editedProduction.resources && editedProduction.resources[resourceId] ) {
        nextProps.actions.setPendingContextualization( undefined );
        setTimeout( () => {
          this.onSummonAsset( contentId, resourceId );
          nextProps.actions.setLinkModalFocusData( undefined );
          nextProps.actions.setGlossaryModalFocusData( undefined );
        } );
      }
    }
  }

  componentWillUnmount = () => {
    this.props.actions.setEditorFocus( undefined );
    this.props.actions.setEditedSectionId( undefined );
    this.props.actions.resetDraftEditorsStates();
    this.props.actions.resetViewsUi();
  }

  confirmExit( e ) {
    const { productionIsSaved } = this.props;
    if ( !productionIsSaved ) {
      const confirmationMessage = '\o/';
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage;
    }
  }

  setDraggedResourceId = ( resourceId ) => {
    this.props.actions.setDraggedResourceId( resourceId );
  }

  setLinkModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // productionId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setLinkModalFocusData( { focusId, selection } );
  }

  setGlossaryModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // productionId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setGlossaryModalFocusData( { focusId, selection } );
  }

  setEditedContextualizationId = ( contextualizationId ) => {
    this.props.actions.setSelectedContextualizationId( undefined );
    if ( this.props.editedProduction.contextualizations[contextualizationId] ) {
      this.props.actions.setEditedContextualizationId( contextualizationId );
    }
  }

  goToSection = ( sectionId ) => {
    const {
      editedProduction: {
        id
      }
    } = this.props;
    this.props.history.push( `/productions/${id}/sections/${sectionId}` );
  }

  submitMultiResources = ( files ) => {
    this.props.actions.setUploadStatus( {
      status: 'initializing',
      errors: []
    } );
    setTimeout( () => {
      const { setErrorMessage } = this.props.actions;
      if ( files.length > maxBatchNumber ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Too many files uploaded' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      const validFiles = validateFiles( files );
      if ( validFiles.length === 0 ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'No valid files to upload' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      if ( validFiles.length < files.length ) {
        const invalidFiles = files.filter( ( f ) => validFiles.find( ( oF ) => oF.name === f.name ) === undefined );
        this.props.actions.setUploadStatus( {
          ...this.props.uploadStatus,
          errors: invalidFiles.map( ( file ) => ( {
            fileName: file.name,
            reason: 'too big'
          } ) )
        } );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Some files larger than maximum size' } );
      }
      const errors = [];
      validFiles.reduce( ( curr, next ) => {
        return curr.then( () => {
          this.props.actions.setUploadStatus( {
            status: 'uploading',
            currentFileName: next.name,
            errors: this.props.uploadStatus.errors
          } );
          console.log( 'create resource data for', next );
          return createResourceData( next, this.props )
          .then( ( res ) => {
            if ( res && !res.success ) errors.push( res );
          } );
        } );
      }, Promise.resolve() )
      .then( () => {
        if ( errors.length > 0 ) {
          setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: errors } );
        }
        // this.props.actions.setMainColumnMode('edition');
        this.props.actions.setUploadStatus( undefined );
      } )
      .catch( ( error ) => {
        this.props.actions.setUploadStatus( undefined );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error } );
      } );
    }, 100 );

  }

  onSummonAsset = ( contentId, resourceId ) => summonAsset( contentId, resourceId, this.props, peritextConfig );

  onCreateHyperlink = ( { title, url }, contentId, selection ) => {
    const {
      match: {
        params: {
          productionId,
          sectionId,
        }
      },
      actions: {
        createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const id = genId();
    const resource = {
      ...createDefaultResource(),
      id,
      metadata: {
        type: 'webpage',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        title,
      },
      data: {
        url,
      }
    };
    return new Promise( ( resolve, reject ) => {
      createResource( {
        resourceId: id,
        productionId,
        resource
      }, ( err ) => {
        if ( !err ) {
          resolve();
        }
        else reject();
      } );
    } )
    .then( () => {
      this.onContextualizeGlossary( id, contentId, selection );
    } );
  }

  onContextualizeHyperlink = ( resourceId, contentId, selection ) => {
    const {
      match: {
        params: {
          sectionId,
        }
      },
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    // setTimeout( () => {
      this.onSummonAsset( contentId, resourceId );
      this.props.actions.setLinkModalFocusData( undefined );
      this.props.actions.setGlossaryModalFocusData( undefined );
    // } );
  }

  onCreateGlossary = ( { name, entryType, description }, contentId, selection ) => {
    const {
      match: {
        params: {
          productionId,
          sectionId,
        }
      },
      actions: {
        createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const id = genId();
    const resource = {
      ...createDefaultResource(),
      id,
      metadata: {
        type: 'glossary',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        title: name,
      },
      data: {
        name,
        entryType,
        description,
      }
    };
    return new Promise( ( resolve, reject ) => {
      createResource( {
        resourceId: id,
        productionId,
        resource
      }, ( err ) => {
        if ( !err ) {
          resolve();
        }
        else reject();
      } );
    } )
    .then( () => {

      /*
       * this.props.actions.setPendingContextualization({
       *   resourceId: id,
       *   contentId
       * });
       */
      this.onContextualizeGlossary( id, contentId, selection );
    } )

    /**
     * @todo do something here
     */
    .catch( console.error );/* eslint no-console: 0 */

  }

  onContextualizeGlossary = ( resourceId, contentId, selection ) => {
    const {
      match: {
        params: {
          sectionId,
        }
      },
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    // setTimeout( () => {
      this.onSummonAsset( contentId, resourceId );
      this.props.actions.setLinkModalFocusData( undefined );
      this.props.actions.setGlossaryModalFocusData( undefined );
    // } );
  }

  updateSectionRawContent = ( editorStateId ) => {
    const {
      match: {
        params: {
          productionId,
          sectionId,
        }
      },
    } = this.props;
    const section = this.props.editedProduction.resources[sectionId];
    const finalEditorStateId = editorStateId === sectionId ? 'main' : editorStateId;
    const finalEditorState = this.props.editorStates[editorStateId];

     /*
      * as the function is debounced it would be possible
      * not to have access to the final editor state
      */
    if ( !finalEditorState ) {
      return;
    }
    const rawContents = convertToRaw( finalEditorState.getCurrentContent() );

     /**
      * Note the following lines are not done in the right way (the ...rest way)
      * because rawContents was not updated properly.
      * @todo investigate that
      */
    const newSection = {
      ...section,
      // contents: rawContent
    };
    // this.props.update(this.state.editorState);
    if ( finalEditorStateId === 'main' ) {

       /*
        * newSection = {
        *   ...section,
        *   contents: rawContent
        * };
        */
      newSection.data.contents.contents = rawContents;
    }
    else if ( newSection.data.contents.notes[editorStateId] && newSection.data.contents.notes[editorStateId].contents ) {
      newSection.data.contents.notes[editorStateId].contents = rawContents;

       /*
        * newSection = {
        *   ...section,
        *   notes: {
        *     ...section.data.contents.notes,
        *     [editorStateId]: {
        *       ...section.data.contents.notes[editorStateId],
        *       contents: rawContent
        *     }
        *   }
        * };
        */
    }
    else {
      console.warn( 'could not update editor %s', editorStateId );/* eslint no-console: 0 */
    }

     this.props.actions.updateResource( {
      productionId,
      resourceId: sectionId,
      resource: newSection,
    } );
  }

  onCreateInternalLink = ( { contentId, selection, selectedSectionId } ) => {
    const {
      match: {
        params: {
          // productionId,
          sectionId,
        }
      },
      // userId,
      actions: {
        // createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    let editorState = this.props.editorStates[editorStateId];
    let selectionState = editorState.getSelection();
    if ( selection ) {
      editorState = EditorState.acceptSelection( editorState, selection );
      selectionState = selection;
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      SECTION_POINTER,
      'MUTABLE',
      { sectionId: selectedSectionId }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentStateWithEntity,
      selectionState,
      entityKey
    );
    const newEditorState = EditorState.push( editorState, contentStateWithLink );
    this.props.actions.updateDraftEditorState( editorStateId, newEditorState );
    this.props.actions.setInternalLinkModalFocusData( undefined );
    setTimeout( () => {
      this.updateSectionRawContent( editorStateId, this.props.editorStates[editorStateId] );
    } );
  }

   setInternalLinkModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // productionId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setInternalLinkModalFocusData( { focusId, selection } );
  }

  embedLastResource = () => {
    const resources = this.props.editedProduction.resources;
    const resourcesMap = Object.keys( resources ).map( ( id ) => resources[id] );
    const lastResource = resourcesMap.sort( ( a, b ) => {
      if ( a.lastUpdateAt > b.lastUpdateAt ) {
        return -1;
      }
      else {
        return 1;
      }
    } )[0];
    if ( lastResource ) {
      this.onSummonAsset( this.props.assetRequestState.editorId, lastResource.id );
    }
  }

  onResourceEditAttempt = ( resourceId ) => {
    this.props.actions.setEditedResourceId( resourceId );
  };

  deleteResource = ( payload, callback ) => {
    const { actions: { deleteResource: deleteResourceAction, deleteAsset } } = this.props;
    const relatedAssetsIds = getRelatedAssetsIds( payload.resource );
    if ( relatedAssetsIds.length ) {
      relatedAssetsIds.reduce( ( cur, assetId ) => {
        return cur.then( () => new Promise( ( resolve, reject ) => {
          const thatPayload = {
            assetId,
            productionId: payload.productionId,
            asset: this.props.editedProduction.assets[assetId]
          };
          deleteAsset( thatPayload, ( err ) => {
            if ( err ) {
              return reject( err );
            }
            else {
              return resolve();
            }
          } );
        } ) );

      }, Promise.resolve() )
      .then( () => {
        deleteResourceAction( payload, callback );
      } )
      .catch( callback );
    }

    else deleteResourceAction( payload, callback );
  }
  onGoToResource = ( resourceId ) => {
    const {
      props: {
        history,
        match: {
          params: {
            productionId
          }
        }
      }
    } = this;
    history.push( `/productions/${productionId}/resources/${resourceId}` );
  }

  render() {
    const {
      props: {
        editedProduction,
        uploadStatus,
        match: {
          params: {
            sectionId,
            productionId,
          }
        },
        editorPastingStatus,
      },
      goToSection,
      onSummonAsset,
      onContextualizeHyperlink,
      onCreateHyperlink,

      onContextualizeGlossary,
      onCreateGlossary,

      onCreateInternalLink,
      submitMultiResources,
      embedLastResource,
      onResourceEditAttempt,
      deleteResource,
      onGoToResource,
    } = this;

    if ( editedProduction ) {
      const section = editedProduction.resources[sectionId];
      if ( section ) {
        return (
          <DataUrlProvider
            productionId={ productionId }
            serverUrl={ config.apiUrl }
          >
            <EditionUiWrapper withLargeHeader>
              <SectionViewLayout
                section={ section }
                goToSection={ goToSection }
                production={ this.props.editedProduction }
                embedLastResource={ embedLastResource }
                summonAsset={ onSummonAsset }
                submitMultiResources={ submitMultiResources }
                onCreateHyperlink={ onCreateHyperlink }
                onContextualizeHyperlink={ onContextualizeHyperlink }
                onGoToResource={ onGoToResource }

                onCreateGlossary={ onCreateGlossary }
                onContextualizeGlossary={ onContextualizeGlossary }

                onResourceEditAttempt={ onResourceEditAttempt }
                onCreateInternalLink={ onCreateInternalLink }
                deleteResource={ deleteResource }
                { ...this.props }
              />
              <PastingModal editorPastingStatus={ editorPastingStatus } />
              <UploadModal uploadStatus={ uploadStatus } />
            </EditionUiWrapper>
          </DataUrlProvider>
        );
      }
      else return <div>Section does not exist</div>;
    }
    return null;
  }
}

export default withRouter( SectionViewContainer );
