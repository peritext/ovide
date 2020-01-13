/**
 * This module provides misc utils for the editor
 * @module ovide/components/ContentsEditor
 */
import {
  EditorState,
  Modifier,
  convertToRaw,
} from 'draft-js';

import {
  constants
} from 'scholar-draft';

const {
  INLINE_ASSET,
} = constants;

/**
 * Add plain text in one of the editor states (main or note)
 * @param {string} text - text to add
 * @param {string} contentId - 'main' or noteId
 */
export const addTextAtCurrentSelection = ( text, contentId, props ) => {
    const {
      activeSection,
      activeProductionId,
      sectionId,
      editorStates,
      updateDraftEditorState,
      updateResource,
    } = props;
    const editorState = contentId === 'main' ? editorStates[sectionId] : editorStates[contentId];
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    const newContentState = Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
    );
    let newSection;
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-text'
    );
    updateDraftEditorState( editorStateId, newEditorState );
    if ( contentId === 'main' ) {
      newSection = {
        ...activeSection,
        data: {
          ...activeSection.data,
          contents: {
            ...activeSection.data.contents,
            contents: convertToRaw( newEditorState.getCurrentContent() )
          }
        }
      };
    }
    else {
      newSection = {
        ...activeSection,
        data: {
          ...activeSection.data,
          contents: {
            ...activeSection.data.contents,
            notes: {
              ...activeSection.data.contents.notes,
              [contentId]: {
                ...activeSection.data.contents.notes[contentId],
                contents: convertToRaw( newEditorState.getCurrentContent() )
              }
            }
          }
        }
      };
    }
    updateResource( { productionId: activeProductionId, resourceId: sectionId, resource: newSection } );
  };

/**
 * Format production data as assets
 * @return {object} assets
 */
export const computeAssets = ( props ) => {
  const {
      production: {
        contextualizers,
        contextualizations,
        resources
    }
  } = props;
  const assets = Object.keys( contextualizations )
  .reduce( ( ass, id ) => {
    const contextualization = contextualizations[id];
    const contextualizer = contextualizers[contextualization.contextualizerId];
    const resource = resources[contextualization.sourceId];
    if ( contextualizer && resource ) {
      return {
        ...ass,
        [id]: {
          ...contextualization,
          resource,
          additionalResources: contextualization.additionalResources ?
            contextualization.additionalResources.map( ( thatId ) => resources[thatId] )
           : [],
          contextualizer,
          type: contextualizer ? contextualizer.type : INLINE_ASSET
        }
      };
    }
    return { ...ass };
  }, {} );

  return assets;
};

/**
 * Computes assets choices menu data and callback
 */
export const computeAssetChoiceProps = ( props ) => {
  const {
    production: {
      resources
    },
    setEditorFocus,
    cancelAssetRequest,
    startNewResourceConfiguration
  } = props;
  return {
    options: Object.keys( resources ).map( ( key ) => resources[key] ),
    addNewResource: () => startNewResourceConfiguration( true ),
    addPlainText: ( text, contentId ) => {
      addTextAtCurrentSelection( text, contentId, props );
      cancelAssetRequest();
      setEditorFocus( undefined );
      setTimeout( () => {
        setEditorFocus( contentId );
      } );
    }
  };
};

