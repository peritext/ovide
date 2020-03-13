/**
 * This module provides a form for editing a new or existing resource
 * @module ovide/components/ResourceForm
 */
/* eslint react/no-set-state : 0 */
/* eslint react/jsx-boolean-value : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { csvParse } from 'd3-dsv';
import { Form, NestedField, Text, TextArea } from 'react-form';
import {
  BigSelect,
  Button,
  Column,
  Control,
  Delete,
  Label,
  HelpPin,
  DropZone,
  Field,
  Help,
  Level,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import config from '../../config';
import { translateNameSpacer } from '../../helpers/translateUtils';
import {
  retrieveMediaMetadata,
  retrieveWebpageMetadata,
  loadImage,
  inferMetadata,
  parseBibTeXToCSLJSON,
} from '../../helpers/assetsUtils';
import { getFileAsText } from '../../helpers/fileLoader';
import { base64ToBytesLength } from '../../helpers/misc';
import {
  createDefaultResource,
  validateResource
} from '../../helpers/schemaUtils';
import { requestAssetData } from '../../helpers/dataClient';

/**
 * Imports Components
 */
import AuthorsManager from '../AuthorsManager';
import BibRefsEditor from '../BibRefsEditor';
import AssetPreview from '../AssetPreview';
import SchemaForm from '../SchemaForm';
import ExplainedLabel from '../ExplainedLabel';
import ImageGalleryEditor from '../ImageGalleryEditor';
import GlossaryForm from '../GlossaryForm';
import TagsEditor from '../TagsEditor';

/**
 * Imports Assets
 */
import { resourcesSchemas } from '../../peritextConfig.render';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourcesSchemas ).filter( ( key ) => key !== 'section' );
const { maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );

