/* global describe, it */

var expect = require('chai').expect;
var sinon = require('sinon');


describe('nodex-auth0', function() {
  
  describe('package.json', function() {
    var json = require('../package.json');
    
    it('should have assembly metadata', function() {
      expect(json.assembly.namespace).to.equal('io.modulate/vnd/auth0');
      
      expect(json.assembly.components).to.have.length(10);
      expect(json.assembly.components).to.include('mgmt/v2/client');
    });
  });
  
  it('should throw if required', function() {
    expect(function() {
      var pkg = require('..');
    }).to.throw(Error).with.property('code', 'MODULE_NOT_FOUND');
  });
  
});


afterEach(function() {
  sinon.restore();
});
