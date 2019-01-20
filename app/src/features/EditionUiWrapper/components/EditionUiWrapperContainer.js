/**
 * This module provides a connected component for handling edition ui generals
 * @module ovide/features/EditionUi
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

/**
 * Imports Project utils
 */
/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as editedProductionDuck from '../../ProductionManager/duck';

/**
 * Imports Components
 */
import EditionUiWrapperLayout from './EditionUiWrapperLayout';

@connect(
  ( state ) => ( {
    lang: state.i18nState && state.i18nState.lang,
    ...duck.selector( state.editionUiWrapper ),
    ...editedProductionDuck.selector( state.editedProduction ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...duck,
    }, dispatch )
  } )
)

class EditionUiWrapperContainer extends Component {

  constructor( props ) {
    super( props );
  }

  getNavLocation = ( path ) => {
    switch ( path ) {
      case '/productions/:productionId/library':
        return 'library';
      case '/productions/:productionId/editions':
        return 'editions';
      case '/productions/:productionId/editions/:editionId':
        return 'edition';
      case '/productions/:productionId/sections/:sectionId':
        return 'editor';
      case '/productions/:productionId/summary':
      case '/productions/:productionId':
        return 'summary';
      default:
        return undefined;
    }
  }

  getActiveSectionTitle = ( production, sectionId ) => production.sections[sectionId].metadata.title;

  getActiveEditionTitle = ( production, editionId ) => production.editions[editionId].metadata.title;

  render() {
    const navLocation = this.getNavLocation( this.props.match.path );
    let activeSectionTitle;
    if ( this.props.match.params.sectionId && this.props.editedProduction ) {
      activeSectionTitle = this.getActiveSectionTitle( this.props.editedProduction, this.props.match.params.sectionId );
    }
    let activeEditionTitle;
    if ( this.props.match.params.editionId && this.props.editedProduction ) {
      activeEditionTitle = this.getActiveEditionTitle( this.props.editedProduction, this.props.match.params.editionId );
    }
    return (
      <EditionUiWrapperLayout
        { ...this.props }
        activeSectionTitle={ activeSectionTitle }
        activeEditionTitle={ activeEditionTitle }
        sectionId={ this.props.match.params.sectionId }
        editionId={ this.props.match.params.editionId }
        navLocation={ navLocation }
      />
    );
  }
}

export default withRouter( EditionUiWrapperContainer );
