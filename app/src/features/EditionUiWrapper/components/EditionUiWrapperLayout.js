/**
 * This module provides a connected component for displaying edition ui generals
 * @module ovide/features/EditionUi
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Navbar,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import Helmet from 'react-helmet';
import stringify from 'fast-json-stable-stringify';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import downloadFile from '../../../helpers/fileDownloader';
import {
  bundleProjectAsJSON,
  bundleProjectAsHTML,
  bundleProjectAsMarkdown,
} from '../../../helpers/projectBundler';
import {
  abbrevString
} from '../../../helpers/misc';
import { requestAssetData } from '../../../helpers/dataClient';

/**
 * Imports Components
 */
import LanguageToggler from '../../../components/LanguageToggler'; import ExportModal from '../../../components/ExportModal';

/**
 * Imports Assets
 */

const EditionUiWrapperLayout = ( {
  exportModalOpen,
  editedProduction = {},
  sectionId,
  editionId,
  navLocation,
  navbarOpen,
  withLargeHeader,
  actions: {
    setExportModalOpen,
    toggleNavbarOpen,
  },
  children,
  activeSectionTitle = '',
  activeEditionTitle = '',
}, {
  t
} ) => {

  /**
   * Variables definition
   */
  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.EditionUiWrapper' );

  /**
   * Computed variables
   */
  const productionId = editedProduction.id;

  let computedTitle;
  if ( editedProduction && editedProduction.metadata && editedProduction.metadata.title ) {
    computedTitle = abbrevString( editedProduction.metadata.title, 25 );
  }
  else computedTitle = translate( 'Unnamed production' );

  let realActiveSectionTitle;
  if ( activeSectionTitle.length ) {
    realActiveSectionTitle = activeSectionTitle.length > 10 ? `${activeSectionTitle.substr( 0, 10 ) }...` : activeSectionTitle;
  }
  else {
    realActiveSectionTitle = translate( 'Untitled section' );
  }

  let realActiveEditionTitle;
  if ( activeEditionTitle.length ) {
    realActiveEditionTitle = activeEditionTitle.length > 10 ? `${activeEditionTitle.substr( 0, 10 ) }...` : activeEditionTitle;
  }
  else {
    realActiveEditionTitle = translate( 'Untitled edition' );
  }

  /**
   * Callbacks handlers
   */
  const handleExportToFile = ( type ) => {
    // console.log( 'handle export to file', type );
    const title = editedProduction.metadata.title;
    // @todo: handle failure error in UI
    const onRejection = ( e ) => console.error( e );/* eslint no-console : 0 */
    switch ( type ) {
      case 'html':
        bundleProjectAsHTML( { production: editedProduction, requestAssetData } )
          .then( ( HTMLbundle ) => {
            downloadFile( HTMLbundle, 'html', title );
          } )
          .catch( onRejection );
        break;
      case 'json':
        bundleProjectAsJSON( { production: editedProduction, requestAssetData } )
          .then( ( JSONbundle ) => {
            downloadFile( stringify( JSONbundle ), 'json', title );
          } )
          .catch( onRejection );
        break;
      case 'markdown':
        bundleProjectAsMarkdown( { production: editedProduction, requestAssetData } )
          .then( ( markdownBundle ) => {
            downloadFile( markdownBundle, 'md', title );
          } )
          .catch( onRejection );
        break;
      default:
        break;
    }
  };
  const handleOpenExportModal = () => setExportModalOpen( true );
  const handleCloseExportModal = () => setExportModalOpen( false );

  return (
    <StretchedLayoutContainer isAbsolute>
      <Helmet>
        <title>
          {`Ovide | ${computedTitle}`}
        </title>
      </Helmet>
      <Navbar
        brandImage={ require( '../../../sharedAssets/logo.png' ) }
        brandUrl={ '/' }
        isOpen={ navbarOpen === true }
        onToggle={ toggleNavbarOpen }
        style={ { zIndex: 2000 } }
        withLargeHeader={ withLargeHeader }

        locationBreadCrumbs={ [
            {
              href: '/',
              isActive: false,
              content: `${translate( 'Home' )}`,
            },
            {
              href: `/productions/${productionId}`,
              content: computedTitle
              || translate( 'Unnamed production' ),
              isActive: navLocation === 'summary'
            },
          ] }

        menuOptions={ [
            // link to summary view
            {
              href: `/productions/${productionId}`,
              isActive: navLocation === 'summary',
              content: `${translate( 'Contents' )}`,
            },
            navLocation === 'editor' ?
            {
              isActive: true,
              content: `/ ${realActiveSectionTitle}`,
              href: `/productions/${productionId}/sections/${sectionId}`,
            }
            : undefined,
            // link to livrary view
            {
              href: `/productions/${productionId}/library`,
              isActive: navLocation === 'library',
              content: translate( 'Library' ),
            },
            // link to design view
            {
              href: `/productions/${productionId}/editions`,
              isActive: navLocation === 'editions',
              content: translate( 'Editions' ),
            },
            navLocation === 'edition' ?
            {
              isActive: true,
              content: `/ ${realActiveEditionTitle}`,
              href: `/productions/${productionId}/editions/${editionId}`,
            }
            : undefined,
          ].filter( ( d ) => d ) }
        actionOptions={ [ {
            content: (
              <Button
                onClick={ handleOpenExportModal }
                className={ 'button' }
              >
                {translate( 'Export' )}
              </Button>
            )
          },
          {
            content: <LanguageToggler />
          } ] }
      />
      <StretchedLayoutItem
        isFlex={ 1 }
        isFlowing
      >
        {children}
      </StretchedLayoutItem>
      <ExportModal
        isActive={ exportModalOpen }
        onClose={ handleCloseExportModal }
        onChange={ handleExportToFile }
      />
      <ReactTooltip id={ 'tooltip' } />
    </StretchedLayoutContainer>
  );
};

EditionUiWrapperLayout.contextTypes = {
  t: PropTypes.func,
};

export default EditionUiWrapperLayout;
