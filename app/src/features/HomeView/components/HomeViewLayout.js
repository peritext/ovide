/**
 * This module provides a connected component for displaying the home view
 * @module ovide/features/HomeView
 */
/* eslint react/jsx-no-bind:0 */
/* eslint react/prefer-stateless-function : 0 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';
import { v4 as genId } from 'uuid';
import ReactTooltip from 'react-tooltip';
import { toastr } from 'react-redux-toastr';
import {
  Button,
  Column,
  Columns,
  Container,
  Control,
  Field,
  Help,
  Notification,
  Input,
  Level,
  ModalCard,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';
import { Link } from 'react-router-dom';

/**
 * Imports Project utils
 */
import { createDefaultSection } from '../../../helpers/schemaUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { inElectron } from '../../../helpers/electronUtils';

/**
 * Imports Components
 */
import DeleteProductionModal from './DeleteProductionModal';
import Footer from './Footer';
import LanguageToggler from '../../../components/LanguageToggler';
import NewProductionForm from './NewProductionForm';
import ProductionCardWrapper from './ProductionCardWrapper';
import DownloadDesktop from '../../../components/DownloadDesktop';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxProductionSize } = config;

class HomeViewLayout extends Component {
  constructor( props, context ) {
    super( props );

    this.translate = translateNameSpacer( context.t, 'Features.HomeView' );
  }

  componentWillUpdate = ( nextProps, nextState, nextContext ) => {
    if ( this.context.t !== nextContext.t ) {
       this.translate = translateNameSpacer( nextContext.t, 'Features.HomeView' );
    }
  }

  renderAboutTab = () => {
    return null;
  }

