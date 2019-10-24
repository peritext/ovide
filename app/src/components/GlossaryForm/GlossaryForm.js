/* eslint react/prefer-stateless-function : 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  Label,
  Control,
  Select,
} from 'quinoa-design-library/components/';
import { translateNameSpacer } from '../../helpers/translateUtils';

import resourceSchema from 'peritext-schemas/resource';

import LocationPicker from '../LocationPicker';
import DatesPicker from '../DatesPicker';

const glossaryTypes = resourceSchema.definitions.glossary.properties.entryType.enum;

export default class GlossaryForm extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }
  render = () => {
    const {
      props: {
        onChange,
        data = {}
      },
      context: {
        t
      }
    } = this;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.GlossaryForm' );

    /**
     * computed variables
     */
    const {
      name = '',
      description = '',
      entryType = 'person',
      location = {},
      dates = {},
      contents = {
        contents: {},
        notesOrder: [],
        notes: {}
      }
    } = data;
    const defaultData = {
      name,
      description,
      entryType,
      location,
      dates,
      contents
    };

    const handleNewNameChange = ( e ) => onChange( { ...defaultData, name: e.target.value } );
    const handleNewDescriptionChange = ( e ) => onChange( { ...defaultData, description: e.target.value } );
    const handleLocationChange = ( newLocation ) => {
      onChange( { ...defaultData, location: newLocation } );
    };
    const handleDatesChange = ( newDates ) => {
      onChange( {
        ...defaultData,
        dates: {
          ...dates,
          ...newDates
        }
      } );
    };
    const handleNewEntryTypeChange = ( e ) => {
      const newType = e.target.value;
      onChange( { ...defaultData, entryType: newType, location: {}, dates: {} } );
    };

    return (
      <div>
        <Field>
          <Label>{translate( 'Type of the entry' )}</Label>
          <Control>
            <Select
              onChange={ handleNewEntryTypeChange }
              value={ entryType }
            >
              {
              glossaryTypes
              .map( ( type, index ) => {
                return (
                  <option
                    key={ index }
                    id={ type }
                    value={ type }
                  >
                    {translate( type )}
                  </option>
                );
              } )
            }
            </Select>
          </Control>
        </Field>
        {
        entryType === 'place' &&
        <div style={ { marginBottom: '1rem' } }>
          <LocationPicker
            location={ location }
            onChange={ handleLocationChange }
          />
        </div>
      }
        {
        entryType === 'event' &&
        <div style={ { marginBottom: '1rem' } }>
          <DatesPicker
            dates={ dates }
            onChange={ handleDatesChange }
          />
        </div>
      }
        <Field>
          <Label>{translate( 'Name' )}</Label>
          <Control>
            <input
              className={ 'input' }
              placeholder={ translate( 'Glossary name' ) }
              value={ name }
              onChange={ handleNewNameChange }
            />
          </Control>
        </Field>
        <Field>
          <Label>{translate( 'Description of the entry' )}</Label>
          <Control>
            <textarea
              className={ 'textarea' }
              placeholder={ translate( 'Glossary entry' ) }
              value={ description }
              onChange={ handleNewDescriptionChange }
            />
          </Control>
        </Field>
      </div>
    );
  }
}
