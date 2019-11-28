/**
 * This module provides the logic for handling copying text in editor
 * @module ovide/components/ContentsEditor
 */
import { uniqBy } from 'lodash';

import {
  EditorState,
  convertToRaw,
  Modifier,
} from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';

import {
  getSelectedBlocksList
} from 'draftjs-utils';

import {
  constants
} from 'scholar-draft';

import {
  getCitationModels,
} from '../citationUtils';

import { requestAssetData } from '../../../helpers/dataClient';

import { uniq } from 'lodash';

import CSL from 'citeproc';

import makeReactCitations from './makeReactCitations';

const {
  NOTE_POINTER,
  // SCHOLAR_DRAFT_CLIPBOARD_CODE,
  INLINE_ASSET,
  BLOCK_ASSET,
} = constants;

/**
 * Loads a map of copied assets
 * @param {array} copiedAssets
 * @param {function} getResourceDataUrl
 * @return {Promise} promise
 *
 */
export const packCopiedAssets = ( {
  copiedAssets,
  production,
} ) => {
  return new Promise( ( resolveGlobal, rejectGlobal ) => {
    Object.keys( copiedAssets ).reduce( ( cur, assetId ) =>
        cur.then( ( temp = {} ) => new Promise( ( resolve, reject ) => {
          const asset = { ...copiedAssets[assetId] };
          requestAssetData( production, asset )
          .then( ( data ) => {
            asset.data = data;
            resolve( {
              ...temp,
              [assetId]: asset,
            } );
          } )
          .catch( reject );
        } ) ),
      Promise.resolve() )
      .then( ( newCopiedAssets ) => {
        resolveGlobal( newCopiedAssets );
      } )
      .catch( rejectGlobal );
  } );
};

/**
 * Loads an array of copied resources with their data
 * @param {object} props
 * @param {string} props.editorFocus
 * @param {object} props.editorStates
 * @param {object} props.activeSection
 * @param {object} props.production
 * @return {object} copiedData
 *
 */

