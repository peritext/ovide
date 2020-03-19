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
  // NavbarItem,
  Navbar,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import Helmet from 'react-helmet';
import ReduxToastr from 'react-redux-toastr';
// import { Link } from 'react-router-dom';

import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { inElectron } from '../../../helpers/electronUtils';
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
  history,
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
    realActiveSectionTitle = activeSectionTitle.length > 30 ? `${activeSectionTitle.substr( 0, 30 ) }...` : activeSectionTitle;
  }
  else {
    realActiveSectionTitle = translate( 'Untitled section' );
  }

  let realActiveEditionTitle;
  if ( activeEditionTitle.length ) {
    realActiveEditionTitle = activeEditionTitle.length > 30 ? `${activeEditionTitle.substr( 0, 30 ) }...` : activeEditionTitle;
  }
  else {
    realActiveEditionTitle = translate( 'Untitled edition' );
  }

  /**
   * Callbacks handlers
   */
  const handleClickPrevious = () => {
    history.goBack();
  };
  const handleClickNext = () => {
    history.goForward();
  };

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
              isActive: navLocation === 'materials'
            },
            /* navLocation === 'materials' || */navLocation === 'editor-section' || navLocation === 'editor-resource' ?
            {
              href: `/productions/${productionId}`,
              isActive: navLocation === 'materials',
              content: translate( 'Materials' ),
            } : undefined,
            navLocation === 'editor-section' ?
            {
              isActive: true,
              content: `${realActiveSectionTitle}`,
              href: `/productions/${productionId}/sections/${sectionId}`,
            }
            : undefined,

            navLocation === 'editor-resource' ?
            {
              isActive: true,
              content: `${realActiveSectionTitle}`,
              href: `/productions/${productionId}/resources/${sectionId}`,
            }
            : undefined,
            navLocation === 'glossary' ?
            {
              href: `/productions/${productionId}/glossary`,
              isActive: true,
              content: translate( 'Glossary' ),
            } : undefined,
            // link to design view
            navLocation === 'editions' || navLocation === 'edition' ?
            {
              href: `/productions/${productionId}/editions`,
              isActive: navLocation === 'editions',
              content: translate( 'Editions' ),
            } : undefined,
            navLocation === 'edition' ?
            {
              isActive: true,
              content: `${realActiveEditionTitle}`,
              href: `/productions/${productionId}/editions/${editionId}`,
            } : undefined,
            navLocation === 'parameters' ?
            {
              isActive: true,
              content: `${translate( 'Parameters' )}`,
              href: `/productions/${productionId}/parameters`,
            } : undefined

          ].filter( ( v ) => v ) }

        menuOptions={ [
          inElectron ?
          {
              href: '',
              content: (
                <div onClick={ ( e ) => {
                  e.preventDefault();
                  e.stopPropagation();
                } }
                >
                  <Button
                    data-for={ 'tooltip' }
                    data-tip={ history.length ? translate( 'previous view' ) : undefined }
                    data-place={ 'bottom' }
                    data-effect={ 'solid' }
                    onClick={ handleClickPrevious }
                    style={ { marginRight: '.5rem' } }
                    isDisabled={ !history.length }
                    isRounded
                  >
                    <i className={ 'fa fa-chevron-left' } />
                  </Button>
                  <Button
                    data-for={ 'tooltip' }
                    data-tip={ !( history.index === history.length - 1 ) ? translate( 'next view' ) : undefined }
                    data-place={ 'bottom' }
                    data-effect={ 'solid' }
                    onClick={ handleClickNext }
                    isDisabled={ history.index === history.length - 1 }
                    isRounded
                  >
                    <i className={ 'fa fa-chevron-right' } />
                  </Button>
                </div>

              )
          } : undefined,
            // link to materials view
            {
              href: `/productions/${productionId}`,
              isActive: navLocation === 'materials' || navLocation === 'editor-section' || navLocation === 'editor-resource',
              content: translate( 'Materials' ),
            },
            {
              href: `/productions/${productionId}/glossary`,
              isActive: navLocation === 'glossary',
              content: translate( 'Glossary' ),
            },
            // link to design view
            {
              href: `/productions/${productionId}/editions`,
              isActive: navLocation === 'editions' || navLocation === 'edition',
              content: translate( 'Editions' ),
            },
            {
              href: `/productions/${productionId}/parameters`,
              isActive: navLocation === 'parameters',
              content: translate( 'Parameters' ),
            },
          ].filter( ( d ) => d ) }
        actionOptions={ [
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
        ].filter( ( i ) => i ) }
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
