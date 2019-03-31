import React from 'react';
import PaginatedList from '../../../components/PaginatedList';
import MentionCard from './MentionCard';

import {
    Column,

    Title,
  } from 'quinoa-design-library/components';

const Mentions = ( {
    production,
    mentions,
    removeMention,
    translate,
} ) => {

    const renderNoMentions = () => (
      <Column style={ {
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        } }
      >
        <Title isSize={ 4 }>{
            translate( 'No mentions yet for this glossary entry' )
        }
        </Title>
      </Column>
    );
    const renderMentionInList = ( mention ) => {
        return (
          <MentionCard
            mention={ mention }
            production={ production }
            key={ mention.contextualizationId }
            removeMention={ removeMention }
          />
        );
    };
    return (
      <PaginatedList
        items={ mentions }
        itemsPerPage={ 30 }
        defaultColumns={ 1 }
        style={ { height: '100%' } }
        renderNoItem={ renderNoMentions }
        renderItem={ renderMentionInList }
      />
    );
};

export default Mentions;
