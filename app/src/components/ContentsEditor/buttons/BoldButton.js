/**
 * This module provides a toolbar button for bold text modifier
 * @module ovide/components/ContentsEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import InlineButton from './InlineButton';

export default ( props ) => (
  <InlineButton
    { ...props }
    inlineStyleType={ 'BOLD' }
  >
    {props.iconMap.bold}
  </InlineButton>
);
