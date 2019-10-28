import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle';

const HelpPin = ( {
  children,
  place,
  type,
  effect = 'solid',
  className = '',
} ) =>
  ( 
  <span
    className={ `help-pin ${className}` }
    style={ { position: 'relative' } }
    data-tip={ children }
    data-for={ 'help-tooltip' }
    data-type={ type }
    data-place={ place }
    data-effect={ effect }
    >
    <Icon >
      <FontAwesomeIcon icon={ faQuestionCircle } />
    </Icon>
  </span> 
);

HelpPin.propTypes = {
  effect: PropTypes.string,
  place: PropTypes.string,
  type: PropTypes.string,
};

export default HelpPin;
