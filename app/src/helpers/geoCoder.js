import get from 'axios';
import getConfig from './getConfig';

const {
    maptilerKey
} = getConfig();

export const getPlacesSuggestions = ( str ) => {
    return new Promise( ( resolve, reject ) => {
        const query = encodeURIComponent( str.toLowerCase() );
        get( `https://geocoder.tilehosting.com/q/${query}.js?key=${maptilerKey}` )
        .then( ( { data: { results: suggestions } } ) => {
            resolve( suggestions );
        } )
        .catch( reject );
    } );
};
