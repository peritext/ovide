import React from 'react';
import PropTypes from 'prop-types';
import { StructuredCOinS } from 'peritext-utils';

const InlineAssetWrapper = ( {
  data,
  children,
}, {
  production,
  contextualizers,
  openedContextualizationId,
  openAsideContextualization,
  bindContextualizationElement,
  renderingMode = 'screened',
} ) => {
  const assetId = data.asset && data.asset.id;
  if ( !assetId || !production ) {
    return null;
  }
  const contextualization = production.contextualizations[assetId];
  if ( !contextualization ) {
    return null;
  }

  const contextualizer = production.contextualizers[contextualization.contextualizerId];
  const resource = production.resources[contextualization.sourceId];
  const contextualizerModule = contextualizers[contextualizer.type];
  const Component = contextualizerModule && contextualizerModule.Inline;

  const onClick = () => {
    if ( typeof openAsideContextualization === 'function' ) {
      openAsideContextualization( contextualization.id );
    }
  };

  const handleMainClick = () => {
    if ( resource.metadata.type === 'glossary' ) {
      onClick();
    }
  };

  const active = assetId === openedContextualizationId;

  const bindRef = ( element ) => {
    if ( typeof bindContextualizationElement === 'function' ) {
      bindContextualizationElement( contextualization.id, element );
    }
  };

  if ( contextualizer && Component ) {
    return (
      <span
        className={ `${'InlineAssetWrapper ' + 'inline-'}${ contextualizer.type }${active ? ' active' : ''}` }
        id={ assetId }
        ref={ bindRef }
        onClick={ handleMainClick }
      >
        {resource.metadata.type !== 'glossary' &&
        <StructuredCOinS resource={ resource } />
        }
        <Component
          contextualization={ contextualization }
          contextualizer={ contextualizer }

          resource={ resource }
          renderingMode={ 'screen' }
        >
          {children}
        </Component>
        {renderingMode === 'screened' &&
          <sup
            className={ 'link mention-context-pointer' }
            onClick={ onClick }
          >
            ◈
          </sup>
        }
      </span>
    );
  }
  return null;
};

/**
 * Component's properties types
 */
InlineAssetWrapper.propTypes = {

  /**
   * Corresponds to the data initially embedded in a draft-js entity
   */
  data: PropTypes.shape( {
    asset: PropTypes.shape( {
      id: PropTypes.string
    } )
  } )
};

/**
 * Component's context used properties
 */
InlineAssetWrapper.contextTypes = {
  production: PropTypes.object,
  contextualizers: PropTypes.object,
  onAssetContextRequest: PropTypes.func,
  openedContextualizationId: PropTypes.string,
  openAsideContextualization: PropTypes.func,
  bindContextualizationElement: PropTypes.func,
  renderingMode: PropTypes.string,
};

export default InlineAssetWrapper;
