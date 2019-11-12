import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import {
    Button,
    Column,
    ModalCard,
    Input,
    Title,
    StretchedLayoutContainer,
    StretchedLayoutItem,
  } from 'quinoa-design-library/components';

// import { ReferencesManager } from 'react-citeproc';

import { translateNameSpacer } from '../../../helpers/translateUtils';
import { buildCitationsForProduction, getCitationModels } from '../../../helpers/citationUtils';

import Mentions from './Mentions';
import Prospections from './Prospections';

import {
    // getCitationModels,
    findProspectionMatches
  } from './utils';
import { resourceHasContents } from 'peritext-utils';
import { computeAssetsForProduction } from '../../../helpers/resourcesUtils';
import CitationsBuilder from '../../../helpers/citationsBuilder.worker.js';

const MIN_SEARCH_LENGTH = 2;

const renderHeader = ( {
    mentionMode = '',
    searchString,
    onSearchStringChange,
    translate,
    addAllProspects,
    removeAllMentions,
    prospections,
    mentions,
} ) => {
    if ( mentionMode === 'add' ) {
        return (
          <StretchedLayoutContainer isDirection={ 'horizontal' }>
            <StretchedLayoutItem isFlex={ 1 }>
              <StretchedLayoutContainer>
                <Column style={ { paddingLeft: 0 } }>
                  <Input
                    value={ searchString }
                    onChange={ onSearchStringChange }
                    placeholder={ translate( 'Find matches' ) }
                  />
                </Column>
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column style={ { paddingRight: 0 } }>
                <Button
                  isDisabled={ prospections.length === 0 }
                  isColor={ 'primary' }
                  onClick={ addAllProspects }
                >
                  {translate( [ 'Add one match', 'Add {n} matches', 'n' ], { n: prospections.length } )}
                </Button>
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        );
    }
    return (
      <StretchedLayoutContainer isDirection={ 'horizontal' }>
        <StretchedLayoutItem isFlex={ 1 }>
          <Column style={ { paddingLeft: 0 } }>
            <Input
              value={ searchString }
              onChange={ onSearchStringChange }
              placeholder={ translate( 'Find mentions' ) }
            />
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <Column style={ { paddingRight: 0 } }>
            <Button
              isDisabled={ mentions.length === 0 }
              isColor={ 'danger' }
              onClick={ removeAllMentions }
            >
              {translate( [ 'Remove one mention', 'Remove {n} mentions', 'n' ], { n: mentions.length } )}
            </Button>
          </Column>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>

    );
};

