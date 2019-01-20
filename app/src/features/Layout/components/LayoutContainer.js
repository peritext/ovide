/* eslint react/no-set-state : 0 */
/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the layout container
 * @module ovide/features/Layout
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { inElectron } from '../../../helpers/electronUtils';

// import { setAllowExamplePrompted } from '../../ChunksEdition/duck';
import { setRgpdAgreementPrompted } from '../../../redux/duck';

import LayoutLayout from './LayoutLayout';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  ( state ) => ( {
    // allowExamplePrompted: state.chunks.ui.allowExamplePrompted,
    rgpdAgreementPrompted: state.data.utils.rgpdAgreementPrompted,
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      // setAllowExamplePrompted,
      setRgpdAgreementPrompted,
    }, dispatch )
  } )
)
class LayoutContainer extends Component {

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
    store: PropTypes.object.isRequired
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
  }

  componentDidMount = () => {
    const rgpdAgreement = localStorage.getItem( 'ovide/rgpd-agreement' );
    if ( !inElectron && !rgpdAgreement ) {
      this.props.actions.setRgpdAgreementPrompted( true );
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <LayoutLayout { ...this.props } />
    );
  }
}

export default LayoutContainer;
