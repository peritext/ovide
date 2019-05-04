import React from 'react';
import PropTypes from 'prop-types';
import {
    Field,
    Label,
    Control,
    Input,
    Select,
  } from 'quinoa-design-library/components/';
import { translateNameSpacer } from '../../helpers/translateUtils';

import './DatesParts.scss';

const days = [];
for ( let i = 1; i <= 31; i++ ) {
 days.push( i );
}
days.push( 'none' );

const DatesParts = ( {
    year,
    month,
    day,
    onUpdate
}, { t } ) => {
        const translate = translateNameSpacer( t, 'Components.DatesParts' );

        const months = {
            0: translate( 'January' ),
            1: translate( 'February' ),
            2: translate( 'March' ),
            3: translate( 'April' ),
            4: translate( 'May' ),
            5: translate( 'June' ),
            6: translate( 'Jully' ),
            7: translate( 'August' ),
            8: translate( 'September' ),
            9: translate( 'October' ),
            10: translate( 'November' ),
            11: translate( 'December' ),
            none: translate( 'None' ),
        };

        const handleYearChange = ( e ) => {
            const newYear = e.target.value;
            if ( !isNaN( +newYear ) ) {
                onUpdate( {
                    date: new Date( +newYear, month ? +month : 1, day ? +day : 2 ),
                    dateParts: {
                        year: newYear
                    }
                } );
            }
        };
        const handleMonthChange = ( e ) => {
            const newMonth = e.target.value;
            let newDate;
            if ( newMonth === 'none' ) {
                newDate = new Date( +year, 1, day ? +day : 1 );
            }
            else {
                newDate = new Date( +year, +newMonth, day ? +day : 2 );
            }
            onUpdate( {
                date: newDate,
                dateParts: {
                    month: newMonth
                }
            } );
        };
        const handleDayChange = ( e ) => {
            const newDay = e.target.value;
            let newDate;
            if ( newDay === 'none' ) {
                newDate = new Date( +year, +month, 1 );
            }
            else {
                newDate = new Date( +year, +month, +newDay + 1 );
            }
            onUpdate( {
                date: newDate,
                dateParts: {
                    day: newDay
                }
            } );
        };
        const monthsList = Object.keys( months ).map( ( number ) => ( {
            monthNumber: number,
            monthName: months[number]
        } ) );

        return (
          <div className={ 'dates-parts' }>
            <Field>
              <Label>{translate( 'Year' )}</Label>
              <Control>
                <Input
                  value={ year || '' }
                  onChange={ handleYearChange }
                />
              </Control>
            </Field>
            <div className={ `field-container ${( year && year.length ) ? '' : 'is-disabled'}` }>
              <Field>
                <Label>{translate( 'Month' )}</Label>
                <Control>
                  <Select
                    onChange={ handleMonthChange }
                    value={ month || 'none' }
                  >
                    {
                        monthsList
                        .map( ( thatMonth, index ) => {
                            return (
                              <option
                                key={ index }
                                id={ thatMonth.monthNumber }
                                value={ thatMonth.monthNumber }
                              >
                                {thatMonth.monthName}
                              </option>
                            );
                        } )
                        }
                  </Select>
                </Control>
              </Field>
            </div>
            <div className={ `field-container ${( year && year.length && month ) ? '' : 'is-disabled'}` }>
              <Field>
                <Label>{translate( 'Day' )}</Label>
                <Control>
                  <Select
                    onChange={ handleDayChange }
                    value={ day || 'none' }
                  >
                    {
                        days
                        .map( ( thatDay, index ) => {
                            return (
                              <option
                                key={ index }
                                id={ thatDay }
                                value={ thatDay }
                              >
                                {thatDay === 'none' ? translate( 'none' ) : thatDay}
                              </option>
                            );
                        } )
                        }
                  </Select>
                </Control>
              </Field>
            </div>
          </div>
        );
};

DatesParts.contextTypes = {
    t: PropTypes.func,
};

export default DatesParts;
