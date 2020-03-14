/**
 * This module provides a sortable sections cards list
 * @module ovide/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

/**
 * Imports Components
 */
import SectionCard from './SectionCard';
import PaginatedList from '../../../components/PaginatedList';

const SortableItem = SortableElement( ( {
  value,
  production,
  goToSection,
  allowMove = true,
  onDelete,
  setSectionLevel,
  isSorting,
  sectionIndex,
  // sectionIndex,
  maxSectionIndex,
  setSectionIndex,
  selectedResourcesIds,
  onToggleSectionSelection,
} ) => {
    const { resource, level: initialLevel } = value;
    let level = allowMove ? initialLevel : 0;
    level = isNaN( level ) ? 0 : level;
    const isSelected = selectedResourcesIds.includes( resource.id );

    return (
      <Level style={ { marginBottom: 0, width: '100%' } }>
        <Column
          isSize={ 12 - level }
          isOffset={ level }
          style={{marginBottom: 0}}
        >
          <SectionCard
            section={ resource }
            minified={ isSorting }
            tags={ production.tags }
            level={ level }
            showMoveUi={ allowMove }
            sectionIndex={ sectionIndex }
            maxSectionIndex={ maxSectionIndex }
            goTo={ goToSection }
            production={ production }
            isActive={ isSelected }
            onToggleSelected={ onToggleSectionSelection }
            onDelete={ onDelete }
            setSectionIndex={ setSectionIndex }
            setSectionLevel={ setSectionLevel }
          />
        </Column>
      </Level>
    );
  }
);

const SortableSectionsList = SortableContainer( ( {
  items,
  renderNoItem,
  ...props
} ) => {
  return (
    <PaginatedList
      items={ items }
      style={ { height: '100%' } }
      defaultColumns={ 1 }
      renderNoItem={ renderNoItem }
      renderItem={ ( { resource, level }, index ) => {
          return (
            <SortableItem
              { ...props }
              key={ resource.id }
              maxSectionIndex={ items.length - 1 }
              sectionIndex={ index }
              index={ index }
              value={ { resource, level } }
            />
          );
        } }
    />
  );
} );

export default SortableSectionsList;
