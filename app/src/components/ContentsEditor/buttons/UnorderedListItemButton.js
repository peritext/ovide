/**
 * This module provides a toolbar button for unordered modifier
 * @module ovide/components/ContentsEditor
 */
/* eslint react/prop-types: 0 */
import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'unordered-list-item' }
  >
    {props.iconMap.unorderedlist}
  </BlockButton>
);
