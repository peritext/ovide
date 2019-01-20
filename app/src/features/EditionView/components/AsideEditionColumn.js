/**
 * This module provides a layout component for displaying edition view aside column layout
 * @module ovide/features/EditionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Tab,
  TabLink,
  TabList,
  Tabs,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import AsideEditionContents from './AsideEditionContents';

/**
 * Imports Assets
 */

/**
 * Shared variables
 */
// const resourceTypes = Object.keys( resourceSchema.definitions ).filter( ( t ) => t !== 'glossary' );

const AsideEditionColumn = ( {
  editionAsideTabCollapsed,
  editionAsideTabMode,
  production = {},
  edition = {},
  style = {},
  className,
  citationStylesList,
  citationLocalesList,
  setEditionAsideTabCollapsed,
  onCitationStyleChange,
  onCitationLocaleChange,
  setEditionAsideTabMode,
  onEditionChange,
  addItemsToSummaryVisible,
  setAddItemsToSummaryVisible,
  template,
  summaryEdited,
  setSummaryEdited,

}, { t } ) => {

  /**
   * Variables definition
   */
  /*
   * const { settings = {} } = production;
   * const { options = {} } = settings;
   */

  /**
   * Computed variables
   */
  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.EditionView' );

  /**
   * Callbacks handlers
   */
  const handleSetAsideAsSettings = () => setEditionAsideTabMode( 'settings' );
  const handleSetAsideAsSummary = () => setEditionAsideTabMode( 'summary' );
  const handleSetAsideAsStyles = () => setEditionAsideTabMode( 'styles' );
  const handleToggleAsideCollapsed = () => setEditionAsideTabCollapsed( !editionAsideTabCollapsed );

  return (
    <Column
      style={ style }
      className={ className }
      isSize={ editionAsideTabCollapsed ? 1 : '1/4' }
      isWrapper
    >
      <StretchedLayoutContainer
        isDirection={ 'vertical' }
        isAbsolute
        style={ {
            paddingLeft: editionAsideTabCollapsed ? undefined : '1rem'
          } }
      >
        <StretchedLayoutItem>
          <Column>
            <Tabs
              isBoxed
              isFullWidth
              style={ { overflow: 'hidden' } }
            >
              <TabList>
                {
                  !editionAsideTabCollapsed &&
                  <Tab
                    onClick={ handleSetAsideAsSettings }
                    isActive={ editionAsideTabMode === 'settings' }
                  >
                    <TabLink>{translate( 'Settings' )}</TabLink>
                  </Tab>
                }
                {
                  !editionAsideTabCollapsed &&
                  <Tab
                    onClick={ handleSetAsideAsSummary }
                    isActive={ editionAsideTabMode === 'summary' }
                  >
                    <TabLink>{translate( 'Summary' )}</TabLink>
                  </Tab>
                }
                {
                  !editionAsideTabCollapsed &&
                  <Tab
                    onClick={ handleSetAsideAsStyles }
                    isActive={ editionAsideTabMode === 'styles' }
                  >
                    <TabLink>
                      {translate( 'Styles' )}
                    </TabLink>
                  </Tab>
                }
                <Tab
                  className={ 'is-hidden-mobile' }
                  onClick={ handleToggleAsideCollapsed }
                  isActive={ editionAsideTabCollapsed }
                >
                  <TabLink
                    style={ {
                          boxShadow: 'none',
                          transform: editionAsideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease',
                          paddingRight: editionAsideTabCollapsed ? '1rem' : undefined,
                          display: editionAsideTabCollapsed ? 'inline-block' : 'flex',
                          justifyContent: editionAsideTabCollapsed ? undefined : 'flex-end',
                          textAlign: 'left'
                        } }
                    data-for={ 'tooltip' }
                    data-effect={ 'solid' }
                    data-place={ 'right' }
                    data-tip={ editionAsideTabCollapsed ? translate( 'show edition settings pannels' ) : translate( 'hide edition settings pannels' ) }
                  >
                      ◀
                  </TabLink>
                </Tab>
              </TabList>
            </Tabs>
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          isFlex={ 1 }
          isFlowing
          style={ {
            // paddingRight: '5rem',
          } }
        >
          <AsideEditionContents
            {
              ...{
                editionAsideTabCollapsed,
                editionAsideTabMode,
                citationStylesList,
                citationLocalesList,
                onCitationStyleChange,
                onCitationLocaleChange,
                addItemsToSummaryVisible,
                setAddItemsToSummaryVisible,
                edition,
                production,
                onEditionChange,
                template,
                summaryEdited,
                setSummaryEdited,
              }
            }
          />
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

AsideEditionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideEditionColumn;
