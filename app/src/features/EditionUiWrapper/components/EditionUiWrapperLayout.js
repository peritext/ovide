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
  NavbarItem,
  Navbar,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import Helmet from 'react-helmet';
import ReduxToastr from 'react-redux-toastr';
import { Link } from 'react-router-dom';

import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import LanguageToggler from '../../../components/LanguageToggler';

/**
 * Imports Assets
 */

const EditionUiWrapperLayout = ( {
  editedProduction = {},
  sectionId,
  editionId,
  navLocation,
  navbarOpen,
  withLargeHeader,
  actions: {
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
              isActive: navLocation === 'parameters'
            },
          ] }

        menuOptions={ [
            // link to materials view
            {
              href: `/productions/${productionId}`,
              isActive: navLocation === 'materials',
              content: translate( 'Materials' ),
            },
            navLocation === 'editor-section' ?
            {
              isActive: true,
              content: `/ ${realActiveSectionTitle}`,
              href: `/productions/${productionId}/sections/${sectionId}`,
            }
            : undefined,

            navLocation === 'editor-resource' ?
            {
              isActive: true,
              content: `/ ${realActiveSectionTitle}`,
              href: `/productions/${productionId}/resources/${sectionId}`,
            }
            : undefined,
            {
              href: `/productions/${productionId}/glossary`,
              isActive: navLocation === 'glossary',
              content: translate( 'Glossary' ),
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
        actionOptions={ [
          {
              content: (
                <NavbarItem
                  isActive={ navLocation === 'parameters' }
                  to={ `/productions/${productionId}/parameters` }
                  tag={ Link }
                >
                  {translate( 'Parameters' )}
                </NavbarItem>
              )
          },
          {
            content: (
              <Button
                target={ 'blank' }
                rel={ 'noopener no-referer' }
                href={ 'https://framaforms.org/ovide-feedback-form-1584195913' }
                data-for={ 'tooltip' }
                data-tip={ translate( 'report a bug or suggest an improvement' ) }
                data-place={ 'bottom' }
                data-effect={ 'solid' }
              >
                { translate( 'feedbacks' ) }
              </Button>
            )
          },
          {
            content: <LanguageToggler />
          }
        ] }
      />
      <StretchedLayoutItem
        isFlex={ 1 }
        isFlowing
      >
        {children}
      </StretchedLayoutItem>
      <ReactTooltip id={ 'tooltip' } />
      <ReactTooltip id={ 'help-tooltip' } />
      <ReactTooltip id={ 'card-tooltip' } />
      <ReduxToastr
        timeOut={ 5000 }
        newestOnTop={ false }
        position={ 'top-right' }
        transitionIn={ 'fadeIn' }
        transitionOut={ 'fadeOut' }
        closeOnToastrClick
      />
    </StretchedLayoutContainer>
  );
};

EditionUiWrapperLayout.contextTypes = {
  t: PropTypes.func,
};

export default EditionUiWrapperLayout;
