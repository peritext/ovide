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

const pasteFromOutside = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  createContextualization,
  createContextualizer,
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

  const editorId = editorFocus === 'main' ? activeSection.id : editorFocus;

  const handle = () => {

    const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );
    const resourcesToAdd = [];
    const contextualizationsToAdd = [];
    const contextualizersToAdd = [];
    const activeSectionId = activeSection.id;

    /*
     * unset editor focus to avoid
     * noisy draft-js editor updates
     */
    setEditorFocus( undefined );

    const copiedContentState = convertFromHTML( {
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
      },
      htmlToBlock: ( nodeName ) => {
        if ( nodeName === 'image' ) {
          return null;
        }
      }
    } )( html );

    /**
     * Append copied content state to existing editor state
     */
    const newContentState = Modifier.replaceWithFragment(
      activeEditorState.getCurrentContent(),
      activeEditorState.getSelection(),
      copiedContentState.getBlockMap()
    );
    const newEditorState = EditorState.push(
      activeEditorState,
      newContentState,
      'paste-content'
    );

    /**
     * Chaining all objects creations requiring server confirmation
     * (we will actually update editor state only after this
     * to avoid discrepancies due to interruptions/errors)
     */
    Promise.resolve()
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
      .then( () => {
        if ( contextualizersToAdd.length ) {
          setEditorPastingStatus( {
            status: 'attaching-contextualizers',
            statusParameters: {
              length: contextualizersToAdd.length
            }
          } );
        }

        return contextualizersToAdd.reduce( ( cur, next, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve, reject ) => {
               setEditorPastingStatus( {
                status: 'attaching-contextualizers',
                statusParameters: {
                  length: contextualizersToAdd.length,
                  iteration: index + 1
                }
              } );
              const contextualizationToCreate = contextualizationsToAdd[index];

              return new Promise( ( res1, rej1 ) => {
                createContextualizer( {
                  productionId,
                  userId,
                  contextualizerId: next.id,
                  contextualizer: next
                }, ( err ) => {
                  if ( err ) {
                    rej1( err );
                  }
 else res1();
                } );
              } )
              .then( () => new Promise( ( res1, rej1 ) => {
                createContextualization( {
                    productionId,
                    userId,
                    contextualizationId: contextualizationToCreate.id,
                    contextualization: contextualizationToCreate
                  }, ( err2 ) => {
                    if ( err2 ) {
                      rej1( err2 );
                    }
                    else {
                      res1();
                    }
                  } );
              } ) )
              .then( resolve )
              .catch( reject );

            } );
          } );
        }, Promise.resolve() );

      } )
      .then( () => {
        setEditorPastingStatus( {
          status: 'updating-contents'
        } );

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
   * We show a loading modal only if html content is big enough
   */
  if ( html.length > 1000 ) {
    setEditorPastingStatus( {
      status: 'converting-contents'
    } );
    setTimeout( handle, 500 );
  }
 else handle();

  return true;
};

export default pasteFromOutside;
