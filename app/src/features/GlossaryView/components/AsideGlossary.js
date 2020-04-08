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
    Tabs,
    TabList,
    Tab,
    TabLink
  } from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import LoadingScreen from '../../../components/LoadingScreen';
import CenteredIcon from '../../../components/CenteredIcon';

// import { ReferencesManager } from 'react-citeproc';

import { translateNameSpacer } from '../../../helpers/translateUtils';

import Mentions from './Mentions';
import Prospections from './Prospections';

import CitationsBuilder from '../../../helpers/citationsBuilder.worker';
import ProspectionsBuilder from '../../../helpers/glossaryProspectionsBuilder.worker';

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

        this.prospectionsBuilder = new ProspectionsBuilder();
        this.prospectionsBuilder.onmessage = this.onProspectionsBuilderMessage;

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
    componentWillUnmount = () => {
      this.prospectionsBuilder.terminate();
      this.citationsBuilder.terminate();
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
  onProspectionsBuilderMessage = ( event ) => {
    const { data } = event;
    const { type, response } = data;
    if ( type && response ) {
      switch ( type ) {
        case 'BUILD_PROSPECTIONS':
          const { prospections } = response;
          this.setState( {
            prospections,
            loading: false,
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
      const { production, resource } = this.props;
      this.prospectionsBuilder.postMessage( {
        type: 'BUILD_PROSPECTIONS',
        payload: {
          resource,
          searchTerm: value,
          production
        }
      } );
      this.setState( {
        loading: true,
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
                getIcon,
            },
            state: {
                prospections = [],
                loading,
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
            if ( !contents ) {
              contents = { entityMap: {}, blocks: [] };
            }
            return Object.keys( contents.entityMap ).find( ( entityKey ) => {
                const entity = contents.entityMap[entityKey];
                if ( entity.type === 'INLINE_ASSET' && entity.data.asset.id === contextualizationId ) {
                    contents.blocks.find( ( block, blockIndex ) => {
                        const match = block.entityRanges.find( ( range ) => +range.key === +entityKey );
                        if ( match ) {
                            mention = {
                                offset: match.offset,
                                length: match.length,
                                blockIndex,
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
          if ( searchString.length > MIN_SEARCH_LENGTH && mention.contentId && mention.blockIndex !== undefined ) {
            const section = production.resources[mention.sectionId];
            const contents = mention.contentId === 'main' ? section.data.contents.contents : section.data.contents.notes[mention.contentId].contents;
            const block = contents.blocks[mention.blockIndex];
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
      const title = resource &&
        resource.data &&
        resource.data.name &&
        resource.data.name.trim().length ?
        resource.data.name
        :
        translate( 'Unnamed glossary entry' );
      return (
        <div>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column>
                <Title
                  style={ { paddingTop: '.5rem' } }
                  isSize={ 5 }
                >
                  <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' } }>
                    <CenteredIcon
                      src={ icons.glossary.black.svg }
                      isSize={ '32x32' }
                    />
                    {translate( 'You are editing mentions for "{title}" entry', { title } )}
                    <span
                      data-for={ 'tooltip' }
                      className={ 'contents-indicator' }
                      data-tip={ translate( resource.data.entryType ) }
                    >
                      <i className={ `fa fa-${getIcon( resource.data.entryType )}` } />
                    </span>
                  </span>

                </Title>

              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column>
                <Tabs
                  isBoxed
                  isFullWidth
                  style={ { overflow: 'hidden' } }
                >
                  <TabList>
                    <Tab
                      onClick={ handleSetMentionModeToAdd }
                      isActive={ mentionMode === 'add' }
                    >
                      <TabLink>
                        {translate( 'Add new mentions' )}
                      </TabLink>
                    </Tab>
                    <Tab
                      onClick={ handleSetMentionModeToReview }
                      isActive={ mentionMode === 'review' }
                    >
                      <TabLink>
                        {translate( 'Review existing mentions' )} ({mentions.length})
                      </TabLink>
                    </Tab>
                  </TabList>
                </Tabs>
              </Column>
            </StretchedLayoutItem>

            <StretchedLayoutItem>
              <Column>

                {
                    renderHeader( {
                        mentionMode,
                        searchString,
                        onSearchStringChange: handleSearchStringChange,
                        addAllProspects,
                        prospections,
                        mentions,
                        removeAllMentions,
                        getIcon,
                        translate,
                    } )
                }
              </Column>
            </StretchedLayoutItem>

            <StretchedLayoutItem isFlex={ 1 }>
              {
                  loading ? <LoadingScreen /> :
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
                }
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
