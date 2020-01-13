import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Map from 'pigeon-maps';
import Overlay from 'pigeon-overlay';

import { getPlacesSuggestions } from '../../helpers/geoCoder';
import { translateNameSpacer } from '../../helpers/translateUtils';

import {
  Button,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import './LocationPicker.scss';
import LocationPickerSuggestions from './LocationPickerSuggestions';

const Marker = () =>
  (
    <span
      style={ {
            color: 'red',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: '1px red solid',
            padding: '1em',
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: ' -.8rem',
            top: '-.8rem',
          } }
    >
      <i className={ 'fas fa-map-marker' } />
    </span> );

const PrevMarker = () =>
  (
    <span
      style={ {
            background: 'pink',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            display: 'inline-block'
          } }
    />
  );

export default class LocationPickerContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      isEdited: false,
      latitude: props.location && props.location.latitude,
      longitude: props.location && props.location.longitude,
      address: props.location && props.location.address,
      zoomLevel: 2,
      showSuggestions: false,
      suggestions: []
    };
  }

  componentWillReceiveProps = ( nextProps ) => {

    if (
      this.props.location &&
      this.props.location.latitude &&
      nextProps.location &&
      nextProps.location.latitude &&
      this.props.location.latitude !== nextProps.location.latitude
    ) {
      this.setState( {
        latitude: nextProps.location.latitude
      } );
    }
    if (
      this.props.location &&
      this.props.location.longitude &&
      nextProps.location &&
      nextProps.location.longitude &&
      this.props.location.longitude !== nextProps.location.longitude
    ) {
      this.setState( {
        longitude: nextProps.location.longitude
      } );
    }
  }

  toggleEdited = ( e ) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState( {
      isEdited: !this.state.isEdited
    } );
  }

  setLatitude = ( latitude ) => {
    this.setState( {
      latitude
    } );
  }

  setLongitude = ( longitude ) => {
    this.setState( {
      longitude
    } );
  }

  setAddress = ( address ) => {
    this.setState( {
      address
    } );
  }

  handleAddressSubmit = ( query ) => {
    event.preventDefault();
    getPlacesSuggestions( query )
      .then( ( suggestions ) => {
        this.setState( { suggestions } );
      } );
  }

  onMapChange = ( { center, zoom } ) => {
    const lat = center[0];
    const lng = center[1];
    this.setState( {
      latitude: lat,
      longitude: lng,
      isEdited: true,
      zoomLevel: zoom,
    } );
    // this.handleSubmit( true );
  }

  handleSubmit = ( isEdited = false ) => {
    const {
      latitude,
      longitude,
      address
    } = this.state;
    this.setState( {
      isEdited
    } );
    this.props.onChange( {
      latitude,
      longitude,
      address
    } );
  }

  onReset = () => {
    this.setState( {
      latitude: undefined,
      longitude: undefined,
      address: undefined,
      isEdited: false,
    } );
    this.props.onChange( {
      latitude: undefined,
      longitude: undefined,
      address: undefined
    } );
  }

  handleCancel = () => {
    this.setState( {
      isEdited: false,
      latitude: this.props.location && this.props.location.latitude,
      longitude: this.props.location && this.props.location.longitude,
      address: this.props.location && this.props.location.address,
    } );
  }

  render = () => {
    const {
      state: {
        isEdited,
        latitude,
        longitude,
        zoomLevel = 10,
        address = '',
        suggestions = [],
        showSuggestions,
      },
      props: {
        location,
        onChange,
      },
      context: { t },
      toggleEdited,

      /*
       * handleSubmit,
       * handleCancel,
       */

      setLatitude,
      setLongitude,
      setAddress,

      handleAddressSubmit,
      onMapChange,
      onReset,
    } = this;

    const translate = translateNameSpacer( t, 'Components.LocationPicker' );

    const isInitialized = location && location.latitude;

    const silentEvent = ( e ) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const onLatitudeChange = ( e ) => !isNaN( +e.target.value ) && setLatitude( +e.target.value );
    const onLongitudeChange = ( e ) => !isNaN( +e.target.value ) && setLongitude( +e.target.value );
    const handleAddressChange = ( e ) => {
      const val = e.target.value;
      setAddress( val );
      if ( !showSuggestions ) {
        this.setState( { showSuggestions: true } );
      }
      handleAddressSubmit( val );
    };
    const onSuggestionsBlur = () => {
      this.setState( { showSuggestions: false } );
    };
    const handleSuggestionChoice = ( { lat, lon, area } ) => {
      let newZoomLevel = 2;

      if ( area < 20 ) {
        newZoomLevel = 9;
      }
      else if ( area < 50 ) {
        newZoomLevel = 8;
      }
      else if ( area < 100 ) {
        newZoomLevel = 7;
      }
      else if ( area < 400 ) {
        newZoomLevel = 5;
      }
      else if ( area < 2000 ) {
        newZoomLevel = 4;
      }
      else if ( area < 3000 ) {
        newZoomLevel = 3;
      }

      /*
       * setLatitude( lat );
       * setLongitude( lon );
       */

      this.setState( {
        showSuggestions: false,
        zoomLevel: newZoomLevel,
        latitude: lat,
        longitude: lon,
       } );
       onChange( {
        ...location,

        latitude: lat,
        longitude: lon
      } );
    };

    const onAlignOnMapPosition = () => {
      onChange( {
        ...location,
        latitude,
        longitude,
      } );
    };

    const bindLocationInputAnchor = ( locationInputAnchor ) => {
      this.locationInputAnchor = locationInputAnchor;
    };
    return (
      <div
        onClick={ silentEvent }
      >

        {
          !isInitialized && !isEdited &&
          <Button
            isFullWidth
            onClick={ toggleEdited }
          >
              {translate( 'add location' )}
          </Button>
        }

        <StretchedLayoutContainer isDirection={ 'horizontal' }>
          <StretchedLayoutItem style={ { paddingRight: '1rem' } }>
            {
            isEdited ?
              <StretchedLayoutContainer isDirection={ 'vertical' }>
                <StretchedLayoutItem isFlex={ 1 }>
                  <div className={ 'field' }>
                    <label className={ 'label' }>{translate( 'Address' )}</label>
                    <div className={ 'control' }>
                      <input
                        ref={ bindLocationInputAnchor }
                        value={ address }
                        onChange={ handleAddressChange }
                        placeholder={ translate( 'Input a place to search' ) }
                        className={ 'input location-picker-input' }
                      />
                      {
                          suggestions.length && showSuggestions ?
                            <LocationPickerSuggestions
                              anchor={ this.locationInputAnchor }
                              onBlur={ onSuggestionsBlur }
                              onSuggestionChoice={ handleSuggestionChoice }
                              { ...{ suggestions } }
                            />
                          : null
                        }
                    </div>
                  </div>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
              : null
          }

            {
            isEdited ?
              <div
                style={ { paddingTop: '1rem' } }
              >
                <div className={ 'field' }>
                  <label className={ 'label' }>{translate( 'Latitude' )}</label>
                  <div className={ 'control' }>
                    <input
                      className={ 'input' }
                      value={ location.latitude || '' }
                      placeholder={ translate( 'input latitude' ) }
                      onChange={ onLatitudeChange }
                    />
                  </div>
                </div>

                <div>
                  <label className={ 'label' }>{translate( 'Longitude' )}</label>
                  <div className={ 'control' }>
                    <input
                      className={ 'input' }
                      value={ location.longitude || '' }
                      placeholder={ translate( 'input longitude' ) }
                      onChange={ onLongitudeChange }
                    />
                  </div>
                </div>
              </div>
              :
              null
          }
            {
            ( location.latitude || location.longitude ) ?
              <div
                style={ { marginTop: '1rem' } }
                className={ '' }
              >
                <button
                  onClick={ onReset }
                  className={ 'button is-danger is-fullwidth' }
                >
                  {translate( 'delete location' )}
                </button>
              </div>
              :
              null
          }
          </StretchedLayoutItem>
          <StretchedLayoutItem
            isFlex={ 1 }
            style={ { position: 'relative' } }
          >
            <div style={ { width: '100%', height: '20rem' } }>
              <Map
                center={ [ latitude || 0, longitude || 0 ] }
                zoom={ zoomLevel }
                onBoundsChanged={ onMapChange }
              >
                {

                  <Overlay anchor={ [ latitude || 0, longitude || 0 ] }>
                    <PrevMarker />
                  </Overlay>

                  }
                {location.latitude ?
                  <Overlay anchor={ [ location.latitude, location.longitude ] }>
                    <Marker />
                  </Overlay>
                : null}
              </Map>
            </div>
            <div>
              <Button
                style={ { position: 'absolute', top: '1rem', right: '1rem' } }
                onClick={ onAlignOnMapPosition }
              >{translate( 'Update location from map position' )}
              </Button>
            </div>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

      </div>
    );
  }
}
