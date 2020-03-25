const resourceSchemas = require( 'peritext-schemas/resource' );
const peritextConfig = {
  contextualizers: {
    bib: require( 'peritext-contextualizer-bib' ),
    glossary: require( 'peritext-contextualizer-glossary' ),
    webpage: require( 'peritext-contextualizer-webpage' ),
    embed: require( 'peritext-contextualizer-embed' ),
    video: require( 'peritext-contextualizer-video' ),
    image: require( 'peritext-contextualizer-image' ),
    sourceCode: require( 'peritext-contextualizer-source-code' ),
    vegaLite: require( 'peritext-contextualizer-vegalite' ),
    table: require( 'peritext-contextualizer-table' ),
    },
  templates: [
    require( 'peritext-template-pyrrah' ).default,
    require( 'peritext-template-deucalion' ).default,
    require( 'peritext-template-callirhoe' ).default,
    require( 'peritext-template-chrysaor' ).default
  ],
  renderingModes: [ 'screened', 'paged' ],
  htmlBuilds: {
    'single-page-html': {
      deucalion: true,
      callirhoe: true,
      chrysaor: true
    },
    'multi-page-html': {
      deucalion: true,
      callirhoe: true,
      chrysaor: true
    }
  },
  generators: {
    'single-page-html': {
      outputFormat: 'html',
      generatorType: 'single-page-html',
      id: 'single-page-html',
      interfaceCoverage: [ 'desktop', 'web' ]
    },
    'multi-page-html': {
      outputFormat: 'zip',
      generatorType: 'multi-page-html',
      id: 'multi-page-html',
      interfaceCoverage: [ 'desktop', 'web' ]
    },
  },
  resourcesSchemas: {
    section: resourceSchemas.definitions.section,
    bib: resourceSchemas.definitions.bib,
    glossary: resourceSchemas.definitions.glossary,
    webpage: resourceSchemas.definitions.webpage,
    image: resourceSchemas.definitions.image,
    table: resourceSchemas.definitions.table,
    video: resourceSchemas.definitions.video,
    embed: resourceSchemas.definitions.embed,
  },
};

// global.peritextConfig = peritextConfig;
module.exports = peritextConfig;
