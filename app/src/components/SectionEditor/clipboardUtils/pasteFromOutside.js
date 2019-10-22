/**
 * This module provides the logic for handling pasting contents in editor
 * when pasting contents comes from outside ovide (webpage, text editor, ... machine clipboard)
 * @module ovide/components/SectionEditor
 */
import {
  EditorState,
  convertToRaw,
  Modifier,
} from 'draft-js';

import { convertFromHTML } from 'draft-convert';

import parsePastedLink from './parsePastedLink';
// import parsePastedImage from './parsePastedImage';

const HTML_LENGTH_LOADING_SCREEN_THRESHOLD = 1000;
const MEDIUM_TIMEOUT = 500;

/**
 * Parses and structure pasted data into a copied content states + diverse objects
 * that will be created by the parsing operation
 */
export const computePastedData = ( {
  resources,
  activeSection,
  html
} ) => {
  const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );
  const resourcesToAdd = [];
  const contextualizationsToAdd = [];
  const contextualizersToAdd = [];
  const activeSectionId = activeSection.id;
  const imagesToAdd = [];

  const copiedContentState = convertFromHTML( {

    /**
     * html nodes to entities hook.
     * Besides providing the right entities we must
     * also store objects that should be created in the production (resources, contextualizations, contextualizers)
     */
    htmlToEntity: ( nodeName, node, createEntity ) => {
      if ( nodeName === 'a' ) {
        const {
          contextualization,
          contextualizer,
          resource,
          entity
        } = parsePastedLink(
              node,
              [ ...resourcesList, ...resourcesToAdd ],
              activeSectionId
        );

        if ( contextualization ) {
          contextualizationsToAdd.push( contextualization );
        }
        if ( contextualizer ) {
          contextualizersToAdd.push( contextualizer );
        }
        if ( resource ) {
          resourcesToAdd.push( resource );
        }
        if ( entity ) {
          return createEntity( entity.type, entity.mutability, entity.data );
        }
      }

    /*
     *   else if ( nodeName === 'img' ) {
     *     const {
     *       contextualization,
     *       contextualizer,
     *       resource,
     *       entity
     *     } = parsePastedImage(
     *           node,
     *           [ ...resourcesList, ...resourcesToAdd ],
     *           activeSectionId
     *     );
     */

    /*
     *     if ( contextualization ) {
     *       contextualizationsToAdd.push( contextualization );
     *     }
     *     if ( contextualizer ) {
     *       contextualizersToAdd.push( contextualizer );
     *     }
     *     if ( resource ) {
     *       imagesToAdd.push( resource );
     *     }
     *     if ( entity ) {
     *       return createEntity( entity.type, entity.mutability, entity.data );
     *     }
     *   }
     */
    },

    /*
     * htmlToBlock: ( nodeName ) => {
     *   if ( nodeName === 'img' ) {
     *     return {
     *       type: 'atomic',
     *       data: {}
     *     };
     *   }
     * }
     */
  } )( html );

  return {
    copiedContentState,
    resourcesToAdd,
    contextualizationsToAdd,
    contextualizersToAdd,
    imagesToAdd
  };
};

/**
 * Apply related operations for pasting external content
 */
