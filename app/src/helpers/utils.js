import copy from 'copy-to-clipboard';

export const mapToArray = ( map ) =>
  Object.keys( map ).reduce( ( res, id ) => [
    ...res,
    map[id]
  ], [] );

const youtubeRegexp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/gi;
const vimeoRegexp = /^(https?\:\/\/)?(www\.)?(vimeo\.com)/gi;
const validMediaRegexps = [ youtubeRegexp, vimeoRegexp ];

export const mediaUrlIsValid = ( url = '' ) => {
  return validMediaRegexps.find( ( regexp ) => url.match( regexp ) ) !== undefined;
};

export const convertRemToPixels = ( rem ) => {
  return rem * parseFloat( getComputedStyle( document.documentElement ).fontSize );
};

export const getMediaPlatformFromUrl = ( url = '' ) => {
  if ( url.indexOf( 'file://' ) === 0 ) {
    return 'local';
  }
  const simple = [ 'youtube', 'vimeo', 'wistia', 'dailymotion', 'facebook', 'soundcloud', 'wistia', 'twitch' ];
  const platform = simple.find( ( s ) => {
    if ( url.includes( s ) ) {
      return true;
    }
  } );
  if ( platform ) {
    return platform;
  }
  else if ( url.includes( 'youtu.be' ) ) {
    return 'youtube';
  }
  else {
    return 'defaultImage';
  }
};

export const copyToClipboard = ( text ) => {
  copy( text );
};

export const abbrev = ( str = '', maxLength = 10 ) => {
  if ( str.length > maxLength ) {
    return `${str.slice( 0, maxLength ) }...`;
  }
  return str;
};

const parseRedirectQuery = ( location, history ) => {
  const redirectTo = {};

  if ( typeof location.pathname === 'string' && location.pathname !== '' ) {
    redirectTo.pathname = decodeURIComponent( location.pathname );
  }

  if ( typeof location.search === 'string' && location.search !== '' ) {
    const queryObject = {};
    location.search.split( '&' ).map( ( q ) => q.split( '=' ) ).forEach( ( arr ) => {
      queryObject[arr[0]] = arr.slice( 1 ).join( '=' );
    } );
    redirectTo.query = queryObject;
    if ( queryObject.pathname ) {
      redirectTo.pathname = decodeURIComponent( queryObject.pathname );
    }
  }

  if ( typeof location.hash === 'string' && location.hash !== '' ) {
    redirectTo.hash = `#${location.hash}`;
  }

  redirectTo.pathname = redirectTo.pathname.replace( '/ovide', '' );

  setTimeout( () => history.replace( redirectTo ) );
};

/**
 * Redirect logic
 * taken from React for GitHub Pages - https://github.com/rafrex/react-github-pages
 * (thanks!)
 */
export const checkForRedirect = ( location, history ) => {
  if ( location.search.includes( 'redirect=true' ) ) {
    parseRedirectQuery( location, history );
  }
};

