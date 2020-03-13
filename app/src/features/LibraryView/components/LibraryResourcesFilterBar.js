/**
 * This module provides a component for displaying filters and search input in resources list
 * @module ovide/features/LibraryView
 */

/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Level,
  LevelItem,
  LevelLeft,
  LevelRight,
  Field,
  Input,
  Dropdown,
  Button,
  FlexContainer,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import CenteredIcon from '../../../components/CenteredIcon';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import ColorMarker from '../../../components/ColorMarker/ColorMarker';

const LibraryFiltersBar = ( {
  filterValues,
  onDeleteSelection,
  onDeselectAllVisibleResources,
  onSearchStringChange,
  onSelectAllVisibleResources,
  onToggleOptionsVisibility,
  onToggleTagSelectionVisibility,
  optionsVisible,
  tagSelectionVisible,
  resourceTypes,
  searchString,
  selectedResourcesIds,
  onChange,
  sortValue,
  statusFilterValue,
  statusFilterValues,
  tagsFilterValues,
  // translate,
  resources,
  visibleResources,
  onBatchUntag,
  onBatchTag,
  tags = {},
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.LibraryView' );

  const handleBatchTag = ( tagId ) => {
    const consensual = !selectedResourcesIds.find( ( resourceId ) => {
      const theseTags = resources[resourceId].metadata.tags || [];
      return !theseTags.includes( tagId );
    } );
    if ( consensual ) {
      onBatchUntag( {
        tagId,
        resourcesIds: selectedResourcesIds
      } );
    }
 else {
      onBatchTag( {
        tagId,
        resourcesIds: selectedResourcesIds
      } );
    }
  };

  return (
    <Level
      isMobile
      style={ { flexFlow: 'row wrap' } }
    >
      <LevelLeft>
        <Field hasAddons>
          <Input
            value={ searchString }
            onChange={ onSearchStringChange }
            placeholder={ translate( 'Find a resource' ) }
          />
        </Field>
        <LevelItem>
          <Dropdown
            closeOnChange={ false }
            menuAlign={ 'left' }
            onToggle={ onToggleOptionsVisibility }
            onChange={ onChange }
            isActive={ optionsVisible }
            isColor={ Object.keys( filterValues ).filter( ( f ) => filterValues[f] ).length > 0 ? 'info' : '' }
            value={ {
              sort: {
                value: sortValue,
              },
              filter: {
                value: Object.keys( filterValues ).filter( ( f ) => filterValues[f] ),
              },
              status: {
                value: statusFilterValue,
              },
              tags: {
                value: Object.keys( tagsFilterValues ).filter( ( id ) => tagsFilterValues[id] ),
              }
          } }
            options={
            [
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
                {
                  id: 'most mentioned',
                  label: translate( 'most mentioned' )
                }
              ]
            },
            {
              label: translate( 'Show items of type' ),
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
              id: 'status',
              options: statusFilterValues.map( ( type ) => ( {
                id: type.id,
                label: type.label
              } ) ),
            }
          ].filter( ( d ) => d )
        }
          >
            {translate( 'Filters' )}
          </Dropdown>
        </LevelItem>
      </LevelLeft>
      <LevelRight>
        <LevelItem>
          <Button
            onClick={ onSelectAllVisibleResources }
            isDisabled={ selectedResourcesIds.length === visibleResources.length }
          >
            {translate( 'Select all' )} ({visibleResources.length})
          </Button>
        </LevelItem>
        <LevelItem>
          <div
            style={ {
              opacity: selectedResourcesIds.length ? 1 : 0.5,
              pointerEvents: selectedResourcesIds.length ? 'all' : 'none'
            } }
          >
            <Dropdown
              closeOnChange={ false }
              menuAlign={ 'left' }
              onToggle={ onToggleTagSelectionVisibility }
              onChange={ handleBatchTag }
              isActive={ tagSelectionVisible }
              value={ {
                tags: {
                  // set as value only "consensual" tags (all selected resources are tagged)
                  value: Object.keys( tags ).filter( ( tagId ) => {
                    return !selectedResourcesIds.find( ( resourceId ) => {
                      const theseTags = resources[resourceId].metadata.tags || [];
                      return !theseTags.includes( tagId );
                    } );
                  } )
                }
            } }
              options={
              [

              Object.keys( tags ).length ?
              {
                label: translate( 'Tag selection with' ),
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
            ].filter( ( d ) => d )
          }
            >
              {translate( 'Tag selection' )}
            </Dropdown>
          </div>
        </LevelItem>
        <LevelItem>
          <Button
            onClick={ onDeselectAllVisibleResources }
            isDisabled={ selectedResourcesIds.length === 0 }
          >
            {translate( 'Deselect all' )}
          </Button>
        </LevelItem>
        <LevelItem>
          <Button
            isColor={ 'danger' }
            onClick={ onDeleteSelection }
            isDisabled={ selectedResourcesIds.length === 0 }
          >
            {translate( 'Delete selection' )}
          </Button>
        </LevelItem>
      </LevelRight>
    </Level>
);
};

LibraryFiltersBar.contextTypes = {
  t: PropTypes.func,
};

export default LibraryFiltersBar;
