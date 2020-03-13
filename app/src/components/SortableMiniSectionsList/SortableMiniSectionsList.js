/**
 * This module provides a list of sections for the section view
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { List, AutoSizer } from 'react-virtualized';
import ReactTooltip from 'react-tooltip';
import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

/**
 * Imports Components
 */
import SectionMiniCard from '../SectionMiniCard';

const SortableItem = SortableElement( ( {
  value: {
    level,
    resource
  },
  onOpenSettings,
  onDeleteSection,
  setSectionLevel,

  productionId,
  activeSectionId,

  setSectionIndex,
  sectionIndex,
  maxSectionIndex,
  history,
  tags,

} ) => {
  const handleDelete = ( event ) => {
    event.stopPropagation();
    onDeleteSection( resource.id );
  };
  const handleSelect = () => {
    if ( history ) {
      history.push( `/productions/${productionId}/sections/${resource.id}` );
    }
  };
  return (
    <Level>
      <Column
        isSize={ 12 - level }
        isOffset={ level }
      >
        <SectionMiniCard
          section={ resource }
          isActive={ resource.id === activeSectionId }
          setSectionIndex={ setSectionIndex }
          sectionIndex={ sectionIndex }
          maxSectionIndex={ maxSectionIndex }
          setSectionLevel={ setSectionLevel }
          productionId={ productionId }
          onSelect={ handleSelect }
          tags={ tags }
          level={ level }
          onDeleteSection={ handleDelete }
          onOpenSettings={ onOpenSettings }
        />
      </Column>
    </Level>
  );
} );

const SortableSectionsList = SortableContainer( ( {
  items,
  ...props
} ) => {
  const rowRenderer = ( {
    key,
    style,
    index,
  } ) => {
    return (
      <div
        key={ key }
        style={ style }
      >
        <SortableItem
          { ...props }
          index={ index }
          sectionIndex={ index }
          value={ items[index] }
        />
      </div>
    );
  };
  const handleRowsRendered = () =>
            ReactTooltip.rebuild();
  return (
    <AutoSizer>
      {( { width, height } ) => (
        <List
          height={ height }
          rowCount={ items.length }
          rowHeight={ 155 }
          rowRenderer={ rowRenderer }
          width={ width }
          onRowsRendered={ handleRowsRendered }
        />
      )}
    </AutoSizer>
  );
} );

export default SortableSectionsList;
