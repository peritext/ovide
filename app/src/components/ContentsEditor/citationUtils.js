/**
 * This module provides utils for manipulating citations in the editor
 * @module ovide/components/ContentsEditor
 */
/*
 * import {
 *   constants
 * } from 'scholar-draft';
 */

// import { resourceToCslJSON } from 'peritext-utils';

import defaultStyle from 'raw-loader!./assets/apa.csl';
import defaultLocale from 'raw-loader!./assets/english-locale.xml';

// const { INLINE_ASSET, BLOCK_ASSET } = constants;

/**
 * Retrieve proper citation styling models from a production
 * @return {object} proper models
 */
export const getCitationModels = ( production ) => {
  const style = ( production &&
                          production.settings &&
                          production.settings.citationStyle &&
                          production.settings.citationStyle.data
                        )
                          || defaultStyle;
    const locale = ( production &&
                          production.settings &&
                          production.settings.citationLocale &&
                          production.settings.citationLocale.data
                        )
                          || defaultLocale;
  return { style, locale };
};
