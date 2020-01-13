/* eslint react/no-set-state : 0 */
/**
 * This module generates and manages a form for editing
 * an object according to its json-schema model.
 * The entire form is generated out of the json schema.
 * This component should be kept as generic as possible
 * to preserve UI flexibility regarding data schemas.
 * @module ovide/components/SchemaForm
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import defaults from 'json-schema-defaults';
import DatePicker from 'react-datepicker';
import { SketchPicker as ColorPicker } from 'react-color';
import Textarea from 'react-textarea-autosize';
import Tooltip from 'react-tooltip';

import {
  DropZone,
  CodeEditor,
  Button,
} from 'quinoa-design-library/components';

import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import Ajv from 'ajv';

// import Select from 'react-select';

// import 'react-select/dist/react-select.css';

// import {get, set} from 'dot-prop';
import { get, set } from '../../helpers/dot-prop';

import AssetWidget from '../AssetWidget';
import ExplainedLabel from '../ExplainedLabel';

/*
 * import CodeEditor from '../CodeEditor/CodeEditor';
 * import DropZone from '../DropZone/DropZone';
 */

import './SchemaForm.scss';

const ajv = new Ajv();

const ErrorDisplay = ( { error } ) => (
  <li>
    {error.message}
  </li>
);

/**
 * Generates an edition interface out of a json-schema portion and corresponding object part
 * @param {object} totalSchema - global schema being used to edit object (needed for references to definitions for instance)
 * @param {object} model - locally scoped part of the global schema
 * @param {object} totalObject - total object being edited
 * @param {object|boolean|array|string|number} value - current value being edited
 * @param {number} level - level of nesting of the form
 * @param {string} key - key of the current property being scoped by the form
 * @param {array} path - dotprop path from the total object to the current value
 * @param {onChange} function - callback
 * @param {boolean} required - whether edited property is required
 * @return {ReactMarkup} form - the form part corresponding to form scope
 */
