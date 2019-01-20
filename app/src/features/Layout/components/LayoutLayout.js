/**
 * This module exports a stateless component rendering the layout of the layout view
 * @module ovide/features/Layout
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import './LayoutLayout.scss';

Modal.setAppElement( '#mount' );

const LayoutLayout = ( {
  children,
  allowExamplePrompted,
  actions: {
    setAllowExamplePrompted,
  }
  // location: {pathname}
}, {
  currentGuidedTourView,
  startTour,
  t
} ) => {
  const onCloseExamplePrompt = () => setAllowExamplePrompted( false );
  const onLoadExample = () => {
                                  setAllowExamplePrompted( false );
                                  startTour( { view: currentGuidedTourView } );
                                };
  return (
    <div className={ 'ovide-Layout hero' }>
      {children}

      <Modal
        isOpen={ allowExamplePrompted }
        onRequestClose={ onCloseExamplePrompt }
      >

        <div className={ 'modal-content' }>
          <div className={ 'modal-header' }>
            <h1 className={ 'title is-1' }>
              {
                            t( 'Start guided tour' )
                          }
            </h1>
            <div className={ 'close-modal-icon-container' }>
              <span
                className={ 'icon' }
                onClick={ onCloseExamplePrompt }
              >
                <i className={ 'fas fa-times-circle' } />
              </span>
            </div>
          </div>
          <div className={ 'modal-body composition-modal' }>
            <div
              style={ { paddingLeft: '2rem' } }
              className={ 'column content is-large' }
            >
              {t( 'Ovide needs to load an example corpus to walk you through its features. Your actual work will not be lost though. Do you want to continue ?' )}
            </div>
          </div>
          <ul className={ 'modal-footer' }>
            <li>
              <button
                className={ 'button is-fullwidth is-primary' }
                onClick={ onLoadExample }
              >
                {t( 'Load example corpus and start the tour' )}
              </button>
            </li>
            <li>
              <button
                id={ 'copy-clipboard' }
                className={ 'button is-fullwidth is-secondary' }
                onClick={ onCloseExamplePrompt }
              >
                {t( 'Cancel' )}
              </button>
            </li>
          </ul>
        </div>
      </Modal>

      {/*<div
              style={ {
                        position: 'fixed',
                        display: rgpdAgreementPrompted ? 'block' : 'none',
                        right: '1rem',
                        bottom: '1rem',
                      } }
              className={ 'card' }
            >

              <div className={ 'modal-content' }>
                <div className={ 'modal-body composition-modal' }>
                  <div className={ 'column content' }>
                    {t( 'Ovide needs to use your web browser local storage to store your data in order to run this web version of the tool. That way your data will remain in your browser and won\'t have to be sent to any distant server. Do you allow Ovide to use your web browser local storage ?' )}
                  </div>
                </div>
                <ul className={ 'modal-footer' }>
                  <li>
                    <button
                      className={ 'button is-fullwidth is-primary' }
                      onClick={ onAcceptRgpd }
                    >
                      {t( 'Yes, use the local storage' )}
                    </button>
                  </li>
                  <li>
                    <Link
                      to={ '/' }
                      className={ 'button is-fullwidth is-secondary' }
                      onClick={ onRefuseRgpd }
                    >
                      {t( 'No, get me back to home' )}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>*/}
    </div>
  );
};

LayoutLayout.contextTypes = {
  startTour: PropTypes.func,
  t: PropTypes.func,
  currentGuidedTourView: PropTypes.string,
};

export default LayoutLayout;
