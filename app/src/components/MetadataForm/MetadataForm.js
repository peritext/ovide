/**
 * This module provides a production edition form
 * @module ovide/components/MetadataForm
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Text, TextArea } from 'react-form';
import {
  Button,
  Control,
  Field,
  Column,
  Columns,
  Label,
  Help,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * Imports Components
 */
import AuthorsManager from '../AuthorsManager';
import ExplainedLabel from '../ExplainedLabel';

class MetadataForm extends Component {

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
  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        production,
        status,
        onSubmit,
        onCancel,
      },
      context: {
        t
      }
    } = this;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.MetadataForm' );
    const errorValidator = ( values ) => {
      return {
        title: !values.title ? translate( 'Production title is required' ) : null,
      };
    };

    /**
     * Callbacks handlers
     */
    const handleSubmitForm = ( values ) => {
      const newValues = { ...values };
      // parse authors
      const authors = newValues.authors;

                      /*
                       * .reduce((result, item) => result.concat(item.split(',')), [])
                       * .map( ( d ) => d.trim() )
                       * .filter( ( d ) => d.length > 0 );
                       */
      const payload = {
        ...production,
        metadata: {
          ...production.metadata,
          ...newValues,
          authors
        },
      };
      onSubmit( { payload, password: values.password } );
    };

    /**
     * References bindings
     */
    const bindRef = ( form ) => {
      this.form = form;
    };

    return (
      <Form
        defaultValues={ production.metadata }
        validate={ errorValidator }
        onSubmit={ handleSubmitForm }
      >
        {( formApi ) => {
          const onAuthorsChange = ( authors ) => formApi.setValue( 'authors', authors );
          const handleSubmit = formApi.submitForm;
          return (
            <form
              ref={ bindRef }
              onSubmit={ handleSubmit }
            >
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Production title' ) }
                    explanation={ translate( 'Explanation about the production title' ) }
                  />
                  <Text
                    className={ 'input' }
                    field={ 'title' }
                    id={ 'title' }
                    type={ 'text' }
                    placeholder={ translate( 'title' ) }
                  />
                </Control>
                {
                  formApi.touched.title && formApi.errors && formApi.errors.title &&
                    <Help isColor={ 'danger' }>{formApi.errors.title}</Help>
                }
              </Field>
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Production subtitle' ) }
                    explanation={ translate( 'Explanation about the production subtitle' ) }
                  />
                  <Text
                    className={ 'input' }
                    field={ 'subtitle' }
                    id={ 'subtitle' }
                    type={ 'text' }
                    placeholder={ translate( 'subtitle' ) }
                  />
                </Control>
              </Field>

              <AuthorsManager
                field={ 'authors' }
                id={ 'authors' }
                onChange={ onAuthorsChange }
                authors={ formApi.getValue( 'authors' ) }
              />
              <Field>
                <Label>{translate( 'Production Abstract' )}</Label>
                <Control hasIcons>
                  <TextArea
                    className={ 'textarea' }
                    field={ 'abstract' }
                    id={ 'abstract' }
                    type={ 'text' }
                    placeholder={ translate( 'abstract' ) }
                  />
                </Control>
              </Field>
              {!production.id && status === 'processing' && <Help>{translate( 'Creating production' )}</Help>}
              {!production.id && status === 'fail' && <Help isColor={ 'danger' }>{translate( 'Production could not be created' )}</Help>}
              <Columns>
                <Column isSize={ 6 }>
                  <Button
                    isFullWidth
                    type={ 'submit' }
                    isColor={ 'success' }
                  >
                    {production.id ?
                      <span>{translate( 'Update settings' )}</span> :
                      <span>{translate( 'Create production' )}</span>
                    }
                  </Button>
                </Column>
                <Column isSize={ 6 }>
                  <Button
                    onClick={ onCancel }
                    isFullWidth
                    isColor={ 'danger' }
                  >
                    {translate( 'Cancel' )}
                  </Button>
                </Column>
              </Columns>
            </form>
          );
          }
        }
      </Form>
    );
  }
}

MetadataForm.contextTypes = {
  t: PropTypes.func,
};
export default MetadataForm;
