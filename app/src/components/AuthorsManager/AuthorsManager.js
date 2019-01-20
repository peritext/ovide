/**
 * This module provides a component allowing to manage an authors list
 * @module ovide/components/AuthorsManager
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Control,
  Field,
  Level,
  HelpPin,
  Icon,
  Label,
  Delete,
  StretchedLayoutContainer,
  StretchedLayoutItem
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import productionSchema from 'peritext-schemas/production';
const FIELDS = Object.keys( productionSchema.definitions.metadata.properties.authors.items.properties );

class AuthorsManager extends Component {
  constructor( props ) {
    super( props );
    this.forms = {};
  }

  focusOnLastInput = () => {
    const lastInputKey = this.props.authors.length - 1;
    if ( this.forms[lastInputKey] ) {
      this.forms[lastInputKey].getElementsByTagName( 'input' )[0].focus();
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        authors = [],
        onChange,
        title,
        titleHelp,
      },
      context: {
        t
      }
    } = this;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.AuthorsManager' );

    /**
     * Callbacks handlers
     */
    const handleAddAuthor = ( e ) => {
      e.preventDefault();
      const newAuthors = [
        ...authors,
        FIELDS.reduce( ( res, key ) => ( { ...res, [key]: '' } ), {} )
      ];
      onChange( newAuthors );
      setTimeout( this.focusOnLastInput );
    };

    return (
      <Field>
        <Label>
          {title || translate( 'Authors' )}
          <HelpPin place={ 'right' }>
            {titleHelp || translate( 'Explanation about the production authors' )}
          </HelpPin>
        </Label>
        {
          authors &&
          authors.map( ( author, index ) => {
            const onAuthorChange = ( { index: authorIndex, key, value } ) => {
              // const value = e.target.value;
              const newAuthors = [ ...authors ];
              newAuthors[authorIndex][key] = value;
              onChange( newAuthors );
            };
            const onRemoveAuthor = () => {
              const newAuthors = [
                ...authors.slice( 0, index ),
                ...authors.slice( index + 1 )
              ];
              onChange( newAuthors );
              setTimeout( this.focusOnLastInput );
            };
            const bindRef = ( form ) => {
              this.forms[index] = form;
            };
            return (
              <div
                key={ index }
                ref={ bindRef }
              >
                <Control>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem style={ { paddingRight: '1rem' } }>
                      <Icon
                        isSize={ 'small' }
                        isAlign={ 'left' }
                        className={ 'fa fa-user' }
                      />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      {
                      FIELDS
                      .map( ( key ) => {
                        const handleInputChange = ( e ) => {
                          const value = e.target.value;
                          onAuthorChange( { index, key, value } );
                        };
                        return (
                          <input
                            key={ key }
                            className={ 'input' }
                            placeholder={ translate( key ) }
                            value={ author[key] || '' }
                            onChange={ handleInputChange }
                          />
                        );
                      } )
                    }
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete
                        onClick={ onRemoveAuthor }
                        className={ 'icon is-right' }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>

                  {/*<input
                    className={ 'input' }
                    ref={ bindInput }
                    placeholder={ translate( 'New author' ) }
                    value={ author }
                    onChange={ onAuthorChange }
                  />*/}

                </Control>
              </div>
            );
          } )
        }
        <Level>
          <Button
            isFullWidth
            onClick={ handleAddAuthor }
          >
            {translate( 'Add an author' )}
          </Button>
        </Level>
      </Field>
    );
  }
}

AuthorsManager.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AuthorsManager;

