/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'react-tooltip';
import {
  Card,
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Button,
  HelpPin,
  Icon,
  Title,
  Delete,
} from 'quinoa-design-library/components/';
import './SummaryCard.scss';

/**
 * Imports Project utils
 */
// import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import SchemaForm from '../SchemaForm';
import MovePad from '../MovePad';

class SummaryCard extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      isEdited: false
    };
  }

  render = () => {
    const {
      props: {
        summaryBlock,
        blockSchema = { properties: {} },
        providedBlock,
        translate,
        onRemove,
        index,
        maxIndex,
        onMoveUp,
        onMoveDown,
        onBlockDataChange,
      },
      state: {
        isEdited,
      }
    } = this;

    const isEditable = Object.keys( blockSchema.properties ).length > 0;

    const handleToggleIsEdited = () => {
      this.setState( {
        isEdited: !isEdited
      } );
      Tooltip.rebuild();
    };

    const customTitle = summaryBlock.data && summaryBlock.data.customTitle;

    return (
      <div
        ref={ providedBlock.innerRef }
        { ...providedBlock.dragHandleProps }
        { ...providedBlock.draggableProps }
        className={ `ovide-SummaryCard ${isEdited ? 'is-edited' : ''}` }
      >
        <Column style={ { marginLeft: 0 } }>
          <Card
            style={ { marginLeft: 0 } }
            bodyContent={
              <div style={ { position: 'relative' } }>
                <StretchedLayoutContainer
                  style={ { minHeight: isEdited ? undefined : '5.5rem' } }
                  isDirection={ 'horizontal' }
                >
                  <StretchedLayoutItem
                    isFlex={ 1 }
                    style={ { minWidth: '70%' } }
                  >
                    <Title isSize={ 4 }>
   
                          {
                          customTitle && customTitle.length ?
                          `${customTitle} (${translate( summaryBlock.type )})`
                          : translate( summaryBlock.type )
                        }

                          <HelpPin>
                            {translate( `Explanation about ${summaryBlock.type}` )}
                          </HelpPin>
 
                    </Title>

                  </StretchedLayoutItem>
                  <StretchedLayoutItem
                    isFlex={ 1 }
                    className={ 'move-pad-container' }
                  >
                    {
                      <MovePad
                        verticalOnly
                        hideMainButton
                        chevronsData={ {
                          left: {
                            tooltip: translate( 'Level {n}', { n: 1 } ),
                            isDisabled: true,
                          },
                          right: {
                            tooltip: translate( 'Level {n}', { n: 1 } ),
                            isDisabled: true,
                          },
                          up: {
                            isDisabled: index === 0,
                            tooltip: translate( 'Move up in the summary' ),
                            onClick: onMoveUp
                          },
                          down: {
                            isDisabled: index === maxIndex,
                            tooltip: translate( 'Move down in the summary' ),
                            onClick: onMoveDown
                          }
                        } }
                        moveComponentToolTip={ translate( 'Move item in summary' ) }
                        MoveComponent={ () =>
                          (
                            <span

                              style={ { cursor: 'move' } }
                              className={ 'button' }
                            >
                              <Icon className={ 'fa fa-arrows-alt' } />
                            </span>
                          )
                        }
                      />
                    }
                    {
                      <Delete
                        onClick={ handleToggleIsEdited }
                        style={ {
                          position: 'absolute',
                          right: 0,
                          top: 0,
                        } }
                      />
                    }
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
                <StretchedLayoutContainer
                  className={ 'actions-container' }
                  isDirection={ 'horizontal' }
                >
                  {
                        isEditable &&
                        <StretchedLayoutItem isFlex={ 1 }>
                          <Button
                            isFullWidth
                            onClick={ handleToggleIsEdited }
                            isColor={ 'info' }
                          >
                            {translate( 'Edit' )}
                          </Button>
                        </StretchedLayoutItem>

                      }
                  {
                    <StretchedLayoutItem isFlex={ 1 }>
                      <Button
                        isFullWidth
                        onClick={ onRemove }
                        isColor={ 'danger' }
                      >
                        {translate( 'Delete' )}
                      </Button>
                    </StretchedLayoutItem>
                      }
                </StretchedLayoutContainer>
                <div className={ 'parameters-container' }>
                  <SchemaForm
                    schema={ blockSchema }
                    document={ summaryBlock.data }
                    onAfterChange={ onBlockDataChange }
                  />
                </div>
              </div>
            }
          />
        </Column>
      </div>
    );
  }
}

SummaryCard.contextTypes = {
  t: PropTypes.func,
};

export default SummaryCard;
