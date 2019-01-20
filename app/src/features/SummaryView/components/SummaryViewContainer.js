/**
 * This module provides a connected component for handling the summary view
 * @module ovide/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as editedProductionDuck from '../../ProductionManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

/**
 * Imports Components
 */
import SummaryViewLayout from './SummaryViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';

/**
 * Imports Assets
 */

@connect(
  ( state ) => ( {
    ...duck.selector( state.summary ),
    ...editedProductionDuck.selector( state.editedProduction ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editedProductionDuck,
      ...sectionsManagementDuck,
      ...duck
    }, dispatch )
  } )
)
class SummaryViewContainer extends Component {

  constructor( props ) {
    super( props );
  }

  componentWillMount = () => {
    const {
      match: {
        params: {
          productionId
        }
      }
    } = this.props;

    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }
  }

  shouldComponentUpdate = () => true;

  goToSection = ( sectionId ) => {
    const {
      editedProduction: {
        id
      }
    } = this.props;
    this.props.history.push( `/productions/${id}/sections/${sectionId}` );
  }

  render() {
    return this.props.editedProduction ?
          (
            <EditionUiWrapper>
              <SummaryViewLayout
                { ...this.props }
                goToSection={ this.goToSection }
              />
            </EditionUiWrapper>
          )
          : null;
  }
}

export default SummaryViewContainer;
