/**
 * This module provides a modal for adding quickly a link in editor
 * @module ovide/components/GlossaryModal
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
  Title,
  Field,
  Control,
  Image,
  Dropdown,
  FlexContainer,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { abbrevString } from '../../helpers/misc';

/**
 * Import components
 */
import GlossaryForm from '../GlossaryForm';

class GlossaryModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };
  constructor( props ) {
    super( props );
    this.state = {
      dropdownOpen: false,
      choosenResource: undefined,
      name: '',
      description: '',
      entryType: 'person',
    };
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( !nextProps.isActive ) {
      this.setState( {
        dropdownOpen: false,
        choosenResource: undefined,
        name: '',
        description: '',
        entryType: 'person'
      } );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        onClose,
        glossaries = [],
        isActive,
        onCreateGlossary,
        onContextualizeGlossary,
        focusData
      },
      state: {
        dropdownOpen,
        choosenResource,
        name,
        description,
        entryType,
      },
      context: {
        t
      }
    } = this;

    /**
     * Computed variables
     */
    const activeResource = choosenResource && glossaries.find( ( r ) => r.id === choosenResource );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.GlossaryModal' );

    /**
     * Callbacks handlers
     */
    const handleConfirm = () => {
      if ( name && name.length && entryType ) {
        onCreateGlossary( {
          name,
          description,
          entryType,
          contents: {
            contents: {},
            notes: {},
            notesOrder: []
          }
        }, focusData.focusId, focusData.selection );
      }
      else {
        onContextualizeGlossary( choosenResource, focusData.focusId, focusData.selection );
      }
    };
    const handleToggleExistingGlossarysDropDown = () => this.setState( { dropdownOpen: !dropdownOpen } );
    const handleChooseResource = ( thatId ) => this.setState( { choosenResource: choosenResource === thatId ? undefined : thatId } );

    /*
     * const handleNewNameChange = ( e ) => this.setState( { name: e.target.value } );
     * const handleNewDescriptionChange = ( e ) => this.setState( { description: e.target.value } );
     * const handleNewEntryTypeChange = ( val ) => this.setState( { entryType: val } );
     */
    const handleNewItemChange = ( vals ) => this.setState( vals );

    return (
      <ModalCard
        isActive={ isActive }
        headerContent={ translate( 'Add a glossary item' ) }
        onClose={ onClose }
        mainContent={
          <div>
            {glossaries.length > 0
            &&
            <Field
              style={ {
                      pointerEvents: ( name && name.length && entryType ) ? 'none' : 'all',
                      opacity: ( name && name.length && entryType ) ? 0.5 : 1
                    } }
            >
              <Title isSize={ 4 }>
                {translate( 'Pick an existing glossary item from your library' )}
              </Title>
              <Control>
                <Dropdown
                  onToggle={ handleToggleExistingGlossarysDropDown }
                  isActive={ dropdownOpen }
                  closeOnChange
                  onChange={ handleChooseResource }
                  value={ { id: choosenResource } }
                  options={ glossaries
                                  .sort( ( a, b ) => {
                                    if ( a.metadata.title > b.metadata.title ) {
                                      return 1;
                                    }
                                    return -1;
                                  } )
                                  .map( ( resource ) => ( {
                                  id: resource.id,
                                  label: (
                                    <FlexContainer
                                      alignItems={ 'center' }
                                      flexDirection={ 'row' }
                                    >
                                      <Image
                                        style={ { display: 'inline-block', marginRight: '1em' } }
                                        isSize={ '16x16' }
                                        src={ icons.glossary.black.svg }
                                      />
                                      <span >
                                        {`${abbrevString( resource.data.name, 30 )} (${abbrevString( resource.data.entryType, 30 )})`}
                                      </span>
                                    </FlexContainer>
                                    )
                                } ) ) }
                >
                  {choosenResource && activeResource ? abbrevString( `${activeResource.data.name} (${activeResource.data.entryType})`, 60 ) : translate( 'Choose an existing glossary item' )}
                </Dropdown>
              </Control>
            </Field>
                  }
            <div>
              <Title isSize={ 4 }>
                {translate( 'Create a new glossary item' )}
              </Title>
              <GlossaryForm
                data={ { name, description, entryType } }
                onChange={ handleNewItemChange }
                translate={ translate }
              />
            </div>
          </div>
        }
        footerContent={ [
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 0 }
            onClick={ handleConfirm }
            isDisabled={ !choosenResource && !( name && name.length && entryType ) }
            isColor={ 'primary' }
          >{translate( 'Add glossary item' )}
          </Button>,
          <Button
            onClick={ onClose }
            isFullWidth
            key={ 1 }
            isColor={ 'warning' }
          >{translate( 'Cancel' )}
          </Button>,
        ] }
      />
    );
  }
}

export default GlossaryModal;
