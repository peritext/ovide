/**
 * This module provides a wrapper for production cards as displayed in list within the home view
 * @module ovide/features/HomeView
 */
/* eslint react/prefer-stateless-function : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import {
  Level,
  Column
} from 'quinoa-design-library/components/';

/**
 * Imports Components
 */
import ProductionCard from './ProductionCard';

export default class ProductionCardWrapper extends Component {
  render = () => {
    const {
      production,
      onAction: handleAction,
      onClick: handleClick,
    } = this.props;
    return (
      <Level>
        <Column>
          <ProductionCard
            production={ production }
            onClick={ handleClick }
            onAction={ handleAction }
          />
        </Column>
      </Level>
    );
  }
}
