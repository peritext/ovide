import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Title
} from 'quinoa-design-library/components/';

import DatesParts from './DatesParts';
import { translateNameSpacer } from '../../helpers/translateUtils';

export default class DatesPicker extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      isEdited: false
    };
  }

  toggleEdited = ( ) => {
    this.setState( {
      isEdited: !this.state.isEdited
    } );
  }

  render = () => {
    const {
      state: {
        isEdited,
      },
      props: {
        dates,
      },
      context: { t },
      toggleEdited,
    } = this;

    const {
      start,
      startDateParts = {},
      // end,
      endDateParts = {},
    } = dates;

    const translate = translateNameSpacer( t, 'Components.DatesPicker' );
    const isInitialized = dates && dates.start;

    const handleDelete = () => {
      this.props.onChange( {
        start: undefined,
        startDateParts: {
          year: undefined,
          month: undefined,
          day: undefined,
        },
        endDateParts: {
          year: undefined,
          month: undefined,
          day: undefined,
        },
        end: undefined,
      } );
      this.toggleEdited();
    };

    const onUpdateStart = ( { date, dateParts } ) => {
      this.props.onChange( {
        start: date.getTime(),
        startDateParts: {
          ...startDateParts,
          ...dateParts,
        }
      } );
    };

    const onUpdateEnd = ( { date, dateParts } ) => {
      this.props.onChange( {
        end: date.getTime(),
        endDateParts: {
          ...endDateParts,
          ...dateParts,
        }
      } );
    };

    return (
      <div>
        <div className={ 'level' }>
          {
                  !isInitialized && !isEdited &&
                  <button
                    className={ 'button is-fullwidth' }
                    onClick={ toggleEdited }
                  >
                      {translate( 'add-dates' )}
                  </button>
                }
        </div>
        <div
          className={ 'level' }
        >
          {( isInitialized || isEdited ) ?
            <div>
              <div>
                <Title isSize={ 5 }>{translate( 'Start date' )}</Title>
                <DatesParts
                  { ...startDateParts }
                  onUpdate={ onUpdateStart }
                />
              </div>
              <div style={ {
              opacity: start ? 1 : 0.5,
              pointerEvents: start ? 'all' : 'none',
            } }
              >
                <Title isSize={ 5 }>{translate( 'End date' )}</Title>
                <DatesParts
                  { ...endDateParts }
                  onUpdate={ onUpdateEnd }
                />
              </div>
            </div>
          : null
        }
        </div>
        <div className={ 'level' }>
          { ( isInitialized || isEdited ) &&
            <button
              className={ 'button is-danger' }
              onClick={ handleDelete }
              isDisabled={ !isInitialized }
            >
                {translate( 'delete dates' )}
            </button>
          }
        </div>
      </div>
    );
  }
}