  renderProductionsTab = () => {

    /**
     * Variables definition
     */
    const {
      productions,
      newProduction,
      newProductionOpen,
      newProductionTabMode,
      sortingMode,
      searchString,
      productionDeleteId,
      createProductionStatus,
      // overrideProductionStatus,
      deleteProductionStatus,
      importProductionStatus,
      overrideImport,
      downloadModalVisible,
      // overrideProductionMode,

      history,

      rgpdAgreementPrompted,

      actions: {
        createProduction,
        // overrideProduction,
        duplicateProduction,
        deleteProduction,
        fetchProductions,
        importProduction,
        setNewProductionTabMode,
        setNewProductionOpen,
        setSortingMode,
        setSearchString,
        setProductionDeleteId,
        setOverrideImport,
        setOverrideProductionMode,
        setErrorMessage,
        setRgpdAgreementPrompted,
        setDownloadModalVisible,
      }
    } = this.props;

    /**
     * Computed variables
     */
    const productionsList = Object.keys( productions || {} ).map( ( id ) => ( { id, ...productions[id] } ) );
    const searchStringLower = searchString.toLowerCase();
    const visibleProductionsList = productionsList.filter( ( s ) => {
      const data = JSON.stringify( s ).toLowerCase();
      return data.indexOf( searchStringLower ) > -1;
    } )
    .sort( ( a, b ) => {
      switch ( sortingMode ) {
        case 'edited recently':
          if ( a.lastUpdateAt > b.lastUpdateAt ) {
            return -1;
          }
          return 1;
        case 'title':
        default:
          if ( a.metadata.title.toLowerCase().trim() > b.metadata.title.toLowerCase().trim() ) {
            return 1;
          }
          return -1;
      }
    } );

    /**
     * Callbacks handlers
     */
    const handleConfirmImport = ( importMode ) => {
      setOverrideImport( false );
      setOverrideProductionMode( importMode );
    };
    const onAcceptRgpd = () => {
                                  localStorage.setItem( 'ovide/rgpd-agreement', true );
                                  setRgpdAgreementPrompted( false );
                                };
    const onRefuseRgpd = () => {
      setDownloadModalVisible( true );
                                  // setRgpdAgreementPrompted( false );
    };
    const handleDeleteProduction = ( ) => {
      deleteProduction( { productionId: productionDeleteId, production: productions[productionDeleteId] } );
    };
    const handleDropFiles = ( files ) => {
      if ( !files || !files.length ) {
        return;
      }
      else if ( files[0].size > maxProductionSize ) {
        setErrorMessage( { type: 'IMPORT_PRODUCTION_FAIL', error: 'file is too large' } );
        return;
      }
      // console.log( 'import production', files[0], importProduction );
      importProduction( files[0], ( err ) => {
        if ( err ) {
          console.error( err );/* eslint no-console: 0 */
          toastr.error( this.translate( 'The production could not be imported' ) );

        }
        else {
          setNewProductionOpen( false );
          fetchProductions();
        }

      } );

      /*
       * .then( ( res ) => {
       *   const productionImported = res.result;
       *   if ( productionImported ) {
       *    // override an existing production (which has the same id)
       *     const existant = productionsList.find( ( production ) => production.id === productionImported.id );
       *     // has preexisting production, prompt for override
       *     if ( existant !== undefined ) {
       *       setOverrideImport( true );
       *     }
       *     else {
       *       setOverrideImport( false );
       *       setOverrideProductionMode( 'create' );
       *     }
       *   }
       * } );
       */
    };
    const handleCreateNewProduction = ( payload ) => {
      const startingSectionId = genId();
      const defaultSection = createDefaultSection();
      const startingSection = {
        ...defaultSection,
        id: startingSectionId,
        metadata: {
          ...defaultSection.metadata,
          title: 'Introduction'
        }
      };
      const production = {
        ...payload.payload,
        sections: {
          [startingSectionId]: startingSection,
        },
        sectionsOrder: [ startingSectionId ],
        id: genId(),
      };

      createProduction( {
        ...payload,
        payload: production,
       },
       ( err ) => {
          if ( !err ) {
            setNewProductionOpen( false );
            history.push( {
              pathname: `/productions/${production.id}/sections/${startingSectionId}`,
            } );
          }
        } );
    };

    /*
     * const handleCreateExistingProduction = ( ) => {
     *   createProduction( {
     *     payload: newProduction,
     *   } )
     *   .then( ( res ) => {
     *     setNewProductionOpen( false );
     *     history.push( {
     *       pathname: `/productions/${res.result.data.production.id}/`,
     *     } );
     *   } );
     * };
     * const handleOverrideExistingProduction = ( ) => {
     *   overrideProduction( { payload: newProduction } )
     *   .then( ( resp ) => {
     *     if ( resp.result ) {
     *       setNewProductionOpen( false );
     *       history.push( {
     *         pathname: `/productions/${newProduction.id}/`,
     *       } );
     *     }
     *   } );
     * };
     */
    const handleSearchStringChange = ( e ) => setSearchString( e.target.value );
    const handleToggleNewProductionOpened = () => setNewProductionOpen( !newProductionOpen );
    const handleSortByEditedRecently = () => setSortingMode( 'edited recently' );
    const handleSortByTitle = () => setSortingMode( 'title' );
    const handleAbortProductionDeletion = () => setProductionDeleteId( undefined );
    const handleCloseNewProduction = () => setNewProductionOpen( false );
    const handleSetNewProductionModeForm = () => setNewProductionTabMode( 'form' );
    const handleSetNewProductionModeFile = () => setNewProductionTabMode( 'file' );
    const handleCloseOverrideImport = () => setOverrideImport( false );
    const handleConfirmImportOverride = () => handleConfirmImport( 'override' );
    const handleConfirmImportCreate = () => handleConfirmImport( 'create' );

    return (
      <Container>
        <Columns>
          <Column isSize={ '1/3' }>
            <Column>
              <div className={ 'column' }>
                <Title isSize={ 3 }>
                  <span style={ {
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center'
                  } }
                  >
                    <img
                      style={ { width: '3rem', paddingRight: '.5rem' } }
                      src={ require( '../../../sharedAssets/logo-base.png' ) }
                    />
                    <strong style={ { fontWeight: 600 } }>
                      Ovide
                    </strong>
                    <span
                      style={ {
                        marginLeft: '.5rem',
                        borderRadius: '.5rem',
                        fontSize: '.7rem',
                        padding: '.4rem',
                        background: '#8cc63f',
                        color: 'white',
                        fontWeight: 400
                      } }
                    >{__OVIDE_VERSION__}
                    </span>
                  </span>
                </Title>
              </div>
              <div
                style={ { paddingLeft: '4rem' } }
                className={ 'column' }
              >
                <p className={ 'content' }>
                  {this.translate( 'Ovide is an experimental writing and publishing tool. It is made for context-intensive, distributed, scholarly publishing endeavours.' )}
                </p>
                <p
                  className={ 'content' }
                  dangerouslySetInnerHTML={ {/* eslint react/no-danger:0*/
                    __html: this.translate( 'It is built around the <a rel="noopener" target="blank" href="{peritextUrl}">peritext ecosystem</a> and the <a rel="noopener" target="blank" href="{quinoaUrl}">quinoa project</a>.', {
                      quinoaUrl: 'https://github.com/medialab/fonio',
                      peritextUrl: 'https://peritext.github.io',
                    } )
                  } }
                />
              </div>
              <div
                style={ { paddingLeft: '4rem' } }
                className={ 'column' }
              >
                <LanguageToggler />
              </div>
              <div
                style={ { paddingLeft: '4rem' } }
                className={ 'column' }
              >
                {( inElectron || !rgpdAgreementPrompted ) &&
                  <Button
                    isFullWidth
                    onClick={ handleToggleNewProductionOpened }
                    isColor={ newProductionOpen ? 'primary' : 'primary' }
                  >
                    {this.translate( 'New production' )}
                  </Button>
                }

              </div>

              <Level />
              <Level />

              <Level />
              <Level />
            </Column>
          </Column>

          {
            <Column
              isHidden={ newProductionOpen }
              isSize={ '2/3' }
            >
              {productionsList.length > 0 &&
              <Column
                style={ { paddingTop: '1.5rem' } }
              >
                <StretchedLayoutContainer
                  isFluid
                  isDirection={ 'horizontal' }
                >
                  <StretchedLayoutItem
                    isFluid
                    isFlex={ 1 }
                  >
                    <Field hasAddons>
                      <Control>
                        <Input
                          value={ searchString }
                          onChange={ handleSearchStringChange }
                          placeholder={ this.translate( 'find a production' ) }
                        />
                      </Control>
                    </Field>
                  </StretchedLayoutItem>
                  <StretchedLayoutItem isFluid>
                    <Column>
                      <StretchedLayoutContainer
                        isDirection={ 'horizontal' }
                        isFluid
                      >
                        <StretchedLayoutItem><i>{this.translate( 'sort by' )}</i></StretchedLayoutItem>

                        <StretchedLayoutItem>
                          <span style={ { paddingLeft: '1rem', paddingRight: '.1rem' } } />
                          <a onClick={ handleSortByEditedRecently }>
                            {
                                  sortingMode === 'edited recently' ?
                                    <strong>{this.translate( 'recent edition' )}</strong>
                                    :
                                    this.translate( 'recent edition' )
                                }
                          </a>
                        </StretchedLayoutItem>
                        <StretchedLayoutItem>
                          <span style={ { paddingLeft: '1rem', paddingRight: '.1rem' } } />
                          <a onClick={ handleSortByTitle }>
                            {
                                  sortingMode === 'title' ?
                                    <strong>{this.translate( 'title' )}</strong>
                                    :
                                    this.translate( 'title' )
                                }
                          </a>
                        </StretchedLayoutItem>
                      </StretchedLayoutContainer>
                    </Column>
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
              </Column>
                }
              <FlipMove>
                {
                        visibleProductionsList.map( ( production ) => {
                          const handleAction = ( id, event ) => {
                            event.stopPropagation();
                            switch ( id ) {
                              case 'open':
                                history.push( {
                                  pathname: `/productions/${production.id}`
                                } );
                                break;
                              case 'duplicate':
                                duplicateProduction( { production } );

                                /*
                                 * .then( ( res ) => {
                                 *   if ( res.result ) {
                                 *     setOverrideProductionMode( 'create' );
                                 *   }
                                 * } );
                                 */
                                break;
                              case 'delete':
                                setProductionDeleteId( production.id );
                                break;
                              default:
                                break;
                            }
                          };

                          const handleClick = ( e ) => {
                            e.stopPropagation();
                            history.push( `/productions/${production.id}` );
                          };
                          return (
                            <ProductionCardWrapper
                              key={ production.id }
                              production={ production }
                              onClick={ handleClick }
                              onAction={ handleAction }
                            />
                          );
                        } )
                      }
              </FlipMove>
              {
              productionsList.length === 0 && !newProductionOpen &&
              <div style={ { marginTop: '2.5rem' } }>
                <Title>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 1 }>
                      {this.translate( 'You have no productions yet' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      {( inElectron || !rgpdAgreementPrompted ) &&
                      <Button
                        isColor={ 'info' }
                        onClick={ handleToggleNewProductionOpened }
                        style={ {
                          marginLeft: '1rem'
                        } }
                      >
                        {this.translate( 'Create a first production' )}
                      </Button>}
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>

              </div>
            }

              {
                  !inElectron && rgpdAgreementPrompted &&
                  <Column style={ { paddingTop: '2rem' } }>
                    <Notification isColor={ 'info' }>
                      <Title isSize={ 5 }>{this.translate( 'Welcome to Ovide!' )}</Title>
                      <p>
                        {this.translate( 'web-notice' )}
                      </p>
                      <p style={ { marginTop: '2rem', marginBottom: '2rem' } }>
                        {this.translate( 'Do you allow Ovide to use your web browser local storage to store your work with this web version ?' )}
                      </p>
                      <StretchedLayoutContainer isDirection={ 'horizontal' }>
                        <StretchedLayoutItem>
                          <button
                            className={ 'button is-primary' }
                            onClick={ onAcceptRgpd }
                          >
                            {this.translate( 'Yes, use the local storage' )}
                          </button>
                        </StretchedLayoutItem>
                        <StretchedLayoutItem>
                          <Link
                            to={ '/' }
                            className={ 'button is-secondary' }
                            onClick={ onRefuseRgpd }
                          >
                            {this.translate( 'No' )}
                          </Link>
                        </StretchedLayoutItem>
                      </StretchedLayoutContainer>

                    </Notification>
                  </Column>
                }
              <Column style={ { paddingTop: '2rem' } }>
                <Notification isColor={ 'warning' }>
                  <Title isSize={ 5 }>{this.translate( 'Work in progress!' )}</Title>
                  <p>
                    {this.translate( 'Please notice that Ovide is currently in alpha stage, which means that this is an unstable version that could still present major bugs.' )}
                  </p>

                </Notification>
              </Column>

              {
                    !inElectron &&
                    <Column>
                      <DownloadDesktop mode={ 'horizontal' } />
                    </Column>
                }
              {productionDeleteId &&
              <DeleteProductionModal
                deleteStatus={ deleteProductionStatus }
                onConfirm={ handleDeleteProduction }
                onCancel={ handleAbortProductionDeletion }
              />
                }
            </Column>
          }
          {
            newProductionOpen &&
              <NewProductionForm
                widthRatio={ newProductionOpen ? '2/3' : '1/2' }
                createProductionStatus={ createProductionStatus }
                importProductionStatus={ importProductionStatus }
                mode={ newProductionTabMode }
                newProduction={ newProduction }
                onClose={ handleCloseNewProduction }
                onCloseNewProduction={ handleCloseNewProduction }
                onCreateNewProduction={ handleCreateNewProduction }
                onDropFiles={ handleDropFiles }
                onSetModeFile={ handleSetNewProductionModeFile }
                onSetModeForm={ handleSetNewProductionModeForm }
                translate={ this.translate }
              />
          }
        </Columns>
        <ModalCard
          isActive={ downloadModalVisible }
          onClose={ () => setDownloadModalVisible( false ) }
          headerContent={ this.translate( 'Download ovide for desktop (still free)' ) }
          mainContent={
            <DownloadDesktop />
          }
        />
        <ModalCard
          isActive={ overrideImport }
          headerContent={ this.translate( 'Override production' ) }
          onClose={ handleCloseOverrideImport }
          mainContent={
            <Help isColor={ 'danger' }>
              {this.translate( 'Production exists, do you want to override it?' )}
            </Help>
          }
          footerContent={ [
            <Button
              isFullWidth
              key={ 0 }
              onClick={ handleConfirmImportOverride }
              isColor={ 'danger' }
            >{this.translate( 'Override exist production' )}
            </Button>,
            <Button
              isFullWidth
              key={ 1 }
              onClick={ handleConfirmImportCreate }
              isColor={ 'warning' }
            >{this.translate( 'Create new production' )}
            </Button>,
            <Button
              isFullWidth
              key={ 2 }
              onClick={ handleCloseOverrideImport }
            >
              {this.translate( 'Cancel' )}
            </Button>
              ] }
        />
      </Container>
    );
  }

  renderVisibleTab = ( mode, lang = 'en' ) => {
    switch ( mode ) {
      case 'about':
        return this.renderAboutTab( mode, lang );
      case 'productions':
      default:
        return this.renderProductionsTab( mode, lang );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        tabMode,
        lang,
      },
      renderVisibleTab,
    } = this;

    /**
     * Callbacks handlers
     */
    return (
      <section style={ { overflow: 'auto' } }>

        {/* main contents */}
        <Container>
          <Level />
          {renderVisibleTab( tabMode, lang )}
          <Level />
          <Level />
        </Container>

        <Footer
          id={ 'footer' }
          translate={ this.translate }
        />

        <ReactTooltip id={ 'tooltip' } />

      </section>
    );
  }
}

/**
 * Context data used by the component
 */
HomeViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default HomeViewLayout;
