import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

import Map from 'pigeon-maps'
import Overlay from 'pigeon-overlay'

import getConfig from '../../helpers/getConfig';
const { 
  googleApiKey,
} = getConfig();
import { translateNameSpacer } from '../../helpers/translateUtils';

import {
  Button,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

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
            justifyContent: 'center'
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

  handleAddressSubmit = ( event ) => {
    event.preventDefault();
    geocodeByAddress( this.state.address )
      .then( ( results ) => getLatLng( results[0] ) )
      .then( ( coordinates ) => {
        const { lat, lng } = coordinates;
        this.setState( {
          latitude: lat,
          longitude: lng
        } );
        this.handleSubmit( true );
      } )
      .catch( () => {

      } );
  }

  onMapChange = ( { center } ) => {
    const lat = center[0];
    const lng = center[1];
    this.setState( {
      latitude: lat,
      longitude: lng,
      isEdited: true
    } );
    this.handleSubmit( true );
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
        address = '',
      },
      props: {
        location,
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
                  <h6 className={ 'title is-6' }>
                    {translate( 'Search location by address' )}
                  </h6>
                  <form
                    onSubmit={ handleAddressSubmit }
                    className={ 'stretched-columns' }
                  >
                    <StretchedLayoutContainer isDirection={ 'horizontal' }>
                      <StretchedLayoutItem>
                        <PlacesAutocomplete
                          className={ 'input' }
                          inputProps={ {
                              value: address,
                              placeholder: translate( 'input an address' ),
                              onChange: setAddress,
                              onSubmit: handleAddressSubmit
                            } }
                        />
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <Button
                          style={ { height: '100%', marginLeft: '1rem' } }
                          isColor={ 'info' }
                          onClick={ handleAddressSubmit }
                        >
                          <span className={ 'icon' }>
                            <i className={ 'fas fa-search' } />
                          </span>
                        </Button>
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </form>
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
                      value={ latitude || '' }
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
                      value={ longitude || '' }
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
            latitude ?
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
          {
          latitude && longitude &&
          <StretchedLayoutItem isFlex={ 1 }>
            <div style={ { width: '100%', height: '20rem' } }>
              <Map
                  center={ [ latitude, longitude ] }
                  zoom={ 11 }
                  onBoundsChanged={ onMapChange }
                >
                  {
                        location &&
                                location.latitude &&
                                location.latitude !== latitude &&
                                location.longitude !== longitude &&
                                <Overlay anchor={ [ location.latitude, location.longitude ] }>
                                  <PrevMarker />
                                </Overlay>
                                
                      }
                  <Overlay anchor={ [ latitude, longitude ] }>
                    <Marker />
                  </Overlay> 
              </Map>
            </div>
          </StretchedLayoutItem>
        }
        </StretchedLayoutContainer>

      </div>
    );
  }
}
