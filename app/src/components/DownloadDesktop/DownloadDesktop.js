import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../helpers/translateUtils';

import mac from './assets/mac.png';
import linux from './assets/linux.png';
import windows from './assets/windows.png';

import './DownloadDesktop.scss';

const repo = __SOURCE_REPOSITORY__ || '';
const version = __OVIDE_VERSION__ || '0.0.1';
const links = {
  macos: `${repo}/releases/download/${version}/ovide-${version}-mac.pkg`,
  linux: `${repo}/releases/download/${version}/ovide-${version}-linux.zip`,
  windows: `${repo}/releases/download/${version}/ovide-${version}-windows.zip`,
};

const DownloadDesktop = ( { mode = 'horizontal' }, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.DownloadDesktop' );
  const columnModifier = mode === 'horizontal' ? 'is-4' : 'is-12';
  return (
    <div className={ 'ovide-DownloadDesktop' }>
      <div className={ 'title is-5' }>{translate( 'Download Ovide for desktop' )}</div>
      <div className={ mode === 'horizontal' ? 'columns' : '' }>
        <div className={ `column ${columnModifier}` }>
          <a
            target={ 'blank' }
            className={ 'box is-fullwidth' }
            href={ links.macos }
          >
            <span className={ 'icon is-large' }>
              <img src={ mac } />
            </span>
            <span>{translate( 'Download for mac' )}</span>
          </a>
        </div>
        <div className={ `column ${columnModifier}` }>
          <a
            target={ 'blank' }
            className={ 'box is-fullwidth' }
            href={ links.linux }
          >
            <span className={ 'icon is-large' }>
              <img src={ linux } />
            </span>
            <span>{translate( 'Download for linux' )}</span>
          </a>
        </div>
        <div className={ `column ${columnModifier}` }>
          <a
            target={ 'blank' }
            className={ 'box is-fullwidth' }
            href={ links.windows }
          >
            <span className={ 'icon is-large' }>
              <img src={ windows } />
            </span>
            <span>{translate( 'Download for windows' )}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

DownloadDesktop.contextTypes = {
  t: PropTypes.func
};

export default DownloadDesktop;
