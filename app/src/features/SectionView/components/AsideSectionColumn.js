/**
 * This module provides the layout for the aside column of the editor
 * @module ovide/features/SectionView
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'react-tooltip';
import { debounce } from 'lodash';
import {
  Column,
  Tab,
  TabLink,
  TabList,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { resourcesSchemas } from '../../../peritextConfig.render';

/**
 * Imports Components
 */
import AsideSectionContents from './AsideSectionContents';
import CenteredIcon from '../../../components/CenteredIcon';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourcesSchemas ).filter( ( t ) => t !== 'section' );

class AsideSectionColumn extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce( this.setResourceSearchString, 500 );
  }

  componentDidMount = () => {
    const { resourceSearchString } = this.props;
    this.setState( {
      searchString: resourceSearchString
    } );
  }

  shouldComponentUpdate = ( nextProps, nextState ) => {
    const changingProps = [
      'asideTabCollapsed',
      'asideTabMode',
      'resourceOptionsVisible',
      'mainColumnMode',
      // 'section',
      'editedResourceId',
      // 'sections',

      'resourceSearchString',
      'resourceFilterValues',
      'tagsFilterValues',
      'resourceSortValue',
      'sectionSortValue'
    ];
    const {
      production: {
        metadata: {
          coverImage: prevCoverImage
        },
        resources: prevResources,
        sectionsOrder: prevSectionsOrder
      }
    } = this.props;
    const {
      production: {
        metadata: {
          coverImage: nextCoverImage
        },
        resources: nextResources,
        sectionsOrder: nextSectionsOrder
      }
    } = nextProps;

    const prevSectionsTitles = this.props.sections.map( ( { resource } ) => resource.metadata.title ).join( '-' );
    const nextSectionsTitles = nextProps.sections.map( ( { resource } ) => resource.metadata.title ).join( '-' );
    return (
      changingProps.find( ( propName ) => this.props[propName] !== nextProps[propName] ) !== undefined
      || prevResources !== nextResources
      || prevSectionsOrder !== nextSectionsOrder
      || prevSectionsTitles !== nextSectionsTitles
      || prevCoverImage !== nextCoverImage
      || this.state.searchString !== nextState.searchString
    );
  }

  setResourceSearchString = ( value ) => this.props.setResourceSearchString( value )

  setResourceSearchStringDebounce = ( value ) => {
    // const {setResourceSearchString} = this.props;
    this.setState( {
      searchString: value
    } );
    this.setResourceSearchString( value );
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      className,
      asideTabCollapsed,
      asideTabMode,
      resourceOptionsVisible,
      mainColumnMode,
      production,

      getResourceTitle,
      sections,
      section,

      editedResourceId,

      setAsideTabCollapsed,
      setAsideTabMode,
      setResourceOptionsVisible,
      setMainColumnMode,
      setSectionLevel,
      setEditorFocus,

      visibleResources,
      visibleSections,
      resourceFilterValues,
      tagsFilterValues,
      setResourceFilterValues,
      setTagsFilterValues,
      resourceSortValue,
      sectionSortValue,
      setResourceSortValue,
      setSectionSortValue,

      onResourceEditAttempt,

      onDeleteResource,
      onSetCoverImage,

      onDeleteSection,
      onOpenSectionSettings,
      onCloseSectionSettings,
      onCloseActiveResource,
      onSortEnd,
      handleSectionIndexChange,
      onGoToResource,
      history,
    } = this.props;
    const { t } = this.context;
    const {
      id: productionId,
    } = production;

    /**
     * Computed variables
     */

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.SectionView' );

    /**
     * Callbacks handlers
     */
    const handleResourceFilterToggle = ( type ) => {
      setResourceFilterValues( {
        ...resourceFilterValues,
        [type]: resourceFilterValues[type] ? false : true
      } );
    };
    const handleTagsFilterToggle = ( type ) => {
      setTagsFilterValues( {
        ...tagsFilterValues,
        [type]: tagsFilterValues[type] ? false : true
      } );
    };
    const handleSetAsideTabSummary = () => {
      setAsideTabMode( 'summary' );
      this.setResourceSearchString( '' );
      setResourceFilterValues( {} );
      setTagsFilterValues( {} );
      setTimeout( () => Tooltip.rebuild() );
    };
    const handleSetAsideTabLibrary = () => {
      setAsideTabMode( 'library' );
      this.setResourceSearchString( '' );
      setResourceFilterValues( {} );
      setTagsFilterValues( {} );
      setTimeout( () => Tooltip.rebuild() );
    };
    const handleToggleAsideTabCollapsed = () => setAsideTabCollapsed( !asideTabCollapsed );

    return (
      <Column
        className={ className }
        isSize={ asideTabCollapsed ? 1 : '1/4' }
      >
        <StretchedLayoutContainer
          isFluid
          isAbsolute
          style={ {
            paddingLeft: asideTabCollapsed ? undefined : 0
          } }
        >
          <StretchedLayoutItem>
            <Column style={ { paddingRight: 0 } }>
              <Tabs
                isBoxed
                isFullWidth
                style={ { overflow: 'hidden' } }
              >
                <Column style={ { paddingRight: 0 } }>
                  <TabList>
                    {
                    !asideTabCollapsed &&
                    'collapse' &&
                    <Tab
                      onClick={ handleSetAsideTabSummary }
                      isActive={ asideTabMode === 'summary' }
                    >
                      <TabLink>
                        <CenteredIcon
                          src={ icons.section.black.svg }
                          isSize={ '32x32' }
                        />
                        {translate( 'Sections' )}
                      </TabLink>
                    </Tab>
                    }
                    {
                    !asideTabCollapsed &&
                    <Tab
                      onClick={ handleSetAsideTabLibrary }
                      isActive={ asideTabMode === 'library' }
                    >
                      <TabLink>
                        <CenteredIcon
                          src={ icons.bib.black.svg }
                          isSize={ '32x32' }
                        />
                        {translate( 'Library' )}
                      </TabLink>
                    </Tab>
                    }
                    <Tab
                      onClick={ handleToggleAsideTabCollapsed }
                      isActive={ asideTabCollapsed }
                      style={ { flex: 0 } }
                    >
                      <TabLink
                        style={ {
                          boxShadow: 'none',
                          transform: asideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease',
                          display: asideTabCollapsed ? 'inline-block' : 'flex',
                          justifyContent: asideTabCollapsed ? undefined : 'flex-end',
                          paddingRight: asideTabCollapsed ? 0 : undefined,
                          textAlign: 'left'
                        } }
                        data-for={ 'tooltip' }
                        data-effect={ 'solid' }
                        data-place={ 'right' }
                        data-tip={ asideTabCollapsed ? translate( 'show summary and library pannels' ) : translate( 'hide summary and library pannels' ) }
                      >
                        ◀
                      </TabLink>
                    </Tab>
                  </TabList>
                </Column>
              </Tabs>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column>
              <AsideSectionContents
                {
                  ...{
                    asideTabCollapsed,
                    asideTabMode,
                    section,
                    editedResourceId,
                    getResourceTitle,
                    handleResourceFilterToggle,
                    tags: production.tags,
                    handleTagsFilterToggle,
                    history,
                    mainColumnMode,
                    onCloseActiveResource,
                    onCloseSectionSettings,
                    onDeleteResource,
                    onDeleteSection,
                    onOpenSectionSettings,
                    onResourceEditAttempt,
                    onSetCoverImage,
                    onSortEnd,
                    resourceFilterValues,
                    tagsFilterValues,
                    resourceOptionsVisible,
                    resourceSortValue,
                    sectionSortValue,
                    setSectionSortValue,
                    resourceTypes,
                    sections,
                    setEditorFocus,
                    setMainColumnMode,
                    setResourceOptionsVisible,
                    setResourceSortValue,
                    handleSectionIndexChange,
                    setSectionLevel,
                    productionId,
                    visibleResources,
                    visibleSections,
                    onGoToResource,
                  }
                }
                setResourceSearchStringDebounce={ this.setResourceSearchStringDebounce }
                searchString={ this.state.searchString }
              />
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }
}

AsideSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideSectionColumn;
