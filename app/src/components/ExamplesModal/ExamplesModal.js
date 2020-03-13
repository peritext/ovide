/**
 * This module provides a modal for adding quickly a link in editor
 * @module ovide/components/ExamplesModal
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import get from 'axios';

import {
  ModalCard,
  Notification,
  Box,
  Content,
  Title,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * Import components
 */

const repoBasis = 'https://raw.githubusercontent.com/peritext/peritext-usecases/master';

class ExamplesModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };

  constructor ( props ) {
    super( props );
    this.state = {
      info: undefined,
      networkError: undefined,
    };
  }

  componentDidMount = () => {
    this.getJSON( 'info.json' )
    .then( ( { cases } ) => {
      this.setState( { cases } );
    } )
    .catch( ( networkError ) => {
      this.setState( {
        networkError
      } );
    } );
  }

  getJSON = ( path ) => {
    const url = `${repoBasis}/${path}`;
    return new Promise( ( resolve, reject ) => {
      get( url )
        .then( ( { data } ) => resolve( data ) )
        .catch( reject );
    } );
  }

  onImportCase = ( id ) => {
    this.props.onClose();
    this.getJSON( `${id}/production.json` )
    .then( ( data ) => {
      this.props.onImportExample( data );
    } )
    .catch( ( networkError ) => {
      this.setState( {
        networkError
      } );
    } );
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      context: {
        t
      },
      state: {
        networkError,
        cases,
      },
      props: {
        isActive,
        onClose,
        lang,
      }
    } = this;

    /**
     * Computed variables
     */

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.ExamplesModal' );

    /**
     * Callbacks handlers
     */

    return (
      <ModalCard
        isActive={ isActive }
        headerContent={ translate( 'Load an example' ) }
        onClose={ onClose }
        mainContent={
          <div>
            {
              networkError ?
                <Notification type={ 'error' }>
                  {translate( 'The demonstration cases could not be loaded' )}
                </Notification>
              : null
            }
            {
              cases && cases.length > 0 &&
              cases.map( ( c ) => {
                const handleClick = () => {
                  this.onImportCase( c.id );
                };
                return (
                  <Box
                    style={ { cursor: 'pointer' } }
                    onClick={ handleClick }
                    key={ c.id }
                  >
                    <Title isSize={ 3 }>{c.title}</Title>
                    <Title isSize={ 4 }>{c.author}</Title>
                    <Content>
                      <i>{c.description[lang]}</i>
                    </Content>
                  </Box>
                );
              } )
            }
          </div>
        }
      />
    );
  }
}

export default ExamplesModal;
