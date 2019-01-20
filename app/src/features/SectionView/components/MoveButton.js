/**
 * This module provides a mini component for representing move possibility
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Button,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import CenteredIcon from '../../../components/CenteredIcon';

const MoveButton = ( {

} ) => (
  <Button
    style={ { pointerEvents: 'none' } }
    data-place={ 'left' }
    data-effect={ 'solid' }
    data-for={ 'tooltip' }
  >
    <CenteredIcon src={ icons.move.black.svg } />
  </Button>
);

export default MoveButton;
