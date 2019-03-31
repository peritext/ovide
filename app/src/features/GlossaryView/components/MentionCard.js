/**
 * This module provides a card representing a resource in library view (extended display with preview if relevant)
 * @module ovide/features/LibraryView
 */
/* eslint react/no-danger : 0 */
/* eslint react/prefer-stateless-function : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Column,

  Button,
  Content,
  Notification,
  Card,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import { contextualizers as contextualizersModules } from '../../../peritextConfig.render';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import CenteredIcon from '../../../components/CenteredIcon';
import MatchRenderer from './MatchRenderer';

const buildMentionRawContent = ( {
    mention,
    production
} ) => {
    const section = production.sections[mention.sectionId];
    const contents = mention.contentId === 'main' ? section.contents : section.notes[mention.contentId];
    const matchEntityKey = `${+Object.keys( contents.entityMap ).pop() + 1 }`;
    const entitiesDedupMap = {};
    const contextualizationEntityKey = Object.keys( contents.entityMap )
        .find( ( entityKey ) => contents.entityMap[entityKey].type === 'INLINE_ASSET' && contents.entityMap[entityKey].data.asset.id === mention.contextualizationId );
        const finalContents = {
        ...contents,
        blocks: contents.blocks
                    .filter( ( b ) => b.key === mention.blockKey )
                    .map( ( block ) => ( {
                        ...block,
                        entityRanges: [
                            ...block.entityRanges,
                            {
                                offset: mention.offset,
                                length: mention.length,
                                key: matchEntityKey
                            }
                        ]
                        .filter( ( range ) => {

                          if (
                            +range.key !== +contextualizationEntityKey &&
                            ( range.key === matchEntityKey || (
                            contents.entityMap[range.key]
                            && !entitiesDedupMap[range.key]
                            )
                            )
                            ) {
                              entitiesDedupMap[range.key] = true;
                              return true;
                            }
                        } )
                    } ) ),
        entityMap: {
            ...contents.entityMap,
            [matchEntityKey]: {
                type: 'MENTION_MARKER',
                data: {
                  id: mention.id
                }
            }
        }
    };
    return finalContents;
};

class MentionCard extends Component {
  constructor ( props ) {
    super( props );
  }

  getChildContext = () => ( {
      production: this.props.production,
      renderingMode: 'paged',
      contextualizers: contextualizersModules
  } )

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        mention,
        production,
        removeMention,
      },
      context: {
        t,
      },
    } = this;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.GlosaryView' );

    /**
     * Computed variables
     */
    const cardSize = 12;
    let raw;
    if ( mention.contentId && mention.blockKey ) {
      raw = buildMentionRawContent( { mention, production } );
    }

    /**
     * Callbacks handlers
     */
    const handleClick = () => {
        removeMention( mention );
    };
    return (
      <Column
        isSize={ cardSize }
      >
        <Card
          isSelectable={ false }
          isActive={ undefined }
          bodyContent={
            <StretchedLayoutContainer
              isDirection={ 'horizontal' }
              className={ 'ovide-MentionCard' }
            >
              <StretchedLayoutItem isFlex={ 1 }>
                {raw ?
                  <Content>
                    <MatchRenderer raw={ raw } />
                  </Content>
                :
                  <Notification isColor={ 'danger' }>
                    {translate( 'Bugged glossary mention' )}
                  </Notification>
                }
                <p><i>{production.sections[mention.sectionId].metadata.title}</i></p>
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Button
                  onClick={ handleClick }
                  isRounded
                  isColor={ 'warning' }
                  data-place={ 'left' }
                  data-effect={ 'solid' }
                  data-for={ 'tooltip' }
                  data-tip={ translate( 'remove mention' ) }
                >
                  <CenteredIcon src={ icons.remove.black.svg } />
                </Button>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
        }
        />
      </Column>
    );
  }
}

MentionCard.childContextTypes = {
    production: PropTypes.object,
    renderingMode: PropTypes.string,
    contextualizers: PropTypes.object,
};

MentionCard.contextTypes = {
  t: PropTypes.func.isRequired,
  getResourceDataUrl: PropTypes.func
};

export default MentionCard;
