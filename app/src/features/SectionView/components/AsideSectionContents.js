/**
 * This module provides the contents for the aside column of the editor
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  Field,
  Control,
  Input,
  Dropdown,
  FlexContainer,
  StretchedLayoutItem,
  StretchedLayoutContainer,
  Button
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import ResourcesList from './ResourcesList';
import SortableMiniSectionsList from '../../../components/SortableMiniSectionsList';
import CenteredIcon from '../../../components/CenteredIcon';
import ColorMarker from '../../../components/ColorMarker';

const AsideSectionContents = ( {
  tags = {},
  asideTabCollapsed,
  asideTabMode,
  getResourceTitle,
  handleResourceFilterToggle,
  handleTagsFilterToggle,
  editedResourceId,
  history,
  mainColumnMode,
  onCloseActiveResource,
  onCloseSectionSettings,
  onDeleteResource,
  onDeleteSection,
  onOpenSectionSettings,
  onResourceEditAttempt,
  onSortEnd,
  resourceFilterValues,
  tagsFilterValues,
  resourceOptionsVisible,
  resourceSortValue,
  sectionSortValue,
  resourceTypes,
  searchString,
  sections,
  visibleSections,
  section,
  setEditorFocus,
  setMainColumnMode,
  setResourceOptionsVisible,
  setResourceSortValue,
  setSectionSortValue,
  setResourceSearchStringDebounce,
  handleSectionIndexChange,
  setSectionLevel,
  productionId,
  visibleResources,
  onGoToResource,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );
  if ( asideTabCollapsed ) {
        return null;
      }
      const setOption = ( option, optionDomain, forSection ) => {
        if ( optionDomain === 'filter' ) {
          handleResourceFilterToggle( option );
        }
        if ( optionDomain === 'tags' ) {
          handleTagsFilterToggle( option );
        }
        else if ( optionDomain === 'sort' ) {
          if ( forSection ) {
            setSectionSortValue( option );
          }
 else {
            setResourceSortValue( option );
          }
        }
      };
      const handleResourceSearchChange = ( e ) => setResourceSearchStringDebounce( e.target.value );
      const handleToggleResourcesOptionVisible = () => {
        setResourceOptionsVisible( !resourceOptionsVisible );
      };
      switch ( asideTabMode ) {
        case 'library':

          const handleClickAddItemsToLibrary = () => {
            if ( mainColumnMode === 'edition' ) {
              setEditorFocus( undefined );
            }

            setMainColumnMode( mainColumnMode === 'newresource' ? 'edition' : 'newresource' );
          };
          return (
            <StretchedLayoutContainer
              className={ 'aside-section-column' }
              isFluid
              isAbsolute
            >
              <StretchedLayoutItem>
                <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                  <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                    <Field hasAddons>
                      <Control style={ { flex: 1 } }>
                        <Input
                          value={ searchString }
                          onChange={ handleResourceSearchChange }
                          placeholder={ translate( 'find a resource' ) }
                        />
                        {/*<Input value={resourceSearchString} onChange={e => setResourceSearchString(e.target.value)} placeholder={translate('find a resource')} />*/}
                      </Control>
                      <Control>
                        <Dropdown
                          closeOnChange={ false }
                          menuAlign={ 'right' }
                          isColor={
                            Object.keys( resourceFilterValues ).filter( ( f ) => resourceFilterValues[f] ).length > 0 ||
                            Object.keys( tagsFilterValues ).filter( ( f ) => tagsFilterValues[f] ).length > 0
                            ? 'info' : ''
                          }
                          onToggle={ handleToggleResourcesOptionVisible }
                          onChange={ setOption }
                          isActive={ resourceOptionsVisible }
                          value={ {
                          sort: {
                            value: resourceSortValue,
                          },
                          filter: {
                            value: Object.keys( resourceFilterValues ).filter( ( f ) => resourceFilterValues[f] ),
                          },
                          tags: {
                            value: Object.keys( tagsFilterValues ).filter( ( f ) => tagsFilterValues[f] ),
                          }
                        } }
                          options={ [
                          {
                            label: translate( 'Sort items by' ),
                            id: 'sort',
                            options: [
                              {
                                id: 'edited recently',
                                label: translate( 'edited recently' )
                              },
                              {
                                id: 'title',
                                label: translate( 'title' )
                              },
                            ]
                          },
                          Object.keys( tags ).length ?
                          {
                            label: translate( 'Show items with tags' ),
                            id: 'tags',
                            options:
                              Object.entries( tags )
                              .sort( ( [ key1, tag1 ], [ key2, tag2 ] ) => { /* eslint no-unused-vars : 0 */
                                if ( tag1.name > tag2.name ) {
                                  return 1;
                                }
                                else return -1;
                              } )
                              .map( ( [ key, tag ] ) => ( {
                                id: key,
                                label: (
                                  <span>
                                    <ColorMarker color={ tag.color } />
                                    <span>{tag.name}</span>
                                  </span>
                                )
                              } ) )
                          } : undefined,
                          {
                            label: translate( 'Show ...' ),
                            id: 'filter',
                            options: resourceTypes.map( ( type ) => ( {
                              id: type,
                              label: (
                                <FlexContainer
                                  flexDirection={ 'row' }
                                  alignItems={ 'center' }
                                >
                                  <CenteredIcon
                                    src={ icons[type].black.svg }
                                    style={ { minWidth: '1rem', marginRight: '1rem' } }
                                  />
                                  <span>
                                    {translate( type )}
                                  </span>
                                </FlexContainer>
                              )
                            } ) ),
                          }
                        ].filter( ( d ) => d ) }
                        >
                          {translate( 'Filters' )}
                        </Dropdown>
                      </Control>
                    </Field>
                  </Column>
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem
                isFlex={ 1 }
                isFlowing
              >
                <Column isWrapper>
                  <ResourcesList
                    resources={ visibleResources }
                    onDeleteResource={ onDeleteResource }
                    productionId={ productionId }
                    activeSectionId={ section.id }
                    editedResourceId={ editedResourceId }
                    onGoToResource={ onGoToResource }
                    onCloseSettings={ onCloseActiveResource }
                    onResourceEditAttempt={ onResourceEditAttempt }
                    getResourceTitle={ getResourceTitle }
                    tags={ tags }
                  />
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Column style={ { paddingTop: 0 } }>
                  <Column style={ { paddingTop: 0 } }>
                    <Button
                      isFullWidth
                      style={ { overflow: 'visible' } }
                      onClick={ handleClickAddItemsToLibrary }
                      isColor={ mainColumnMode === 'newresource' ? 'primary' : 'info' }
                    >

                      <span style={ { paddingRight: '1rem' } }>{translate( 'Add items to library' )}</span>
                    </Button>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
        case 'summary':
        default:
          const handleOpenSettings = ( thatSection ) => {
                      setEditorFocus( undefined );
                      if ( mainColumnMode === 'editmetadata' ) {
                       onCloseSectionSettings();
                      }
                      else {
                       onOpenSectionSettings( thatSection.id );
                      }
                    };
          const handleClickNewSection = () => {
                        if ( mainColumnMode === 'edition' ) {
                          setEditorFocus( undefined );
                        }
                        setMainColumnMode( mainColumnMode === 'newsection' ? 'edition' : 'newsection' );
                      };
          return (
            <StretchedLayoutContainer
              isFluid
              isAbsolute
            >
              <StretchedLayoutItem>
                <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                  <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                    <Field hasAddons>
                      <Control style={ { flex: 1 } }>
                        <Input
                          value={ searchString }
                          onChange={ handleResourceSearchChange }
                          placeholder={ translate( 'find a section' ) }
                        />
                        {/*<Input value={resourceSearchString} onChange={e => setResourceSearchString(e.target.value)} placeholder={translate('find a resource')} />*/}
                      </Control>
                      <Control>
                        <Dropdown
                          closeOnChange={ false }
                          menuAlign={ 'right' }
                          isColor={
                            Object.keys( resourceFilterValues ).filter( ( f ) => resourceFilterValues[f] ).length > 0 ||
                            Object.keys( tagsFilterValues ).filter( ( f ) => tagsFilterValues[f] ).length > 0
                            ? 'info' : ''
                          }
                          onToggle={ handleToggleResourcesOptionVisible }
                          onChange={ ( option, optionDomain ) => setOption( option, optionDomain, true ) }
                          isActive={ resourceOptionsVisible }
                          value={ {
                          sort: {
                            value: sectionSortValue,
                          },
                          tags: {
                            value: Object.keys( tagsFilterValues ).filter( ( f ) => tagsFilterValues[f] ),
                          }
                        } }
                          options={ [
                          {
                            label: translate( 'Sort items by' ),
                            id: 'sort',
                            options: [
                              {
                                id: 'summary',
                                label: translate( 'order in production default summary' )
                              },
                              {
                                id: 'edited recently',
                                label: translate( 'edited recently' )
                              },
                              {
                                id: 'title',
                                label: translate( 'title' )
                              },
                            ]
                          },
                          Object.keys( tags ).length ?
                          {
                            label: translate( 'Show items with tags' ),
                            id: 'tags',
                            options:
                              Object.entries( tags )
                              .sort( ( [ key1, tag1 ], [ key2, tag2 ] ) => { /* eslint no-unused-vars : 0 */
                                if ( tag1.name > tag2.name ) {
                                  return 1;
                                }
                                else return -1;
                              } )
                              .map( ( [ key, tag ] ) => ( {
                                id: key,
                                label: (
                                  <span>
                                    <ColorMarker color={ tag.color } />
                                    <span>{tag.name}</span>
                                  </span>
                                )
                              } ) )
                          } : undefined,

                        ].filter( ( d ) => d ) }
                        >
                          {translate( 'Filters' )}
                        </Dropdown>
                      </Control>
                    </Field>
                  </Column>
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem
                isFlex={ 1 }
                isFlowing
              >
                <Column isWrapper>
                  <SortableMiniSectionsList
                    productionId={ productionId }
                    items={ visibleSections }
                    onSortEnd={ onSortEnd }
                    history={ history }
                    allowMove={ !searchString.length && sectionSortValue === 'summary' && !tagsFilterValues.length }
                    activeSectionId={ section.id }
                    setSectionIndex={ handleSectionIndexChange }
                    maxSectionIndex={ sections.length - 1 }
                    onOpenSettings={ handleOpenSettings }
                    onDeleteSection={ onDeleteSection }
                    setSectionLevel={ setSectionLevel }
                    tags={ tags }
                    useDragHandle
                  />
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem >
                <Column style={ { paddingTop: 0 } }>
                  <Column style={ { paddingTop: 0 } }>
                    <Button
                      style={ { overflow: 'visible' } }
                      onClick={ handleClickNewSection }
                      isColor={ 'primary' }
                      isFullWidth
                    >
                      <span style={ { paddingRight: '1rem' } }>{translate( 'New section' )}</span>
                    </Button>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
      }

};

AsideSectionContents.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AsideSectionContents;
