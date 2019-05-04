/**
 * This module provides a card representing an edition in editions view
 * @module ovide/features/EditionsView
 */
/* eslint react/no-danger : 0 */
/* eslint react/prefer-stateless-function : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Column,
  Columns,
  Button,
  Title,
  Card,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import {
  abbrevString,
} from '../../../helpers/misc';
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Import components
 */
import CenteredIcon from '../../../components/CenteredIcon';

/**
 * Imports Assets
 */

class EditionCard extends Component {
  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        edition,
        href,
        // onEdit,
        onDelete,
        onClick,
        onDuplicate,
      },
      context: {
        t,
      }
    } = this;
    const {
      metadata = {}
    } = edition;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.EditionView' );

    /**
     * Computed variables
     */
    const editionsIcons = {
      paged: require( '../../../sharedAssets/paged.png' ),
      screened: require( '../../../sharedAssets/screened.png' ),
    };

    /**
     * Callbacks handlers
     */

    return (
      <Column
        isSize={ '12' }
      >
        <Card
          onClick={ onClick }
          bodyContent={
            <div
              className={ 'ovide-EditionCard' }
            >
              <Columns style={ { marginBottom: 0 } }>
                <Column isSize={ 2 }>
                  <CenteredIcon src={ editionsIcons[metadata.type] } />
                </Column>

                <Column
                  style={ { transition: 'none', paddingTop: '.2rem' } }
                  isSize={ 8 }
                >
                  <Title
                    style={ { paddingTop: '.5rem' } }
                    isSize={ 6 }
                  >
                    <Link to={ href }>
                      {metadata.title && metadata.title.length ? abbrevString( metadata.title, 30 ) : translate( 'Untitled edition' )}
                    </Link>
                    {
                      edition.lastUpdateAt &&
                      <p style={ { fontSize: '.7rem', marginTop: '1rem', marginBottom: '1rem', opacity: 0.5 } }>
                        <i>
                          {translate( 'Last modification' )}: {new Date( edition.lastUpdateAt ).toLocaleString()}
                        </i>
                      </p>
                    }
                  </Title>
                </Column>
              </Columns>
              <Columns>
                <Column
                  style={ { paddingTop: 0 } }
                  isOffset={ 2 }
                  isSize={ 7 }
                >
                  <Button
                    onClick={ onClick }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'edit this edition' ) }
                  >
                    <CenteredIcon src={ icons.edit.black.svg } />
                  </Button>
                  <Button
                    onClick={ onDuplicate }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'duplicate this edition' ) }
                  >
                    <CenteredIcon src={ icons.asset.black.svg } />
                  </Button>

                  <Button
                    onClick={ onDelete }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'delete this edition' ) }
                  >
                    <CenteredIcon src={ icons.remove.black.svg } />
                  </Button>

                </Column>
              </Columns>
            </div>
        }
        />
      </Column>
    );
  }
}

EditionCard.contextTypes = {
  t: PropTypes.func.isRequired,
  getResourceDataUrl: PropTypes.func
};

export default EditionCard;
