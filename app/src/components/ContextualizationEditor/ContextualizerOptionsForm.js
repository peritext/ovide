import React, { useState, useEffect } from 'react';

import {
  Control,
  Select,
  CodeEditor,
  StretchedLayoutContainer,
} from 'quinoa-design-library/components';

import ExplainedLabel from '../ExplainedLabel';
import StretchedLayoutItem from 'quinoa-design-library/components/StretchedLayoutItem';

const ControlledInput = ( {
  value,
  onChange,
  ...props,
} ) => {
  const [ actualValue, setActualValue ] = useState( value );

  useEffect( () => {
    setActualValue( value );
  }, [ value ] );

  const handleBlur = () => {
    onChange( actualValue );
  };

  const handleChange = ( e ) => {
    setActualValue( e.target.value );
  };

  const handleKeyDown = ( e ) => {
    if ( e.key === 'Enter' ) {
      onChange( actualValue );
    }
  };

  return (
    <input
      value={ actualValue }
      onChange={ handleChange }
      onBlur={ handleBlur }
      onKeyDown={ handleKeyDown }
      { ...props }
    />
  );
};

const ContextualizerOptionsForm = ( {
  translate,
  optionsSchema,
  contextualizer = {},
  onChange,
} ) => {
  const {
    parameters = {}
  } = contextualizer;

  const handleParameterChange = ( key, value ) => {
    const updated = {
      ...parameters,
      [key]: value
    };
    onChange( updated );
  };
  return (
    <div>
      {
        Object.keys( optionsSchema )
        .map( ( key ) => {
          const propertySchema = optionsSchema[key];

          const value = parameters[key];
          const isGhost = value === undefined;

          const renderForm = () => {
            switch ( propertySchema.type ) {
              case 'number':
                if ( propertySchema.uiType === 'time' ) {
                  const totalSeconds = isNaN( +value ) ? 0 : +value;
                  const seconds = totalSeconds % 60;
                  const minutes = ( ( totalSeconds - seconds ) / 60 ) % 60;
                  const hours = ( totalSeconds - minutes * 60 - seconds ) / 3600;
                  const handleHoursChange = ( val ) => {
                    let newValue = val;
                    newValue = +newValue;
                    if ( !isNaN( newValue ) ) {
                      const newTime = newValue * 3600 + minutes * 60 + seconds;
                      handleParameterChange( key, newTime );
                    }
                  };
                  const handleMinutesChange = ( val ) => {
                    let newValue = val;
                    newValue = +newValue;
                    if ( !isNaN( newValue ) ) {
                      const newTime = hours * 3600 + newValue * 60 + seconds;
                      handleParameterChange( key, newTime );
                    }
                  };
                  const handleSecondsChange = ( val ) => {
                    let newValue = val;
                    newValue = +newValue;
                    if ( !isNaN( newValue ) ) {
                      const newTime = hours * 3600 + minutes * 60 + newValue;
                      handleParameterChange( key, newTime );
                    }
                  };
                  return (
                    <StretchedLayoutContainer
                      className={ 'time-input-container' }
                      isDirection={ 'horizontal' }
                    >
                      <StretchedLayoutItem>
                        <ControlledInput
                          className={ 'input' }
                          placeholder={ translate( 'hours' ) }
                          value={ hours }
                          onChange={ handleHoursChange }
                        />
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        {translate( 'hours' )}
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <ControlledInput
                          className={ 'input' }
                          placeholder={ translate( 'minutes' ) }
                          value={ minutes }
                          onChange={ handleMinutesChange }
                        />
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        {translate( 'minutes' )}
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <ControlledInput
                          className={ 'input' }
                          placeholder={ translate( 'seconds' ) }
                          value={ seconds }
                          onChange={ handleSecondsChange }
                        />
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        {translate( 'seconds' )}
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>

                  );
                }
                else {
                  const handleInputNumberChange = ( e ) => {
                    let newValue = e.target.value;
                    newValue = +newValue;
                    if ( !isNaN( newValue ) ) {
                      handleParameterChange( key, newValue );
                    }
                  };
                  return (
                    <input
                      className={ 'input' }
                      placeholder={ translate( key ) }
                      value={ value }
                      onChange={ handleInputNumberChange }
                    />
                  );
                }

              case 'string':
                if ( propertySchema.code ) {
                  const handleCodeChange = ( code ) => {
                    handleParameterChange( key, code );
                  };
                  return (
                    <CodeEditor
                      value={ value || '' }
                      onChange={ handleCodeChange }
                      changeDelay={ 2000 }
                    />
                  );
                }
                const handleInputChange = ( e ) => {
                  const newValue = e.target.value;
                  handleParameterChange( key, newValue );
                };
                return (
                  <input
                    className={ 'input' }
                    placeholder={ translate( key ) }
                    value={ value }
                    onChange={ handleInputChange }
                  />
                );
              case 'boolean':
                const handleSelectChange = ( e ) => {
                  let newValue = e.target.value;
                  newValue = newValue === 'true' ? true : false;
                  handleParameterChange( key, newValue );
                };
                return (
                  <Select
                    value={ value }
                    onChange={ handleSelectChange }
                  >
                    <option value>
                      {translate( 'yes' )}
                    </option>
                    <option value={ false }>
                      {translate( 'no' )}
                    </option>
                  </Select>
                );
              default:
                return null;
            }
          };

          return (
            <Control key={ key }>
              <ExplainedLabel
                title={ translate( key ) }
                explanation={ translate( `Explanation about ${key} parameter for contextualizer ${contextualizer.type}` ) }
              />
              <div
                style={ {
                  opacity: isGhost ? 0.5 : 1
                } }
              >
                {renderForm()}
              </div>
            </Control>
          );
        } )
      }
    </div>
  );
};

export default ContextualizerOptionsForm;
