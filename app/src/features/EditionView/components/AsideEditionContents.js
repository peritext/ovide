/**
 * This module provides a layout component for displaying edition view aside column contents
 * @module ovide/features/EditionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CodeEditor,
  Column,
  Control,
  Field,
  Label,
  Level,
  Icon,
  Select,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import debounce from 'lodash/debounce';
import Tooltip from 'react-tooltip';
// import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  silentEvent,
} from '../../../helpers/misc';
import productionSchema from 'peritext-schemas/production';
const editionSchema = productionSchema.definitions.edition;

/**
 * Imports Components
 */

import AuthorsManager from '../../../components/AuthorsManager';
import ExplainedLabel from '../../../components/ExplainedLabel';
import DebouncedInput from '../../../components/DebouncedInput';
import DebouncedTextarea from '../../../components/DebouncedTextarea';
import HelpPin from '../../../components/HelpPin';

class AsideEditionContents extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      edition: props.edition
    };
    this.propagateEditionChange = debounce( this.propagateEditionChange, 2000 );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.edition !== nextProps.edition ) {
      this.setState( { edition: nextProps.edition } );
    }
    if ( this.props.editionAsideTabMode !== nextProps.editionAsideTabMode ) {
      setTimeout( () => Tooltip.rebuild() );
    }
  }

  propagateEditionChange = ( edition ) => {
    this.props.onEditionChange( edition );
  }

  handleEditionChange = ( edition ) => {
    this.setState( { edition } );
    this.propagateEditionChange( edition );
  }

  render = () => {
    const {
      props: {
        editionAsideTabCollapsed,
        editionAsideTabMode,
        citationStylesList,
        citationLocalesList,
        summaryEdited,

        onCitationStyleChange,
        onCitationLocaleChange,

        setSummaryEdited,

        availableGenerators,
        onExportChoice: handleExportChoice,

        /*
         * production,
         * edition = {},
         */
        template,
        // onEditionChange: handleEditionChange,
      },
      state: {
        edition = {},
      },
      context: { t },
      handleEditionChange,
    } = this;
    const {
      data = {}
    } = edition;
    const {
      style = {
        mode: 'replace',
        css: ''
      },
      additionalHTML = '',
      citationLocale,
      citationStyle,
      publicationTitle,
      publicationSubtitle,
      publicationDate,
      publicationAuthors = [],
      allowAnnotation = false,
      plan = {},
      bibType,
    } = data;
    const {
      summary = []
    } = plan;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.EditionView' );

    /**
     * Computed variables
     */

    /**
     * Callbacks handlers
     */
    const handleCssModeChange = ( e ) => {
      silentEvent( e );
      handleEditionChange( {
        ...edition,
        data: {
          ...data,
          style: {
            ...style,
            mode: e.target.value
          }
        }
      } );
    };
    const handleCssUpdate = ( css ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...data,
          style: {
            ...style,
            css,
          }
        }
      } );
    };
    const handleAdditionalHTMLChange = ( html ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...data,
          additionalHTML: html
        }
      } );
    };
    const handleTitleChange = ( title ) => {
      handleEditionChange( {
        ...edition,
        metadata: {
          ...edition.metadata,
          title
        }
      } );
    };
    const handleDescriptionChange = ( description ) => {
      handleEditionChange( {
        ...edition,
        metadata: {
          ...edition.metadata,
          description
        }
      } );
    };
    const handleBibTypeChange = ( e ) => {
      const newBibType = e.target.value;
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          bibType: newBibType
        }
      } );
    };

    const handlePublicationTitleChange = ( newPublicationTitle ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          publicationTitle: newPublicationTitle
        }
      } );
    };
    const handlePublicationDateChange = ( newPublicationDate ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          publicationDate: newPublicationDate
        }
      } );
    };
    const handlePublicationAuthorsChange = ( newAuthors ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          publicationAuthors: newAuthors
        }
      } );
    };
    const handlePublicationSubtitleChange = ( newPublicationTitle ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          publicationSubtitle: newPublicationTitle
        }
      } );
    };
    const handleAllowAnnotationChange = ( newAllowAnnotation ) => {
      handleEditionChange( {
        ...edition,
        data: {
          ...edition.data,
          allowAnnotation: newAllowAnnotation
        }
      } );
    };

    const handleLoadTemplateCss = () => {
      const newCss = `${style.css }\n${ ( template && template.css ) || ''}`;
      handleCssUpdate( newCss );
    };
    const handleCitationStyleChange = ( e ) => {
      const id = e.target.value;
      const title = citationStylesList.find( ( c ) => c.id === id ).title;
      onCitationStyleChange( id, title, edition );
    };
    const handleCitationLocaleChange = ( e ) => {
      const id = e.target.value;
      const names = citationLocalesList.find( ( c ) => c.id === id ).names;
      onCitationLocaleChange( id, names, edition );
    };

    const handleToggleSummaryEdited = () => {
      setSummaryEdited( !summaryEdited );
    };

    if ( editionAsideTabCollapsed ) {
        return null;
    }
    switch ( editionAsideTabMode ) {
        case 'settings':
          return (
            <Column>
              <Level>
                <Button
                  onClick={ handleToggleSummaryEdited }
                  isColor={ summaryEdited ? 'primary' : 'primary' }
                  isFullWidth
                >
                  {summaryEdited ? translate( 'Close summary edition' ) : translate( 'Edit summary' )}
                </Button>
              </Level>
              <Label>
                {translate( 'Current summary' )}
              </Label>
              <ol style={ { marginLeft: '1rem', marginBottom: '1rem' } }>
                {
                      summary.map( ( summaryBlock, index ) => (
                        <li key={ index }>
                          {
                            summaryBlock.data && summaryBlock.data.customTitle && summaryBlock.data.customTitle.length ?
                            `${summaryBlock.data.customTitle} (${translate( summaryBlock.type )})`
                            : translate( summaryBlock.type )
                          }
                        </li>
                      ) )
                    }
              </ol>
              
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Edition title' ) }
                    explanation={ translate( 'Explanation about the edition title' ) }
                  />
                  <DebouncedInput
                    className={ 'input' }
                    type={ 'text' }
                    placeholder={ translate( 'Edition title' ) }
                    value={ edition.metadata.title }
                    onChange={ handleTitleChange }
                  />
                </Control>
              </Field>
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Edition description' ) }
                    explanation={ translate( 'Explanation about the edition description' ) }
                  />
                  <DebouncedTextarea
                    className={ 'textarea' }
                    type={ 'text' }
                    placeholder={ translate( 'Edition description' ) }
                    value={ edition.metadata.description }
                    onChange={ handleDescriptionChange }
                  />
                </Control>
              </Field>

              <Level>
                <Column>
                  <Field>
                    <Control>
                      <ExplainedLabel
                        title={ translate( 'Publication title' ) }
                        explanation={ translate( 'Explanation about the publication title' ) }
                      />
                      <DebouncedInput
                        className={ 'textarea' }
                        type={ 'text' }
                        placeholder={ translate( 'Publication title' ) }
                        value={ publicationTitle }
                        onChange={ handlePublicationTitleChange }
                      />
                    </Control>
                  </Field>
                </Column>
              </Level>
              <Level>
                <Column>
                  <Field>
                    <Control>
                      <ExplainedLabel
                        title={ translate( 'Publication subtitle' ) }
                        explanation={ translate( 'Explanation about the publication subtitle' ) }
                      />
                      <DebouncedInput
                        className={ 'textarea' }
                        type={ 'text' }
                        placeholder={ translate( 'Publication subtitle' ) }
                        value={ publicationSubtitle }
                        onChange={ handlePublicationSubtitleChange }
                      />
                    </Control>
                  </Field>
                </Column>
              </Level>

              <Level>
                <Column>
                  <Field>
                    <Control>
                      <ExplainedLabel
                        title={ translate( 'Publication date' ) }
                        explanation={ translate( 'Explanation about the publication date' ) }
                      />
                      <DebouncedInput
                        className={ 'textarea' }
                        type={ 'text' }
                        placeholder={ translate( 'Publication date' ) }
                        value={ publicationDate }
                        onChange={ handlePublicationDateChange }
                      />
                    </Control>
                  </Field>
                </Column>
              </Level>

              <Level>
                <Column>
                  <Field>
                    <Control>
                      <ExplainedLabel
                        title={ translate( 'Publication custom authors' ) }
                        explanation={ translate( 'Explanation about the publication custom authors' ) }
                      />
                      <AuthorsManager
                        onChange={ handlePublicationAuthorsChange }
                        authors={ publicationAuthors }
                      />
                    </Control>
                  </Field>
                </Column>
              </Level>

              {template.meta.options.allowAnnotation &&
              <Level>
                <Column>
                  <Field>
                    <Control>
                      <ExplainedLabel
                        title={ translate( 'Allow annotation' ) }
                        explanation={ translate( 'Explanation about allow annotation' ) }
                      />
                      <StretchedLayoutContainer isDirection={ 'horizontal' }>
                        <StretchedLayoutItem>
                          <Button
                            onClick={ () => handleAllowAnnotationChange( true ) }

                            isColor={ allowAnnotation ? 'primary' : 'info' }
                            style={ { cursor: allowAnnotation ? 'default' : 'pointer' } }
                          >
                            {translate( 'allow annotation' )}
                          </Button>
                        </StretchedLayoutItem>
                        <StretchedLayoutItem>
                          <Button
                            onClick={ () => handleAllowAnnotationChange( false ) }

                            style={ { cursor: !allowAnnotation ? 'default' : 'pointer' } }
                            isColor={ !allowAnnotation ? 'primary' : 'info' }
                          >
                            {translate( 'do not allow annotation' )}
                          </Button>
                        </StretchedLayoutItem>
                      </StretchedLayoutContainer>

                    </Control>
                  </Field>
                </Column>
              </Level>
              }

              <Level>
                <Column style={ { maxWidth: '100%' } }>
                  <form>
                    <Field>
                      <ExplainedLabel
                        title={ translate( 'Citation style' ) }
                        explanation={ translate( 'Explanation about citation style' ) }
                      />
                      <Control>
                        <Select
                          onChange={ handleCitationStyleChange }
                          value={ citationStyle.id }
                        >
                          {
                            citationStylesList.map( ( thatCitationStyle ) => {
                              return (
                                <option
                                  key={ thatCitationStyle.id }
                                  value={ thatCitationStyle.id }
                                >
                                  {thatCitationStyle.title}
                                </option>
                              );
                            } )
                          }
                        </Select>
                      </Control>
                    </Field>
                  </form>
                </Column>
              </Level>

              <Level>
                <Column>
                  <form>
                    <Field>
                      <ExplainedLabel
                        title={ translate( 'Citation locale' ) }
                        explanation={ translate( 'Explanation about citation locale' ) }
                      />
                      <Control>
                        <Select
                          onChange={ handleCitationLocaleChange }
                          value={ citationLocale.id }
                        >
                          {
                            citationLocalesList.map( ( thatCitationLocale ) => {
                              return (
                                <option
                                  key={ thatCitationLocale.id }
                                  value={ thatCitationLocale.id }
                                >
                                  {thatCitationLocale.names[1]}
                                </option>
                              );
                            } )
                          }
                        </Select>
                      </Control>
                    </Field>
                  </form>
                </Column>
              </Level>

              <Level>
                <Column style={ { maxWidth: '100%' } }>
                  <form>
                    <Field>
                      <ExplainedLabel
                        title={ translate( 'Bibliographic metadata type' ) }
                        explanation={ translate( 'Explanation about bibliographic metadata type' ) }
                      />
                      <Control>
                        <Select
                          onChange={ handleBibTypeChange }
                          value={ bibType }
                        >
                          {
                            editionSchema.properties.data.properties.bibType.enum.map( ( thatBibType ) => {
                              return (
                                <option
                                  key={ thatBibType }
                                  value={ thatBibType }
                                >
                                  {translate( thatBibType )}
                                </option>
                              );
                            } )
                          }
                        </Select>
                      </Control>
                    </Field>
                  </form>
                </Column>
              </Level>
            </Column>
          );
        case 'exports':
          return (
            <Column>
              <StretchedLayoutContainer
                style={ { paddingBottom: '2rem' } }
                isDirection={ 'vertical' }
              >
                {
                    [
                      ...availableGenerators
                      .map( ( generator ) => ( {
                        id: generator.id,
                        title: translate( `download as ${generator.id}` ),
                        explanation: translate( `explanation about ${generator.id} download` ),
                        icon: 'fa-download'
                      } ) ),
                      edition.metadata.type === 'paged' ?
                      {
                        id: 'print',
                        title: translate( 'print or save this view' ),
                        explanation: translate( 'explanation about print or save this view' ),
                        icon: 'fa-print'
                      } : undefined
                    ]
                    .filter( ( o ) => o )
                    .map( ( option, index ) => {
                      return (
                        <StretchedLayoutItem key={ index }>
                          <Column>
                            <Button
                              onClick={ () => handleExportChoice( option.id ) }
                              isFullWidth
                            >
                              <Icon
                                isSize={ 'small' }
                                isAlign={ 'left' }
                                className={ `fa ${option.icon}` }
                              />
                              <span style={ { marginRight: '.5rem' } }>{ option.title }</span>
                              <HelpPin>
                                {option.explanation}
                              </HelpPin>
                            </Button>
                          </Column>
                        </StretchedLayoutItem>
                        );
                    } )
                  }
                {/* <StretchedLayoutItem isFlex={ 1 }>
                    <Column>
                      <BigSelect
                        activeOptionId={ undefined }
                        onChange={ ( id ) => downloadEdition( generators[id], renderingLocale ) }
                        boxStyle={ { minHeight: '12rem', textAlign: 'center' } }
                        options={
                          [
                            ...availableGenerators.map( ( generator ) => ( {
                              id: generator.id,
                              label: (
                                <ExplainedLabel
                                  title={ translate( `download as ${generator.id}` ) }
                                  explanation={ translate( `explanation about ${generator.id} download` ) }
                                />
                              ),
                              iconUrl: icons.takeAway.black.svg
                            } ) )
                          ]
                      }
                      />
                    </Column>
                  </StretchedLayoutItem> */}
              </StretchedLayoutContainer>
            </Column>
          );
        case 'styles':
        default:
          return (
            <Column>
              <Level>
                <Column>
                  <form>
                    <Field>
                      <Label>{translate( 'Styles customization mode' )}</Label>
                      <Control>
                        <Select
                          onChange={ handleCssModeChange }
                          value={ style.mode }
                        >
                          <option value={ 'merge' } >{translate( 'add to template styles' )}</option>
                          <option value={ 'replace' }>{translate( 'replace styles' )}</option>
                        </Select>
                      </Control>
                    </Field>
                  </form>
                </Column>
              </Level>
              <Level>
                <CodeEditor
                  value={ style.css }
                  onChange={ handleCssUpdate }
                />
              </Level>
              {
                style.mode === 'replace' &&
                  <Level>
                    <Button onClick={ handleLoadTemplateCss }>
                      {translate( 'load template css' )}
                    </Button>
                  </Level>
              }
              <Level>
                <ExplainedLabel
                  title={ translate( 'Additional document-level HTML code' ) }
                  explanation={ translate( 'Explanation about additional document-level HTML code' ) }
                />
              </Level>
              <Level>
                <CodeEditor
                  value={ additionalHTML }
                  onChange={ handleAdditionalHTMLChange }
                />
              </Level>

            </Column>
          );
      }
  }
}

AsideEditionContents.contextTypes = {
  t: PropTypes.func,
};

export default AsideEditionContents;
