import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
 defaultSortResourceSections,
 buildResourceSectionsSummary,
 getResourceTitle,
 } from 'peritext-utils';

import {
  Button,
  Card,
  Delete,
  Columns,
  Column,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Level,
} from 'quinoa-design-library/components';
import arrayMove from 'array-move';

// import SortableMiniSectionsList from '../SortableMiniSectionsList';
import SectionMiniCard from '../SectionMiniCard';

import { translateNameSpacer } from '../../helpers/translateUtils';

export default class CustomSummaryEditor extends Component {
  static contextTypes = {
    production: PropTypes.object,
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {

      /*
       * edited: false,
       * value: props.value
       */
    };
  }

  /*
   * componentWillReceiveProps = ( nextProps ) => {
   *   if ( this.props.value !== nextProps.value ) {
   *     this.setState( {
   *       value: nextProps.value
   *     } );
   *   }
   * }
   */

  render = () => {

    const {

      /*
       * state: {
       *   edited,
       *   // value = {}
       * },
       */
      props: {
        // value: propsValue = { active: false },
        onChange,
        blockSettings,
        summaryType = 'sections',
        onCancel,
        // onSubmit,
        value,
      },
      context: {
        production = {},
        t
      }
    } = this;

    const translate = translateNameSpacer( t, 'Components.CustomSummaryEditor' );

    const { active = false, summary = [] } = value;

    const handleActiveChange = ( to ) => {
      const newValue = {
        ...value,
        active: to
      };
      onChange( newValue );
      // this.setState( { value: newValue } );
    };

    const addBlockToSummary = ( item ) => {
      const newSummary = [
        ...summary,
        item
      ];
      onChange( {
          ...value,
          summary: newSummary
      } );
    };

    const { sectionsOrder = [], resources = {} } = production;

    const existingSummary = summaryType === 'customSectionsSummary' ?
     sectionsOrder.map( ( { resourceId, level } ) => {
      if ( resources[resourceId] ) {
        const thatSection = resources[resourceId];
        return {
          title: getResourceTitle( thatSection ),
          level,
          resourceId
        };
      }
    } ).filter( ( s ) => s )
    :
    buildResourceSectionsSummary( { production, options: {
      ...blockSettings,
      customSummary: { active: false }
    } } )
    .map( ( { resourceId } ) => ( {
      resourceId,
      level: 0,
      type: production.resources[resourceId].metadata.type,
      title: getResourceTitle( production.resources[resourceId] )
    } ) )
    .sort( defaultSortResourceSections );

    const actionableSummary = summary.map( ( { level, resourceId } ) => {
      const thatSection = ( resources[resourceId] || { metadata: {} } );
      return {
        ...thatSection,
        metadata: {
          ...thatSection.metadata,
          level
        }
      };
    } );

    const handleOnSortEnd = ( { oldIndex, newIndex } ) => {
      const sectionsIds = summary.map( ( el ) => el.resourceId );
      const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );
      const newSummary = newSectionsOrder.map( ( id ) => {
        const summaryEl = summary.find( ( el ) => el.resourceId === id );
        return summaryEl;
      } );
      onChange( {
          ...value,
          summary: newSummary
      } );
    };
    const handleDelete = ( id ) => {
      const newSummary = summary.filter( ( i ) => i.resourceId !== id );
      onChange( {
          ...value,
          summary: newSummary
      } );
    };
    const handleSetSectionIndex = ( oldIndex, newIndex ) => {
      handleOnSortEnd( { oldIndex, newIndex } );
    };

