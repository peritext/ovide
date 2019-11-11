import React from 'react';

import {
  Image
} from 'quinoa-design-library/components';

const CenteredIcon = ( {
  src,
  style = {},
  isSize = '16x16',
  ...props,
} ) => (
  <Image
    isSize={ isSize }
    src={ src }
    style={ {
      margin: 0,
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column nowrap',
      justifyContent: 'center',
      ...style,
    } }
    { ...props }
  />
);

export default CenteredIcon;
