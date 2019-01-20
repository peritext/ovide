
const {
  getProductions,
  getProduction,
  createProduction,
  updateProduction,
  updateProductionPart,
  deleteProduction,
  packProduction,
} = require( './productionsTransactions' );

const {
  getCitationStyles,
  getCitationStyle,
  getCitationLocales,
  getCitationLocale,
  getHTMLBuild,
} = require( './staticResourcesTransactions' );

const {
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetData,
} = require( './assetsTransactions' );

const {
  generateEdition
} = require( './generatorsTransactions' );

const routes = {
  'get-productions': getProductions,
  'get-production': getProduction,
  'create-production': createProduction,
  'delete-production': deleteProduction,
  'update-production': updateProduction,
  'pack-production': packProduction,
  'update-production-part': updateProductionPart,

  'create-asset': createAsset,
  'update-asset': updateAsset,
  'delete-asset': deleteAsset,
  'get-asset-data': getAssetData,

  'get-citation-styles': getCitationStyles,
  'get-citation-locales': getCitationLocales,
  'get-citation-style': getCitationStyle,
  'get-citation-locale': getCitationLocale,

  'get-html-build': getHTMLBuild,

  'generate-edition': generateEdition
};

module.exports = routes;