class DataForm extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  }

  constructor( props ) {
    super( props );
  }

  componentWillReceiveProps( nextProps ) {
    if ( this.props.resource !== nextProps.resource ) {
      nextProps.formApi.setAllValues( { data: nextProps.resource.data } );
    }
  }
  render = () => {

    /**
     * Variables definition
     */
    const {
      resource,
      resourceType,
      asNewResource,
      productionId,
      // existingAssetsIds,
      onAssetChange,
      assets,
      formApi,
      tags,
      createTag,
      updateTag,
      deleteTag,
    } = this.props;
    const { t } = this.context;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.ResourceForm' );
    const loadResourceData = ( type, file ) =>
      new Promise( ( resolve, reject ) => {
        switch ( type ) {
          case 'bib':
            return getFileAsText( file )
              .then( ( text ) => resolve( parseBibTeXToCSLJSON( text ) ) )
              .catch( ( e ) => reject( e ) );
          case 'image':
            return loadImage( file )
              .then( ( base64 ) => resolve( { base64 } ) )
              .catch( ( e ) => reject( e ) );
          case 'table':
            return getFileAsText( file )
              .then( ( text ) => resolve( { json: csvParse( text ) } ) )
              .catch( ( e ) => reject( e ) );
          default:
            return reject();
        }
      } );

    /**
     * Callbacks handlers
     */
    const handleDropBibFiles = ( files ) => {
      formApi.setError( 'maxSize', undefined );
      loadResourceData( resourceType, files[0] )
      .then( ( data ) => {
        const contentLength = JSON.stringify( data ).length;
        if ( contentLength > maxResourceSize ) {
          formApi.setError( 'maxSize', translate( 'File is too large ({s} Mb), please choose one under {m} Mb', { s: Math.floor( contentLength / 1000000 ), m: realMaxFileSize / 1000000 } ) );
        }
        const inferedMetadata = inferMetadata( { ...data, file: files[0] }, resourceType );
        const prevMetadata = formApi.getValue( 'metadata' );
        const metadata = {
          ...prevMetadata,
          ...inferedMetadata,
          title: prevMetadata.title ? prevMetadata.title : inferedMetadata.title
        };
        formApi.setValue( 'metadata', metadata );
        formApi.setValue( 'data', {
          citations: data,
          contents: {
            contents: {},
            notes: {},
            notesOrder: []
          }
        } );

      } )
      .catch( ( e ) => {
        console.error( e );/* no-console: 0*/
      } );
    };
    const handleEditBib = ( value ) => {
      const bibData = parseBibTeXToCSLJSON( value );
      // @todo: citation-js parse fail in silence, wait error handling feature
      if ( bibData.length === 1 ) {
        formApi.setValue( 'data', { citations: bibData } );
        // formApi.setError( 'data', {undefined} );
      }
      else if ( bibData.length > 1 ) {
        formApi.setError( 'data', translate( 'Please enter only one bibtex' ) );
      }
      else formApi.setError( 'data', translate( 'Invalid bibtext resource' ) );
    };

    const handleDataChange = ( data ) => {
      formApi.setValue( 'data', data );
    };

    switch ( resourceType ) {

    case 'glossary':
      return (
        <GlossaryForm
          schema={ resourcesSchemas[resourceType] }
          data={ formApi.getValue( 'data' ) }
          onAssetChange={ onAssetChange }
          translate={ translate }
          onChange={ handleDataChange }
          tags={ tags }
          productionId={ productionId }
          resourceTags={ formApi.getValue( 'metadata.tags' ) }
          onTagsUpdate={ ( theseTags ) => formApi.setValue( 'metadata.tags', theseTags ) }
          createTag={ createTag }
          updateTag={ updateTag }
          deleteTag={ deleteTag }
        />
      );

    case 'image':
      return (
        <ImageGalleryEditor
          schema={ resourcesSchemas[resourceType] }
          data={ formApi.getValue( 'data' ) }
          assets={ assets }
          onAssetChange={ onAssetChange }
          translate={ translate }
          onAfterChange={ handleDataChange }
        />
      );
    case 'bib':
      return (
        <Field>
          <Control>
            <ExplainedLabel
              title={ translate( 'Bib file' ) }
              explanation={ translate( 'Explanation about the bib' ) }
            />
            {
              asNewResource ?
                <DropZone
                  accept={ '.bib,.txt' }
                  onDrop={ handleDropBibFiles }
                >
                  {translate( 'Drop a bib file' )}
                </DropZone> : null
            }
            {
              !asNewResource &&
              <BibRefsEditor
                style={ { minWidth: '10rem' } }
                data={ resource.data.citations }
                onChange={ handleEditBib }
                tags={ tags }
                resourceTags={ formApi.getValue( 'metadata.tags' ) }
                onTagsUpdate={ ( theseTags ) => formApi.setValue( 'metadata.tags', theseTags ) }
                createTag={ createTag }
                updateTag={ updateTag }
                deleteTag={ deleteTag }
                translate={ translate }
              />
            }

          </Control>
          {
            formApi.errors && formApi.errors.data &&
              <Help isColor={ 'danger' }>{formApi.errors.data}</Help>
          }
        </Field>
      );

    case 'webpage':
      const handleWebpageURLChange = ( thatUrl ) => {
        retrieveWebpageMetadata( thatUrl )
          .then( ( metadata ) => {
            Object.keys( metadata )
              .forEach( ( key ) => {
                const existing = formApi.getValue( `metadata.${key}` );
                if ( ( !existing || ( typeof existing === 'string' && !existing.trim().length ) || ( Array.isArray( existing ) && !existing.length ) ) && metadata[key] ) {
                  formApi.setValue( `metadata.${key}`, metadata[key] );
                }
              } );
          } );
      };
      return (
        <div>
          <Field>
            <Control>
              <ExplainedLabel
                title={ translate( 'hyperlink' ) }
                explanation={ translate( 'Explanation about the hyperlink' ) }
              />
              <Text
                className={ 'input' }
                field={ 'url' }
                id={ 'url' }
                type={ 'text' }
                onChange={ handleWebpageURLChange }
                placeholder={ translate( 'http://' ) }
              />
            </Control>
            {
              formApi.errors && formApi.errors.url &&
                <Help isColor={ 'danger' }>{formApi.errors.url}</Help>
            }
          </Field>
        </div>
      );
    case 'video':
        if ( resourcesSchemas[resourceType] ) {
          const wrapDataChange = ( data, b ) => {
            if ( data.mediaUrl !== formApi.getValue( 'data.mediaUrl' ) ) {
              retrieveMediaMetadata( data.mediaUrl )
                .then( ( { metadata } ) => {
                  Object.keys( metadata )
                    .forEach( ( key ) => {
                      const existing = formApi.getValue( `metadata.${key}` );
                      if ( ( !existing || ( typeof existing === 'string' && !existing.trim().length ) || ( Array.isArray( existing ) && !existing.length ) ) && metadata[key] ) {
                        formApi.setValue( `metadata.${key}`, metadata[key] );
                      }
                    } );
                } );
            }
            handleDataChange( data, b );
          };

          return (
            <SchemaForm
              schema={ resourcesSchemas[resourceType] }
              document={ formApi.getValue( 'data' ) }
              omitProps={ [ 'contents' ] }
              assets={ assets }
              onAssetChange={ onAssetChange }
              translate={ translate }
              onAfterChange={ wrapDataChange }
            />
          );
        }
        break;
    default:
      if ( resourcesSchemas[resourceType] ) {
        return (
          <SchemaForm
            schema={ resourcesSchemas[resourceType] }
            document={ formApi.getValue( 'data' ) }
            omitProps={ [ 'contents' ] }
            assets={ assets }
            onAssetChange={ onAssetChange }
            translate={ translate }
            onAfterChange={ handleDataChange }
          />
        );
      }
      return null;
    }
  }
}

