/**
 * This module provides a modal for exporting a production
 * @module ovide/components/ExportModal
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  ModalCard,
  BigSelect,
  Notification,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const ExportModal = ( {
  activeOptionId,
  onClose,
  onChange,
  status,
  isActive
}, { t } ) => {

  const translate = translateNameSpacer( t, 'Components.ExportModal' );

  return (
    <ModalCard
      isActive={ isActive }
      headerContent={ translate( 'Export production' ) }
      onClose={ onClose }
      mainContent={
        <StretchedLayoutContainer isDirection={ 'vertical' }>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column>
              <BigSelect
                activeOptionId={ activeOptionId }
                onChange={ onChange }
                boxStyle={ { minHeight: '12rem', textAlign: 'center' } }
                options={ [
                        {
                          id: 'json',
                          label: translate( 'Export your production to backup it (peritext JSON format)' ),
                          iconUrl: activeOptionId === 'json' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                        },
                        {
                          id: 'html',
                          label: translate( 'Export your production to plain HTML (for use in another project)' ),
                          iconUrl: activeOptionId === 'html' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                        },
                        {
                          id: 'markdown',
                          label: translate( 'Export your production to markdown (for use in another project)' ),
                          iconUrl: activeOptionId === 'markdown' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                        },

                      ] }
              />
            </Column>
          </StretchedLayoutItem>
          {status === 'success' &&
          <StretchedLayoutItem>
            <Notification isColor={ 'success' }>
              {translate( 'Production was bundled successfully' )}
            </Notification>
          </StretchedLayoutItem>
                }
        </StretchedLayoutContainer>
      }
    />
  );
};

ExportModal.contextTypes = {
  t: PropTypes.func,
};

export default ExportModal;