const makeForm = ( totalSchema, model, totalObject, value, level, key, path, onChange, required, translate, assets, onAssetChange, onEditCustomSummary ) => {
  const render = () => {
        let onRadioClick;

        switch ( model.type ) {
          // value is a boolean
          case 'boolean':
            onRadioClick = () => {
              onChange( path, !value );
            };
            return (
              <div onClick={ onRadioClick }>
                <input
                  type={ 'radio' }
                  id={ key }
                  name={ key }
                  value={ key }
                  onChange={ onRadioClick }
                  checked={ value || false }
                />
                <div><div /></div>
                <label htmlFor={ key }>{translate( key )}</label>
              </div>
              );
          // value is a number
          case 'number':
            // ... representing an absolute date time
            if ( key.indexOf( 'date' ) === 0 ) {
              const onDateChange = ( m ) => {
                onChange( path, m.toDate().getTime() );
              };
              return (
                <DatePicker
                  selected={ value ? moment( value ) : moment() }
                  onChange={ onDateChange }
                />
              );
            }
            else if ( model.enum ) {
                if ( model.enum.length > 1 ) {
                  return (
                    <ul style={ { margin: 0, listStyle: 'none' } }>
                      {
                        model.enum.map( ( thatValue ) => {
                          const handleClick = () => {
                            onChange( path, thatValue );
                          };
                          return (
                            <li key={ thatValue }>
                              <Button
                                isColor={ thatValue === value ? 'primary' : '' }
                                onClick={ handleClick }
                                isFullWidth
                              >
                                {translate( thatValue )}
                              </Button>
                            </li>
                          );
                        } )
                      }
                    </ul>
                  );

                  /*
                   * return (
                   *   <Select
                   *     name={ key }
                   *     value={ value }
                   *     onChange={ ( e ) => onChange( path, e.value ) }
                   *     clearable={ false }
                   *     searchable={ false }
                   *     options={
                   *       model.enum.map( ( thatValue ) => ( { value: thatValue, label: translate( thatValue ) } ) )
                   *     }
                   *   /> );
                   */
              }
              // only one value enumerable --> informative
              else {
                return (
                  <p>
                    <span className={ 'tag' }>{value}</span>
                  </p>
                );
              }
            }
            // ... a plain number
            return (
              <input
                className={ 'input' }
                value={ value || '' }
                onChange={ ( e ) => onChange( path, +e.target.value ) }
              />
            );
          // value is an array
          case 'array':
            // ... offering several enumerable options (checkbox)
            if ( model.items && model.items.enum ) {
              const activeValue = value || [];
              return (
                <ul className={ 'items-list checkbox-list' }>
                  {
                    model.items.enum.map( ( item ) => {
                      const checked = activeValue.indexOf( item ) > -1;
                      onRadioClick = ( e ) => {
                        e.stopPropagation();
                        e.preventDefault();
                        let newValue;
                        // uncheck option
                        if ( checked ) {
                          newValue = activeValue.filter( ( val ) => val !== item );
                          onChange( path, newValue );
                        // check option
                        }
                        else {
                          newValue = [ ...activeValue, item ];
                        }
                        onChange( path, newValue );
                      };
                      return (
                        <li
                          key={ item }
                        >
                          <label
                            className={ 'checkbox' }
                            htmlFor={ item }
                            onClick={ onRadioClick }
                          >
                            <input
                              type={ 'checkbox' }
                              id={ item }
                              name={ translate( key ) }
                              value={ item }
                              onChange={ onRadioClick }
                              checked={ checked || false }
                            />
                            <div><div /></div>
                            {translate( item )}
                          </label>
                        </li>
                      );
                    } )
                  }
                </ul>
              );
            }
            // array allowing to manage a list of objects (e.g. authors)
            else {
              const activeValue = ( value && Array.isArray( value ) ) ? value : [];
              const addElement = ( e ) => {
                e.stopPropagation();
                e.preventDefault();
                const newElement = defaults( model.items );
                const newArray = [ ...activeValue, newElement ];
                onChange( path, newArray );
              };
              return (
                <ul className={ 'items-list' }>
                  {
                    activeValue.map( ( element, index ) => {
                      const onDelete = () => {
                        const newArray = [ ...activeValue.slice( 0, index ), ...activeValue.slice( index + 1 ) ];
                        onChange( path, newArray );
                      };
                      const onUp = () => {
                        const newArray = [ ...activeValue.slice( 0, index - 1 ), element, activeValue[index - 1], ...activeValue.slice( index + 1 ) ];
                        onChange( path, newArray );
                      };
                      const onDown = () => {
                        const newArray = [ ...activeValue.slice( 0, index ), activeValue[index + 1], element, ...activeValue.slice( index + 2 ) ];
                        onChange( path, newArray );
                      };
                      return (
                        <li key={ index }>
                          {makeForm(
                          totalSchema,
                          model.items,
                          totalObject,
                          element,
                          level + 1,
                          key,
                          [ ...path, index ],
                          onChange,
                          false,
                          translate,
                          assets,
                          onAssetChange,
                        )}
                          {index > 0 &&
                            <button
                              className={ 'button is-secondary' }
                              onClick={ onUp }
                            >
                              {translate( 'up' )}
                            </button>
                          }
                          {index < value.length - 1 &&
                            <button
                              className={ 'button is-secondary' }
                              onClick={ onDown }
                            >
                              {translate( 'down' )}
                            </button>
                          }
                          <button
                            className={ 'button is-danger' }
                            onClick={ onDelete }
                          >{translate( 'delete' )}
                          </button>
                        </li>
                    );
                    } )
                  }
                  <li className={ 'section' }>
                    <button
                      className={ 'button is-primary is-fullwidth' }
                      onClick={ addElement }
                    >
                      {translate( `Add ${key && key.replace( /s$/, '' )}` )}
                    </button>
                  </li>
                </ul>
              );

            }
          // value is a string ...
          case 'string':
            // pointing to an asset id
            if ( key.indexOf( 'AssetId' ) > -1 ) {

              const handleAssetChange = ( assetId, asset ) => {
                onAssetChange( assetId, asset );
                onChange( path, assetId );
              };
              const handleDelete = () => {
                if ( value ) {
                  onAssetChange( value, undefined );
                }
                onChange( path, undefined );
              };

              return (
                <AssetWidget
                  name={ key }
                  assetId={ value }
                  onChange={ ( val ) => onChange( path, val ) }
                  accept={ model.acceptMimetypes.join( ',' ) }
                  translate={ translate }
                  onDelete={ handleDelete }
                  onAssetChange={ handleAssetChange }
                  assets={ assets }
                />
              );
            }
            else if ( key.indexOf( 'dropfile' ) === key.length - 'dropbox'.length - 1 ) {
              const onDrop = ( files ) => {
                onChange( path, files );
              };
              return (
                <DropZone
                  onDrop={ onDrop }
                >
                  {translate( 'drop-a-file-here' )}
                </DropZone>
              );
            }

            // pointing to a code field
            else if ( key.indexOf( 'Code' ) > -1 || ( key.includes( 'Code' ) && key.indexOf( 'Code' ) === key.length - 'Code'.length - 1 ) ) {
              const mode = key.indexOf( 'css' ) > -1 ? 'css' : 'javascript';
              return (
                <CodeEditor
                  value={ value }
                  mode={ mode }
                  onChange={ ( val ) => onChange( path, val ) }
                />
              );
            }
            // pointing to a color field
            else if ( key.includes( 'Color' ) || key.includes( 'Color' ) ) {
              return (
                <ColorPicker
                  color={ value }
                  onChange={ ( val ) => onChange( path, val.hex ) }
                />
              );
            }
            // value is an enumerable string (select)
            else if ( model.enum ) {
              if ( model.enum.length > 1 ) {
                return (
                  <ul style={ { margin: 0, listStyle: 'none' } }>
                    {
                        model.enum.map( ( thatValue ) => {
                          const handleClick = () => {
                            onChange( path, thatValue );
                          };
                          return (
                            <li key={ thatValue }>
                              <Button
                                isColor={ thatValue === value ? 'primary' : '' }
                                onClick={ handleClick }
                                isFullWidth
                              >
                                {translate( thatValue )}
                              </Button>
                            </li>
                          );
                        } )
                      }
                  </ul>
                  );

                /*
                 * return (
                 *   <Select
                 *     name={ key }
                 *     value={ value }
                 *     onChange={ ( e ) => onChange( path, e.value ) }
                 *     clearable={ false }
                 *     searchable={ false }
                 *     options={
                 *       model.enum.map( ( thatValue ) => ( { value: thatValue, label: translate( thatValue ) } ) )
                 *     }
                 *   /> );
                 */
              }
              // only one value enumerable --> informative
              else {
                return (
                  <p>
                    <span className={ 'tag' }>{value}</span>
                  </p>
                );
              }
            }
            // value is a plain string
            else if ( model.longString ) {
              return (
                <Textarea
                  value={ value }
                  className={ 'textarea' }
                  placeholder={ translate( model.description ) }
                  onChange={ ( e ) => onChange( path, e.target.value ) }
                />
              );
            }
            // else {
            return (
              <input
                value={ value || '' }
                className={ 'input' }
                placeholder={ translate( model.description ) }
                onChange={ ( e ) => onChange( path, e.target.value ) }
              />
            );

            /*
             * }
             * value is an object ...
             */
          case 'object':
            const actualValue = value || {};
            if ( model.uiType ) {
              switch ( model.uiType ) {
                case 'customResourcesSummary':
                case 'customSectionsSummary':
                  const handleClick = ( e ) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onEditCustomSummary(
                      {
                        path,
                        totalObject,
                        value,
                        level,
                        key,
                        summaryType: model.uiType,
                      }
                    );
                  };
                  return (
                    <Button
                      isFullWidth
                      isColor={ 'primary' }
                      onClick={ handleClick }
                    >{translate( 'edit composition' )}
                    </Button>
                  );
                default:
                  return null;
              }
            }
            // value has properties -> nest a new properties manager
            return (
              <div>
                {
                  model.properties &&
                  Object.keys( model.properties )
                  // display only editable properties
                  .filter( ( id ) =>
                    model.properties[id].editable === undefined || model.properties[id].editable === true
                  )
                  // represent a property manager for each property
                  .map( ( thatKey ) => (
                    <div key={ thatKey }>
                      {makeForm(
                        totalSchema,
                        model.properties[thatKey],
                        totalObject,
                        actualValue[thatKey],
                        level + 1,
                        thatKey,
                        [ ...path, thatKey ],
                        onChange,
                        model.required && model.required.indexOf( thatKey ) > -1,
                        translate,
                        assets,
                        onAssetChange,
                        onEditCustomSummary,
                      )}
                    </div>
                  ) )
                }
              </div>
            );
          default:
            // value is a reference to a definition properties set
            if ( model.anyOf && model.anyOfFrom ) {
              const type = get( totalObject, model.anyOfFrom );
              const refs = totalSchema.definitions;
              const subModel = refs[type];
              if ( subModel ) {
                return makeForm(
                  totalSchema,
                  subModel,
                  totalObject,
                  value,
                  level + 1,
                  key,
                  [ ...path ],
                  onChange,
                  false,
                  translate,
                  assets,
                  onAssetChange,
                  onEditCustomSummary
                );
              }
            }
            // default: render as json
            /**
             * @todo : remove this when sure each usecase has been handled
             */
            return ( <pre>{JSON.stringify( model, null, 2 )}</pre> );
        }
      };
  return (
    <div
      style={ { marginLeft: level * 4 } }
      className={ 'schema-item' }
    >
      {( model.title || key ) &&
        <ExplainedLabel
          className={ `title is-${level + 3}` }
          title={
            <span>
              <span>{translate( model.title || key )}</span>
              {required &&
                <span className={ 'tag is-danger' }>
                  {translate( 'required' )}
                </span>
              }
            </span>
          }
          explanation={ translate( `Explanation about ${key}` ) }
        />
      }
      {render()}
    </div>
  );
};

