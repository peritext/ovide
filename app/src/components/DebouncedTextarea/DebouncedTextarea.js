import React, { Component } from 'react';
import { debounce } from 'lodash';

export default class DebouncedTextarea extends Component {
  constructor( props ) {
    super( props );
    const delay = props.delay || 500;
    this.state = {
      value: props.value,
      delay,
    };
    this.onChange = debounce( this.onChange, delay );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.value !== nextProps.value ) {
      this.setState( {
        value: nextProps.value
      } );
    }
    if ( this.props.delay !== nextProps.delay ) {
      this.setState( {
        delay: nextProps.delay
      } );
      this.onChange = debounce( this.onChange, nextProps.delay );
    }
  }

  onChange = ( value ) => {
    this.props.onChange( value );
  }

  handleChange = ( e ) => {
    const value = e.target.value;
    this.setState( { value } );
    this.onChange( value );
  }

  render = () => {
    const {
      state: {
        value
      },
      props: {
        placeholder
      },
      handleChange
    } = this;
    return (
      <textarea
        className={ 'textarea' }
        type={ 'text' }
        placeholder={ placeholder }
        value={ value }
        onChange={ handleChange }
      />
    );
  }
}
