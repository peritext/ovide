import React, { Component } from 'react';
import {
  Column,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Delete,
} from 'quinoa-design-library/components/';
import { v4 as genId } from 'uuid';
import FlipMove from 'react-flip-move';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';

import arrayMove from 'array-move';
import { debounce } from 'lodash';
// import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { defaults } from '../../helpers/schemaUtils';

/**
 * Imports Components
 */
import SummaryCard from './SummaryCard';
import PossibleSummaryCard from './PossibleSummaryCard';

const UPDATE_DELAY = 2000;

class SummaryEditor extends Component {
  constructor( props ) {
    super( props );
    const summary = this.getSummaryFromEdition( props.edition );
    this.state = {
      summary
    };
    this.propagateSummaryChange = debounce( this.propagateSummaryChange, UPDATE_DELAY );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.edition !== nextProps.edition ) {
      const summary = this.getSummaryFromEdition( nextProps.edition );
      this.setState( {
        summary
      } );
    }
  }

  componentWillUnmount = () => {
    this.propagateSummaryChange.flush();
  }

  getSummaryFromEdition = ( edition = {} ) => {
    const {
      data = {}
    } = edition;
    const {
      plan = {},
    } = data;
    const {
      summary = []
    } = plan;
    return summary;
  }

  propagateSummaryChange = ( summary ) => {
    this.props.onSummaryChange( summary );
  }

  onSummaryChange = ( summary ) => {
    this.setState( {
      summary
    } );
    this.propagateSummaryChange( summary );
  }

  render = () => {
    const {
      props: {
        template,
        // edition = {},
        translate,
        setSummaryEdited,
        summaryEdited,
      },
      state: {
        summary
      },
      onSummaryChange,
    } = this;

    /*
     * const {
     *   data = {}
     * } = edition;
     * const {
     *   plan = {},
     * } = data;
     * const {
     *   summary = []
     * } = plan;
     */

    /**
     * Computed variables
     */
    const summaryBlockDataTypes = template.meta.summaryBlockDataTypes;

    /**
     * Callbacks handlers
     */

    const handleAddNewItemToSummary = ( blockType ) => {
      const elementSchema = summaryBlockDataTypes[blockType];
      const newElement = {
        type: blockType,
        data: {
          ...defaults( elementSchema )
        },
        id: genId()
      };
      onSummaryChange( [
        ...summary,
        newElement,
      ] );
    };

    const handleSummaryDragEnd = ( { source, destination, reason } ) => {
      switch ( reason ) {
        case 'DROP':
          if ( source && destination && source.droppableId === 'summary' && destination.droppableId === 'summary' ) {
            const to = destination.index >= 0 ? destination.index : 0;
            const newSummary = arrayMove( summary, source.index, to );
            onSummaryChange( newSummary );
          }
          else if ( source && destination && source.droppableId === 'possibles' && destination.droppableId === 'summary' ) {
            const blockType = Object.keys( summaryBlockDataTypes )[source.index];
            const elementSchema = summaryBlockDataTypes[blockType];
            const newElement = {
              type: blockType,
              data: {
                ...defaults( elementSchema )
              },
              id: genId()
            };
            const to = destination.index >= 0 ? destination.index : 0;
            const newSummary = [ ...summary ];
            newSummary.splice( to, 0, newElement );
            onSummaryChange( newSummary );
          }
          break;
        default:
          break;
      }
    };

    const handleToggleSummaryEdited = () => {
      setSummaryEdited( !summaryEdited );
    };

    return (
      <DragDropContext onDragEnd={ handleSummaryDragEnd }>

        <StretchedLayoutContainer
          isDirection={ 'horizontal' }
          style={ { width: '100%', height: '100%', overflow: 'hidden', position: 'relative' } }
        >

          <StretchedLayoutItem
            style={ { height: '100%', overflow: 'hidden' } }
            isFlex={ '1' }
          >

            <Column style={ { height: '100%', overflow: 'hidden' } }>
              <StretchedLayoutContainer
                isDirection={ 'vertical' }
                style={ { height: '100%', overflow: 'hidden' } }
              >
                <StretchedLayoutItem>
                  <Column>
                    <Title isSize={ 4 }>
                      {translate( 'Current summary' )}
                    </Title>
                  </Column>
                </StretchedLayoutItem>
                <StretchedLayoutItem
                  isFlex={ 1 }
                  style={ { overflow: 'auto' } }
                >
                  <Droppable droppableId={ 'summary' }>
                    {( provided ) => (
                      <div
                        ref={ provided.innerRef }
                        { ...provided.droppableProps }
                        style={ { overflow: 'auto', minHeight: '100%' } }
                      >
                        {provided.placeholder}
                        <FlipMove>
                          {
                            summary.map( ( summaryBlock, index ) => {
                              const handleRemove = () => {
                                const newSummary = summary.filter( ( c, i ) => i !== index );
                                onSummaryChange( newSummary );
                              };
                              const handleMoveUp = () => {
                                const newSummary = arrayMove( summary, index, index - 1 );
                                onSummaryChange( newSummary );
                              };
                              const handleMoveDown = () => {
                                const newSummary = arrayMove( summary, index, index + 1 );
                                onSummaryChange( newSummary );
                              };
                              const handleBlockDataChange = ( newData ) => {
                                const newSummary = [ ...summary ];
                                newSummary[index].data = newData;
                                onSummaryChange( newSummary );
                              };
                              return (

                                <Draggable
                                  draggableId={ `summaryBlock-${index}` }
                                  type={ 'SUMMARY_BLOCK' }
                                  index={ index }
                                  key={ summaryBlock.id }
                                >
                                  {( providedBlock ) => (
                                    <SummaryCard
                                      // className={ chunkSnapshot.isDragging ? 'dragged-chunk' : 'still-chunk' }
                                      providedBlock={ providedBlock }
                                      summaryBlock={ summaryBlock }
                                      onRemove={ handleRemove }
                                      translate={ translate }
                                      index={ index }
                                      maxIndex={ summary.length - 1 }
                                      onMoveUp={ handleMoveUp }
                                      onMoveDown={ handleMoveDown }
                                      onBlockDataChange={ handleBlockDataChange }
                                      blockSchema={ template.meta.summaryBlockDataTypes[summaryBlock.type] }
                                    />
                                  )}
                                </Draggable>
                              );
                            } )
                          }
                        </FlipMove>
                      </div>
                                  )}
                  </Droppable>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem
            style={ { height: '100%', overflow: 'hidden' } }
            isFlex={ '1' }
          >
            <Column style={ { height: '100%', overflow: 'hidden' } }>
              <StretchedLayoutContainer
                isDirection={ 'vertical' }
                style={ { height: '100%', overflow: 'hidden' } }
              >
                <StretchedLayoutItem>
                  <Column>
                    <Title isSize={ 4 }>
                      {translate( 'Possible items' )}
                    </Title>
                  </Column>
                </StretchedLayoutItem>
                <StretchedLayoutItem
                  isFlex={ 1 }
                  style={ { overflow: 'auto' } }
                >
                  <Droppable droppableId={ 'possibles' }>
                    {( provided ) => (
                      <div
                        ref={ provided.innerRef }
                        { ...provided.droppableProps }
                      >

                        {provided.placeholder}
                        {
                        Object.keys( summaryBlockDataTypes ).map( ( summaryBlockType, index ) => {
                          const handleAdd = () => {
                            handleAddNewItemToSummary( summaryBlockType );
                          };
                          const schema = summaryBlockDataTypes[summaryBlockType];
                          let isDisabled = false;
                          if ( schema.unique && summary.find( ( s ) => s.type === summaryBlockType ) ) {
                            isDisabled = true;
                          }
                          return (

                            <Draggable
                              draggableId={ `possible-block-${index}` }
                              type={ 'POSSIBLE_BLOCK' }
                              index={ index }
                              key={ index }
                            >
                              {( providedBlock ) => (
                                <PossibleSummaryCard
                                  // className={ chunkSnapshot.isDragging ? 'dragged-chunk' : 'still-chunk' }
                                  providedBlock={ providedBlock }
                                  blockType={ summaryBlockType }
                                  schema={ schema }
                                  isDisabled={ isDisabled }
                                  onAdd={ handleAdd }
                                  translate={ translate }
                                />
                              )}
                            </Draggable>
                          );
                        } )
                      }
                      </div>
                                )}
                  </Droppable>
                </StretchedLayoutItem>

              </StretchedLayoutContainer>
            </Column>
          </StretchedLayoutItem>
          {typeof setSummaryEdited === 'function' &&
          <Delete
            style={ {
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem'
                  } }
            onClick={ handleToggleSummaryEdited }
          />
          }
        </StretchedLayoutContainer>
      </DragDropContext>
          );
  }
}

export default SummaryEditor;
