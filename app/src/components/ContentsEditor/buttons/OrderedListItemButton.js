/**
 * This module provides a toolbar button for ordered list modifier
 * @module ovide/components/ContentsEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'ordered-list-item' }
  >
    {props.iconMap.orderedlist}
  </BlockButton>
);