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
  Columns,

  Icon,
  Button,
  Title,
  Card,

  Tag,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { resourceHasContents } from 'peritext-utils';

/**
 * Imports Project utils
 */
import {
  abbrevString,
  silentEvent,
  computeSectionFirstWords,
} from '../../../helpers/misc';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { requestAssetData } from '../../../helpers/dataClient';
import { getColorByBgColor } from '../../../helpers/misc';

/**
 * Imports Components
 */
import AssetPreview from '../../../components/AssetPreview';
import CenteredIcon from '../../../components/CenteredIcon';

/**
 * Imports Assets
 */
import './ResourceCard.scss';

class ResourceCard extends Component {
  constructor ( props ) {
    super( props );
    this.state = {
      assets: {}
    };
    this.refreshAssets( props );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.resource !== nextProps.resource ) {
      this.refreshAssets( nextProps );
    }
  }

  refreshAssets = ( props ) => {
    const {
      productionId,
      assets = []
    } = props;
    assets.reduce( ( cur, asset ) => {
      return cur.then( () => {
        return new Promise( ( resolve, reject ) => {
          requestAssetData( { productionId, asset } )
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

    /**
     * Variables definition
     */
    const {
      props: {
        resource,
        // assets,
        getTitle,
        onEdit,
        onDelete,
        numberOfMentions = 0,
        isActive,
        onClick,
        isSelectable,
        productionId,
        onGoToResource,
        tags = {},
      },
      context: {
        t,
      },
      state: {
        assets = {}
      }
    } = this;
    const {
      data,
      metadata = {}
    } = resource;

    const {
      type,
    } = metadata;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Computed variables
     */
    let title;
    if ( type === 'bib' && data && data[0] ) {
      title = (
        <div
          className={ 'bib-wrapper' }
          dangerouslySetInnerHTML={ { __html: data[0].htmlPreview } }
        />
      );
    }
    else title = abbrevString( getTitle( resource ) || translate( 'untitled resource' ), 40 );
    let cardSize;
    switch ( resource.metadata.type ) {

      /*
       * case 'image':
       * case 'table':
       * case 'video':
       * case 'embed':
       *   cardSize = {
       *     mobile: 12,
       *     tablet: 6,
       *     desktop: 8,
       *     widescreen: 8,
       *   };
       *   break;
       */
      default:
        cardSize = {
          mobile: 12,
          tablet: 6,
          desktop: 4,
          widescreen: 4,
        };
        break;
    }
    const url = resource.data.url || Array.isArray( resource.data.citations ) && resource.data.citations[0] && resource.data.citations[0].URL;

    /**
     * Callbacks handlers
     */

    return (
      <Column
        isSize={ cardSize }
        style={ {
          padding: '.5rem'
        } }
      >
        <Card
          isSelectable={ isSelectable }
          isActive={ isActive }
          onClick={ onClick }
          bodyContent={
            <div
              className={ 'ovide-ResourceCard' }
            >
              <Columns style={ { marginBottom: 0 } }>
                <Column
                  isSize={ 1 }
                  style={ {
                    paddingTop: 0,
                    paddingBottom: 0,
                  } }
                >
                  <CenteredIcon
                    src={ icons[type] && icons[type].black.svg }
                    isSize={ '32x32' }
                  />
                  {
                    resourceHasContents( resource ) ?
                      <span
                        className={ 'contents-indicator' }
                        data-for={ 'tooltip' }
                        data-tip={ translate( 'this resource is annotated with contents' ) }
                      >
                        ☰
                      </span>
                    : null
                  }

                </Column>

                <Column
                  isSize={ 9 }
                  style={ {
                    paddingTop: 0,
                    paddingBottom: 0,
                    position: 'relative',
                    transition: 'none',
                  } }
                >
                  <Title
                    style={ { paddingTop: '.5rem', marginBottom: 0 } }
                    isSize={ 6 }
                  >
                    <span>
                      {title}
                      {
                          [ 'webpage', 'video' ].includes( resource.metadata.type ) ?
                            <a
                              style={ { marginLeft: '.5rem' } }
                              onClick={ silentEvent }
                              target={ 'blank' }
                              href={ url }
                            >
                              <Icon className={ 'fa fa-external-link' } />
                            </a>
                          :
                            null
                        }

                    </span>
                  </Title>
                </Column>
              </Columns>
              {![ 'webpage', 'glossary', 'bib' ].includes( resource.metadata.type ) &&
              <Columns style={ { marginBottom: 0 } }>
                <Column
                  style={ { position: 'relative' } }
                  isSize={ 12 }
                >
                  <div style={ { maxWidth: '100%', overflow: 'hidden', maxHeight: '20rem' } }>
                    <AssetPreview
                      resource={ resource }
                      silentPreviewClick={ false }
                      assets={ assets }
                      productionId={ productionId }
                    />
                  </div>

                </Column>
              </Columns>
              }
              {
                resourceHasContents( resource ) ?
                  <p style={ { fontSize: '.8rem', paddingLeft: '.5rem', marginBottom: 0 } }>
                    <i>
                      {computeSectionFirstWords( resource )}
                    </i>
                  </p> : null
              }
              {
                resource.metadata.tags && resource.metadata.tags.length ?
                  <div style={ { padding: 0, fontSize: '.6rem' } }>
                    {
                    resource.metadata.tags.map( ( tagId ) => {
                      const tag = tags[tagId];
                      if ( tag ) {
                        return (
                          <Tag
                            style={ {
                              background: tag.color,
                              color: getColorByBgColor( tag.color )
                            } }
                            key={ tagId }
                          >
                            {tag.name}
                          </Tag>
                        );
                      }
                      return null;

                    } )
                  }
                  </div>
                :
                null
              }
              {
                ( numberOfMentions > 0 || resource.lastUpdateAt ) &&
                <div
                  style={ {
                    padding: '.5rem',
                    fontSize: '.6rem'
                  } }
                >
                  {
                    numberOfMentions > 0 ?
                      <div>
                        <i>{translate( [ 'one mention in contents', '{n} mentions in contents', 'n' ], { n: numberOfMentions } )}</i>
                      </div>
                    : null
                  }
                  {
                    resource.lastUpdateAt &&
                    <div>
                      <i>{translate( 'Last update:' )} {new Date( resource.lastUpdateAt ).toLocaleString()}</i>
                    </div>
                  }
                </div>
              }

              <Columns>
                <Column
                  isSize={ 7 }
                  style={ {
                    paddingLeft: '1rem'
                  } }
                >
                  <Button
                    onClick={ onEdit }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'settings' ) }
                  >
                    <CenteredIcon src={ icons.settings.black.svg } />
                  </Button>

                  <Button
                    onClick={ onGoToResource }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'edit contents' ) }
                  >
                    <CenteredIcon src={ icons.edit.black.svg } />
                  </Button>

                  <Button
                    onClick={ onDelete }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( `delete this ${type}` ) }
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

ResourceCard.contextTypes = {
  t: PropTypes.func.isRequired,
  getResourceDataUrl: PropTypes.func
};

export default ResourceCard;
