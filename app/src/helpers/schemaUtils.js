/**
 * This module provides schema-related utils
 * @module ovide/utils/schemaUtils
 */
import Ajv from 'ajv';
import def from 'json-schema-defaults';

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
