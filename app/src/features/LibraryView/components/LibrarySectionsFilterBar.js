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
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.LibraryView' );

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
    </Level>
);
};

LibraryFiltersBar.contextTypes = {
  t: PropTypes.func,
};

export default LibraryFiltersBar;