export default class SchemaForm extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired,
  }
  constructor( props ) {
    super( props );

    this.state = {
      document: props.document || defaults( props.schema ),
      assets: props.assets || {},
    };
  }

  componentWillReceiveProps ( nextProps ) {
    if ( this.props.document !== nextProps.document ) {
      this.setState( {
        document: nextProps.document || defaults( this.props.schema ),
        assets: nextProps.assets || {}
      } );
    }

    Tooltip.rebuild();
  }

  onChange = ( path, value ) => {
    const {
      state: {
        document,
        // assets = {},
      },
      props: {
        schema,
        onAfterChange
      }
    } = this;
    const newDocument = set( { ...document }, path.join( '.' ), value );
    let valid = ajv.validate( schema, newDocument );

    this.setState( {
      document: newDocument,
      errors: ajv.errors
    } );
    // upstream hook
    if ( typeof onAfterChange === 'function' ) {
      if ( Promise.resolve( onAfterChange ) == onAfterChange ) { /* eslint eqeqeq : 0 */
        onAfterChange( newDocument, path )
          .then( ( transformedDocument ) => {
            valid = ajv.validate( schema, transformedDocument );
            this.setState( {
              document: transformedDocument,
              errors: valid.errors
            } );
          } )
          .catch( ( error ) => {
            this.setState( {
              errors: [ { message: 'upstream error', error } ]
            } );
          } );
        }
        else {
          onAfterChange( newDocument, path );
        }
    }
  }

  onValidate = ( e ) => {
    if ( e && e.preventDefault ) {
      e.stopPropagation();
      e.preventDefault();
    }
    const {
      state: {
        document
      },
      props: {
        schema,
        onSubmit
      }
    } = this;
    const valid = ajv.validate( schema, document );
    if ( valid ) {
      onSubmit( document );
    }
    else {
      const errors = ajv.errors;
      this.setState( {
        errors
      } );
    }
  }

  render() {
    const {
      state: {
        document,
        errors,
      },
      props: {
        schema: inputSchema,
        assets = {},
        onAssetChange,
        omitProps = [],
        onEditCustomSummary,
        title,
        // onCancel
      },
      context: {
        t,
      },
      onChange,
      // onValidate
    } = this;

    const schema = omitProps.reduce( ( res, propName ) => {
      delete res.properties[propName];
      return res;
    }, inputSchema );

    return (
      <div
        onClick={ ( e ) => e.stopPropagation() }
        className={ 'ovide-SchemaForm' }
      >
        {title && <h1 className={ 'title is-3' }>{title}</h1>}
        {makeForm( schema, schema, document, document, 0, undefined, [], onChange, false, t, assets, onAssetChange, onEditCustomSummary )}
        {errors &&
          <ul>
            {errors.map( ( error, key ) => (
              <ErrorDisplay
                key={ key }
                error={ error }
              />
            ) )}
          </ul>
        }
      </div>
    );
  }
}
