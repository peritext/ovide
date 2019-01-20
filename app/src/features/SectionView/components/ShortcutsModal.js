/**
 * This module provides a modal displaying shortcuts help
 * @module ovide/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalCard
} from 'quinoa-design-library/components';
import { translateNameSpacer } from '../../../helpers/translateUtils';

const ShortcutsModal = ( {
  // translate,
  isActive,
  onClose,
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.SectionView' );
  return (
    <ModalCard
      isActive={ isActive }
      headerContent={ translate( 'Shortcuts help' ) }
      onClose={ onClose }
      style={ {
      maxHeight: '80%'
    } }
      mainContent={
        <div>
          <p>
            {translate( 'All the shortcuts presented below are also accessible through the editor graphical interface (move cursor/select text)' )}
          </p>
          <table className={ 'table' }>
            <thead>
              <tr>
                <th>{translate( 'Shortcut' )}</th>
                <th>{translate( 'Where' )}</th>
                <th>{translate( 'Effect' )}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th><code>cmd+l</code></th>
                <th>{translate( 'Anywhere' )}</th>
                <th>{translate( 'Open item citation widget' )}</th>
              </tr>
              <tr>
                <th><code>cmd+m</code></th>
                <th>{translate( 'Anywhere' )}</th>
                <th>{translate( 'Add a new note' )}</th>
              </tr>
              <tr>
                <th><code>{translate( '"#" then space' )}</code></th>
                <th>{translate( 'Begining of a paragraph' )}</th>
                <th>{translate( 'Add a title' )}</th>
              </tr>
              <tr>
                <th><code>{translate( '">" then space' )}</code></th>
                <th>{translate( 'Begining of a paragraph' )}</th>
                <th>{translate( 'Add a citation block' )}</th>
              </tr>
              <tr>
                <th><code>{translate( '"*" then content then "*"' )}</code></th>
                <th>{translate( 'Anywhere' )}</th>
                <th>{translate( 'Write italic text' )}</th>
              </tr>
              <tr>
                <th><code>{translate( '"**" then content then "**"' )}</code></th>
                <th>{translate( 'Anywhere' )}</th>
                <th>{translate( 'Write bold text' )}</th>
              </tr>
              <tr>
                <th><code>{translate( '"*" then space' )}</code></th>
                <th>{translate( 'Begining of a paragraph' )}</th>
                <th>{translate( 'Begin a list' )}</th>
              </tr>
            </tbody>
          </table>
        </div>
  }
    />
);
};
ShortcutsModal.contextTypes = {
  t: PropTypes.func,
};

export default ShortcutsModal;