class AsideGlossary extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            prospections: [],
            citations: {}
        };
        this.citationsBuilder = new CitationsBuilder();
        this.citationsBuilder.onmessage = this.onCitationsBuilderMessage;

        this.updateCitations( props );
        this.updateProspections = debounce( this.updateProspections, 1000 );

    }

    static childContextTypes = {
      citations: PropTypes.object,
    }

    getChildContext = () => ( {
      citations: this.state.citations && this.state.citations.citationComponents,
    } )

    componentDidMount = () => {
      setTimeout( () => {
            this.updateProspections( this.props.searchString );
      } );
    }
    componentWillReceiveProps = ( nextProps ) => {
      if ( nextProps.production && this.props.production.id !== nextProps.production.id ) {
          this.updateCitations( nextProps );
      }
      if (
          ( this.props.production.contextualizations !== nextProps.production.contextualizations )
          ||
          ( this.props.production.resources !== nextProps.production.resources )
          ||
          ( this.props.searchString !== nextProps.searchString && nextProps.searchString.length >= MIN_SEARCH_LENGTH )
          ) {
         setTimeout( () => {
              this.updateProspections( nextProps.searchString );
         } );
      }
  }

  onCitationsBuilderMessage = ( event ) => {
    const { data } = event;
    const { type, response } = data;
    if ( type && response ) {
      switch ( type ) {
        case 'BUILD_CITATIONS_FOR_PRODUCTION':
          const { citations } = response;
          this.setState( {
            citations,
          } );
          break;
        default:
          break;
      }
    }
  }

    updateProspections = ( value ) => {
      if ( !this.props.resource ) {
        return;
      }
      const { production } = this.props;

      const { contextualizations, resources } = production;
      const matches = Object.keys( production.resources )
      .filter( ( resourceId ) => resourceHasContents( production.resources[resourceId] ) )
      .reduce( ( result, resourceId ) => {
          const section = production.resources[resourceId];
          return [
              ...result,
              ...findProspectionMatches( {
                  contents: section.data.contents.contents,
                  sectionId: resourceId,
                  contentId: 'main',
                  value,
                  contextualizations,
                  resources,
              } ),
              ...section.data.contents.notesOrder.reduce( ( res, noteId ) =>
                  [ ...res, ...findProspectionMatches( {
                      contents: section.data.contents.notes[noteId].contents,
                      sectionId: resourceId,
                      noteId,
                      value,
                      contextualizations,
                      resources,
                  } ) ]
              , [] )
          ];
      }
      , [] );

      this.setState( {
          prospections: matches
      } );
    }
    onSearchStringChange = ( value ) => {
        this.props.onSearchStringChange( value );
    }
    updateCitations = ( props ) => {
        const { production } = props;
        this.citationsBuilder.postMessage( {
          type: 'BUILD_CITATIONS_FOR_PRODUCTION',
          payload: {
            production,
          }
         } );
    }
    render = () => {
        const {
            props: {
                resource = {},
                mentionMode = 'add',
                addProspect,
                addProspects,
                removeMention,
                removeMentions,
                mentionsToDeleteNumber,
                mentionsToCreateNumber,
                setMentionMode,
                searchString,
                production,
                isBatchDeleting,
                mentionDeleteStep,
                isBatchCreating,
                mentionCreationStep,
            },
            state: {
                prospections = [],
                citations,
            },
            context: {
                t
            },
            onSearchStringChange,
            } = this;
          const { id: resourceId } = resource;

        const translate = translateNameSpacer( t, 'Features.GlossaryView' );

        const relatedContextualizationsIds = Object.keys( production.contextualizations )
        .filter( ( contextualizationId ) => production.contextualizations[contextualizationId].sourceId === resourceId );

        const searchStringLower = searchString.toLowerCase();
        const mentions = relatedContextualizationsIds.map( ( contextualizationId ) => {
          const contextualization = production.contextualizations[contextualizationId];
          const sectionId = contextualization.targetId;
          const section = production.resources[sectionId];
          const editors = [ 'main', ...production.resources[sectionId].data.contents.notesOrder ];
          let mention = {
            sectionId,
            contextualizationId,
          };
          editors.find( ( editorId ) => {
            let contents;
            if ( editorId === 'main' ) {
                contents = section.data.contents.contents;
            }
            else {
                contents = section.data.contents.notes[editorId].contents;
            }
            return Object.keys( contents.entityMap ).find( ( entityKey ) => {
                const entity = contents.entityMap[entityKey];
                if ( entity.type === 'INLINE_ASSET' && entity.data.asset.id === contextualizationId ) {
                    // console.log('found with entity', entity, entityKey);
                    contents.blocks.find( ( block ) => {
                        const match = block.entityRanges.find( ( range ) => +range.key === +entityKey );
                        // console.log('match', match);
                        if ( match ) {
                            mention = {
                                offset: match.offset,
                                length: match.length,
                                blockKey: block.key,
                                sectionId,
                                contentId: editorId,
                                contextualizationId
                            };
                            return true;
                        }
                    } );
                    return true;
                }
            } );
            } );
            return mention;
        } )
        .filter( ( mention ) => {
          if ( searchString.length > MIN_SEARCH_LENGTH && mention.contentId && mention.blockKey ) {
            const section = production.resources[mention.sectionId];
            const contents = mention.contentId === 'main' ? section.data.contents.contents : section.data.contents.notes[mention.contentId].contents;
            const block = contents.blocks.find( ( thatBlock ) => thatBlock.key === mention.blockKey );
            return block.text.toLowerCase().includes( searchStringLower );
          }
          return true;
        } );
        const handleSetMentionModeToReview = () => {
            setMentionMode( 'review' );
            onSearchStringChange( '' );
        };
        const handleSetMentionModeToAdd = () => {
            setMentionMode( 'add' );
            onSearchStringChange( '' );
        };
        const handleSearchStringChange = ( e ) => {
            onSearchStringChange( e.target.value );
        };
        const addAllProspects = () => {
            addProspects( prospections );
        };
        const removeAllMentions = () => {
          removeMentions( mentions );
        };
      return (
        <div>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column>
                <Title
                  style={ { paddingTop: '.5rem' } }
                  isSize={ 5 }
                >{
                            resource &&
                            resource.data &&
                            resource.data.name &&
                            resource.data.name.trim().length ?
                            resource.data.name
                            :
                            translate( 'Unnamed glossary entry' )
                        } - <i>{mentionMode === 'add' ? translate( 'add new mentions' ) : translate( 'existing mentions' )}</i>
                </Title>
                {
                    renderHeader( {
                        mentionMode,
                        searchString,
                        onSearchStringChange: handleSearchStringChange,
                        addAllProspects,
                        prospections,
                        mentions,
                        removeAllMentions,
                        translate,
                    } )
                }
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={ 1 }>
              <StretchedLayoutContainer isAbsolute>
                {
                        mentionMode === 'add' ?
                          <Prospections
                            searchString={ searchString }
                            translate={ translate }
                            prospections={ prospections }
                            production={ production }
                            addProspect={ addProspect }
                            minSearchLength={ MIN_SEARCH_LENGTH }
                          />
                        :
                          <Mentions
                            resourceId={ resource.id }
                            production={ production }
                            translate={ translate }
                            searchString={ searchString }
                            mentions={ mentions }
                            removeMention={ removeMention }
                            removeMentions={ removeMentions }
                          />
                    }
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column>
                <StretchedLayoutContainer isDirection={ 'horizontal' }>
                  <StretchedLayoutItem isFlex={ 1 }>
                    <Button
                      onClick={ handleSetMentionModeToAdd }
                      isColor={ mentionMode === 'add' ? 'primary' : 'info' }
                      isFullWidth
                    >
                      {translate( 'Add new mentions' )}
                    </Button>
                  </StretchedLayoutItem>
                  <StretchedLayoutItem isFlex={ 1 }>
                    <Button
                      onClick={ handleSetMentionModeToReview }
                      isColor={ mentionMode === 'review' ? 'primary' : 'info' }
                      isFullWidth
                    >
                      {translate( 'Review existing mentions' )} ({mentions.length})
                    </Button>
                  </StretchedLayoutItem>

                </StretchedLayoutContainer>
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>

          <ModalCard
            isActive={ isBatchDeleting }
            headerContent={ translate( [ 'Deleting a mention', 'Deleting {n} mentions', 'n' ], { n: mentionsToDeleteNumber } ) }
            mainContent={
              <div>
                {translate( 'Deleting mention {k} of {n}', { k: mentionDeleteStep + 1, n: mentionsToDeleteNumber } )}
              </div>
              }
          />
          <ModalCard
            isActive={ isBatchCreating }
            headerContent={ translate( [ 'Creating a mention', 'Creating {n} mentions', 'n' ], { n: mentionsToCreateNumber } ) }
            mainContent={
              <div>
                {translate( 'Creating mention {k} of {n}', { k: mentionCreationStep + 1, n: mentionsToCreateNumber } )}
              </div>
              }
          />
        </div>
      );
    }
}

AsideGlossary.contextTypes = {
    t: PropTypes.func,
};

export default AsideGlossary;
