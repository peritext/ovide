/**
 * This module exports a function providing the proper configuration object
 * regarding process mode (production or development)
 * @module ovide/utils/config
 */

/*
 * import devConfig from '../../config.dev';
 * import prodConfig from '../../config.prod';
 */

/**
 * @return {object} config - prod or dev config
 */
export default function getConfig() {
  return OVIDE_CONFIG;/* eslint no-undef : 0 */
}
