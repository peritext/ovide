/**
 * Ovide backoffice Application
 * =======================================
 * Root component of the application.
 * @module ovide
 */
import React from 'react';

import { Route } from 'react-router';
import ReduxToastr from 'react-redux-toastr';

import { ConnectedRouter } from 'connected-react-router';

import { AnimatedSwitch } from 'react-router-transition';

import 'quinoa-design-library/themes/millet/style.css';
import './Application.scss';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

/*
 * import About from './features/About/components/AboutContainer.js';
 * import Tour from './features/Tour/components/TourContainer.js';
 */
import HomeView from './features/HomeView/components';
import SectionView from './features/SectionView/components';
import SummaryView from './features/SummaryView/components';
import LibraryView from './features/LibraryView/components';
import GlossaryView from './features/GlossaryView/components';
import EditionsView from './features/EditionsView/components';
import EditionView from './features/EditionView/components';
import NotFound from './components/NotFound/NotFound.js';

const EditionRoutes = ( { match } ) => {
  return (
    <div>
      <Route
        exact
        path={ `${match.path}:productionId` }
        component={ LibraryView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/sections/:sectionId` }
        component={ SectionView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/resources/:sectionId` }
        component={ SectionView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/parameters` }
        component={ SummaryView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/glossary` }
        component={ GlossaryView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/editions` }
        component={ EditionsView }
      />
      <Route
        exact
        path={ `${match.path}:productionId/editions/:editionId` }
        component={ EditionView }
      />

    </div>
   );
 };

const routes = [
  (
    <Route
      exact
      key={ 1 }
      path={ '/' }
      component={ () => (
        <HomeView />
      ) }
    />
  ),
  (
    <Route
      key={ 2 }
      path={ '/productions/' }
      component={ EditionRoutes }
    />
  ),

  /*
   * (
   *   <Route
   *     key={ 3 }
   *     path={ '/de/' }
   *     component={ () => (
   *       <Layout>
   *         <About />
   *       </Layout>
   *     ) }
   *   />
   * ),
   */
  (
    <Route
      key={ 4 }
      component={ NotFound }
    />
  ),
];

/**
 * Renders the whole ovide application
 * @return {ReactComponent} component
 */
/*
 * const Application = ( { history } ) => (
 *   <ConnectedRouter
 *     history={ history }
 *   >
 *       <AnimatedSwitch
 *         atEnter={ { opacity: 0 } }
 *         atLeave={ { opacity: 0 } }
 *         atActive={ { opacity: 1 } }
 *         className={ 'switch-wrapper' }
 *       >
 *         {routes}
 *       </AnimatedSwitch>
 *       <ReduxToastr
 *         timeOut={ 5000 }
 *         newestOnTop={ false }
 *         position={ 'top-right' }
 *         transitionIn={ 'fadeIn' }
 *         transitionOut={ 'fadeOut' }
 *         closeOnToastrClick
 *       />
 *   </ConnectedRouter>
 * );
 */

const Application = ( { history } ) => (
  <ConnectedRouter
    history={ history }
  >
    <AnimatedSwitch
      atEnter={ { opacity: 0 } }
      atLeave={ { opacity: 0 } }
      atActive={ { opacity: 1 } }
      className={ 'switch-wrapper' }
    >
      {routes}
      <ReduxToastr
        timeOut={ 5000 }
        newestOnTop={ false }
        position={ 'top-right' }
        transitionIn={ 'fadeIn' }
        transitionOut={ 'fadeOut' }
        closeOnToastrClick
      />
    </AnimatedSwitch>

  </ConnectedRouter>
);

export default Application;