export const computeCopiedData = ( {
  editorFocus,
  editorStates,
  activeSection,
  production,
} ) => {
  const {
    contextualizations,
    contextualizers
  } = production;

    // we store entities data as a js object in order to reinject them in editor states later one
    let copiedEntities = {};
    const copiedNotes = [];
    const copiedContextualizers = [];
    const copiedContextualizations = [];

    // bootstrapping the list of copied entities accross editors
    copiedEntities[editorFocus] = [];

    let editorState;

    /*
     * get proper editor state (wether copy event comes from a note or the main content)
     */

    // case 1 : data is copied from the main editor
    if ( editorFocus === 'main' ) {
      editorState = editorStates[activeSection.id];
    }
    // case 2: data is copied from a note
    else {
      editorState = editorStates[editorFocus];
    }

    const currentContent = editorState.getCurrentContent();

    /*
     * this function comes from draft-js-utils - it returns
     * a fragment of content state that correspond to currently selected text
     */
    const selectedBlocksList = getSelectedBlocksList( editorState );

    let selection = editorState.getSelection().toJS();
    // normalizing selection regarding direction
    selection = {
      ...selection,
      startOffset: selection.isBackward ? selection.focusOffset : selection.anchorOffset,
      startKey: selection.isBackward ? selection.focusKey : selection.anchorKey,
      endOffset: selection.isBackward ? selection.anchorOffset : selection.focusOffset,
      endKey: selection.isBackward ? selection.anchorKey : selection.focusKey,
    };

    /*
     * we are going to parse draft-js ContentBlock objects
     * and store separately non-textual objects that need to be remembered
     * (entities, notes, inline assets, block assets)
     */
    selectedBlocksList.forEach( ( contentBlock, blockIndex ) => {
      const block = contentBlock.toJS();
      let charsToParse;
      if ( blockIndex === 0 && selectedBlocksList.size === 1 ) {
        charsToParse = block.characterList.slice( selection.startOffset, selection.endOffset );
      }
      else if ( blockIndex === 0 ) {
        charsToParse = block.characterList.slice( selection.startOffset );
      }
      else if ( blockIndex === selectedBlocksList.size - 1 ) {
        charsToParse = block.characterList.slice( 0, selection.endOffset );
      }
      else {
        charsToParse = block.characterList;
      }
      const entitiesIds = uniq( charsToParse.filter( ( char ) => char.entity ).map( ( char ) => char.entity ) );
      let entity;
      let eData;
      entitiesIds.forEach( ( entityKey ) => {
        entity = currentContent.getEntity( entityKey );
        eData = entity.toJS();

        /*
         * draft-js entities are stored separately
         * because we will have to re-manipulate them (ie. attribute a new target id)
         * when pasting later on
         */
        copiedEntities[editorFocus].push( {
          key: entityKey,
          entity: eData
        } );
        const type = eData.type;
        // copying note pointer and related note
        if ( type === NOTE_POINTER ) {
          const noteId = eData.data.noteId;
          const noteEditorState = editorStates[noteId];
          if ( noteEditorState && eData.data.noteId ) {
            const noteContent = noteEditorState.getCurrentContent();
            // note content is storied as a raw representation
            const rawContent = convertToRaw( noteContent );
            copiedEntities[noteId] = [];
            copiedNotes.push( {
              id: noteId,
              contents: rawContent
            } );
            // copying note's entities
            const noteCopiedEntities = {};
            noteContent.getBlockMap().forEach( ( thatBlock ) => {
              thatBlock.getCharacterList().map( ( char ) => {
                // copying note's entity and related contextualizations
                if ( char.entity ) {
                  entityKey = char.entity;
                  if ( !noteCopiedEntities[entityKey] ) {
                    entity = currentContent.getEntity( entityKey );
                    eData = entity.toJS();
                    noteCopiedEntities[entityKey] = eData;
                  }
                }
              } );
              Object.keys( noteCopiedEntities ).forEach( ( thatEntityKey ) => {
                const entityInJS = noteCopiedEntities[thatEntityKey];
                copiedEntities[noteId].push( {
                  key: thatEntityKey,
                  entity: entityInJS
                } );
                const contextualization = contextualizations[entityInJS.data.asset.id];
                copiedContextualizations.push( {
                  ...contextualization
                } );
                copiedContextualizers.push( {
                  ...contextualizers[contextualization.contextualizerId],
                  id: contextualization.contextualizerId
                } );
              } );
              return true;
            } );
          }
        }

        /*
         * copying asset entities and related contextualization & contextualizer
         * (in case the resource being copied is deleted by the time)
         */
        else if ( type === INLINE_ASSET || type === BLOCK_ASSET ) {
          const assetId = entity.data.asset.id;
          const contextualization = contextualizations[assetId];
          copiedContextualizations.push( { ...contextualization } );
          copiedContextualizers.push( {
            ...contextualizers[contextualization.contextualizerId],
            id: contextualization.contextualizerId
          } );
        }
      } );
      return true;
    } );

    // clean copied entities (de-duplicating)
    copiedEntities = Object.keys( copiedEntities ).reduce( ( result, contentId ) => ( {
      ...result,
      [contentId]: uniqBy( copiedEntities[contentId], ( e ) => e.key )
    } ), {} );
    const copiedResources = uniq(
      copiedContextualizations.map( ( { sourceId } ) => sourceId )
    ).map( ( resourceId ) => production.resources[resourceId] );
    const copiedAssets = copiedResources.reduce( ( res, resource ) => {
      const assetsIds = [];
      const { data } = resource;

      Object.keys( data ).forEach( ( key ) => {
        const prop = data[key];
        if ( key.includes( 'AssetId' ) ) {
          assetsIds.push( prop );
        }
        else if ( Array.isArray( prop ) ) {
          prop.forEach( ( val ) => {
            Object.keys( val ).forEach( ( key2 ) => {
              const prop2 = val[key2];
              if ( key2.includes( 'AssetId' ) ) {
                assetsIds.push( prop2 );
              }
            } );
          } );
        }
      } );
      return assetsIds.reduce( ( res2, assetId ) => ( {
        ...res2,
        [assetId]: production.assets[assetId]
      } ), res );
    }, {} );
    // this object stores all the stuff we need to paste content later on
    const copiedData = {
      copiedEntities,
      copiedContextualizations,
      copiedContextualizers,
      copiedResources,
      copiedAssets,
      copiedNotes,
      contentId: editorFocus
    };

    return copiedData;
};

/**
 * Handles data computing for copy
 * @param {object} props
 * @return {object} modifications
 *
 */
