/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  HelpPin,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
// import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import IconBtn from '../../../components/IconBtn';
import icons from 'quinoa-design-library/src/themes/millet/icons';

const PossibleSummaryCard = ( {
  blockType,
  providedBlock,
  translate,
  isDisabled,
  onAdd,
}/*, { t }*/ ) => {

  const render = () => (
    <Column style={ { marginLeft: 0, opacity: isDisabled ? 0.5 : 1 } }>
      <Card
        bodyContent={
          <StretchedLayoutContainer isDirection={ 'horizontal' }>
            <StretchedLayoutItem isFlex={ 1 }>
              {translate( blockType )}
              <HelpPin>
                {translate( `Explanation about ${blockType}` )}
              </HelpPin>
            </StretchedLayoutItem>
            {!isDisabled &&
              <StretchedLayoutItem style={ { transform: 'scale(.9)' } }>
                <IconBtn
                  onClick={ onAdd }
                  src={ icons.asset.black.svg }
                />
              </StretchedLayoutItem>
          }
          </StretchedLayoutContainer>
          }
      />
    </Column>
  );
  if ( isDisabled ) {
    return render();
  }
  return (
    <div
      ref={ providedBlock.innerRef }
      { ...providedBlock.dragHandleProps }
      { ...providedBlock.draggableProps }
    >
      {render()}
    </div>
  );
};

PossibleSummaryCard.contextTypes = {
  t: PropTypes.func,
};

export default PossibleSummaryCard;
