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

import { setLanguage } from 'redux-i18n';

import LandingLayout from './LandingLayout';

import { checkForRedirect } from '../../../helpers/utils';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect( ( state ) => ( {
  lang: state.i18nState.lang,
} ),
( dispatch ) => ( {
  actions: bindActionCreators( {
    setLanguage
  }, dispatch )
} ) )
class LandingContainer extends Component {

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

    startTour: PropTypes.func,
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
  }

  componentWillMount = () => {
    const {
      location,
      history
    } = this.props;
    checkForRedirect( location, history );
  }

  shouldComponentUpdate() {
    return true;
  }

  onStartGuidedTour = () => {
    this.context.startTour();
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const handleStartGuidedTour = this.onStartGuidedTour;
    return (
      <LandingLayout
        { ...this.props }
        onStartGuidedTour={ handleStartGuidedTour }
      />
    );
  }
}

export default LandingContainer;
