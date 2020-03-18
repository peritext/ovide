/**
 * This module provides a component for displaying filters and search input in resources list
 * @module ovide/features/GlossaryView
 */

/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Level,
  HelpPin,
  Column,
  Input,
  Dropdown,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components';
import { translateNameSpacer } from '../../../helpers/translateUtils';

import { resourcesSchemas } from '../../../peritextConfig.render';
import ColorMarker from '../../../components/ColorMarker/ColorMarker';

const glossaryTypes = resourcesSchemas.glossary.properties.entryType.enum;

const GlossaryFiltersBar = ( {
  filterValues,
  onSearchStringChange,
  onToggleOptionsVisibility,
  optionsVisible,
  searchString,
  onChange,
  sortValue,
  statusFilterValue,
  tagsFilterValues,
  glossaryFilterValues,
  statusFilterValues,
  getIcon,
  tags = {},
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.GlossaryView' );
  return (
    <Level
      isMobile
      style={ { flexFlow: 'row wrap' } }
    >
      <Title
        style={ { paddingLeft: '1rem', paddingTop: '.5rem' } }
        isSize={ 5 }
      >
        {translate( 'Production glossary entries' )}
        <HelpPin>
          {translate( 'This view allows you to manage your glossary entries and to handle where to mention them in your sections contents' )}
        </HelpPin>
      </Title>
      <StretchedLayoutContainer
        style={ { width: '100%' } }
        isDirection={ 'horizontal' }
      >
        <StretchedLayoutItem isFlex={ 1 }>
          <Column>
            <Input
              value={ searchString }
              onChange={ onSearchStringChange }
              placeholder={ translate( 'Find a resource' ) }
            />
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <Column>
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
            glossaryType: {
              value: Object.keys( glossaryFilterValues ).filter( ( f ) => glossaryFilterValues[f] ),
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
               label: translate( 'Show types' ),
               id: 'glossaryType',
               options: glossaryTypes.map( ( type ) => ( {
                 id: type,
                 label: (
                   <span>
                     <i
                       style={ { marginRight: '.5rem' } }
                       className={ `fa fa-${getIcon( type )}` }
                     />
                     { translate( type ) }
                   </span>
                 )
               } ) ),
            },
            Object.keys( tags ).length ?
            {
              label: translate( 'Show entries with tags' ),
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
            },

          ].filter( ( option ) => option )
        }
            >
              {translate( 'Filters' )}
            </Dropdown>
          </Column>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>

    </Level>
);
};

GlossaryFiltersBar.contextTypes = {
  t: PropTypes.func,
};

export default GlossaryFiltersBar;
