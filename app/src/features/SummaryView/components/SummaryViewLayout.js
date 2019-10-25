/* eslint-disable arrow-parens */
/**
 * This module provides a layout component for displaying the summary view
 * @module ovide/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { arrayMove } from 'react-sortable-hoc';
import { v4 as genId } from 'uuid';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Column,
  Delete,
  Container,
  Content,
  Collapsable,
  Icon,
  Level,
  LevelItem,
  LevelLeft,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { createDefaultSection } from '../../../helpers/schemaUtils';
import { abbrevString } from '../../../helpers/misc';

/**
 * Imports Components
 */
import MetadataForm from '../../../components/MetadataForm';
import NewSectionForm from '../../../components/NewSectionForm';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import SortableSectionsList from './SortableSectionsList';

const SummaryViewLayout = ( {
  editedProduction: production,
  metadataOpen,
  newSectionOpen,
  promptedToDeleteSectionId,
  isSorting,

  actions: {
    updateProductionMetadata,
    setNewSectionOpen,
    setPromptedToDeleteSectionId,
    setIsSorting,
    setMetadataOpen,

    updateSectionsOrder,
    // setSectionLevel,

    createResource,
    deleteResource,
  },
  goToSection
}, { t } ) => {

  /**
   * Variables definition
   */
  const {
    metadata: {
      title,
      subtitle,
      authors,
      abstract
    },
    sectionsOrder,
    resources,
    id: productionId,
  } = production;

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SummaryView' );

  /**
   * Computed variables
   */
  const sectionsList = sectionsOrder
  .filter( ( { resourceId } ) => resources[resourceId] )
  .map( ( { resourceId, level } ) => ( {
    resource: resources[resourceId],
    level
  } ) );
  const defaultSection = createDefaultSection();
  const defaultSectionMetadata = defaultSection.metadata;

  /**
   * Callbacks handlers
   */
  const handleMetadataEditionToggle = () => {
    setMetadataOpen( !metadataOpen );
  };

  const handleMetadataSubmit = ( { payload: { metadata } } ) => {
    const payload = {
      productionId,
      metadata,
    };
    updateProductionMetadata( payload );
    setMetadataOpen( false );
  };

  const handleNewSectionSubmit = ( metadata ) => {
    const newSection = {
      ...defaultSection,
      metadata,
      id: genId()
    };
    createResource( {
      resourceId: newSection.id,
      resource: newSection,
      productionId,
    }, ( err ) => {
      if ( !err ) {
        const newSectionsOrder = [
          ...sectionsOrder,
          {
            resourceId: newSection.id,
            level: 0
          }
        ];
        updateSectionsOrder( {
          productionId,
          sectionsOrder: newSectionsOrder
        }, ( thatErr ) => {
          if ( !thatErr ) {
            setNewSectionOpen( false );
            goToSection( newSection.id );
        }
        } );

      }
    } );
  };

  const handleDeleteSection = ( thatSectionId ) => {
    setPromptedToDeleteSectionId( thatSectionId );
  };
  const handleDeleteSectionExecution = ( thatSectionId ) => {
    const newSectionsOrder = sectionsOrder.filter( ( { resourceId } ) => resourceId !== thatSectionId );
    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder
    }, () => {
      deleteResource( {
        resourceId: thatSectionId,
        productionId,
      } );
    } );

  };

  const handleDeleteSectionConfirm = () => {
    handleDeleteSectionExecution( promptedToDeleteSectionId );
    setPromptedToDeleteSectionId( undefined );
  };

  const handleSortEnd = ( { oldIndex, newIndex } ) => {

    setIsSorting( false );
    const levelsMap = sectionsOrder.reduce( ( res, { resourceId, level } ) => ( {
      ...res,
      [resourceId]: level
    } ), {} );
    const sectionsIds = sectionsOrder.map( ( { resourceId } ) => resourceId );

    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex ).map( resourceId => ( {
      resourceId,
      level: levelsMap[resourceId]
    } ) );

    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder
    } );
    ReactTooltip.rebuild();
  };

  const handleSectionIndexChange = ( oldIndex, newIndex ) => {

    /*
     * const sectionsIds = sectionsList.map( ( section ) => section.id );
     * const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );
     */
    const levelMaps = sectionsOrder.reduce( ( res, item ) => ( {
      ...res,
      [item.resourceId]: item.level
    } ), {} );
    const sectionsIds = sectionsOrder.map( ( { resourceId } ) => resourceId );

    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex ).map( ( resourceId ) => ( {
      resourceId,
      level: levelMaps[resourceId]
    } ) );
    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder
    } );
    setIsSorting( false );
  };

  const handleSetSectionLevel = ( { sectionId, level } ) => {
    const newSectionsOrder = sectionsOrder.map( ( { resourceId: thatResourceId, level: thatLevel } ) => {
      if ( thatResourceId === sectionId ) {
        return {
          resourceId: thatResourceId,
          level
        };
      }
      return {
        resourceId: thatResourceId,
        level: thatLevel
      };
    } );
    updateSectionsOrder( {
      productionId,
      sectionsOrder: newSectionsOrder
    } );
  };

  const handleCloseNewSection = () => setNewSectionOpen( false );
  const handleOpenNewSection = () => setNewSectionOpen( true );
  const handleActiveIsSorting = () => setIsSorting( true );

  return (
    <Container style={ { position: 'relative', height: '100%' } }>
      <StretchedLayoutContainer
        isFluid
        isDirection={ 'horizontal' }
        isAbsolute
      >
        <StretchedLayoutItem
          style={ { marginTop: '1rem' } }
          isFluid
          isFlex={ 1 }
          isFlowing
        >
          <Column style={ { paddingLeft: '1.8rem' } }>
            <Level style={ { marginBottom: '.4rem' } }>
              <Collapsable
                maxHeight={ '100%' }
                isCollapsed={ metadataOpen }
              >
                <Title isSize={ 2 }>
                  {abbrevString( title, 60 )}
                </Title>
                {subtitle &&
                  <Title isSize={ 5 }>
                    <i>{abbrevString( subtitle, 60 )}</i>
                  </Title>
                }
                <div style={ { maxHeight: '15rem', overflow: 'auto' } }>
                  {
                      authors.map( ( author, index ) => (
                        <Level key={ index }>
                          <LevelLeft>
                            <LevelItem>
                              <Icon
                                isSize={ 'small' }
                                isAlign={ 'left' }
                                className={ 'fa fa-user' }
                              />
                            </LevelItem>
                            <LevelItem>
                              {typeof author === 'string' ? abbrevString( author, 60 ) : `${abbrevString( author.given, 60 )} ${abbrevString( author.family, 60 )}`}
                            </LevelItem>
                          </LevelLeft>
                        </Level>
                      ) )
                    }
                </div>
                <Level />
                <Content>
                  <i>{abbrevString( abstract, 300 )}</i>
                </Content>
                <Level />
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button
                isFullWidth
                isColor={ metadataOpen ? 'primary' : 'primary' }
                onClick={ handleMetadataEditionToggle }
              >

                {
                  <StretchedLayoutContainer
                    isAbsolute
                    style={ { alignItems: 'center', justifyContent: 'space-around', padding: '1rem' } }
                    isDirection={ 'horizontal' }
                  >

                    <StretchedLayoutItem isFlex={ 1 }>
                      {metadataOpen ? translate( 'Close production settings' ) : translate( 'Edit production settings' )}
                    </StretchedLayoutItem>
                    {metadataOpen &&
                      <StretchedLayoutItem>
                        <Delete isSize={ 'medium' } />
                      </StretchedLayoutItem>
                    }
                  </StretchedLayoutContainer>
                }
              </Button>
            </Level>
            <Collapsable
              isCollapsed={ !metadataOpen }
              maxHeight={ '100%' }
            >
              {
                metadataOpen &&
                <div style={ { marginTop: '1rem' } }>
                  <MetadataForm
                    production={ production }
                    onSubmit={ handleMetadataSubmit }
                    onCancel={ handleMetadataEditionToggle }
                  />
                </div>
              }
            </Collapsable>
            <Level />
            <Level />
            <Level />
          </Column>
        </StretchedLayoutItem>
        {
          newSectionOpen ?
            <StretchedLayoutItem
              isFluid
              isFlex={ 2 }
              isFlowing
            >
              <Column isWrapper>
                <Column isWrapper>
                  <StretchedLayoutContainer
                    isAbsolute
                    isDirection={ 'vertical' }
                  >
                    <StretchedLayoutItem>
                      <Title isSize={ 2 }>
                        <StretchedLayoutContainer
                          style={ { paddingTop: '1rem' } }
                          isDirection={ 'horizontal' }
                        >
                          <StretchedLayoutItem isFlex={ 11 }>
                            {translate( 'New section' )}
                          </StretchedLayoutItem>
                          <StretchedLayoutItem>
                            <Delete onClick={ handleCloseNewSection } />
                          </StretchedLayoutItem>
                        </StretchedLayoutContainer>
                      </Title>
                      <Level />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <NewSectionForm
                        metadata={ { ...defaultSectionMetadata } }
                        onSubmit={ handleNewSectionSubmit }
                        onCancel={ handleCloseNewSection }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </Column>
            </StretchedLayoutItem>
            :
            <StretchedLayoutItem
              isFluid
              isFlex={ 2 }
              isFlowing
            >
              <Column style={ { paddingRight: 0 } }>
                <Column>
                  <Title
                    style={ { paddingTop: '.2rem' } }
                    isSize={ 2 }
                  >
                    {translate( 'Sections' )}
                  </Title>
                </Column>
                <Level>
                  <Column>
                    <Button
                      onClick={ handleOpenNewSection }
                      isFullWidth
                      isColor={ 'primary' }
                    >
                      {translate( 'New section' )}
                    </Button>
                  </Column>
                </Level>
                <SortableSectionsList
                  items={ sectionsList }
                  production={ production }
                  onSortEnd={ handleSortEnd }
                  renderNoItem={ () => <div>{translate( 'No sections to display' )}</div> }
                  goToSection={ goToSection }
                  setSectionIndex={ handleSectionIndexChange }
                  onSortStart={ handleActiveIsSorting }
                  isSorting={ isSorting }
                  onDelete={ handleDeleteSection }
                  setSectionLevel={ handleSetSectionLevel }
                  useDragHandle
                />
              </Column>
            </StretchedLayoutItem>
        }

        <ConfirmToDeleteModal
          isActive={ promptedToDeleteSectionId !== undefined }
          deleteType={ 'section' }
          production={ production }
          id={ promptedToDeleteSectionId }
          onClose={ () => setPromptedToDeleteSectionId( undefined ) }
          onDeleteConfirm={ handleDeleteSectionConfirm }
        />
      </StretchedLayoutContainer>
    </Container>
    );
};

SummaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SummaryViewLayout;
