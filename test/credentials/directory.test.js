var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/credentials/directory');
var Client = require('../../lib/management/v2/enrollmentsclient');
var ManagementClient = require('auth0').ManagementClient;
var fs = require('fs');
var StubCredentialStore = require('../stubs/credentialstore');


describe('directory', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.equal('http://i.bixbyjs.org/IService');
    expect(factory['@name']).to.equal('auth0-enrollments');
  });
  
  describe('API', function() {
    var _creds = new StubCredentialStore();
    
    var ClientSpy = sinon.spy(Client);
    var api = $require('../../app/credentials/directory',
      { '../../lib/management/v2/enrollmentsclient': ClientSpy }
    )(_creds);
    
    describe('.createConnection', function() {
      afterEach(function() {
        ClientSpy.resetHistory();
      });
      
      it('should construct client', function() {
        sinon.stub(_creds, 'get').yieldsAsync(null, { username: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX', password: 'keyboard cat' });
        
        var client = api.createConnection({ url: 'https://example.auth0.com' });
        
        expect(ClientSpy).to.have.been.calledOnceWithExactly('https://example.auth0.com').and.calledWithNew;
        expect(client).to.be.an.instanceof(Client);
      }); // should construct client
      
      it('should construct client and invoke callback', function(done) {
        sinon.stub(_creds, 'get').yieldsAsync(null, { username: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX', password: 'keyboard cat' });
        
        var client = api.createConnection({ url: 'https://example.auth0.com' }, function() {
          done();
        });
        
        expect(ClientSpy).to.have.been.calledOnceWithExactly('https://example.auth0.com').and.calledWithNew;
        expect(client).to.be.an.instanceof(Client);
      }); // should construct client and invoke callback
      
    }); // .createConnection
    
  }); // API
  
  describe('EnrollmentsClient', function() {
    var _client = sinon.createStubInstance(ManagementClient);
    var ClientStub = sinon.stub().returns(_client);
    var Client = $require('../../lib/management/v2/enrollmentsclient',
      { 'auth0': { ManagementClient: ClientStub } }
    );
    
    describe('#connect', function() {
      
      it('should get credential and construct client', function(done) {
        var client = new Client('https://hansonhq.auth0.com');
        client._creds = new StubCredentialStore();
        sinon.stub(client._creds, 'get').yieldsAsync(null, { username: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX', password: 'keyboard cat' });
        
        client.connect(function() {
          expect(client._creds.get).to.have.been.calledOnceWith('https://hansonhq.auth0.com');
          
          expect(ClientStub).to.have.been.calledOnceWithExactly({
            domain: 'hansonhq.auth0.com',
            clientId: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX',
            clientSecret: 'keyboard cat'
          }).and.calledWithNew;
          
          done();
        });
      }); // should get credential and construct client
      
    }); // #connect
    
    describe('#list', function() {
      var client = new Client('https://hansonhq.auth0.com');
      client._creds = new StubCredentialStore();
      
      before(function(done) {
        sinon.stub(client._creds, 'get').yieldsAsync(null, { username: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX', password: 'keyboard cat' });
        client.connect(done);
      });
      
      it.skip('should get user by id', function(done) {
        _client.users = {};
        _client.users.getGuardianEnrollments = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/users/steve.json', 'utf8')));
        
        client.list({ id: 'auth0|5b6ce4a9e54355613fd4627c' }, function(err, user) {
          /*
          expect(_client.users.get.getCall(0).args[0]).to.deep.equal({ id: 'auth0|5b6ce4a9e54355613fd4627c' });
          
          expect(err).to.be.null;
          expect(user).to.deep.equal({
            id: 'auth0|5b6ce4a9e54355613fd4627c',
            emails: [
              { value: 'steve@example.com' }
            ]
          });
          done();
          */
        });
        
      }); // should get user by id
      
    });
    
    
  });
  
});
