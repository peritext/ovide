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
  Button,
  Field,
  Input,
  Dropdown,
} from 'quinoa-design-library/components';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import ColorMarker from '../../../components/ColorMarker/ColorMarker';

const LibraryFiltersBar = ( {
  filterValues,
  onSearchStringChange,
  onToggleOptionsVisibility,
  optionsVisible,
  searchString,
  onChange,
  statusFilterValue,
  tagsFilterValues,
  sectionsSortValue,
  // translate,
  tags = {},

  onDeleteSelection,
  onDeselectAllVisibleResources,
  onSelectAllVisibleResources,
  onToggleTagSelectionVisibility,
  tagSelectionVisible,
  resourceTypes,
  selectedResourcesIds,
  sortValue,
  statusFilterValues,
  // translate,
  resources,
  visibleResources,
  onBatchUntag,
  onBatchTag,
  searchTagString,
  onSearchTagStringChange,
  onCreateTagFromSearch,
}, { t } ) => {

  const translate = translateNameSpacer( t, 'Features.LibraryView' );

  const handleBatchTag = ( tagId ) => {
    if ( tagId === 'search' || tagId === 'add' ) return;
    const consensual = !selectedResourcesIds.find( ( resourceId ) => {
      const theseTags = ( resources[resourceId] && resources[resourceId].metadata.tags ) || [];
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

  const visibleTags = Object.entries( tags )
  .filter( ( [ key, tag ] ) => { /* eslint no-unused-vars : 0 */
    if ( searchTagString.length > 2 ) {
      return tag.name.toLowerCase().includes( searchTagString.toLowerCase() );
    }
    return true;
  } )
  .sort( ( [ key1, tag1 ], [ key2, tag2 ] ) => { /* eslint no-unused-vars : 0 */
    if ( tag1.name > tag2.name ) {
      return 1;
    }
    else return -1;
  } )
  .map( ( tuple ) => tuple[1] );

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
              sectionsSort: {
                value: sectionsSortValue,
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
              id: 'sectionsSort',
              options: [
                {
                  id: 'summary',
                  label: translate( 'order in production default summary' )
                },
                {
                  id: 'editedRecently',
                  label: translate( 'edited recently' )
                },
                {
                  id: 'title',
                  label: translate( 'title' )
                }
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
              options={ [ {
                label: translate( 'Tag selection with' ),
                id: 'tags',
                options: [
                  {
                    id: 'search',
                    label: (
                      <span>
                        <Input
                          value={ searchTagString }
                          onChange={ onSearchTagStringChange }
                          placeholder={ translate( 'search for a tag' ) }
                        />
                      </span>
                    )
                  },
                  ...visibleTags
                    .map( ( tag ) => ( {
                      id: tag.id,
                      label: (
                        <span>
                          <ColorMarker color={ tag.color } />
                          <span>{tag.name}</span>
                        </span>
                      )
                    } ) ),
                  !visibleTags.length && searchTagString.length > 2 ?
                  {
                    id: 'add',
                    label: (
                      <span>
                        <Button
                          onClick={ onCreateTagFromSearch }
                          isColor={ 'primary' }
                        >
                          {translate( 'Add tag {name}', { name: searchTagString } )}
                        </Button>
                      </span>
                    )

                  } : undefined
                  ].filter( ( o ) => o )
              } ] }
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