    const handleSetSectionLevel = ( { sectionId, level } ) => {
      const newSummary = summary.map( ( el ) => {
        if ( el.resourceId === sectionId ) {
          return {
            ...el,
            level
          };
        }
        return el;
      } );
      onChange( {
          ...value,
          summary: newSummary
      } );
    };
    return (
      <StretchedLayoutContainer
        style={ { width: '100%' } }
        isDirection={ 'vertical' }
      >
        <StretchedLayoutItem>
          <StretchedLayoutContainer
            style={ { margin: '1rem' } }
            isDirection={ 'horizontal' }
          >
            <StretchedLayoutItem isFlex={ 1 }>
              <Title isSize={ 3 }>{translate( 'Edit specific block composition' )}</Title>
            </StretchedLayoutItem>

            <StretchedLayoutItem>
              <Delete onClick={ onCancel } />
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <StretchedLayoutItem
            style={ { margin: '1rem' } }
            isDirection={ 'vertical' }
          >
            <StretchedLayoutItem>
              {translate( 'Should the edition block use the default composition or a custom one ?' )}
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Button
                onClick={ () => handleActiveChange( false ) }
                isColor={ active ? undefined : 'primary' }
              >
                {translate( 'default composition' )}
              </Button>
              <Button
                onClick={ () => handleActiveChange( true ) }
                isColor={ active ? 'primary' : undefined }
              >
                {translate( 'custom composition' )}
              </Button>
            </StretchedLayoutItem>
          </StretchedLayoutItem>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          style={ { overflow: 'auto' } }
          isFlex={ 1 }
        >
          <Columns style={ { paddingLeft: '1rem' } }>
            <Column
              style={ {
              opacity: active ? 1 : 0.5,
              pointerEvents: active ? 'all' : 'none'
            } }
              isSize={ 6 }
            >
              <StretchedLayoutContainer>
                <StretchedLayoutItem>
                  <Title>
                    {translate( 'Default composition' )}
                  </Title>
                </StretchedLayoutItem>
                <StretchedLayoutItem
                  style={ { overflow: 'auto' } }
                  isFlex={ 1 }
                >
                  {
                  existingSummary.map( ( summaryItem, index ) => {
                    const handleAddBlock = () => {
                      addBlockToSummary( {
                        resourceId: summaryItem.resourceId,
                        level: summaryItem.level || 0
                      } );
                    };
                    const isDisabled = actionableSummary.find( ( i ) => i.resourceId === summaryItem.resourceId ) !== undefined;
                    return (
                      <Column
                        style={ { maxWidth: '100%', opacity: isDisabled ? 0.5 : 1 } }
                        key={ index }
                      >
                        <Card
                          style={ { marginLeft: `${summaryItem.level * 0.5 }rem` } }
                          bodyContent={
                            <StretchedLayoutContainer isDirection={ 'horizontal' }>
                              <StretchedLayoutItem isFlex={ 1 }>
                                {summaryItem.title || translate( 'Untitled section' )}
                              </StretchedLayoutItem>
                              {
                                active ?
                                  <StretchedLayoutItem>
                                    <Button
                                      onClick={ handleAddBlock }
                                      style={ { margin: '.1rem' } }
                                      isDisabled={ isDisabled }
                                    >
                                      {translate( 'Add' )}
                                    </Button>
                                  </StretchedLayoutItem>
                                : null
                              }

                            </StretchedLayoutContainer>
                            }
                        />
                      </Column>
                    );
                  } )
                }
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Column>
            <Column
              style={ {
              opacity: active ? 1 : 0.5,
              pointerEvents: active ? 'all' : 'none'
            } }
              isSize={ 6 }
            >
              <StretchedLayoutContainer style={ { minHeight: '100%' } }>
                <StretchedLayoutItem>
                  <Title>
                    {translate( 'Custom composition' )}
                  </Title>
                </StretchedLayoutItem>
                <StretchedLayoutItem
                  style={ { overflow: 'auto' } }
                  isFlex={ 1 }
                >
                  {
                    actionableSummary.map( ( section, index ) => {
                      const onDelete = () => handleDelete( section.id );
                      return (
                        <Level key={ section.id }>
                          <Column
                            isSize={ 12 - section.metadata.level }
                            isOffset={ section.metadata.level }
                          >
                            <SectionMiniCard
                              section={ section }
                              level={ section.metadata.level }
                              sectionIndex={ index }
                              setSectionIndex={ handleSetSectionIndex }
                              maxSectionIndex={ summary.length - 1 }
                              setSectionLevel={ handleSetSectionLevel }
                              onDeleteSection={ onDelete }
                              disableMove
                            />
                          </Column>
                        </Level>
                      );
                    } )
                  }
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Column>

          </Columns>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    );
  }
}
