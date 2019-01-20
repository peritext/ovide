import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { abbrev } from '../../helpers/utils';

// import exampleCorpus from '../../features/Corpora/assets/example.json';

import './NavLayout.scss';

const NavLayout = ( {
  lang,

  actions: {
    setLanguage,
    // setAllowExamplePrompted,
  },
  localizationCrumbs = [],
  localOperations = [],
  importantOperations = [],

  isOpen,
  toggleOpen,
  style = {},
  startGuidedTour,

  history: {
    location: {
      pathname = '',
    },
  },
}, { t } ) => {
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const setOtherLang = ( e ) => {
    e.stopPropagation();
    setLanguage( otherLang );
  };
  const inAbout = pathname.replace( /\//g, '' ) === 'de';

  const inChunksEdition = pathname.match( /\/corpora\/.*\/chunks/ ) !== null;

  const handleStartGuidedTour = () => {
    if ( /\/corpora\/.+/.test( pathname ) ) {

      /*
       * let corpusId = pathname.match( /\/corpora\/([^/]+)/ );
       * corpusId = corpusId && corpusId[1];
       * if ( corpusId && corpusId !== exampleCorpus.metadata.id ) {
       *   setAllowExamplePrompted( true );
       * }
       * else {
       *   startGuidedTour();
       * }
       */
    }
    else {
      startGuidedTour();
    }
  };
  return (
    <nav
      className={ `navbar hero-header ${inChunksEdition ? 'in-chunks-edition' : ''}` }
      style={ style }
    >
      <div className={ 'container is-fluid' }>

        <div className={ 'navbar-brand' }>
          <Link
            className={ 'navbar-item' }
            to={ '/' }
          >
            <h1 className={ 'title is-1' }>
              {t( 'ovide' )}
            </h1>
          </Link>
          <span
            onClick={ toggleOpen }
            className={ `navbar-burger burger ${isOpen ? 'is-active' : ''}` }
            data-target={ 'navbarMenuHero10' }
          >
            <span />
            <span />
            <span />
          </span>
        </div>
        <div
          id={ 'navbarMenuHero10' }
          className={ `navbar-menu ${isOpen ? 'is-active' : ''}` }
        >
          <div className={ 'navbar-start' }>
            {
                        localizationCrumbs.map( ( crumb, index ) => (
                          <Link
                            className={ `navbar-item ${crumb.active ? 'is-active' : ''}` }
                            key={ index }
                            to={ crumb.href }
                          >
                            {abbrev( crumb.name, 20 )}
                          </Link>
                        ) )
                      }
          </div>
          <div className={ 'navbar-end' }>
            {
              localOperations.map( ( operation, index ) => {
                const handleClick = operation.onClick;
                return (
                  <a
                    className={ 'navbar-item' }
                    key={ index }
                    onClick={ handleClick }
                  >
                    {operation.name}
                  </a>
                );
              } )
            }
            {
              importantOperations.filter( ( i ) => i ).map( ( operation, index ) => {
                const handleClick = operation.onClick;
                return (
                  <span
                    key={ index }
                    className={ 'navbar-item' }
                  >
                    <button
                      className={ 'button is-dark' }
                      onClick={ handleClick }
                    >
                      <span>{operation.name}</span>
                    </button>
                  </span>
                );
              } )
            }
            {
              !inAbout &&
              <div
                onClick={ handleStartGuidedTour }
                className={ 'navbar-item has-dropdown is-hoverable' }
              >
                <button
                  id={ 'help-btn' }
                  className={ 'navbar-item' }
                >
                  {t( 'Guided tour' )}
                </button>
              </div>
            }
            <div className={ 'navbar-item has-dropdown is-hoverable' }>
              <Link
                to={ '/de/' }
                className={ `navbar-item  ${inAbout ? 'is-active' : ''}` }
              >
                {t( 'About' )}
              </Link>
            </div>

            <div className={ 'navbar-item has-dropdown is-hoverable' }>
              <button
                onClick={ setOtherLang }
                className={ 'navbar-item' }
              >
                {lang}
              </button>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

NavLayout.contextTypes = {
  t: PropTypes.func,
};

export default NavLayout;
