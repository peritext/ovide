import { expect } from 'chai';
import getConfig from './getConfig';

describe( 'Get config', () => {
  it( 'should return an object', ( done ) => {
    const config = getConfig();
    expect( config ).to.be.an( 'object' );
    done();
  } );
} );
