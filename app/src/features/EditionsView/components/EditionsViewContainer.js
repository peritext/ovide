/**
 * This module provides a connected component for handling the library view
 * @module ovide/features/EditionsView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Imports Project utils
 */

/**
 * Import Ducks
 */
import * as duck from '../duck';
import * as editedProductionDuck from '../../ProductionManager/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import EditionsViewLayout from './EditionsViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';
import DataUrlProvider from '../../../components/DataUrlProvider';

/**
 * Imports Assets
 */

/**
 * Shared variables
 */

@connect(
  ( state ) => ( {
    ...duck.selector( state.editions ),
    ...editedProductionDuck.selector( state.editedProduction ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...editedProductionDuck,
      ...errorMessageDuck,
      ...duck
    }, dispatch )
  } )
)
class EditionsViewContainer extends Component {

  static childContextTypes = {
    production: PropTypes.object,
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ({
    production: this.props.editedProduction,
  })

  componentDidMount = () => {
    const productionId = this.props.match.params.productionId;
    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }
  }

  shouldComponentUpdate = () => true;

  /**
   * Leave locked blocks when leaving the view
   */
  componentWillUnmount = () => {
    this.props.actions.resetViewsUi();
  }

  render() {
    const {
      props: {
        editedProduction,
      },
    } = this;
    return editedProduction ?
          (
            <DataUrlProvider
              productionId={ editedProduction.id }
            >
              <EditionUiWrapper>
                <EditionsViewLayout
                  production={ editedProduction }
                  { ...this.props }
                />
              </EditionUiWrapper>
            </DataUrlProvider>
          )
          : null;
  }
}

export default EditionsViewContainer;
