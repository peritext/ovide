/**
 * This module helps to manage local storage data
 * @module ovide/utils/localStorageUtils
 */
export const loadProductionToken = ( productionId ) => {
  return localStorage.getItem( `ovide/productionToken/${productionId}` );
};
export const saveProductionToken = ( productionId, token ) => {
  localStorage.setItem( `ovide/productionToken/${productionId}`, token );
};
export const deleteProductionToken = ( productionId ) => {
  localStorage.removeItem( `ovide/productionToken/${productionId}` );
};

export const updateEditionHistoryMap = ( productionId ) => {
  const existing = localStorage.getItem( 'ovide/editionProductionMap' );
  let previousMap;
  try {
    if ( existing ) {
      previousMap = JSON.parse( existing );
    }
 else previousMap = {};
  }
 catch ( e ) {
    previousMap = {};
  }
  const newMap = {
    ...previousMap,
    [productionId]: new Date().getTime()
  };
  localStorage.setItem( 'ovide/editionProductionMap', JSON.stringify( newMap ) );
};

const getJSONFromStorage = ( key ) => {
  const existing = localStorage.getItem( key );
  let result;
  try {
    if ( existing ) {
      result = JSON.parse( existing );
    }
  }
  catch ( e ) {
    result = undefined;
  }
  return result;
};

export const getEditionHistoryMap = () => {
  return getJSONFromStorage( 'ovide/editionProductionMap' );
};
