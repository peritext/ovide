/**
 * This module provides a form for creating a new section
 * @module ovide/components/SectionForm
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Text } from 'react-form';
import {
  Button,
  Column,
  Control,
  Field,
  Help,
  HelpPin,
  Label,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * Imports Components
 */
import AuthorsManager from '../AuthorsManager';
import TagsEditor from '../TagsEditor';

class SectionForm extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      tags: props.metadata && props.metadata.tags ? props.metadata.tags : []
    };
  }

  componentDidMount = () => {
    setTimeout( () => {
      if ( this.form ) {
        const inputs = this.form.getElementsByTagName( 'input' );
        if ( inputs && inputs.length ) {
          inputs[0].focus();
        }
      }
    } );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( nextProps.metadata.tags && nextProps.metadata.tags.join() !== this.state.tags.join() ) {
      this.setState( { tags: nextProps.metadata.tags } );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    /**
     * Callbacks handlers
     */
    /**
     * References bindings
     */
    const {
      state: {
        tags: localTags = [],
      },
      props: {
        metadata,
        tags = {},
        createTag,
        updateTag,
        deleteTag,
        onSubmit,
        onCancel,
        submitMessage,
        productionId,
        style = {},
      },
      context: { t }
    } = this;

    const translate = translateNameSpacer( t, 'Components.SectionForm' );

     const errorValidator = ( values ) => {
      return {
        title: !values.title ? translate( 'section-title-is-required' ) : null,
      };
    };

    const handleSubmitFailure = ( error ) => {
      console.error( error );/* eslint no-console : 0 */
    };

    const handleSubmitMetadata = ( values ) => {
      onSubmit( {
        ...values,
        tags: localTags,
      } );
    };

    const bindRef = ( form ) => {
      this.form = form;
    };

    return (
      <Form
        defaultValues={ metadata }
        validate={ errorValidator }
        handleSubmitFailure={ handleSubmitFailure }
        onSubmit={ handleSubmitMetadata }
      >
        {( formApi ) => {
          const handleAuthorsChange = ( authors ) => formApi.setValue( 'authors', authors );
          const handleSubmit = formApi.submitForm;
          const handleUpdateTags = ( theseTags ) => {
            setTimeout( () => {
              this.setState( {
                tags: theseTags
              } );
            } );

          };
          return (
            <form
              style={ style }
              ref={ bindRef }
              onSubmit={ handleSubmit }
            >
              <StretchedLayoutContainer isAbsolute>
                <StretchedLayoutItem
                  isFlex={ 1 }
                  isFlowing
                >
                  <Column>
                    <Field>
                      <Control>
                        <Label>
                          {translate( 'Section title' )}
                          <HelpPin place={ 'right' }>
                            {translate( 'Explanation about the section title' )}
                          </HelpPin>
                        </Label>
                        <Text
                          className={ 'input' }
                          field={ 'title' }
                          id={ 'title' }
                          type={ 'text' }
                          placeholder={ translate( 'Section title' ) }
                        />
                      </Control>
                    </Field>
                    {
                      formApi.errors && formApi.errors.title &&
                      <Help
                        isColor={ 'danger' }
                      >
                        {formApi.errors.title}
                      </Help>
                    }
                    <AuthorsManager
                      field={ 'authors' }
                      id={ 'authors' }
                      title={ translate( 'Section authors' ) }
                      titleHelp={ translate( 'help about section authors' ) }
                      onChange={ handleAuthorsChange }
                      authors={ formApi.getValue( 'authors' ) }
                    />
                    <Field>
                      <Control>
                        <Label>
                          {translate( 'Tags attached to the section' )}
                          <HelpPin place={ 'right' }>
                            {translate( 'Explanation about tags' )}
                          </HelpPin>
                        </Label>
                        <TagsEditor
                          activeTagsIds={ localTags }
                          {
                            ...{
                              tags,
                              createTag,
                              updateTag,
                              deleteTag,
                              productionId,
                              onUpdateTags: handleUpdateTags,
                            }
                          }
                        />
                      </Control>
                    </Field>
                  </Column>
                </StretchedLayoutItem>

                <StretchedLayoutItem>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <Column>
                        <Button
                          isDisabled={ !formApi.getValue( 'title' ).length }
                          isFullWidth
                          type={ 'submit' }
                          isColor={ 'success' }
                        >
                          {submitMessage || translate( 'Create and start editing' )}
                        </Button>
                      </Column>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <Column>
                        <Button
                          onClick={ onCancel }
                          isFullWidth
                          isColor={ 'danger' }
                        >
                          {translate( 'Cancel' )}
                        </Button>
                      </Column>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>

            </form>
          );
        }}
      </Form>
    );
  }
}

SectionForm.contextTypes = {
  t: PropTypes.func,
};
export default SectionForm;
