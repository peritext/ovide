/**
 * This module provides a reusable note pointer component (note pointer inside content)
 * @module ovide/components/ContentsEditor
 */
/* eslint react/no-did-mount-set-state : 0 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Tag
} from 'quinoa-design-library/components';

class NotePointer extends Component {

  static contextTypes = {
    emitter: PropTypes.object,
    notes: PropTypes.object,

    onNotePointerMouseOver: PropTypes.func,
    onNotePointerMouseOut: PropTypes.func,
    onNotePointerMouseClick: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {};
  }

  componentDidMount() {
    const entity = this.props.contentState.getEntity( this.props.entityKey );
    const { noteId } = entity.getData();
    this.setState( {
      note: this.context.notes && this.context.notes[noteId],
      noteId
    } );
    this.unsubscribe = this.context.emitter.subscribeToNotes( ( notes ) => {
      const note = notes[this.state.noteId];
      if ( !this.state.note || ( note && note.order !== this.state.note.order ) ) {
        this.setState( {
          note
        } );
      }
    } );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      note
    } = this.state;

    const {
      onNotePointerMouseOver,
      onNotePointerMouseOut,
      onNotePointerMouseClick,
    } = this.context;

    /*
     * note:  it was necessary to display component children
     * to avoid weird selection bugs implying this component.
     * this should be solved with draft-js@0.11
     * see https://github.com/facebook/draft-js/issues/627
     */
    const {
      children/* eslint react/prop-types : 0 */
    } = this.props;

    /**
     * Computed variables
     */
    const id = note && note.id ? `note-pointer-${note.id}` : 'note-pointer-orphan';

    /**
     * Callbacks handlers
     */
    const handleMouseOver = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseOver === 'function' && note ) {
        onNotePointerMouseOver( note.id, note, event );
      }
    };

    const handleMouseOut = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseOut === 'function' && note ) {
        onNotePointerMouseOut( note.id, note, event );
      }
    };

    const handleMouseClick = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseClick === 'function' && note ) {
        onNotePointerMouseClick( note.id, note, event );
      }
    };

    return (
      <sup
        id={ id }
        contentEditable={ false }
        onMouseOver={ handleMouseOver }
        onFocus={ handleMouseOver }
        onMouseOut={ handleMouseOut }
        onBlur={ handleMouseOut }
        onClick={ handleMouseClick }
      >
        <Tag
          style={ { marginRight: 0, fontSize: '.5em', position: 'relative', bottom: '.7em' } }
          className={ 'is-clickable is-rounded' }
          isColor={ 'info' }
        >{( note && note.order ) || '*'}{children}
        </Tag>
      </sup>
    );
  }
}

NotePointer.propTypes = {
  noteId: PropTypes.string
};

export default NotePointer;
