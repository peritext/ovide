/**
 * This module provides utils for infering production modifications from the editor state
 * @module ovide/components/ContentsEditor
 */
/**
 * Imports Libraries
 */
import {
  utils,
} from 'scholar-draft';

/**
 * Shared variables
 */
const {
  getUsedAssets,
  updateNotesFromEditor,
} = utils;

/**
 * Deletes notes that are not any more linked
 * to an entity in the editor
 * and update notes numbers if their order has changed.
 * @param {object} props - properties to use
 */
export const updateNotesFromContentsEditor = ( props ) => {
  const {
    editorStates,
    sectionId,
    // activeProductionId,
    activeSection,
    updateSection,
  } = props;
  const {
    // newNotes,
    notesOrder
  } = updateNotesFromEditor( editorStates[sectionId], { ...activeSection.data.contents.notes } );
  const newSection = activeSection;
  // newSection.data.contents.notes = newNotes;
  newSection.data.contents.notesOrder = notesOrder;

  /*
   * if (newNotes !== activeSection.data.contents.notes) {
   * updateSection( activeProductionId, sectionId, newSection );
   */
    updateSection( newSection );
  // }
};

/**
 * Deletes contextualizations that are not any more linked
 * to an entity in the editor.
 * @param {object} props - properties to use
 */
export const updateContextualizationsFromEditor = ( props ) => {
    const {
      activeSection,
      editorStates,
      deleteContextualization,
      deleteContextualizer,
      // sectionId,
      production,
      userId
    } = props;
    const activeProductionId = production.id;
    const activeSectionId = activeSection.id;
    // regroup all eligible editorStates
    const usedEditorStates = activeSection.data.contents.notesOrder.reduce( ( result, noteId ) => {
      return [
      ...result,
      editorStates[noteId]
      ];
    }, [ editorStates[activeSectionId] ] );
    // regroup all eligible contextualizations
    const sectionContextualizations = Object.keys( production.contextualizations )
      .filter( ( id ) => {
        return production.contextualizations[id].targetId === activeSectionId;
      } )
      .reduce( ( final, id ) => ( {
        ...final,
        [id]: production.contextualizations[id],
      } ), {} );

    // look for used contextualizations in main
    const used = usedEditorStates.reduce( ( u, editorState ) => {
      const forThisOne = getUsedAssets( editorState, sectionContextualizations );
      return [ ...u, ...forThisOne ];
    }, [] );

    /*
     * compare list of contextualizations with list of used contextualizations
     * to track all unused contextualizations
     */
    const unusedAssets = Object.keys( sectionContextualizations ).filter( ( id ) => !used.includes( id ) );
    // delete contextualizations
    unusedAssets.reduce( ( cur, id ) => {
      return cur.then( () => new Promise( ( resolve, reject ) => {
        const { contextualizerId } = sectionContextualizations[id];
        return new Promise( ( res1, rej1 ) => {
          deleteContextualization( {
            productionId: activeProductionId,
            contextualizationId: id,
            userId
          }, ( err ) => {
            if ( err ) {
              rej1( err );
            }
            else res1();
          } );
        } )
        .then( () => {
          return new Promise( ( res1, rej1 ) => {
            deleteContextualizer( {
              productionId: activeProductionId,
              contextualizerId,
              userId
            }, ( err ) => {
              if ( err ) {
                rej1( err );
              }
              else res1();
            } );
          } );
        } )
        .then( resolve )
        .catch( reject );

      } ) );
    }, Promise.resolve() );
  };

