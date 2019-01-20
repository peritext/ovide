/**
 * This module provides a connected component for handling the design view
 * @module ovide/features/EditionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { uniq } from 'lodash';
import {
  withRouter,
} from 'react-router';

import { toastr } from 'react-redux-toastr';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { getRelatedAssetsIds } from '../../../helpers/assetsUtils';
import { requestAssetData } from '../../../helpers/dataClient';
import { inElectron } from '../../../helpers/electronUtils';
import getConfig from '../../../helpers/getConfig';
let electron;/* eslint no-unused-vars: 0 */
if ( inElectron ) {
  electron = require( 'electron' );
}
import {
  requestEditionDownload,
} from '../../../helpers/dataClient';

const config = getConfig();

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as productionDuck from '../../ProductionManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import EditionViewLayout from './EditionViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';
// import DataUrlProvider from '../../../components/DataUrlProvider';

/**
 * Imports Assets
 */
// import config from '../../../config';
import { contextualizers } from '../../../peritextConfig.render';

@connect(
  ( state ) => ( {
    lang: state.i18nState && state.i18nState.lang,
    ...productionDuck.selector( state.editedProduction ),
    ...duck.selector( state.edition ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...productionDuck,
      ...duck,
    }, dispatch )
  } )
)

class EditionViewContainer extends Component {

  static childContextTypes = {
    production: PropTypes.object,
    googleApiKey: PropTypes.string,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ( {
      production: this.props.editedProduction,
      googleApiKey: config.googleApiKey
  } )

  componentDidMount = () => {
    const productionId = this.props.match.params.productionId;
    if ( !( this.props.editedProduction && this.props.editedProduction.id === productionId ) ) {
      this.props.actions.activateProduction( { productionId } );
    }
    this.props.actions.getCitationStylesList();
    this.props.actions.getCitationLocalesList();
  }

  componentWillReceiveProps = ( nextProps ) => {
    const {
      editedProduction: prevEditedProduction,
      match: {
        params: {
          editionId: prevEditionId
        }
      },
    } = this.props;
    const {
      editedProduction: nextEditedProduction,
      match: {
        params: {
          editionId: nextEditionId
        }
      },
    } = nextProps;
    const prevEdition = prevEditedProduction && prevEditedProduction.editions[prevEditionId];
    const nextEdition = nextEditedProduction && nextEditedProduction.editions[nextEditionId];
    if ( prevEditedProduction !== nextEditedProduction || prevEdition !== nextEdition ) {
      this.updateAssetsData( nextProps, nextEdition );
    }
  }

  componentWillUnmount = () => {
    this.props.actions.resetViewsUi();
  }

  updateAssetsData = ( props, edition = {} ) => {
    const {
      editedProduction: production = {},
      loadedAssets = {},
      actions: {
        setLoadedAsset,
      }
    } = props;
    const {
      contextualizations = {},
      resources = {},
      assets = {},
      sectionsOrder = [],
      id: productionId,
    } = production;
    const {
      data = {}
    } = edition;
    const {
      plan = {}
    } = data;
    if ( plan.type === 'linear' ) {
      const {
        summary = []
      } = plan;

      /**
       * @todo update when sections blocks can be partial
       */
      const sectionsIds = summary.filter( ( block ) => block.type === 'sections' )
                        .reduce( ( totalSections ) => {
                          return totalSections.concat( sectionsOrder );
                        }, [] );

      const relatedResources = uniq(
        sectionsIds.reduce( ( total, sectionId ) =>
          [
            ...total,
            ...Object.keys( contextualizations )
            .filter( ( contId ) => contextualizations[contId].sectionId === sectionId )
            .map( ( contId ) => resources[contextualizations[contId].resourceId] )
          ]
        , [] )
      );

      const assetsIds = uniq(
        relatedResources.reduce( ( total, resource = {} ) => {
          const {
            data: resourceData = {}
          } = resource;
          const relatedAssetsIds = getRelatedAssetsIds( resourceData );
          return [ ...total, ...relatedAssetsIds ];

        }, [] )
      )
      .filter( ( assetId ) => !loadedAssets[assetId] );

      const assetsToLoad = assetsIds.map( ( id ) => assets[id] ).filter( ( a ) => a );

      assetsToLoad.reduce( ( cur, asset ) => {
        return cur.then( () => {
          return new Promise( ( resolve, reject ) => {
            requestAssetData( productionId, asset )
              .then( ( newData ) => {
                const newAsset = {
                  ...asset,
                  data: newData
                };
                setLoadedAsset( newAsset );
                return resolve();
              } )
              .catch( reject );
          } );
        } );
      }, Promise.resolve() );
    }
  }

  downloadEdition = ( generator = {}, locale = {} ) => {
    const {
      props: {
        match: {
          params: {
            editionId
          },
        },
        editedProduction: production,
      },
      context: { t }
    } = this;
    const edition = production.editions[editionId];
    const { id: generatorId } = generator;
    const translate = translateNameSpacer( t, 'Features.EditionView' );

    /**
     * @todo use appropriate locale
     */
    if ( inElectron ) {
       electron.remote.dialog.showSaveDialog( {
         properties: [ 'createDirectory' ],
         title: 'Download edition',
         defaultPath: `${production.metadata.title }.${ generator.outputFormat}`,
       }, ( outputPath ) => {
          toastr.info( translate( 'Bundling the edition for download' ), translate( 'You will be notified when your file is ready.' ) );
          requestEditionDownload( {
            production,
            edition,
            locale,
            outputPath,
            generatorId,
          } )
          .then( () => {
            toastr.success( translate( 'The edition was downloaded successfully' ) );
          } )
          .catch( ( err ) => {
            console.error( 'error during saving !', err );/* eslint no-console: 0 */
            toastr.error( translate( 'An error occured during edition download' ) );
          } );
      } );

    }
    else {
        requestEditionDownload( {
          production,
          edition,
          contextualizers,
          locale,
          generatorId
        } );
    }
  }

  render() {
    const {
      props: {
        match: {
          params: {
            editionId
          },
        },
        editedProduction,
      },
      downloadEdition,
    } = this;
    if ( editedProduction ) {
      const edition = editedProduction.editions[editionId];
      if ( edition ) {
        return (
          <EditionUiWrapper withLargeHeader>
            <EditionViewLayout
              production={ this.props.editedProduction }
              edition={ edition }
              downloadEdition={ downloadEdition }
              { ...this.props }
            />
          </EditionUiWrapper>
        );
      }
    }
    return null;
  }
}

export default withRouter( EditionViewContainer );
