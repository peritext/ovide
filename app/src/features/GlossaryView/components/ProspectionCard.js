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

const buildProspectRawContent = ( {
    prospect,
    production
} ) => {
    const section = production.sections[prospect.sectionId];
    const contents = prospect.contentId === 'main' ? section.contents : section.notes[prospect.contentId];
    if ( !contents || !contents.entityMap ) {
      return;
    }
    const matchEntityKey = `${+( Object.keys( contents.entityMap ).pop() || 0 ) + 1 }`;
    const entitiesDedupMap = {};
    const finalContents = {
        ...contents,
        blocks: [ ...contents.blocks
                    .filter( ( b ) => b.key === prospect.blockKey )
                    .map( ( block ) => ( {
                        ...block,
                        entityRanges: [
                            ...block.entityRanges.filter( ( r ) => {
                              if ( r.key !== +matchEntityKey &&
                              contents.entityMap[r.key] &&
                              !entitiesDedupMap[r.key]
                              ) {
                                entitiesDedupMap[r.key] = true;
                                return true;
                              }
                            }

                            ),
                            {
                                offset: prospect.offset,
                                length: prospect.length,
                                key: +matchEntityKey
                            }
                        ]
                    } ) ) ],
        entityMap: {
            ...contents.entityMap,
            [matchEntityKey]: {
                type: 'MATCH_MARKER',
                data: {
                  id: prospect.id
                }
            }
        }
    };
    return { ...finalContents };
};

class ProspectionCard extends Component {
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
        prospect,
        production,
        addProspect,
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
    const raw = buildProspectRawContent( { prospect, production } );

    /**
     * Callbacks handlers
     */
    const handleClick = () => {
        addProspect( prospect );
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
              className={ 'ovide-ProspectionCard' }
            >
              <StretchedLayoutItem isFlex={ 1 }>
                <Content>
                  <MatchRenderer raw={ raw } />
                </Content>
                <p><i>{production.sections[prospect.sectionId].metadata.title}</i></p>
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Button
                  onClick={ handleClick }
                  isRounded
                  isColor={ 'info' }
                  data-place={ 'left' }
                  data-effect={ 'solid' }
                  data-for={ 'tooltip' }
                  data-tip={ translate( 'add mention' ) }
                >
                  <CenteredIcon src={ icons.asset.black.svg } />
                </Button>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
        }
        />
      </Column>
    );
  }
}

ProspectionCard.childContextTypes = {
    production: PropTypes.object,
    renderingMode: PropTypes.string,
    contextualizers: PropTypes.object,
};

ProspectionCard.contextTypes = {
  t: PropTypes.func.isRequired,
  getResourceDataUrl: PropTypes.func
};

export default ProspectionCard;
