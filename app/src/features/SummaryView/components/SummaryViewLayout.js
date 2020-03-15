/* eslint-disable arrow-parens */
/**
 * This module provides a layout component for displaying the summary view
 * @module ovide/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Column,
  BigSelect,
  Delete,
  Container,
  Notification,
  Content,
  Collapsable,
  Icon,
  Level,
  LevelItem,
  LevelLeft,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import stringify from 'fast-json-stable-stringify';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { abbrevString } from '../../../helpers/misc';
import { requestAssetData } from '../../../helpers/dataClient';
import downloadFile from '../../../helpers/fileDownloader';
import {
  bundleProjectAsJSON,
  bundleProjectAsZIP,
  bundleProjectAsHTML,
  bundleProjectAsMarkdown,
  bundleProjectAsTEI,
} from '../../../helpers/bundlersUtils';

/**
 * Imports Components
 */
import MetadataForm from '../../../components/MetadataForm';
import ExplainedLabel from '../../../components/ExplainedLabel';

const SummaryViewLayout = ( {
  editedProduction: production,
  metadataOpen,

  actions: {
    updateProductionMetadata,
    setMetadataOpen,
  },
}, { t } ) => {

  /**
   * Variables definition
   */
  const {
    metadata: {
      title,
      subtitle,
      authors,
      abstract
    },
    id: productionId,
  } = production;

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SummaryView' );

  /**
   * Computed variables
   */
  /**
   * Callbacks handlers
   */
  const handleMetadataEditionToggle = () => {
    setMetadataOpen( !metadataOpen );
    setTimeout( () => ReactTooltip.rebuild() );
  };

  const handleMetadataSubmit = ( { payload: { metadata } } ) => {
    const payload = {
      productionId,
      metadata,
    };
    updateProductionMetadata( payload );
    setMetadataOpen( false );
  };

  const handleDownload = ( type ) => {
    // console.log( 'handle export to file', type );
    const thatTitle = production.metadata.title;
    // @todo: handle failure error in UI
    const onRejection = ( e ) => console.error( e );/* eslint no-console : 0 */
    switch ( type ) {
      case 'html':
        bundleProjectAsHTML( { production, requestAssetData } )
          .then( ( HTMLbundle ) => {
            downloadFile( HTMLbundle, 'html', thatTitle );
          } )
          .catch( onRejection );
        break;
      case 'json':
        bundleProjectAsJSON( { production, requestAssetData } )
          .then( ( JSONbundle ) => {
            downloadFile( stringify( JSONbundle ), 'json', thatTitle );
          } )
          .catch( onRejection );
        break;
        case 'zip':
            bundleProjectAsZIP( { production, requestAssetData } );
            break;
      case 'markdown':
        bundleProjectAsMarkdown( { production, requestAssetData } )
          .then( ( markdownBundle ) => {
            downloadFile( markdownBundle, 'md', title );
          } )
          .catch( onRejection );
        break;
      case 'tei':
        bundleProjectAsTEI( { production, requestAssetData } )
          .then( ( teiBundle ) => {
            downloadFile( teiBundle, 'xml', thatTitle );
          } )
          .catch( onRejection );
        break;
      default:
        break;
    }
  };
  return (
    <Container style={ { position: 'relative', height: '100%' } }>
      <StretchedLayoutContainer
        isFluid
        isDirection={ 'horizontal' }
        isAbsolute
      >
        <StretchedLayoutItem
          style={ { marginTop: '1rem' } }
          isFluid
          isFlex={ 1 }
          isFlowing
        >
          <Column style={ { paddingLeft: '1.8rem' } }>
            <Level style={ { marginBottom: '.4rem' } }>
              <Collapsable
                maxHeight={ '100%' }
                isCollapsed={ metadataOpen }
              >
                <Title isSize={ 2 }>
                  {abbrevString( title, 60 )}
                </Title>
                {subtitle &&
                  <Title isSize={ 5 }>
                    <i>{abbrevString( subtitle, 60 )}</i>
                  </Title>
                }
                <div style={ { maxHeight: '15rem', overflow: 'auto' } }>
                  {
                      authors.map( ( author, index ) => (
                        <Level key={ index }>
                          <LevelLeft>
                            <LevelItem>
                              <Icon
                                isSize={ 'small' }
                                isAlign={ 'left' }
                                className={ 'fa fa-user' }
                              />
                            </LevelItem>
                            <LevelItem>
                              {typeof author === 'string' ? abbrevString( author, 60 ) : `${abbrevString( author.given, 60 )} ${abbrevString( author.family, 60 )}`}
                            </LevelItem>
                          </LevelLeft>
                        </Level>
                      ) )
                    }
                </div>
                <Level />
                <Content>
                  <i>{abbrevString( abstract, 300 )}</i>
                </Content>
                <Level />
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button
                isFullWidth
                isColor={ metadataOpen ? 'primary' : 'primary' }
                onClick={ handleMetadataEditionToggle }
              >

                <StretchedLayoutContainer
                  isAbsolute
                  style={ { alignItems: 'center', justifyContent: 'space-around', padding: '1rem' } }
                  isDirection={ 'horizontal' }
                >

                  <StretchedLayoutItem isFlex={ 1 }>
                    {metadataOpen ? translate( 'Close production settings' ) : translate( 'Edit production settings' )}
                  </StretchedLayoutItem>
                  {metadataOpen &&
                  <StretchedLayoutItem>
                    <Delete isSize={ 'medium' } />
                  </StretchedLayoutItem>
                    }
                </StretchedLayoutContainer>
              </Button>
            </Level>
            <Collapsable
              isCollapsed={ !metadataOpen }
              maxHeight={ '100%' }
            >
              {
                metadataOpen &&
                <div style={ { marginTop: '1rem' } }>
                  <MetadataForm
                    production={ production }
                    onSubmit={ handleMetadataSubmit }
                    onCancel={ handleMetadataEditionToggle }
                  />
                </div>
              }
            </Collapsable>
            <Level />
            <Level />
            <Level />
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          isFluid
          isFlex={ 2 }
          isFlowing
        >
          <Column style={ { marginTop: '1rem' } }>
            <Title isSize={ 2 }>
              {translate( 'Export production' )}
            </Title>
            <StretchedLayoutContainer isDirection={ 'vertical' }>
              <StretchedLayoutItem isFlex={ 1 }>
                <Column>
                  <BigSelect
                    onChange={ handleDownload }
                    boxStyle={ { cursor: 'pointer', minHeight: '12rem', textAlign: 'center' } }
                    options={ [
                            {
                              id: 'zip',
                              label: (
                                <ExplainedLabel
                                  title={ translate( 'Export to ZIP' ) }
                                  explanation={ translate( 'explanation about export to ZIP' ) }
                                />
                              ),
                              // iconUrl: activeOptionId === 'zip' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                              iconUrl: icons.takeAway.black.svg
                            },
                            {
                              id: 'json',
                              label: (
                                <ExplainedLabel
                                  title={ translate( 'Export to JSON' ) }
                                  explanation={ translate( 'explanation about export to JSON' ) }
                                />
                              ),
                              // iconUrl: activeOptionId === 'json' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                              iconUrl: icons.takeAway.black.svg
                            },

                            {
                              id: 'html',
                              label: (
                                <ExplainedLabel
                                  title={ translate( 'Export to HTML' ) }
                                  explanation={ translate( 'explanation about export to HTML' ) }
                                />
                              ),
                              // iconUrl: activeOptionId === 'html' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                              iconUrl: icons.takeAway.black.svg
                            },
                            {
                              id: 'markdown',
                              label: (
                                <ExplainedLabel
                                  title={ translate( 'Export to markdown' ) }
                                  explanation={ translate( 'explanation about export to markdown' ) }
                                />
                              ),
                              // iconUrl: activeOptionId === 'markdown' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                              iconUrl: icons.takeAway.black.svg
                            },
                            {
                              id: 'tei',
                              label: (
                                <ExplainedLabel
                                  title={ translate( 'Export to TEI' ) }
                                  explanation={ translate( 'explanation about export to TEI' ) }
                                />
                              ),
                              // iconUrl: activeOptionId === 'tei' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                              iconUrl: icons.takeAway.black.svg
                            },

                          ] }
                  />
                </Column>
              </StretchedLayoutItem>
              {status === 'success' &&
              <StretchedLayoutItem>
                <Notification isColor={ 'success' }>
                  {translate( 'Production was bundled successfully' )}
                </Notification>
              </StretchedLayoutItem>
                    }
            </StretchedLayoutContainer>
          </Column>
        </StretchedLayoutItem>

      </StretchedLayoutContainer>
    </Container>
    );
};

SummaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SummaryViewLayout;
