/**
 * This module provides a wrapper for converting editor received props
 * into context data for its children
 * @module ovide/components/ContentsEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Imports Components
 */
import ContentsEditor from './ContentsEditor';

export default class ContentsEditorWrapper extends Component {

  static childContextTypes = {
    startExistingResourceConfiguration: PropTypes.func,
    startNewResourceConfiguration: PropTypes.func,
    deleteContextualizationFromId: PropTypes.func,
    renderingMode: PropTypes.string,
    production: PropTypes.object,
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ( {
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
    startNewResourceConfiguration: this.props.startNewResourceConfiguration,
    deleteContextualizationFromId: this.props.deleteContextualizationFromId,
    renderingMode: this.props.renderingMode,
    production: this.props.production,
  } )

  render = () => {
    const {
      props
    } = this;

    return <ContentsEditor { ...props } />;
  }
}
