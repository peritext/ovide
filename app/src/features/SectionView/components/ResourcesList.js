/**
 * This module provides a resource list for the section edition view
 * @module ovide/features/SectionView
 */
/* eslint react/prefer-stateless-function : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { List, AutoSizer } from 'react-virtualized';
import ReactTooltip from 'react-tooltip';
import {
  Column,
} from 'quinoa-design-library/components/';

/**
 * Imports Assets
 */
import ResourceMiniCard from './ResourceMiniCard';

class ResourceCardWrapper extends Component {
  constructor( props ) {
    super( props );
  }

  render = () => {
    const {
      resource,
      handleDelete,
      getResourceTitle,
      editedResourceId,
      handleEdit,
      activeSectionId,
      onGoToResource,
      tags
    } = this.props;
    return (
      <Column
        key={ resource.id }
        style={ { paddingBottom: 0, paddingTop: 0 } }
      >
        <ResourceMiniCard
          resource={ resource }
          onDelete={ handleDelete }
          getTitle={ getResourceTitle }
          isActive={ resource.id === editedResourceId || resource.id === activeSectionId }
          onGoToResource={ onGoToResource }
          onEdit={ handleEdit }
          tags={ tags }
        />
      </Column>
    );
  }
}

export default @DragDropContext( HTML5Backend ) class ResourcesList extends Component {

  constructor( props, context ) {
    super( props, context );
  }

  render = () => {
    const {
      resources,
      onDeleteResource,
      onResourceEditAttempt,
      getResourceTitle,
      onCloseSettings,
      editedResourceId,
      activeSectionId,
      onGoToResource,
      tags,
    } = this.props;

    const rowRenderer = ( {
      key,
      index,
      style,
    } ) => {
      const handleDelete = ( e ) => {
        e.stopPropagation();
        onDeleteResource( resources[index].id );
      };
      const handleEdit = ( e ) => {
        e.stopPropagation();
        if ( editedResourceId === resources[index].id ) {
          onCloseSettings();
        }
        else {
          onResourceEditAttempt( resources[index].id );
        }

      };

      return (
        <div
          key={ key }
          style={ style }
        >
          <ResourceCardWrapper
            resource={ resources[index] }
            handleDelete={ handleDelete }
            editedResourceId={ editedResourceId }
            getResourceTitle={ getResourceTitle }
            activeSectionId={ activeSectionId }
            onGoToResource={ onGoToResource }
            handleEdit={ handleEdit }
            tags={ tags }
          />
        </div>
      );
    };
    const handleRowsRendered = () =>
              ReactTooltip.rebuild();
    const activeSectionIndex = activeSectionId && resources.findIndex( ( r ) => r.id === activeSectionId );
    return (
      <AutoSizer>
        {( { width, height } ) => (
          <List
            height={ height }
            rowCount={ resources.length }
            rowHeight={ 140 }
            scrollToIndex={ activeSectionIndex }
            rowRenderer={ rowRenderer }
            width={ width }
            onRowsRendered={ handleRowsRendered }
          />
        )}
      </AutoSizer>
    );
  }
}
