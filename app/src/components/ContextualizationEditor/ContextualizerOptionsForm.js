import React from 'react';

import {
  Control,
  Select,
  CodeEditor,
} from 'quinoa-design-library/components';

import ExplainedLabel from '../ExplainedLabel';

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
