import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Delete,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';
import Form from './ContextualizationForm';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { getRelatedAssetsIds } from '../../helpers/assetsUtils';
import { requestAssetData } from '../../helpers/dataClient';

class ContextualizationEditor extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      assets: props.assets || {}
    };

  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( nextProps.contextualization && nextProps.resource ) {
      this.refreshAssets( nextProps );
    }
  }
  refreshAssets = ( props ) => {
    const {
      assets,
      resource = {},
      productionId,
    } = props;

    const relatedAssetsIds = getRelatedAssetsIds( resource.data );
    // const relatedAssets = relatedAssetsIds.map( ( thatId ) => assets[thatId] ).filter( ( a ) => a );
    const relatedAssets = relatedAssetsIds
    .map( ( id ) => assets[id] ).filter( ( a ) => a );

    relatedAssets.reduce( ( cur, asset ) => {
      return cur.then( () => {
        return new Promise( ( resolve, reject ) => {
          requestAssetData( productionId, asset )
            .then( ( data ) => {
              this.setState( {
                assets: {
                  ...this.state.assets,
                  [asset.id]: {
                    ...asset,
                    data
                  }
                }
              } );
              return resolve();
            } )
            .catch( reject );
        } );
      } );
    }, Promise.resolve() );
  }

  render = () => {
    const {
      props: {
        // isActive,
        onClose,
        contextualization,
        contextualizer,
        resource,
        productionId,

        /*
         * assets,
         * renderingMode,
         */
        updateContextualization,
        updateContextualizer,
      },
      context: { t }
    } = this;

    const translate = translateNameSpacer( t, 'Components.ContextualizationEditor' );

    if ( !contextualization || !resource ) {
      return null;
    }
    const handleChange = ( key, value ) => {
      return new Promise( ( resolve, reject ) => {
        if ( key === 'contextualization' ) {
          const newContextualization = {
            ...contextualization,
            ...value
          };
          updateContextualization( {
            productionId,
            contextualizationId: newContextualization.id,
            contextualization: newContextualization
          }, ( err ) => {
            if ( err ) {
              reject( err );
            }
            else {
              resolve();
            }
          } );

        }
        else return resolve();
      } )
      .then( () => new Promise( ( resolve, reject ) => {
        if ( key === 'contextualizer' ) {
          const newContextualizer = {
            ...contextualizer,
            ...value
          };

          updateContextualizer( {
            productionId,
            contextualizerId: newContextualizer.id,
            contextualizer: newContextualizer
          }, ( err ) => {
            if ( err ) {
              reject( err );
            }
            else {
             resolve();
           }
          } );
        }
        else return resolve();
      } ) );
    };
    return (
      <StretchedLayoutContainer
        isDirection={ 'vertical' }
        style={ { height: '100%', overflow: 'hidden' } }
      >
        <StretchedLayoutItem>
          <StretchedLayoutContainer
            isDirection={ 'horizontal' }
          >
            <StretchedLayoutItem isFlex={ 1 }>
              <Title isSize={ 4 }>
                {translate( 'Mention settings' )}
              </Title>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Delete onClick={ onClose } />
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          style={ { overflow: 'auto' } }
          isFlex={ 1 }
        >
          <Form
            translate={ translate }
            contextualizer={ contextualizer }
            contextualization={ contextualization }
            resource={ resource }
            onChange={ handleChange }
          />
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    );

  }
}

ContextualizationEditor.contextTypes = {
  t: PropTypes.func,
};

export default ContextualizationEditor;
