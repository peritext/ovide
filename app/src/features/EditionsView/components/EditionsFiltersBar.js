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
  FlexContainer,
} from 'quinoa-design-library/components';

import CenteredIcon from '../../../components/CenteredIcon';
import { translateNameSpacer } from '../../../helpers/translateUtils';

const EditionsFiltersBar = ( {
  filterValues,
  onSearchStringChange,
  onToggleOptionsVisibility,
  optionsVisible,
  editionsTypes,
  searchString,
  onOptionChange,
  sortValue,
  // translate,
}, { t } ) => {

  const editionsIcons = {
      paged: require( '../../../sharedAssets/paged.png' ),
      screened: require( '../../../sharedAssets/screened.png' ),
    };

  const handleChange = ( value, domain ) => {
    onOptionChange( value, domain );
  };
  const translate = translateNameSpacer( t, 'Features.EditionsView' );

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
            placeholder={ translate( 'Find an edition' ) }
          />
        </Field>
        <LevelItem>
          <Dropdown
            closeOnChange={ false }
            menuAlign={ 'left' }
            onToggle={ onToggleOptionsVisibility }
            onChange={ handleChange }
            isActive={ optionsVisible }
            isColor={ Object.keys( filterValues ).filter( ( f ) => filterValues[f] ).length > 0 ? 'info' : '' }
            value={ {
              sort: {
                value: sortValue,
              },
              filter: {
                value: Object.keys( filterValues ).filter( ( f ) => filterValues[f] ),
              },
            } }
            options={
              [
              {
                label: translate( 'Sort editions by' ),
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
              {
                label: translate( 'Show editions of type' ),
                id: 'filter',
                options: editionsTypes.map( ( type ) => ( {
                  id: type,
                  label: (
                    <FlexContainer
                      flexDirection={ 'row' }
                      alignItems={ 'center' }
                    >
                      <CenteredIcon
                        src={ editionsIcons[type] }
                        style={ { minWidth: '1rem', marginRight: '1rem' } }
                      />
                      {/*<Image
                        style={ { display: 'inline-block', marginRight: '1em' } }
                        isSize={ '16x16' }
                        src={ editionsIcons[type] }
                      />*/}
                      <span>
                        {translate( type )}
                      </span>
                    </FlexContainer>
                  )
                } ) ),
              }
            ]
          }
          >
            {translate( 'Filters' )}
          </Dropdown>
        </LevelItem>
      </LevelLeft>
    </Level>
  );
};

EditionsFiltersBar.contextTypes = {
  t: PropTypes.func,
};

export default EditionsFiltersBar;
