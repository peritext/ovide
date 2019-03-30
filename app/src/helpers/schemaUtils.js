/**
 * This module provides schema-related utils
 * @module ovide/utils/schemaUtils
 */
import Ajv from 'ajv';
import def from 'json-schema-defaults';
import { v4 as genId } from 'uuid';

import productionSchema from 'peritext-schemas/production';
import resourceSchema from 'peritext-schemas/resource';

const ajv = new Ajv();
ajv.addMetaSchema( require( 'ajv/lib/refs/json-schema-draft-06.json' ) );

const sectionSchema = {
  ...productionSchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'],
  ...productionSchema.definitions,
};

const editionSchema = {
  ...productionSchema.definitions.edition,
};

export const validate = ( schema, data ) => {
  const val = ajv.compile( schema );
  return { valid: val( data ), errors: val.errors };
};

export const validateProduction = ( production ) => validate( productionSchema, production );

export const validateEdition = ( edition ) => validate( editionSchema, edition );

export const validateResource = ( resource ) => {
  let validation = validate( resourceSchema, resource );
  if ( validation.valid ) {
    const dataSchema = resourceSchema.definitions[resource.metadata.type];
    validation = validate( dataSchema, resource.data );
  }
  return validation;
};

export const defaults = ( schema ) => def( schema );

export const createDefaultProduction = () => defaults( productionSchema );

export const createDefaultSection = () => defaults( sectionSchema );

export const createDefaultResource = ( type = 'webpage' ) => {
  const dataSchema = resourceSchema.definitions[type];
  const res = defaults( resourceSchema );
  const data = defaults( dataSchema );
  return {
    ...res,
    data
  };
};

export const createDefaultEdition = () => defaults( editionSchema );

const convertQuinoaAuthors = ( authors = [] ) => authors.map( ( author ) => {
  return {
    given: '',
    family: author,
    role: 'author',
    affiliation: ''
  };
} );
export const convertQuinoaStoryToProduction = ( story ) => {
  const production = defaults( productionSchema );
  const productionMetadata = {
    ...production.metadata,
    title: story.metadata.title,
    subtitle: story.metadata.subtitle,
    description: story.metadata.abstract,
    authors: convertQuinoaAuthors( story.metadata.authors )
  };
  const sections = Object.keys( story.sections ).reduce( ( res, sectionId ) => {
    const section = story.sections[sectionId];
    return {
      ...res,
      [sectionId]: {
        ...section,
        metadata: {
          ...section.metadata,
          authors: section.metadata.authors.map( convertQuinoaStoryToProduction )
        }
      }
    };
  }, {} );
  const assets = {};
  const resources = Object.keys( story.resources ).reduce( ( res, resourceId ) => {
    const resource = story.resources[resourceId];
    const newResource = { ...resource };
    newResource.metadata.authors = convertQuinoaAuthors( resource.metadata.authors );
    let asset;
    let assetId;
    let data;
    if ( newResource.metadata.type === 'video' ) {
      newResource.data = {
        mediaUrl: resource.data.url
      };
    }
 else if ( newResource.metadata.type === 'image' ) {

      /**
       * @todo there is still an issue with images imports which are not displayed
       */
      data = resource.data.base64 || '';
      assetId = genId();
      asset = {
        id: assetId,
        data,
        filename: resource.metadata.fileName,
        mimetype: resource.metadata.mimetype,
      };
      assets[assetId] = asset;

      /*
       * newResource.metadata = {
       *   ...newResource.metadata,
       *   type: 'images'
       * };
       */
      newResource.data = {
        images: [ {
          rgbImageAssetId: assetId,
          caption: ''
        } ]
      };
    }
 else if ( newResource.metadata.type === 'table' ) {
      data = resource.data.json || [];
      assetId = genId();
      asset = {
        id: assetId,
        data,
        filename: resource.metadata.fileName,
        mimetype: resource.metadata.mimetype,
      };
      assets[assetId] = asset;
      newResource.data = {
        dataAssetId: assetId
      };
    }
    return {
      ...res,
      [resourceId]: newResource
    };
  }, {} );
  return {
    ...production,
    id: genId(),
    metadata: productionMetadata,
    sectionsOrder: story.sectionsOrder,
    sections,
    resources,
    contextualizations: story.contextualizations,
    contextualizers: story.contextualizers,
    assets,
  };
};
