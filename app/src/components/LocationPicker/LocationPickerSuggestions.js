import React from 'react';

const LocationPickerSuggestions = ( {
    suggestions = [],
    onSuggestionChoice,
    onBlur,
    anchor,
} ) => {
    let top = 0, left = 0, width = 0, maxHeight = 0;
    if ( anchor ) {
        const rect = anchor.getBoundingClientRect();
        top = rect.top + anchor.offsetHeight;
        left = rect.left;
        width = anchor.offsetWidth;
        maxHeight = window.innerHeight - top;
    }
    const style = { top, left, width, maxHeight };
    return [
      <div
        onClick={ onBlur }
        key={ 0 }
        className={ 'location-picker-suggestions-background' }
      />,
      <ul
        key={ 1 }
        style={ style }
        className={ 'location-picker-suggestions' }
      >
        {
        suggestions.map( ( suggestion, suggestionIndex ) => {
            const { lat, lon, display_name: displayName, boundingbox } = suggestion;
            const handleClick = () => {
                const entityWidth = boundingbox[2] - boundingbox[0];
                const entityHeight = boundingbox[3] - boundingbox[1];
                const area = entityWidth * entityHeight;
                onSuggestionChoice( { lat, lon, area } );
            };
            return (
              <li
                onClick={ handleClick }
                key={ suggestionIndex }
              >
                {displayName}
              </li>
            );
        } )
        }
      </ul>
    ];
};

export default LocationPickerSuggestions;