export const handlePasting = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  createProductionObjects,
  updateDraftEditorState,

  setEditorPastingStatus,

  userId,
  activeEditorStateId,
  activeSection,
  productionId,
  resources,
  editorFocus,

  setEditorFocus,
} ) => {

  /*
   * unset editor focus to avoid
   * noisy draft-js editor updates
   */
  setEditorFocus( undefined );

  const editorId = editorFocus === 'main' ? activeSection.id : editorFocus;

  const {
    copiedContentState,
    resourcesToAdd,
    contextualizationsToAdd: tContextualizationsToAdd,
    contextualizersToAdd: tContextualizersToAdd,
    // imagesToAdd
  } = computePastedData( {
    resources,
    activeSection,
    html
  } );

  const contextualizationsToAdd = tContextualizationsToAdd;
  const contextualizersToAdd = tContextualizersToAdd;

  /**
   * Append copied content state to existing editor state
   */
  const newContentState = Modifier.replaceWithFragment(
    activeEditorState.getCurrentContent(),
    activeEditorState.getSelection(),
    copiedContentState.getBlockMap()
  );

    /**
     * Chaining all objects creations requiring server confirmation at each step
     * (we will actually update editor state only after this
     * to avoid discrepancies due to interruptions/errors).
     */
    Promise.resolve()

      /**
       * creating resources
       */
      .then( () => {
        if ( resourcesToAdd.length ) {
          setEditorPastingStatus( {
            status: 'creating-resources',
            statusParameters: {
              length: resourcesToAdd.length
            }
          } );
        }
        return resourcesToAdd.reduce( ( cur, next, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve, reject ) => {
               setEditorPastingStatus( {
                status: 'creating-resources',
                statusParameters: {
                  length: resourcesToAdd.length,
                  iteration: index + 1
                }
              } );
              createResource( {
                productionId,
                userId,
                resourceId: next.id,
                resource: next
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
        }, Promise.resolve() );

      } )

      /**
       * Creating contextualizers & contextualizations
       */
      .then( () => {
        if ( contextualizersToAdd.length ) {
          setEditorPastingStatus( {
            status: 'attaching-contextualizers',
            statusParameters: {
              length: contextualizersToAdd.length
            }
          } );
        }

        return new Promise( ( resolve, reject ) => {
          createProductionObjects( {
            productionId,
            contextualizers: contextualizersToAdd.reduce( ( res, cont ) => ( {
              ...res,
              [cont.id]: cont,
            } ), {} ),
            contextualizations: contextualizationsToAdd.reduce( ( res, cont ) => ( {
              ...res,
              [cont.id]: cont,
            } ), {} ),
          }, ( err ) => {
            if ( err ) {
              reject( err );
            }
            else {
              return resolve();
            }
          } );
        } );

      } )

      /**
       * Updating related section draft contents
       */
      .then( () => {
        setEditorPastingStatus( {
          status: 'updating-contents'
        } );

        const newEditorState = EditorState.push(
          activeEditorState,
          newContentState,
          'paste-content'
        );

        let newSection;
        const contents = convertToRaw( newEditorState.getCurrentContent() );
        if ( editorFocus === 'main' ) {
          newSection = {
            ...activeSection,
            contents,
          };
        }
        else {
          newSection = {
            ...activeSection,
            notes: {
              ...activeSection.notes,
              [activeEditorStateId]: {
                ...activeSection.notes[activeEditorStateId],
                contents,
              }
            }
          };
        }

        /**
         * Simultaneously update section raw content,
         * draft-js content states,
         * and set editor view to edition setting
         */
        setTimeout( () => {
          updateSection( newSection );
          updateDraftEditorState( editorId, newEditorState );
          setEditorFocus( editorFocus );
          setEditorPastingStatus( undefined );
        } );

      } );
  };

/**
 * Handle pasting from outside ovide
 * (this is a wrapper handling wether to display a loading modal or not)
 */
const pasteFromOutside = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  uploadResource,
  createProductionObjects,
  updateDraftEditorState,

  setEditorPastingStatus,

  userId,
  activeEditorStateId,
  activeSection,
  productionId,
  resources,
  editorFocus,

  setEditorFocus,
} ) => {

  /**
   * We show a loading modal only if html content is big enough
   */
  if ( html.length > HTML_LENGTH_LOADING_SCREEN_THRESHOLD ) {
    setEditorPastingStatus( {
      status: 'converting-contents'
    } );
    setTimeout( () =>
      handlePasting( {
        html,
        activeEditorState,
        updateSection,
        createResource,
        uploadResource,
        createProductionObjects,
        updateDraftEditorState,

        setEditorPastingStatus,

        userId,
        activeEditorStateId,
        activeSection,
        productionId,
        resources,
        editorFocus,

        setEditorFocus,
      } )
      , MEDIUM_TIMEOUT );
  }
  else handlePasting( {
    html,
    activeEditorState,
    updateSection,
    createResource,
    uploadResource,
    createProductionObjects,
    updateDraftEditorState,

    setEditorPastingStatus,

    userId,
    activeEditorStateId,
    activeSection,
    productionId,
    resources,
    editorFocus,

    setEditorFocus,
  } );

  return true;
};

export default pasteFromOutside;
