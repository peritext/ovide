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
  value: section,
  production,
  goToSection,
  onDelete,
  setSectionLevel,
  reverseSectionLockMap = {},
  isSorting,
  sectionIndex,
  // sectionIndex,
  maxSectionIndex,
  setSectionIndex,
} ) => {
    return (
      <Level style={ { marginBottom: 0, width: '100%' } }>
        <Column
          isSize={ 12 - section.metadata.level }
          isOffset={ section.metadata.level }
        >
          <SectionCard
            section={ section }
            minified={ isSorting }
            sectionIndex={ sectionIndex }
            maxSectionIndex={ maxSectionIndex }
            goTo={ goToSection }
            production={ production }
            onDelete={ onDelete }
            setSectionIndex={ setSectionIndex }
            setSectionLevel={ setSectionLevel }
            lockData={ reverseSectionLockMap[section.id] }
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
      defaultColumns={ 1 }
      renderNoItem={ renderNoItem }
      renderItem={ ( section, index ) => {
          return (
            <SortableItem
              { ...props }
              key={ section.id/*`item-${index}`*/ }
              maxSectionIndex={ items.length - 1 }
              sectionIndex={ index }
              index={ index }
              value={ section }
            />
          );
        } }
    />
  );
} );

export default SortableSectionsList;
