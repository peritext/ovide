/* eslint react/no-set-state : 0 */
/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the layout container
 * @module ovide/features/Layout
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { withRouter } from 'react-router';

import { setLanguage } from 'redux-i18n';

// import { setAllowExamplePrompted } from '../../features/ChunksEdition/duck';

import NavLayout from './NavLayout';

@withRouter

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect( ( state ) => ( {
  lang: state.i18nState.lang,
  // allowExamplePrompted: state.chunks.ui.allowExamplePrompted,
} ),
( dispatch ) => ( {
  actions: bindActionCreators( {
    setLanguage,
    // setAllowExamplePrompted,
  }, dispatch )
} ) )
class NavContainer extends Component {

  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,

    /**
     * Redux store
     */
    store: PropTypes.object.isRequired,
    currentGuidedTourView: PropTypes.string,
    startTour: PropTypes.func,
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
    this.state = {
      isOpen: false
    };
  }

  shouldComponentUpdate() {
    return true;
  }

  toggleOpen = () => {
    this.setState( {
      isOpen: !this.state.isOpen
    } );
  }

  startGuidedTour = () => {
    const {
      currentGuidedTourView,
      startTour,
    } = this.context;
    startTour( { view: currentGuidedTourView } );
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <NavLayout
        { ...this.props }
        startGuidedTour={ this.startGuidedTour }
        isOpen={ this.state.isOpen }
        toggleOpen={ this.toggleOpen }
      />
    );
  }
}

export default NavContainer;