export const processCopy = ( {
  production,
  citations,
  clipboard,
  editorFocus,
  activeSection,
  editorStates,
} ) => {

  /*
   * we will store all state modifications in this object
   * and return them
   */
  const stateDiff = {};

  /**
   * citeproc scaffolding (for converting copied citations to plain text later on)
   */
  const { locale: citationLocale, style: citationStyle } = getCitationModels( production );
  const sys = {
    retrieveLocale: () => {
      return citationLocale;
    },
    retrieveItem: ( id ) => {
      return citations.citationItems[id];
    },
    variableWrapper: ( params, prePunct, str, postPunct ) => {
      if ( params.variableNames[0] === 'title'
          && params.itemData.URL
          && params.context === 'bibliography' ) {
        return `${prePunct
            }<a href="${
              params.itemData.URL
            }" target="blank">${
              str
            }</a>${
              postPunct}`;
      }
      else if ( params.variableNames[0] === 'URL' ) {
        return `${prePunct
            }<a href="${
              str
            }" target="blank">${
              str
            }</a>${
              postPunct}`;
      }
      else {
        return ( prePunct + str + postPunct );
      }
    }
  };

  const copiedData = computeCopiedData( {
    editorFocus,
    editorStates,
    activeSection,
    production,
  } );

  stateDiff.clipboard = clipboard;
  const tempEditorState = EditorState.createEmpty();
  let clipboardContentState = Modifier.replaceWithFragment(
    tempEditorState.getCurrentContent(),
    tempEditorState.getSelection(),
    clipboard
  );

  const clipboardPlainText = clipboardContentState.getPlainText();

  /**
   * This is the content state that will be parsed if content is pasted internally
   */
  copiedData.clipboardContentState = convertToRaw( clipboardContentState );

  /**
   * converting bib references to string so that they
   * can be pasted in another editor
   */
  const processor = new CSL.Engine( sys, citationStyle );
  const reactCitations = makeReactCitations( processor, citations.citationData );

  /**
   * Iterate through each selected character to find entities and convert them
   * to static markup (in order to have a html clipboard that reflects the perceived content)
   */
  clipboardContentState.getBlocksAsArray()
    .forEach( ( block ) => {
      const characters = block.getCharacterList();
      const blockKey = block.getKey();
        characters.forEach( ( char, index ) => {
          if ( char.getEntity() ) {
            const thatEntityKey = char.getEntity();
            const thatEntity = clipboardContentState.getEntity( thatEntityKey ).toJS();
            if ( thatEntity.type === INLINE_ASSET ) {
              const targetId = thatEntity && thatEntity.data.asset.id;
              const contextualization = production.contextualizations[targetId];
              const contextualizer = production.contextualizers[contextualization.contextualizerId];
              if ( contextualizer.type === 'bib' && reactCitations[contextualization.id] ) {
                const component = reactCitations[contextualization.id].html;
                const content = component.replace( /<(?:.|\n)*?>/gm, '' );
                clipboardContentState = Modifier.replaceText(
                  clipboardContentState,
                  tempEditorState.getSelection().merge( {
                    anchorKey: blockKey,
                    focusKey: blockKey,
                    anchorOffset: index,
                    focusOffset: index + 1,
                  } ),
                  content
                );
              }
            }
          }
        } );
    } );

  /**
   * state-to-html conversion rules
   */
  const toHTMLOptions = {
    entityStyleFn: ( entity ) => {
      const data = entity.getData();
      if ( data.asset && data.asset.id ) {
        const contextualization = production.contextualizations[data.asset.id];
        const contextualizer = production.contextualizers[contextualization.contextualizerId];
        const resource = production.resources[contextualization.sourceId];
        switch ( contextualizer.type ) {
          case 'webpage':
            return {
              element: 'a',
              attributes: {
                href: resource.data.url,
              }
            };
          case 'glossary':
            return {
              element: 'cite',
            };
          case 'bib':
          default:
            return {
              element: 'cite',
            };
        }
      }
      return null;
    }
  };

  /**
   * Clipboard html is composed of two parts :
   * - serialized HTML version of the contents
   * - a custom json tag containing serialized copied data
   */
  const clipboardHtml = `
    ${stateToHTML( clipboardContentState, toHTMLOptions )}
    <script id="ovide-copied-data" type="application/json">
     ${JSON.stringify( copiedData )}
    </script>
  `.split( '\n' ).join( '' ).trim();

  /**
   * Finally store copied data
   */
  stateDiff.copiedData = copiedData;
  return {
    copiedData,
    stateDiff,
    clipboardPlainText,
    clipboardHtml,
  };
};

/**
 * Handle copy and modify state and local storage acconrdingly
 */
const handleCopy = function( event ) {
    const {
      props,
      state: {
        citations,
      },
      editor,
    } = this;
    const setState = this.setState.bind( this );
    // ensuring user is editing the contents
    if ( !props.editorFocus ) {
      return;
    }

    const {
      editorFocus,
      activeSection,
      editorStates,
      production,
    } = props;

    /*
     * first step is to retrieve draft-made clipboard ImmutableRecord
     * case 1: data is copied from the main editor
     */
    let clipboard;
    // case 1 : data is copied from the main editor
    if ( editorFocus === 'main' ) {
      clipboard = editor.mainEditor.editor.getClipboard();
    }
    // case 2: data is copied from a note
    else {
      clipboard = editor.notes[editorFocus].editor.editor.getClipboard();
    }

    const {
      copiedData,
      stateDiff,
      clipboardPlainText,
      clipboardHtml,
    } = processCopy( {
      production,
      citations,
      clipboard,
      editorFocus,
      activeSection,
      editorStates,
    } );

    /**
     * Update loaded elements in upstream state
     */
    setState( stateDiff );

    /**
     * load copy event with updated data
     */
    if ( event ) {
      event.clipboardData.setData( 'text/plain', clipboardPlainText );
      event.clipboardData.setData( 'text/html', clipboardHtml );
      event.preventDefault();
    }

    /**
     * Now update data-related (images, tables, ...) resources data in clipboard
     */
    packCopiedAssets( {
      copiedAssets: copiedData.copiedAssets,
      production,
    } )
    .then( ( packedAssets ) => {

      /*
       * storing in localstorage variable so that we are not dependent from state.
       * wrapping this in a try catch to prevent localStorage overloading errors
       * @todo find a way to copy this to clipboard
       */
      try {
        localStorage.setItem( 'ovide/copied-assets', JSON.stringify( packedAssets ) );
      }
      catch ( err ) {
        console.error( 'could not store copied resources to local storage, reason: ', err );/* eslint no-console: 0*/
      }
    } );
  };

export default handleCopy;
