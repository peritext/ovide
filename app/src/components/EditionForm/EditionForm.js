/**
 * This module provides a form for editing a new or existing edition
 * @module ovide/components/EditionForm
 */
/* eslint react/no-set-state : 0 */
/* eslint react/jsx-boolean-value : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*
 * import { v4 as genId } from 'uuid';
 * import { isEmpty } from 'lodash';
 */
import { Form, Text, TextArea } from 'react-form';
import Tooltip from 'react-tooltip';
import {
  BigSelect,
  Button,
  Column,
  Columns,
  Control,
  Delete,
  Field,
  HelpPin,
  Label,
  Level,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import productionSchema from 'peritext-schemas/production';
import { translateNameSpacer } from '../../helpers/translateUtils';
import {
  createDefaultEdition,
  // validateEdition
} from '../../helpers/schemaUtils';

/**
 * Imports Components
 */
import ExplainedLabel from '../../components/ExplainedLabel';
import SummaryEditor from '../../components/SummaryEditor';

import './EditionForm.scss';

/**
 * Shared variables
 */
const editionSchema = productionSchema.definitions.edition;
const editionsTypes = editionSchema.properties.metadata.properties.type.enum;

// const getAvailableTemplates = (formApi.getValue('metadata.type'), availableTemplates)
const getAvailableTemplates = ( type, templates ) => {
  return templates.filter( ( template ) => template.meta.renderingTypes.includes( type ) );
};

class EditionForm extends Component {

  constructor( props, context ) {
    super( props );
    const edition = props.edition || createDefaultEdition();
    this.state = {
      edition,
    };
    this.translate = translateNameSpacer( context.t, 'Components.EditionForm' );
  }

  componentDidMount = () => {
    setTimeout( () => {
      if ( this.form ) {
        Tooltip.rebuild();
        this.scrollToPosition( 0 );
      }
    } );
  }

  scrollToPosition = ( top ) => {
    if ( this.form ) {
      const inputs = this.form.getElementsByTagName( 'input' );
      if ( inputs && inputs.length ) {
        inputs[0].focus();
      }
      const flowing = this.form.getElementsByClassName( 'is-flowing' );
      if ( flowing && flowing.length ) {
        Array.prototype.forEach.call( flowing, ( el ) => {
          el.scrollTop = top;
        } );
      }
    }
  }

  scrollToElement = ( selector ) => {
    setTimeout( () => {
      const element = document.querySelector( selector );
      // console.log( 'scroll to', selector, element );
      if ( element ) {
        this.scrollToPosition( element.offsetTop );
      }
    } );

  }

  componentWillReceiveProps = ( nextProps, nextContext ) => {
    if ( this.props.edition !== nextProps.edition ) {
      const edition = nextProps.edition || createDefaultEdition();
      this.setState( {
        edition
      } );
    }
    if ( this.context.t !== nextContext.t ) {
      this.translate = translateNameSpacer( nextContext.t, 'Components.EditionForm' );
    }
  }

  componentWillUnmount = () => {
    const { asNewEdition } = this.props;
    if ( !asNewEdition ) this.props.onCancel();
  }

  render = () => {
    const {
      props: {
        asNewEdition = true,
        onCancel,
        onSubmit,
        editionType,
        showTitle = true,
        bigSelectColumnsNumber = 2,
        availableTemplates,
      },
      state: {
        edition = {},
      },
      translate,
    } = this;

    const handleSubmit = ( candidate ) => {
      const templateId = candidate.metadata.templateId;
      const template = this.props.availableTemplates.find( ( thatTemplate ) => thatTemplate.meta.id === templateId );

      const newEdition = {
        ...candidate,
        data: {
          ...edition.data
        },
      };

      newEdition.data.bibType = template.meta.defaultBibType;
      newEdition.data.additionalHTML = template.meta.defaultAdditionalHTML || '';
      onSubmit( newEdition );
    };

    const handleEditionTemplateIdChange = ( thatTemplateId, formApi ) => {
      if ( thatTemplateId === undefined ) {
        //"reset type" case
        formApi.setValue( 'metadata.templateId', undefined );
      }
      const template = availableTemplates.find( ( t ) => t.meta.id === thatTemplateId );
      if ( template ) {
        const { meta: { defaultPlan } } = template;
        console.log( { defaultPlan } );
        this.setState( {
          edition: {
            ...edition,
            data: {
              ...edition.data,
              plan: { ...defaultPlan },
            }
          }
        } );
        // customSummary: { active: false, summary: [] }
        formApi.setValue( 'metadata.title', `${translate( formApi.getValue( 'metadata.type' ) )} (${thatTemplateId})` );
        formApi.setValue( 'metadata.templateId', thatTemplateId );
      }

      Tooltip.rebuild();
    };
    const handleEditionTypeChange = ( thatType, formApi ) => {
      if ( thatType === undefined ) {
        //"reset type" case
        formApi.resetAll();
      }
      const defaultEdition = createDefaultEdition();
      const typeTemplates = getAvailableTemplates( thatType, this.props.availableTemplates );
      formApi.setAllValues( defaultEdition );
      formApi.setValue( 'metadata.type', thatType );

      /**
       * If only one template available for that type auto-select it
       */
      if ( typeTemplates.length > 0 && typeTemplates.length < 2 ) {
        const firstTemplate = typeTemplates[0];
        const firstTemplateId = firstTemplate.meta.id;
        setTimeout( () => handleEditionTemplateIdChange( firstTemplateId, formApi ) );
      }
      Tooltip.rebuild();
    };

    const handleSummaryChange = ( newSummary ) => {
      this.setState( {
        edition: {
          ...edition,
          data: {
            ...edition.data,
            plan: {
              ...edition.data.plan,
              summary: newSummary
            },
          }
        }
      } );
    };

    const handleSubmitFailure = ( error ) => {
      console.error( error );/* eslint no-console : 0 */
    };

    const errorValidator = ( /*values*/ ) => {
      return {

      };
    };

    const bindRef = ( form ) => {
      this.form = form;
    };

    const handleCancel = () => onCancel();

    const editionsIcons = {
      paged: require( '../../sharedAssets/paged.png' ),
      screened: require( '../../sharedAssets/screened.png' ),
      pyrrah: {
        black: require( '../../sharedAssets/pyrrah.black.png' ),
        white: require( '../../sharedAssets/pyrrah.white.png' ),
      },
      deucalion: {
        black: require( '../../sharedAssets/deucalion.black.png' ),
        white: require( '../../sharedAssets/deucalion.white.png' ),
      },
      callirhoe: {
        black: require( '../../sharedAssets/callirhoe.black.png' ),
        white: require( '../../sharedAssets/callirhoe.white.png' ),
      },
      chrysaor: {
        black: require( '../../sharedAssets/chrysaor.black.png' ),
        white: require( '../../sharedAssets/chrysaor.white.png' ),
      },
    };

    return (
      <Form
        defaultValues={ edition }
        validate={ errorValidator }
        validateOnSubmit={ true }
        handleSubmitFailure={ handleSubmitFailure }
        onSubmit={ handleSubmit }
      >
        {
          ( formApi ) => {
            const handleFormAPISubmit = formApi.submitForm;
            return (
              <form
                ref={ bindRef }
                className={ 'ovide-EditionForm is-wrapper' }
                onSubmit={ handleFormAPISubmit }
              >
                <StretchedLayoutContainer isAbsolute>
                  {
                    showTitle &&
                    <StretchedLayoutItem>
                      <Column style={ { paddingTop: 0 } }>
                        <Title isSize={ 3 }>
                          <StretchedLayoutContainer isDirection={ 'horizontal' }>
                            <StretchedLayoutItem isFlex={ 1 }>
                              {asNewEdition ? translate( 'Create a new edition' ) : translate( 'Edit edition' )}
                            </StretchedLayoutItem>
                            <StretchedLayoutItem>
                              <Delete onClick={ handleCancel } />
                            </StretchedLayoutItem>
                          </StretchedLayoutContainer>
                        </Title>
                        <Level />
                      </Column>
                    </StretchedLayoutItem>
                  }
                  <StretchedLayoutItem
                    isFlowing
                    isFlex={ 1 }
                    style={ { overflowX: 'hidden' } }
                  >
                    {
                      asNewEdition && !editionType &&
                      <Column>
                        <BigSelect
                          activeOptionId={ formApi.getValue( 'metadata.type' ) }
                          columns={ bigSelectColumnsNumber }
                          onChange={ ( thatType ) => {
                            handleEditionTypeChange( thatType, formApi );
                            this.scrollToElement( '#template-choice' );
                          } }
                          boxStyle={ { textAlign: 'center' } }
                          options={ formApi.getValue( 'metadata.type' ) ?
                              [ {
                                id: formApi.getValue( 'metadata.type' ),
                                label: <span>{translate( formApi.getValue( 'metadata.type' ) )}<HelpPin>{translate( `Explanation about rendering mode ${formApi.getValue( 'metadata.type' )}` )}</HelpPin></span>,
                                iconUrl: editionsIcons[formApi.getValue( 'metadata.type' )]
                              },
                              {
                                id: undefined,
                                label: <span>{translate( 'reset type' )}</span>,
                                iconUrl: icons.remove.black.svg
                              } ]
                              :
                              editionsTypes.map( ( thatType ) => ( {
                                id: thatType,
                                label: <span>{translate( thatType )}<HelpPin>{translate( `Explanation about rendering mode ${thatType}` )}</HelpPin></span>,
                                iconUrl: editionsIcons[thatType]
                              } ) ) }
                        />
                      </Column>
                    }

                    {
                      formApi.getValue( 'metadata.type' ) &&
                      getAvailableTemplates( formApi.getValue( 'metadata.type' ), availableTemplates ).length > 0 &&
                      <Column id={ 'template-choice' }>
                        <Column>
                          <Label>
                            {translate( 'Choose a template' )}
                          </Label>
                        </Column>
                        <Column>
                          <BigSelect
                            activeOptionId={ formApi.getValue( 'metadata.templateId' ) }
                            columns={ bigSelectColumnsNumber }
                            onChange={ ( thatTemplateId ) => {
                              handleEditionTemplateIdChange( thatTemplateId, formApi );
                              if ( thatTemplateId ) {
                                this.scrollToElement( '#summary-choice' );
                              }
                            } }
                            boxStyle={ { textAlign: 'center' } }
                            options={ formApi.getValue( 'metadata.templateId' ) ?
                                [ {
                                  id: formApi.getValue( 'metadata.templateId' ),
                                  label: <span>{translate( formApi.getValue( 'metadata.templateId' ) )}<HelpPin>{translate( `Explanation about template ${formApi.getValue( 'metadata.templateId' )}` )}</HelpPin></span>,
                                  iconUrl: editionsIcons[formApi.getValue( 'metadata.templateId' )].white
                                },
                                {
                                  id: undefined,
                                  label: translate( 'reset template' ),
                                  iconUrl: icons.remove.black.svg
                                } ]
                                :
                                getAvailableTemplates( formApi.getValue( 'metadata.type' ), availableTemplates )
                                .map( ( thatTemplate ) => ( {
                                  id: thatTemplate.meta.id,
                                  label: <span>{translate( thatTemplate.meta.id )}<HelpPin>{translate( `Explanation about template ${thatTemplate.meta.id}` )}</HelpPin></span>,
                                  iconUrl: editionsIcons[thatTemplate.meta.id].black
                                } ) ) }
                          />
                        </Column>
                      </Column>
                    }

                    <div id={ 'summary-choice' } />
                    {formApi.getValue( 'metadata.type' ) &&
                      formApi.getValue( 'metadata.templateId' ) &&
                      <SummaryEditor
                        {
                        ...{
                          template: availableTemplates.find( ( tempate ) => tempate.meta.id === formApi.getValue( 'metadata.templateId' ) ),
                          edition,
                          translate,
                          summaryEdited: true,
                          onSummaryChange: handleSummaryChange,
                          noScroll: true,
                        }
                      }
                      />
                    }
                    <Level />
                    {formApi.getValue( 'metadata.type' ) &&
                    <Column>
                      <Column>
                        <Field>
                          <Control>
                            <ExplainedLabel
                              title={ translate( 'Title of the edition' ) }
                              explanation={ translate( 'Explanation about the edition title' ) }
                            />
                            <Text
                              className={ 'input' }
                              type={ 'text' }
                              id={ 'metadata.title' }
                              field={ 'metadata.title' }
                              placeholder={ translate( 'Edition title' ) }
                            />
                          </Control>
                        </Field>
                      </Column>
                    </Column>}
                    {formApi.getValue( 'metadata.type' ) &&
                    <Column>
                      <Column>
                        <Field>
                          <Control>
                            <ExplainedLabel
                              title={ translate( 'Description of the edition' ) }
                              explanation={ translate( 'Explanation about the edition description' ) }
                            />
                            <TextArea
                              className={ 'textarea' }
                              type={ 'text' }
                              id={ 'metadata.description' }
                              field={ 'metadata.description' }
                              placeholder={ translate( 'Edition description' ) }
                            />
                          </Control>
                        </Field>
                      </Column>
                    </Column>}
                    <Level />

                  </StretchedLayoutItem>
                  <StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Column>
                        <Columns>
                          <Column isSize={ 6 }>
                            <Button
                              type={ 'submit' }
                              isFullWidth
                              onClick={ handleFormAPISubmit }
                              isDisabled={ !formApi.getValue( 'metadata.type' ) || !formApi.getValue( 'metadata.templateId' ) }
                              isColor={ 'success' }
                            >
                              {asNewEdition ? translate( 'Create edition' ) : translate( 'Update edition' )}
                            </Button>
                          </Column>
                          <Column isSize={ 6 }>
                            <Button
                              isFullWidth
                              isColor={ 'danger' }
                              onClick={ onCancel }
                            >
                              {translate( 'Cancel' )}
                            </Button>
                          </Column>
                        </Columns>
                      </Column>
                    </StretchedLayoutItem>
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
              </form>
          );
          }
        }

      </Form>
    );
  }
}

EditionForm.contextTypes = {
  t: PropTypes.func,
};

export default EditionForm;
