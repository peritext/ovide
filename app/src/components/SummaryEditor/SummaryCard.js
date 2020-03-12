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
        onEditCustomSummary,
        production,
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
        className={ `ovide-SummaryCard actual-summary-card ${isEdited ? 'is-edited' : ''}` }
      >
        <Column>
          <Card
            bodyContent={
              <div style={ { position: 'relative' } }>
                <StretchedLayoutContainer
                  isDirection={ 'horizontal' }
                  style={ { alignItems: 'center', paddingBottom: '.2rem' } }
                >
                  <StretchedLayoutItem
                    isFlex={ 1 }
                  >
                    <Title
                      isSize={ 6 }
                      onClick={ handleToggleIsEdited }
                      style={ { cursor: 'pointer' } }
                    >
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
                  {
                    !isEdited &&
                    <StretchedLayoutItem>
                      <Button
                        isFullWidth
                        isDisabled={ index === 0 }
                        onClick={ onMoveUp }
                        data-tip={ translate( 'Move up in the summary' ) }
                        data-for={ 'tooltip' }
                      >

                        <Icon className={ 'fa fa-chevron-up' } />
                      </Button>
                    </StretchedLayoutItem>
                  }
                  {
                    !isEdited &&
                    <StretchedLayoutItem>
                      <Button
                        isFullWidth
                        isDisabled={ index === maxIndex }
                        onClick={ onMoveDown }
                        data-tip={ translate( 'Move down in the summary' ) }
                        data-for={ 'tooltip' }
                      >

                        <Icon className={ 'fa fa-chevron-down' } />
                      </Button>
                    </StretchedLayoutItem>
                  }

                  {
                    isEditable && !isEdited &&
                    <StretchedLayoutItem>
                      <Button
                        isFullWidth
                        onClick={ handleToggleIsEdited }
                        isColor={ 'info' }
                        data-tip={ translate( 'Edit' ) }
                        data-for={ 'tooltip' }
                      >

                        <Icon className={ 'fa fa-pencil-alt' } />
                      </Button>
                    </StretchedLayoutItem>

                  }
                  {!isEdited &&
                    <StretchedLayoutItem>
                      <Button
                        isFullWidth
                        onClick={ onRemove }
                        isColor={ 'danger' }
                        data-tip={ translate( 'Delete' ) }
                        data-for={ 'tooltip' }
                      >
                        <Icon className={ 'fa fa-trash' } />
                      </Button>
                    </StretchedLayoutItem>
                      }

                  {
                    <Delete
                      onClick={ handleToggleIsEdited }
                      style={ {
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          pointerEvents: isEdited ? 'all' : 'none'
                        } }
                    />
                    }
                </StretchedLayoutContainer>

                <div className={ 'parameters-container' }>
                  <SchemaForm
                    schema={ blockSchema }
                    document={ summaryBlock.data }
                    onAfterChange={ onBlockDataChange }
                    onEditCustomSummary={ onEditCustomSummary }
                    contextDocument={ production }
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
