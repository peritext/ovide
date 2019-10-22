/**
 * This module provides the logic for handling pasting text in editor
 * @module ovide/components/SectionEditor
 */
import pasteFromOutside from './pasteFromOutside';
import pasteFromInside from './pasteFromInside';

const handlePaste = function( html ) {

    const {
      props,
      // state,
      editor,
      // onEditorChange
      updateSectionRawContent,
    } = this;
    // ensuring this is happening while editing the content
    if ( !props.editorFocus ) {
      return;
    }

    const {
      production,
      editorFocus,
      activeSection,
      editorStates,
      createContextualization,
      createContextualizer,
      createResource,
      createAsset,
      updateDraftEditorsStates,
      updateDraftEditorState,
      updateSection,
      userId,
      setEditorPastingStatus,
      setEditorFocus,
      createProductionObjects,
    } = props;

    const {
      id: productionId,
      resources
    } = production;

    if ( !Object.keys( editorStates ).length ) return;

    const {
      notes,
      id: activeSectionId
    } = activeSection;

    /*
     * const {
     *   // clipboard, // blockMap of the data copied to clipboard
     *   // copiedData, // model-dependent set of data objects saved to clipboard
     * } = state;
     */

    let copiedData;

    const activeEditorStateId = editorFocus === 'main' ? activeSectionId : editorFocus;
    const activeEditorState = editorStates[activeEditorStateId];

    // check whether the clipboard contains ovide data
    const dataRegex = /<script id="ovide-copied-data" type="application\/json">(.*)<\/script>$/gm;
    const hasScript = dataRegex.test( html );

    /**
     * ======================================
     * case 1 : comes from outside (no ovide data)
     * ======================================
     */
    if ( !hasScript ) {
      return pasteFromOutside( {
        html,
        activeEditorState,
        updateSection,
        createResource,
        createContextualization,
        createContextualizer,
        updateDraftEditorState,

        setEditorPastingStatus,
        createProductionObjects,
        createAsset,

        userId,
        activeEditorStateId,
        activeSection,
        productionId,
        resources,
        editorFocus,

        setEditorFocus,
      } );
    }

    /**
     * =============================================
     * case 2 : pasting comes from inside the editor
     * =============================================
     */
    else {
      return pasteFromInside( {
        updateSection,
        createContextualization,
        createContextualizer,
        createResource,
        updateDraftEditorsStates,
        activeSection,
        productionId,
        editorFocus,
        setEditorPastingStatus,
        createProductionObjects,
        setEditorFocus,
        updateSectionRawContent,
        createAsset,

        production,
        editor,
        notes,
        editorStates,
        copiedData,
        html,
        dataRegex,
      } );
    }
  };

export default handlePaste;
