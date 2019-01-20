/**
 * Ovide Configuration Module
 * ===========================
 *
 * Module exporting the client app's configuration.
 *
 * IMPORTANT: the OVIDE_CONFIG is a global variable which is:
 *   `dev`: injected by webpack.DefinePlugin
 *   `prod`: a global variable templated in a script tag
 */
/* eslint no-console: 0 */
/* eslint no-undef: 0 */
const CONFIG = typeof OVIDE_CONFIG !== 'undefined' ? OVIDE_CONFIG : {};

if ( !Object.keys( CONFIG ).length )
  console.warn( 'WARNING: OVIDE_CONFIG is absent.' );

CONFIG.restUrl = `${CONFIG.apiUrl }/api`;

export default CONFIG;
