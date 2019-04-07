/**
 * This module provides a card for displaying a production
 * @module ovide/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Card,
  Columns,
  Column,
  Content,
  Icon,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString
} from '../../../helpers/misc';

/**
 * Shared variables
 */
const MAX_STR_LEN = 80;

const InlineIcon = ( {
  icon
} ) => (
  <Icon
    style={ { marginLeft: '.5rem', marginRight: '1rem' } }
    className={ `fa fa-${icon}` }
  />
);

const ProductionCard = ( {
  production,
  onAction,
  onClick,
}, {
  t
} ) => {
  const translate = translateNameSpacer( t, 'Components.ProductionCard' );
  return (
    <div
      onClick={ onClick }
      className={ 'is-clickable' }
    >
      <Card
        title={
          <Columns>
            <Column
              data-effect={ 'solid' }
              data-for={ 'tooltip' }
              data-tip={ ( production.metadata.title || '' ).length > MAX_STR_LEN ? production.metadata.title : undefined }
              isSize={ 8 }
              style={{wordBreak: 'normal'}}
            >
              <Link
                style={ { color: 'inherit' } }
                to={ `productions/${production.id}` }
              >
                <b
                >{abbrevString( production.metadata.title, MAX_STR_LEN )}</b>
              </Link>

            </Column>
          </Columns> }
        subtitle={ abbrevString( production.metadata.subtitle, MAX_STR_LEN ) }
        bodyContent={
          <div>
            {
              production.metadata.authors &&
              production.metadata.authors.length > 0 &&
              <Content>
                <i>{abbrevString(
                  production.metadata.authors.map( ( author ) => {
                    return typeof author === 'string' ? author : `${author.given} ${author.family}`;
                  } ).join( ', ' )
                  , MAX_STR_LEN )}
                </i>
              </Content>
            }

            {
            production.metadata.abstract && production.metadata.abstract.length > 0 &&
            <Content>
              {abbrevString( production.metadata.abstract, 300 )}
            </Content>
          }
            {
            production.lastUpdateAt &&
            <p style={ { fontSize: '.7rem' } }>
              <i>
                {translate( 'Last modification' )}: {new Date( production.lastUpdateAt ).toLocaleString()}
              </i>
            </p>
          }
          </div> }
        onAction={ onAction }
        footerActions={ [] }
        asideActions={ [
          {
            label: <span><InlineIcon icon={ 'pencil-alt' } /> {translate( 'edit' )}</span>,
            isColor: 'primary',
            id: 'open',
          },
          {
            label: <span><InlineIcon icon={ 'copy' } />{translate( 'duplicate' )}</span>,
            id: 'duplicate',
          },
          {
            label: <span><InlineIcon icon={ 'trash' } />{translate( 'delete' )}</span>,
            isColor: 'danger',
            id: 'delete',
          },

        ] }
      />
    </div>
  );
};

ProductionCard.propTypes = {
  onAction: PropTypes.func,
  production: PropTypes.object,
};

ProductionCard.contextTypes = {
  t: PropTypes.func
};

export default ProductionCard;
