import React from 'react';

import {
  Column,
  Title,
} from 'quinoa-design-library/components';

import PaginatedList from '../../../components/PaginatedList';
import ProspectionCard from './ProspectionCard';

const Prospections = ( {
    searchString = '',
    translate,
    prospections,
    production,
    addProspect,
    minSearchLength,
} ) => {
    if ( searchString.length < minSearchLength ) {
        return (
          <div style={ {
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            } }
          >
            <Title isSize={ 3 }>{
                translate( 'Search text parts in the above box in your production to mention with the glossary entry' )
            }
            </Title>
          </div>
        );
    }
    const renderNoProspection = () => (
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
            translate( 'No unmentionned matches for "{s}"', { s: searchString } )
        }
        </Title>
      </Column>
    );
    const renderProspectionInList = ( prospect, index ) => {
        return (
          <ProspectionCard
            key={ index }
            prospect={ prospect }
            production={ production }
            addProspect={ addProspect }
          />
        );
    };
    return (
      <PaginatedList
        items={ prospections }
        itemsPerPage={ 30 }
        defaultColumns={ 1 }
        style={ { height: '100%' } }
        renderNoItem={ renderNoProspection }
        renderItem={ renderProspectionInList }
      />
    );
};

export default Prospections;
