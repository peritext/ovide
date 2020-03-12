/**
 * This module provides a component allowing to manage an tags list
 * @module ovide/components/TagsEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import {
  Button,
  Control,
  Level,
  ModalCard,
  Title,
  Input,
  Label,
  StretchedLayoutContainer,
  StretchedLayoutItem
} from 'quinoa-design-library/components/';

import ColorMarker from '../ColorMarker';
import { SketchPicker as ColorPicker } from 'react-color';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const genRandomHex = () => `#${( Math.random() * 0xFFFFFF << 0 ).toString( 16 )}`;

class TagsEditor extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      searchTerm: '',
      isExpanded: false,
      editedTagId: undefined,
      tempTagData: {}
    };
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      state: {
        searchTerm,
        isExpanded,
        editedTagId,
        tempTagData = {},
      },
      props: {
        activeTagsIds = [],
        onUpdateTags,
        tags = {},

        createTag,
        updateTag,
        deleteTag,
        productionId,
      },
      context: {
        t
      }
    } = this;

    /**
     * Computed variables
     */
    const matchingTags = searchTerm.length ?
      Object.entries( tags ).filter( ( [ key, tag ] ) => tag.name.toLowerCase().includes( searchTerm.toLowerCase() ) )/* eslint no-unused-vars : 0 */
      .map( ( [ key, tag ] ) => tag )
      :
      Object.entries( tags ).map( ( [ _key, tag ] ) => tag );/* eslint no-unused-vars : 0 */

    const availableTags = matchingTags.filter( ( thisTag ) => !activeTagsIds.includes( thisTag.id ) );

    const editedTagName = editedTagId && tags[editedTagId] ? tags[editedTagId].name : undefined;

    const newTagPrompted = searchTerm.length && !availableTags.length
    && !activeTagsIds.find( ( tagId ) => tags[tagId] && tags[tagId].name.toLowerCase() === searchTerm.toLowerCase() );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.TagsEditor' );

    const handleSearchTermChange = ( { target: { value } } ) => {
      this.setState( { searchTerm: value } );
    };

    const handleAddTag = ( { name, color } ) => {
      const tagId = genId();
      const newTag = {
        name,
        color,
        id: tagId
      };
      createTag( { tagId, tag: newTag, productionId } );
      onUpdateTags( [ ...activeTagsIds, tagId ] );
      this.setState( { searchTerm: '' } );
    };

    const toggleExpanded = () => {
      this.setState( {
        isExpanded: !isExpanded,
      } );
    };

    /**
     * Callbacks handlers
     */
    const handleSearchSubmit = ( e ) => {
      e.preventDefault();
      e.stopPropagation();
      if ( !availableTags.length ) {
        handleAddTag( {
          name: searchTerm,
          color: genRandomHex(),
        } );
      }
    };

    const handleCloseEditedTag = () => {
      this.setState( {
        editedTagId: undefined,
        tempTagData: {}
      } );
    };

    const handleUpdateTempTagDataName = ( e ) => {
      this.setState( {
        tempTagData: {
          ...tempTagData,
          name: e.target.value
        }
      } );
    };
    const handleUpdateTempTagDataColor = ( color ) => {
      this.setState( {
        tempTagData: {
          ...tempTagData,
          color
        }
      } );
    };
    const handleDeleteEditedTag = () => {
      deleteTag( {
        tagId: editedTagId,
        productionId,
      } );
      this.setState( {
        editedTagId: undefined,
        tempTagData: {}
      } );
    };
    const handleSaveEditedTag = ( e ) => {
      if ( e ) {
        e.stopPropagation();
        e.preventDefault();
      }
      const newTag = {
        ...tempTagData
      };
      updateTag( { tag: newTag, tagId: newTag.id, productionId } );
      this.setState( {
        editedTagId: undefined,
        tempTagData: {}
      } );
    };

    return (
      <div>
        {
          activeTagsIds.length ?
            <ul>
              {
                activeTagsIds.map( ( tagId ) => {
                  const tag = tags[tagId];
                  const handleUntag = () => {
                    onUpdateTags( activeTagsIds.filter( ( thisTag ) => thisTag !== tagId ) );
                  };
                  const handleEdit = () => {
                    this.setState( {
                      editedTagId: tagId,
                      tempTagData: { ...tag }
                    } );
                  };
                  if ( tag ) {
                    return (
                      <li key={ tagId }>
                        <Level>
                          <StretchedLayoutContainer
                            isDirection={ 'horizontal' }
                            style={ { padding: '1rem', paddingLeft: '.2rem', width: '100%' } }
                          >
                            <StretchedLayoutItem
                              isFlex={ 1 }
                              style={ { display: 'flex', alignItems: 'center' } }
                            >
                              <ColorMarker color={ tag.color } />
                              {tag.name}
                            </StretchedLayoutItem>
                            <StretchedLayoutItem>
                              <Button
                                onClick={ handleEdit }
                                isColor={ 'info' }
                              >{translate( 'Edit tag' )}
                              </Button>
                            </StretchedLayoutItem>
                            <StretchedLayoutItem>
                              <Button
                                onClick={ handleUntag }
                                isColor={ 'warning' }
                              >
                                {translate( 'remove tag' )}
                              </Button>
                            </StretchedLayoutItem>
                          </StretchedLayoutContainer>
                        </Level>

                      </li>
                    );
                  }
                  return null;
                } )
              }
            </ul>
          :
            <div style={ { padding: '1rem' } }>
              {translate( 'No tags yet for this material' )}
            </div>
        }
        <Button
          isFullWidth
          onClick={ toggleExpanded }
        >
          {isExpanded ? translate( 'done with new tags' ) : translate( 'add new tags' )}
        </Button>
        <div style={ { transition: '.5s ease max-height', overflow: 'hidden', maxHeight: isExpanded ? '10000rem' : 0, paddingTop: isExpanded ? '1rem' : 0 } }>
          <Title isSize={ 6 }>
            {translate( 'Other tags used in the production' )}
          </Title>
          <form onSubmit={ handleSearchSubmit }>
            <Input
              placeholder={ translate( 'Search or create a tag' ) }
              value={ searchTerm }
              onChange={ handleSearchTermChange }
            />
          </form>
          <div>
            <ul>
              {
                  newTagPrompted ?
                    <li style={ { paddingTop: '1rem' } }>
                      <Button
                        onClick={ () => handleAddTag( { name: searchTerm, color: genRandomHex() } ) }
                        isColor={ 'success' }
                        isFullWidth
                      >
                        {translate( 'Add {searchTerm} tag', { searchTerm } )}
                      </Button>
                    </li>
                  :
                  availableTags.map( ( tag ) => {
                    const handleAdd = () => {
                      onUpdateTags( [ ...activeTagsIds, tag.id ] );
                    };
                    const handleEdit = () => {
                      this.setState( {
                        editedTagId: tag.id,
                        tempTagData: { ...tag }
                      } );
                    };
                    return (
                      <li key={ tag.id }>
                        <Level>
                          <StretchedLayoutContainer
                            isDirection={ 'horizontal' }
                            style={ { padding: '1rem', paddingLeft: '.2rem', width: '100%' } }
                          >
                            <StretchedLayoutItem
                              isFlex={ 1 }
                              style={ { display: 'flex', alignItems: 'center' } }
                            >
                              <ColorMarker color={ tag.color } />
                              {tag.name}
                            </StretchedLayoutItem>
                            <StretchedLayoutItem>
                              <Button
                                isColor={ 'info' }
                                onClick={ handleEdit }
                              >{translate( 'Edit tag' )}
                              </Button>
                            </StretchedLayoutItem>
                            <StretchedLayoutItem>
                              <Button
                                isColor={ 'primary' }
                                onClick={ handleAdd }
                              >{translate( '+ Add tag' )}
                              </Button>
                            </StretchedLayoutItem>
                          </StretchedLayoutContainer>
                        </Level>
                      </li>
                  );
  } )
                }
            </ul>
          </div>
        </div>
        <ModalCard
          isActive={ editedTagId !== undefined }
          headerContent={ translate( 'Edit tag {tagName}', { tagName: editedTagName } ) }
          onClose={ handleCloseEditedTag }
          mainContent={
            <div>
              <form onSubmit={ handleSaveEditedTag }>

                <Control>
                  <Label>
                    {translate( 'Tag name' )}
                  </Label>
                  <Input
                    value={ tempTagData.name }
                    onChange={ handleUpdateTempTagDataName }
                  />
                </Control>

                <Control>
                  <Label>
                    {translate( 'Tag color' )}
                  </Label>
                  <ColorPicker
                    color={ tempTagData.color }
                    onChange={ ( val ) => handleUpdateTempTagDataColor( val.hex ) }
                  />
                </Control>

              </form>
              <div style={ { paddingTop: '1rem' } }>
                <Button
                  onClick={ handleDeleteEditedTag }
                  isColor={ 'danger' }
                >
                  {translate( 'Delete this tag and untag all related materials' )}
                </Button>
              </div>
            </div>
          }
          footerContent={ [
            <Button
              isFullWidth
              key={ 0 }
              onClick={ handleSaveEditedTag }
              isColor={ 'primary' }
            >
              {translate( 'Save' )}
            </Button>,
            <Button
              onClick={ handleCloseEditedTag }
              isFullWidth
              key={ 1 }
              isColor={ 'warning' }
            >{translate( 'Cancel' )}
            </Button>,
          ] }
        />
      </div>
    );
  }
}

TagsEditor.contextTypes = {
  t: PropTypes.func.isRequired
};

export default TagsEditor;

