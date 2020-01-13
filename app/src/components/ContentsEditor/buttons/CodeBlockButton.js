/**
 * This module provides a toolbar button for codeblock modifier
 * @module ovide/components/ContentsEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'code-block' }
  >
    {props.iconMap.codeblock}
  </BlockButton>
);