class ResourceForm extends Component {

  constructor( props, context ) {
    super( props );
    const resource = props.resource || createDefaultResource();
    const assets = {};
    if ( props.resourceType ) {
      resource.metadata.type = props.resourceType;
    }
    this.state = {
      resource,
      assets,
    };
    this.translate = translateNameSpacer( context.t, 'Components.ResourceForm' );
    this.refreshAssets( props );
  }

  componentDidMount = () => {
    setTimeout( () => {
      if ( this.form ) {
        const inputs = this.form.getElementsByTagName( 'input' );
        if ( inputs && inputs.length ) {
          inputs[0].focus();
        }
        const flowing = this.form.getElementsByClassName( 'is-flowing' );
        if ( flowing && flowing.length ) {
          Array.prototype.forEach.call( flowing, ( el ) => {
            el.scrollTop = 0;
          } );
        }
      }
    } );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.resource !== nextProps.resource ) {
      const resource = nextProps.resource || createDefaultResource();
      if ( nextProps.resourceType ) {
        resource.metadata.type = nextProps.resourceType;
      }
      this.setState( {
        resource,
      } );
    }
    if ( this.props.existingAssets !== nextProps.existingAssets ) {
      this.refreshAssets( nextProps );
    }
  }

  componentWillUnmount = () => {
    const { asNewResource } = this.props;
    if ( !asNewResource ) this.props.onCancel();
  }

  refreshAssets = ( props ) => {
    const {
      productionId,
      existingAssets = []
    } = props;
    existingAssets.reduce( ( cur, asset ) => {
      return cur.then( () => {
        return new Promise( ( resolve, reject ) => {
          // console.log( 'request asset data', productionId, asset );
          requestAssetData( { productionId, asset } )
            .then( ( data ) => {
              // console.log( 'setting asset data', data );
              this.setState( {
                assets: {
                  ...this.state.assets,
                  [asset.id]: {
                    ...asset,
                    data
                  }
                }
              } );
              return resolve();
            } )
            .catch( reject );
        } );
      } );
    }, Promise.resolve() );
  }

  onAssetChange = ( assetId, asset ) => {
    const assets = {
      ...this.state.assets,
      [assetId]: asset,
    };

    this.setState( { assets } );
  }

  render = () => {
    const {
      props: {
        asNewResource = true,
        productionId,
        onCancel,
        onSubmit,
        resourceType,
        showTitle = true,
        bigSelectColumnsNumber = 2,
        onGoToResource,
        allowGoToResource = true,
        tags = {},

        createTag,
        updateTag,
        deleteTag,

        /*
         * existingAssetsIds,
         * existingAssets,
         */
      },
      state: {
        resource = {},
        assets = {},
      },
      translate,
      onAssetChange,
    } = this;

    const handleSubmit = ( candidates ) => {
      if ( candidates.metadata.type === 'embed' ) {
        const { data } = candidates;
        const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        const cleanHtml = data.html.replace( scriptRegex, '' );
        onSubmit( {
          ...candidates,
          data: {
            ...data,
            html: cleanHtml,
          }
        }, assets );
      }
      else {
        onSubmit( candidates, assets );
      }
    };

    const handleResourceTypeChange = ( thatType, formApi ) => {
      if ( thatType === undefined ) {
        //"reset type" case
        formApi.resetAll();
      }
      const defaultResource = createDefaultResource( thatType );
      formApi.setAllValues( defaultResource );
      formApi.setValue( 'metadata.type', thatType );
    };

    const handleSubmitFailure = ( error ) => {
      console.error( error );/* eslint no-console : 0 */
    };

    const errorValidator = ( values ) => {
      if ( values.metadata.type && values.metadata.type !== 'bib' ) {
        const dataSchema = resourcesSchemas[values.metadata.type];
        const dataRequiredValues = dataSchema.required || [];
        return {
          ...dataRequiredValues.reduce( ( result, key ) => ( {
            ...result,
            [key]: values.data[key] ? null : translate( 'this field is required' )
          } ), {
            schemaVal: validateResource( values ).valid ? null : translate( 'resource is not valid' )
          } )
        };
      }
    };

    const bindRef = ( form ) => {
      this.form = form;
    };

    const handleCancel = () => onCancel();

    return (
      <Form
        defaultValues={ resource }
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
                className={ 'is-wrapper' }
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
                              {asNewResource ? translate( `Add ${( resource && resource.metadata.type ) || 'item'} to the library` ) : translate( `Edit ${resource && resource.metadata.type}` )}
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
                  >
                    {
                      asNewResource && !resourceType &&
                      <Column>
                        <BigSelect
                          activeOptionId={ formApi.getValue( 'metadata.type' ) }
                          columns={ bigSelectColumnsNumber }
                          onChange={ ( thatType ) => handleResourceTypeChange( thatType, formApi ) }
                          boxStyle={ { textAlign: 'center' } }
                          options={ formApi.getValue( 'metadata.type' ) ?
                              [ {
                                id: formApi.getValue( 'metadata.type' ),
                                label: translate( formApi.getValue( 'metadata.type' ) ),
                                iconUrl: icons[formApi.getValue( 'metadata.type' )].black.svg
                              },
                              {
                                id: undefined,
                                label: translate( 'reset type' ),
                                iconUrl: icons.remove.black.svg
                              } ]
                              :
                              resourceTypes.map( ( thatType ) => ( {
                                id: thatType,
                                label: translate( thatType ),
                                iconUrl: icons[thatType].black.svg
                              } ) ) }
                        />
                      </Column>
                    }

                    {( ![ 'glossary', 'image', 'webpage' ].includes( formApi.getValue( 'metadata.type' ) ) ) &&
                       !isEmpty( formApi.getValue( 'data' ) ) &&
                                !( formApi.errors && formApi.errors.maxSize ) &&
                                <Column>
                                  <Title isSize={ 5 }>
                                    {translate( 'Preview' )}
                                  </Title>
                                  <AssetPreview
                                    resource={ formApi.values }
                                    productionId={ productionId }
                                    assets={ assets }
                                  />
                                </Column>
                              }
                    {formApi.getValue( 'metadata.type' ) &&
                    <Column>
                      <Column>
                        <NestedField
                          defaultValues={ resource.data }
                          field={ 'data' }
                        >
                          <DataForm
                            asNewResource={ asNewResource }
                            resource={ resource }
                            assets={ assets }
                            onAssetChange={ onAssetChange }
                            resourceType={ resource.metadata.type ? resource.metadata.type : formApi.getValue( 'metadata.type' ) }
                            formApi={ formApi }
                            tags={ tags }
                            createTag={ createTag }
                            updateTag={ updateTag }
                            deleteTag={ deleteTag }
                            productionId={ productionId }
                          />
                        </NestedField>
                        {
                          formApi.errors && formApi.errors.maxSize &&
                            <Help isColor={ 'danger' }>{formApi.errors.maxSize}</Help>
                        }
                      </Column>

                    </Column>
                    }
                    {
                      formApi.getValue( 'metadata.type' ) &&
                      resourcesSchemas[formApi.getValue( 'metadata.type' )].showMetadata &&
                        <Column>
                          <Column>
                            <Field>
                              <Control>
                                <ExplainedLabel
                                  title={ translate( 'Title of the resource' ) }
                                  explanation={ translate( 'Explanation about the resource title' ) }
                                />

                                <Text
                                  className={ 'input' }
                                  type={ 'text' }
                                  id={ 'metadata.title' }
                                  field={ 'metadata.title' }
                                  placeholder={ translate( 'Resource title' ) }
                                />
                              </Control>
                            </Field>
                            <Field>
                              <Control>
                                <ExplainedLabel
                                  title={ translate( 'Source of the resource' ) }
                                  explanation={ translate( 'Explanation about the resource source' ) }
                                />

                                <Text
                                  className={ 'input' }
                                  type={ 'text' }
                                  id={ 'metadata.source' }
                                  field={ 'metadata.source' }
                                  placeholder={ translate( 'Resource source' ) }
                                />
                              </Control>
                            </Field>
                            <Field>
                              <Control>
                                <AuthorsManager
                                  field={ 'metadata.authors' }
                                  id={ 'metadata.authors' }
                                  title={ translate( `Authors of the ${formApi.getValue( 'metadata.type' )}` ) }
                                  titleHelp={ translate( `help about ${formApi.getValue( 'metadata.type' )} authors` ) }
                                  onChange={ ( authors ) => formApi.setValue( 'metadata.authors', authors ) }
                                  authors={ formApi.getValue( 'metadata.authors' ) }
                                />
                              </Control>
                            </Field>
                            <Field>
                              <Control>
                                <ExplainedLabel
                                  title={ translate( 'Date of publication' ) }
                                  explanation={ translate( 'Explanation about the date' ) }
                                />

                                <Text
                                  className={ 'input' }
                                  type={ 'text' }
                                  id={ 'metadata.date' }
                                  field={ 'metadata.date' }
                                  placeholder={ translate( 'Resource date' ) }
                                />
                              </Control>
                            </Field>
                          </Column>

                          <Column>
                            <Field>
                              <Control>
                                <ExplainedLabel
                                  title={ translate( 'Description of the resource' ) }
                                  explanation={ translate( 'Explanation about the resource description' ) }
                                />

                                <TextArea
                                  className={ 'textarea' }
                                  type={ 'text' }
                                  field={ 'metadata.description' }
                                  id={ 'metadata.description' }
                                  placeholder={ translate( 'Resource description' ) }
                                />
                              </Control>
                            </Field>
                          </Column>
                          <Column>
                            <Field>
                              <Control>
                                <Label>
                                  {translate( 'Tags attached to the material' )}
                                  <HelpPin place={ 'right' }>
                                    {translate( 'Explanation about tags' )}
                                  </HelpPin>
                                </Label>
                                <TagsEditor
                                  activeTagsIds={ formApi.getValue( 'metadata.tags' ) }
                                  {
                                    ...{
                                      tags,
                                      createTag,
                                      updateTag,
                                      deleteTag,
                                      productionId,
                                      onUpdateTags: ( theseTags ) => formApi.setValue( 'metadata.tags', theseTags ),
                                    }
                                  }
                                />
                              </Control>
                            </Field>
                          </Column>
                        </Column>
                      }
                    <Level />

                  </StretchedLayoutItem>
                  <StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Column>
                        <StretchedLayoutContainer isDirection={ 'horizontal' }>

                          <StretchedLayoutItem isFlex={ 1 }>
                            <Button
                              type={ 'submit' }
                              isFullWidth
                              onClick={ handleFormAPISubmit }
                              isDisabled={ !formApi.getValue( 'metadata.type' ) || isEmpty( formApi.getValue( 'data' ) ) }
                              isColor={ 'success' }
                            >
                              {asNewResource ? translate( `Add ${formApi.getValue( 'metadata.type' ) || 'item'} to library` ) : translate( `Update ${( resource && resource.metadata.type ) || 'item'}` )}
                            </Button>
                          </StretchedLayoutItem>

                          {
                            !asNewResource && allowGoToResource &&
                            <StretchedLayoutItem isFlex={ 1 }>
                              <Button
                                type={ 'submit' }
                                isFullWidth
                                onClick={ onGoToResource }
                                isDisabled={ !formApi.getValue( 'metadata.type' ) || isEmpty( formApi.getValue( 'data' ) ) }
                                isColor={ 'primary' }
                              >
                                {translate( 'Edit contents' )}
                              </Button>
                            </StretchedLayoutItem>
                          }

                          <StretchedLayoutItem isFlex={ 1 }>
                            <Button
                              isFullWidth
                              isColor={ 'danger' }
                              onClick={ onCancel }
                            >
                              {translate( 'Cancel' )}
                            </Button>
                          </StretchedLayoutItem>

                        </StretchedLayoutContainer>
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

ResourceForm.contextTypes = {
  t: PropTypes.func,
};

export default ResourceForm;
