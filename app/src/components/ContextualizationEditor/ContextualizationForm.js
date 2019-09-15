import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import {
  Control,
  Title,
  Button,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import ExplainedLabel from '../ExplainedLabel';
import peritextConfig from '../../peritextConfig.render';
import { translateNameSpacer } from '../../helpers/translateUtils';

import ContextualizerOptionsForm from './ContextualizerOptionsForm';

const DELAY = 500;

export default class ContextualizationForm extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      contextualization: props.contextualization,
      contextualizer: props.contextualizer,
      resource: props.resource
    };

    this.propagateOnChange = debounce( this.propagateOnChange, DELAY );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.contextualization !== nextProps.contextualization ) {
      this.setState( {
        contextualization: nextProps.contextualization
      } );
    }
    if ( this.props.resource !== nextProps.resource ) {
      this.setState( {
        resource: nextProps.resource
      } );
    }
    if ( this.props.contextualizer !== nextProps.contextualizer ) {
      this.setState( {
        contextualizer: nextProps.contextualizer
      } );
    }
  }

  propagateOnChange = ( key, value ) => {
    this.props.onChange( key, value );
  }
  onChange = ( key, value ) => {
    const oldValue = this.props[key];
    const newValue = {
      ...oldValue,
      ...value
    };
    this.propagateOnChange( key, newValue );
    this.setState( {
      [key]: newValue
    } );
  }

  render = () => {
    const {

      /*
       * props: {
       *   translate,
       * },
       */
      state: {
        contextualization = {},
        contextualizer = {},
        resource = {}
      },
      context: { t },
      onChange,
    } = this;

    const {
      title = '',
      legend = '',
      visibility = {
        screened: true,
        paged: true
      }
    } = contextualization;
    const activeContextualizer = peritextConfig.contextualizers[contextualizer.type];
    const profile = ( activeContextualizer && activeContextualizer.meta && activeContextualizer.meta.profile.block ) || {};
    const translate = translateNameSpacer( t, 'Components.ContextualizationEditor' );

    const contextualizerModuleOptions = profile.options || {};

    const handleTitleChange = ( e ) => {
      const newLegend = e.target.value;
      const newCont = {
        ...contextualization,
        title: newLegend
      };
      onChange( 'contextualization', newCont );
    };

    const handleLegendChange = ( e ) => {
      const newLegend = e.target.value;
      const newCont = {
        ...contextualization,
        legend: newLegend
      };
      onChange( 'contextualization', newCont );
    };

    const handleToggleVisibility = ( renderingMode ) => {
      const newMode = visibility[renderingMode] ? false : true;
      const newCont = {
        ...contextualization,
        visibility: {
          ...visibility,
          [renderingMode]: newMode
        }
      };
      onChange( 'contextualization', newCont );
    };
    const handleContextualizerTypeChange = ( type ) => {
      const newContextualizerModuleOptions = (
        peritextConfig.contextualizers[type] &&
        peritextConfig.contextualizers[type].meta &&
        peritextConfig.contextualizers[type].meta.profile.block &&
        peritextConfig.contextualizers[type].meta.profile.block.options
      ) || {};
      const defaults = Object.keys( newContextualizerModuleOptions ).reduce( ( res, key ) => ( {
        ...res,
        [key]: newContextualizerModuleOptions[key].default
      } ), {} );
      const newCont = {
        ...contextualizer,
        type,
        parameters: defaults
      };
      onChange( 'contextualizer', newCont );
    };
    const handleContextualizerParametersChange = ( parameters ) => {
      const newCont = {
        ...contextualizer,
        parameters
      };
      onChange( 'contextualizer', newCont );
    };

    const availableContextualizersTypes = Object.keys( peritextConfig.contextualizers )
      .filter( ( cId ) => {
        const contextualizerModule = peritextConfig.contextualizers[cId];

        const resourceTypes = contextualizerModule.meta.acceptedResourceTypes;
        const matches = resourceTypes.find( ( thatType ) => {
          if ( thatType.test ) {
            const test = thatType.test( resource );
            return test;
          }
          else if ( thatType.type ) {
            return thatType.type === resource.metadata.type;
          }
        } );

        return matches !== undefined;
      } );

    return (
      <form>
        <Control>
          <ExplainedLabel
            title={ translate( 'Custom title' ) }
            explanation={ translate( 'By default, item title will be used for legending the figure' ) }
          />
          <input
            className={ 'input' }
            value={ title || '' }
            placeholder={ translate( 'Custom title' ) }
            onChange={ handleTitleChange }
          />
        </Control>
        <Control>
          <ExplainedLabel
            title={ translate( 'Custom legend' ) }
            explanation={ translate( 'By default, item description will be used for legending the figure' ) }
          />
          <input
            className={ 'input' }
            value={ legend || '' }
            placeholder={ translate( 'Custom legend' ) }
            onChange={ handleLegendChange }
          />
        </Control>
        <Control>
          <ExplainedLabel
            title={ translate( 'Mention visibility' ) }
            explanation={ translate( 'Choose whether to show this figure in screened and/or paged editions' ) }
          />
          <StretchedLayoutContainer isDirection={ 'horizontal' }>
            {
              peritextConfig.renderingModes.map( ( mode, modeIndex ) => {
                const handleClick = () => {
                  handleToggleVisibility( mode );
                };
                return (
                  <StretchedLayoutItem
                    isFlex={ 1 }
                    key={ modeIndex }
                  >
                    <Button
                      isColor={ visibility[mode] ? 'primary' : 'warning' }
                      onClick={ handleClick }
                      isFullWidth
                    >
                      {translate( mode )}
                    </Button>
                  </StretchedLayoutItem>
                );
              } )
            }
          </StretchedLayoutContainer>
        </Control>
        <Control>
          <ExplainedLabel
            title={ translate( 'Mention type' ) }
            explanation={ translate( 'Choose how to present the item in the document' ) }
          />
          <div>
            {
              availableContextualizersTypes.map( ( type, index ) => {
                const handleClick = () => {
                  handleContextualizerTypeChange( type );
                };
                return (
                  <Button
                    key={ index }
                    isColor={ contextualizer.type === type && 'primary' }
                    onClick={ handleClick }
                    isFullWidth
                  >
                    {translate( type )}
                  </Button>
                );
              } )
            }
          </div>
        </Control>
        {
          Object.keys( contextualizerModuleOptions ).length > 0
          &&
          <div>
            <Title isSize={ 5 }>
              {translate( 'Mention settings' )}
            </Title>
            <ContextualizerOptionsForm
              translate={ translate }
              optionsSchema={ contextualizerModuleOptions }
              contextualizer={ contextualizer }
              onChange={ handleContextualizerParametersChange }
            />
          </div>
        }

      </form>
    );
  }
}
