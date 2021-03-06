/**
 * This module provides a layout component for displaying the design view
 * @module ovide/features/EditionView
 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  StretchedLayoutContainer,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import {
  bundleEditionAsPrintPack,
  bundleProjectAsHTML,
  bundleProjectAsTEI,
  bundleProjectAsMarkdown
} from '../../../helpers/bundlersUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { inElectron } from '../../../helpers/electronUtils';
import { requestAssetData } from '../../../helpers/dataClient';
import downloadFile from '../../../helpers/fileDownloader';

import { templates, contextualizers, generators } from '../../../peritextConfig.render';

/**
 * Imports Components
 */
import AsideEditionColumn from './AsideEditionColumn';
import MainEditionColumn from './MainEditionColumn';

const EditionViewLayout = ( {
  editionAsideTabMode,
  editionAsideTabCollapsed,
  editedProduction: production = {},
  edition,
  addItemsToSummaryVisible,
  // referenceTypesVisible,

  citationStylesList,
  citationLocalesList,
  summaryEdited,
  lang,
  exportPrefix,
  actions: {
    setEditionAsideTabMode,
    setEditionAsideTabCollapsed,
    updateEdition,
    updateCitationStyle,
    updateCitationLocale,
    setAddItemsToSummaryVisible,
    setSummaryEdited,
    setExportPrefix,
  },

  downloadEdition,

  /*
   * onUpdateCss,
   * onUpdateSettings,
   */
}, {
  t
} ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.EditionView' );

  /**
   * Computed variables
   */
  const productionId = production.id;
  const template = templates.find( ( thatTemplate ) => thatTemplate.meta.id === edition.metadata.templateId );
  const availableGenerators = Object.keys( generators )
  .filter( ( generatorId ) => template.meta.generatorsTypes.includes( generators[generatorId].generatorType ) )
  .filter( ( generatorId ) => {
    let interfaceType;
    if ( inElectron ) {
      interfaceType = 'desktop';
    }
    else {
      interfaceType = 'web';
    }
    return generators[generatorId].interfaceCoverage.includes( interfaceType );
  } )
  .map( ( generatorId ) => generators[generatorId] );

  /**
   * Callbacks handlers
   */
  const onEditionChange = ( thatEdition ) => {
    updateEdition( {
      edition: thatEdition,
      editionId: thatEdition.id,
      productionId,
    } );
  };

  const onCitationStyleChange = ( id, title, thatEdition ) => {
    updateCitationStyle( {
      citationStyleId: id,
      editionId: thatEdition.id,
      title,
      edition: thatEdition,
      productionId,
    } );
  };
  const onCitationLocaleChange = ( id, names, thatEdition ) => {
    updateCitationLocale( {
      citationLocaleId: id,
      editionId: edition.id,
      edition: thatEdition,
      names,
      productionId,
    } );
  };

  const renderingLocale = {
    'Table of contents': translate( 'Table of contents' ),
    'Notes': translate( 'Notes' ),
    'Mentions': translate( 'Mentions' ),
    'mentions': translate( 'mentions' ),
    'mention': translate( 'mention' ),
    'Glossary': translate( 'Glossary' ),
    'References': translate( 'References' ),
    'Source': translate( 'Source' ),
    'More informations': translate( 'More informations' ),
    'Mention context': translate( 'Mention context' ),
    'Go to mention': translate( 'Go to mention' ),
    'Print mentions': translate( 'Print mentions' ),
    'expand contents': translate( 'expand contents' ),
    'Point of view of': translate( 'Point of view of' ),
    'untitled section': translate( 'untitled section' ),
    'Expand contents': translate( 'Expand contents' ),
    'references': translate( 'references' ),
    'events': translate( 'events' ),
    'places': translate( 'places' ),
    'persons': translate( 'persons' ),
    'notions': translate( 'notions' ),

    'event': translate( 'event' ),
    'place': translate( 'place' ),
    'person': translate( 'person' ),
    'notion': translate( 'notion' ),

    'Loading': translate( 'Loading' ),
    'resourcesMap': translate( 'resourcesMap' ),
    'This item is mentionned in': translate( 'This item is mentionned in' ),
    'Browse online': translate( 'Browse online' ),
    'Mentions of the item': translate( 'Mentions of the item' ),
    'Mentions of this item': translate( 'Mentions of this item' ),
    'glossary': translate( 'glossary' ),
    'webpage': translate( 'webpage' ),
    'bib': translate( 'bib' ),
    'video': translate( 'video' ),
    'embed': translate( 'embed' ),
    'table': translate( 'table' ),
    'image': translate( 'image' ),
    'print mentions': translate( 'print mentions' ),
    'See mentions': translate( 'See mentions' ),
    'Mentions about this place': translate( 'Mentions about this place' ),
    'Mentions about an event': translate( 'Mentions about an event' ),
    'Nothing to see here!': translate( 'Nothing to see here!' ),
    'There is not content to display for this URL.': translate( 'There is not content to display for this URL.' ),
    'Glossary list': translate( 'Glossary list' ),
  };

  const handleExportChoice = ( id ) => {
    const onRejection = ( error ) => {
      console.error( error );/* eslint no-console: 0 */
    };
    if ( id === 'print' ) {
      window.frames.preview.focus();
      window.frames.preview.print();
    }
    else if ( id === 'printPack' ) {
      bundleEditionAsPrintPack( {
        production,
        requestAssetData,
        edition,
        lang,
        locale: renderingLocale,
      } );
    }
    else if ( id === 'html' ) {
      bundleProjectAsHTML( {
        production,
        edition,
        requestAssetData
      } )
      .then( ( bundle ) => {
        downloadFile( bundle, 'html', edition.metadata.title );
      } )
      .catch( onRejection );
    }
    else if ( id === 'tei' ) {
      bundleProjectAsTEI( {
        production,
        edition,
        requestAssetData
      } )
      .then( ( bundle ) => {
        downloadFile( bundle, 'xml', edition.metadata.title );
      } )
      .catch( onRejection );
    }
    else if ( id === 'markdown' ) {
      bundleProjectAsMarkdown( {
        production,
        edition,
        requestAssetData
      } )
      .then( ( bundle ) => {
        downloadFile( bundle, 'md', edition.metadata.title );
      } )
      .catch( onRejection );
    }
    else {
          downloadEdition( generators[id], renderingLocale );
        }
      };
  const handleExportPrefixChange = ( e ) => {
    setExportPrefix( e.target.value );
  };

  return (
    <StretchedLayoutContainer
      isDirection={ 'horizontal' }
      isAbsolute
    >
      <AsideEditionColumn
        style={ { minWidth: editionAsideTabCollapsed ? undefined : '30%' } }
        className={ `aside-edition-container ${editionAsideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile` }
        {
            ...{
                production,
                edition,
                template,
                onEditionChange,
                summaryEdited,
                setSummaryEdited,
                citationStylesList,
                availableGenerators,
                citationLocalesList,
                editionAsideTabMode,
                onCitationStyleChange,
                setEditionAsideTabMode,
                onCitationLocaleChange,
                editionAsideTabCollapsed,
                addItemsToSummaryVisible,
                setEditionAsideTabCollapsed,
                setAddItemsToSummaryVisible,
                onExportChoice: handleExportChoice,
                exportPrefix,
                onExportPrefixChange: handleExportPrefixChange,
            }
          }
      />

      <MainEditionColumn
        {
            ...{
              lang,
              production,
              locale: renderingLocale,
              edition,
              template,
              translate,
              contextualizers,
              onEditionChange,
              summaryEdited,
              setSummaryEdited,
            }
          }
      />
    </StretchedLayoutContainer>
  );
};

EditionViewLayout.contextTypes = {
  t: PropTypes.func
};
export default EditionViewLayout;
