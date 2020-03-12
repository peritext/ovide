import React from 'react';

const ColorMarker = ( { color = '#000' } ) => (
  <div
    className={ 'color-marker' }
    style={ {
      background: color,
      display: 'inline-block',
      minWidth: '1rem',
      minHeight: '1em',
      marginRight: '1rem',
    } }
  />
);

export default ColorMarker;
