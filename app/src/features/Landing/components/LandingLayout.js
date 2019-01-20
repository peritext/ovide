/**
 * This module exports a stateless component rendering the layout of the layout view
 * @module ovide/features/Layout
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import DownloadDesktop from '../../../components/DownloadDesktop';

import { inElectron } from '../../../helpers/electronUtils';

import './LandingLayout.scss';

const LandingLayout = ( {
  lang,
  actions: {
    setLanguage
  },
  onStartGuidedTour
}, { t } ) => {
  const setLangFr = () => setLanguage( 'fr' );
  const setLangEn = () => setLanguage( 'en' );
  return (
    <div className={ 'ovide-Landing hero is-light' }>
      <section className={ 'hero-body column is-half is-offset-one-quarter' }>
        <h1 className={ 'title is-1 hero-title' }>
          <img
            className={ 'logo-img' }
            src={ require( '../assets/logo.png' ) }
          />
          <span>Ovide </span><span className={ 'tag' }>alpha</span>
        </h1>
        <h2 className={ 'subtitle is-3' }>{t( 'ovide-baseline' )}</h2>
        <div className={ 'content' }>
          <p>{t( 'ovide-description-1' )}</p>
          <p>{t( 'ovide-description-2' )}</p>
          <p>{t( 'ovide-description-3' )}</p>
        </div>

        <div className={ 'level' }>
          <Link
            to={ '/corpora/' }
            id={ 'begin-creating' }
            className={ 'button is-dark is-fullwidth' }
          >
            {t( 'begin-creating' )}
          </Link>
          <button
            onClick={ onStartGuidedTour }
            className={ 'button' }
            id={ 'start-guided-tour' }
          >
            {t( 'start guided tour' )}
          </button>
        </div>

        <div className={ 'level' }>
          <p>
            <button
              onClick={ setLangFr }
              className={ `button ${lang === 'fr' ? 'is-success' : ''}` }
            >
              {t( 'french' )}
            </button>
            <button
              onClick={ setLangEn }
              className={ `button ${lang === 'en' ? 'is-success' : ''}` }
            >
              {t( 'english' )}
            </button>
          </p>
        </div>
        {
            !inElectron &&
            <div className={ 'level' }>
              <DownloadDesktop />
            </div>
        }
      </section>
    </div>
  );
};

LandingLayout.contextTypes = {
  t: PropTypes.func
};

export default LandingLayout;
