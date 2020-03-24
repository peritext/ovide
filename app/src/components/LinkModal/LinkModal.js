/**
 * This module provides a modal for adding quickly a link in editor
 * @module ovide/components/LinkModal
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
  Input,
  Label,
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

class LinkModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };
  constructor( props ) {
    super( props );
    this.state = {
      dropdownOpen: false,
      choosenResource: undefined,
      title: '',
      url: '',
      searchInput: ''
    };
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( !nextProps.isActive ) {
      this.setState( {
        dropdownOpen: false,
        choosenResource: undefined,
        title: '',
        url: '',
        searchInput: ''
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
        hyperlinks = [],
        isActive,
        onCreateHyperlink,
        onContextualizeHyperlink,
        focusData
      },
      state: {
        dropdownOpen,
        choosenResource,
        title,
        url,
        searchInput
      },
      context: {
        t
      }
    } = this;

    /**
     * Computed variables
     */
    const activeResource = choosenResource && hyperlinks.find( ( r ) => r.id === choosenResource );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.LinkModal' );

    /**
     * Callbacks handlers
     */
    const handleConfirm = () => {
      if ( url && url.length ) {
        onCreateHyperlink( { url, title }, focusData.focusId, focusData.selection );
      }
      else {
        onContextualizeHyperlink( choosenResource, focusData.focusId, focusData.selection );
      }
    };
    const handleToggleExistingLinksDropDown = () => this.setState( { dropdownOpen: !dropdownOpen } );
    const handleChooseResource = ( thatId ) => this.setState( { choosenResource: choosenResource === thatId ? undefined : thatId } );
    const handleNewURLChange = ( e ) => this.setState( { url: e.target.value } );
    const handleNewTitleChange = ( e ) => this.setState( { title: e.target.value } );
    const handleSearchInputChange = ( e ) => this.setState( { searchInput: e.target.value } );

    return (
      <ModalCard
        isActive={ isActive }
        headerContent={ translate( 'Add a hyperlink' ) }
        onClose={ onClose }
        mainContent={
          <div>
            {hyperlinks.length > 0 &&
            <Field
              style={ {
                            pointerEvents: ( url && url.length ) ? 'none' : 'all',
                            opacity: ( url && url.length ) ? 0.5 : 1
                          } }
            >
              <Title isSize={ 4 }>
                {translate( 'Pick an existing hyperlink from your library' )}
              </Title>
              <Control>
                <Dropdown
                  onToggle={ handleToggleExistingLinksDropDown }
                  isActive={ dropdownOpen }
                  closeOnChange
                  onChange={ handleChooseResource }
                  value={ { id: choosenResource } }
                  options={ [
                    {
                      id: 'search',
                      label: (
                        <div
                          style={ {
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row'
                          } }
                          onClick={ ( e ) => {
                            e.stopPropagation();
                            e.preventDefault();
                          } }
                        >
                          <i
                            className={ 'fa fa-search' }
                            style={ { marginRight: '1rem' } }
                          />
                          <Input
                            value={ searchInput }
                            onChange={ handleSearchInputChange }
                            placeholder={ translate( 'search for a link' ) }
                            style={ { flex: 1 } }
                          />
                        </div>
                      )
                    },
                    ...hyperlinks
                                  .sort( ( a, b ) => {
                                    if ( a.metadata.title > b.metadata.title ) {
                                      return 1;
                                    }
                                    return -1;
                                  } )
                                  .filter(resource => {
                                    if( searchInput.length > 1 ) {
                                      return resource.metadata.title.toLowerCase().includes(searchInput.toLowerCase())
                                      || resource.data.url.toLowerCase().includes(searchInput.toLowerCase())
                                    }
                                    return true;
                                  })
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
                                        src={ icons.webpage.black.svg }
                                      />
                                      <span
                                        data-for={ 'tooltip' }
                                        data-tip={ `${ resource.metadata.title } (${ resource.data.url })` }
                                      >
                                        {`${abbrevString( resource.metadata.title, 30 )} (${abbrevString( resource.data.url, 30 )})`}
                                      </span>
                                    </FlexContainer>
                                    )
                                } ) )
                   ] }
                >
                  {choosenResource && activeResource ? abbrevString( `${activeResource.metadata.title} (${activeResource.data.url})`, 60 ) : translate( 'Choose an existing hyperlink' )}
                </Dropdown>
              </Control>
            </Field>
                  }
            <div>
              <Title isSize={ 4 }>
                {translate( 'Create a new hyperlink' )}
              </Title>
              <Field>
                <Label>{translate( 'URL address' )}</Label>
                <Control>
                  <input
                    className={ 'input' }
                    placeholder={ translate( 'Hyperlink URL' ) }
                    value={ url }
                    onChange={ handleNewURLChange }
                  />
                </Control>
              </Field>
              <Field>
                <Label>{translate( 'Title of the webpage' )}</Label>
                <Control>
                  <Input
                    placeholder={ translate( 'Hyperlink title' ) }
                    value={ title }
                    onChange={ handleNewTitleChange }
                  />
                </Control>
              </Field>
            </div>
          </div>
        }
        footerContent={ [
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 0 }
            onClick={ handleConfirm }
            isDisabled={ !choosenResource && !( url && url.length ) }
            isColor={ 'primary' }
          >{translate( 'Add hyperlink' )}
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

export default LinkModal;
