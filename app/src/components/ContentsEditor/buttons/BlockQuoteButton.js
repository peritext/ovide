/**
 * This module provides a toolbar button for blockquote modifier
 * @module ovide/components/ContentsEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'blockquote' }
  >
    {props.iconMap.quoteblock}
  </BlockButton>
);
