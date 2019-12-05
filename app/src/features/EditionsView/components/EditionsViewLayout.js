/**
 * This module provides a connected component for displaying the section view
 * @module ovide/features/EditionsView
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import {
  Button,
  Column,
  Container,
  Content,
  Level,
  Title,
  ModalCard,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { templates } from '../../../peritextConfig.render';

/**
 * Imports Components
 */
import EditionForm from '../../../components/EditionForm';
import PaginatedList from '../../../components/PaginatedList';
import EditionCard from './EditionCard';
import EditionsFiltersBar from './EditionsFiltersBar';

/**
 * Imports Assets
 */
import productionSchema from 'peritext-schemas/production';

/**
 * Shared variables
 */
const editionSchema = productionSchema.definitions.edition;
const editionsTypes = editionSchema.properties.metadata.properties.type.enum;

class EditionsViewLayout extends Component {

  constructor( props ) {
    super( props );
  }

  componentWillReceiveProps = ( ) => {
  }

  renderMainColumn = () => {
    const {
      props: {
        newEditionPrompted,
        editedProduction,
        searchString,
        optionsVisibility,
        sortValue,
        filterValues,
        history,
        actions: {
          setNewEditionPrompted,
          setPromptedToDeleteEditionId,
          setOptionsVisibility,
          setSearchString,
          createEdition,
          setSortValue,
          setFilterValues,
        }
      },
      context: { t },
    } = this;

    /**
     * Variables definition
     */
    const {
      editions = {},
      id: productionId,
    } = editedProduction;

    /**
     * Computed variables
     */
    const activeFilters = Object.keys( filterValues ).filter( ( key ) => filterValues[key] );
    const editionsMap = Object.keys( editions ).map( ( editionId ) => editions[editionId] );

    const visibleEditions = editionsMap
    .filter( ( edition ) => {
      if ( searchString && searchString.length > 2 ) {
        return edition.metadata.title.toLowerCase().includes( searchString.toLowerCase() );
      }
      return true;
    } )
    .filter( ( edition ) => {
        if ( activeFilters.length ) {
          return activeFilters.indexOf( edition.metadata.type ) > -1;
        }
        return true;
    } )
    .sort( ( a, b ) => {
        switch ( sortValue ) {
          case 'edited recently':
            if ( a.lastUpdateAt > b.lastUpdateAt ) {
              return -1;
            }
            return 1;
          case 'title':
          default:
            const aTitle = a.metadata.title;
            const bTitle = b.metadata.title;
            if ( ( aTitle && bTitle ) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim() ) {
              return 1;
            }
            return -1;
        }
      } );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.EditionsView' );

    /**
     * Callbacks handlers
     */

    const handleNewEditionCancel = () => {
      setNewEditionPrompted( undefined );
    };

    const handleNewEditionSubmit = ( edition ) => {
      const newEdition = {
        ...edition,
        id: genId(),
        data: {
          ...edition.data,
          plan: {
            ...edition.data.plan,
            summary: edition.data.plan.summary.map( ( s ) => ( {
              ...s,
              id: genId(),
            } ) )
          }
        }
      };
      createEdition( {
        edition: newEdition,
        editionId: newEdition.id,
        productionId,
      }, ( err ) => {
        if ( !err ) {
          history.push( `/productions/${productionId}/editions/${newEdition.id}` );
        }
      } );
      setNewEditionPrompted( false );
    };

    if ( newEditionPrompted ) {
      return (
        <EditionForm
          onCancel={ handleNewEditionCancel }
          onSubmit={ handleNewEditionSubmit }
          availableTemplates={ templates }
        />
      );
    }
    else {
      const renderNoEdition = () => <div>{translate( 'No edition yet' )}</div>;
      const renderEditionInList = ( edition ) => {
          const handleEdit = () => {
          };
          const handleDuplicate = ( e ) => {
            e.stopPropagation();
            let editionTitle = edition.metadata.title;
            let number = editionTitle.match( /\d+/ );

            if ( number ) {
              number = +number[0];
              number += 1;
              editionTitle = editionTitle.replace( /\d+/, number );
            }
            else {
              number = 1;
              editionTitle = `${editionTitle} ${number}`;
            }

            const newEdition = {
              ...edition,
              metadata: {
                ...edition.metadata,
                title: editionTitle,
              },
              id: genId(),
            };
            createEdition( {
              edition: newEdition,
              editionId: newEdition.id,
              productionId,
            } );
          };
          const handleDelete = ( e ) => {
            e.stopPropagation();
            setPromptedToDeleteEditionId( edition.id );
          };
          const handleClick = () => {
            history.push( `/productions/${productionId}/editions/${edition.id}` );
          };
          return (
            <EditionCard
              onClick={ handleClick }
              onEdit={ handleEdit }
              onDelete={ handleDelete }
              onDuplicate={ handleDuplicate }
              href={ `/productions/${productionId}/editions/${edition.id}` }
              edition={ edition }
              key={ edition.id }
            />
          );
        };

      const handleResourceSearchChange = ( e ) => {
        setSearchString( e.target.value );
      };
      const handleToggleOptionsVisibility = () => {
        setOptionsVisibility( !optionsVisibility );
      };

      const handleSetOption = ( value, domain ) => {
        switch ( domain ) {
          case 'sort':
            setSortValue( value );
            break;
          case 'filter':
          default:
            const type = value;
            setFilterValues( {
              ...filterValues,
              [type]: filterValues[type] ? false : true
            } );
            break;
        }
      };
      return (
        <StretchedLayoutContainer isAbsolute>
          <StretchedLayoutItem>
            <Column style={ { paddingRight: 0 } }>
              <EditionsFiltersBar
                filterValues={ filterValues }
                onSearchStringChange={ handleResourceSearchChange }
                searchString={ searchString }
                onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                optionsVisible={ optionsVisibility }
                editionsTypes={ editionsTypes }
                onOptionChange={ handleSetOption }
                sortValue={ sortValue }
                translate={ translate }
                visibleEditions={ visibleEditions }
              />
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ 1 }>
            <StretchedLayoutContainer
              isAbsolute
              isDirection={ 'vertical' }
            >
              <PaginatedList
                items={ visibleEditions }
                itemsPerPage={ 30 }
                defaultColumns={ 2 }
                style={ { height: '100%' } }
                renderNoItem={ renderNoEdition }
                renderItem={ renderEditionInList }
              />
            </StretchedLayoutContainer>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      );
    }
  }

  render = () => {

    const {
      props: {
        newEditionPrompted,
        promptedToDeleteEditionId,
        production,
        actions: {
          setNewEditionPrompted,
          setPromptedToDeleteEditionId,
          deleteEdition,
        }
      },
      context: { t },
      renderMainColumn,
    } = this;

    /**
     * Variables definition
     */
    const {
      id: productionId
    } = production;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.EditionsView' );

    /**
     * Callbacks handlers
     */
    const handleNewEditionClick = () => {
      setNewEditionPrompted( !newEditionPrompted );
    };
    const handleCancelEditionDeletion = () => {
      setPromptedToDeleteEditionId( undefined );
    };
    const handleDeletePromptedToDeleteEdition = () => {
      deleteEdition( {
        editionId: promptedToDeleteEditionId,
        productionId
       } );
      setPromptedToDeleteEditionId( undefined );
    };

    return (
      <Container style={ { position: 'relative', height: '100%' } }>
        <StretchedLayoutContainer
          isFluid
          isDirection={ 'horizontal' }
          isAbsolute
        >
          <StretchedLayoutItem
            className={ 'is-hidden-mobile' }
            isFlex={ '1' }
            style={ { paddingLeft: '1rem' } }
          >
            <Column>
              <Title
                isSize={ 5 }
                style={ { paddingTop: '.5rem' } }
              >
                {translate( 'Production editions' )}

              </Title>
              <Content>
                {translate( 'Editions view aside' )}
              </Content>
              <Level>
                <Button
                  isFullWidth
                  onClick={ handleNewEditionClick }
                  isColor={ newEditionPrompted ? 'primary' : 'primary' }
                >
                  {translate( 'New edition' )}
                </Button>
              </Level>

            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ '3' }>
            <Column isWrapper>
              {renderMainColumn()}
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

        <ModalCard
          isActive={ promptedToDeleteEditionId !== undefined }
          headerContent={ translate( 'Delete an edition' ) }
          onClose={ handleCancelEditionDeletion }
          mainContent={
            <div>
              <p>
                {translate( 'Are you sure you want to delete this edition ?' )}
              </p>
            </div>
          }
          footerContent={ [
            <Button
              type={ 'submit' }
              isFullWidth
              key={ 0 }
              onClick={ handleDeletePromptedToDeleteEdition }
              isColor={ 'danger' }
            >{translate( 'Delete' )}
            </Button>,
            <Button
              onClick={ handleCancelEditionDeletion }
              isFullWidth
              key={ 1 }
              isColor={ 'warning' }
            >{translate( 'Cancel' )}
            </Button>,
          ] }
        />
      </Container>
    );
  }
}

EditionsViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default EditionsViewLayout;
