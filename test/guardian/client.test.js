var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/guardian/client');


describe.skip('auth0/client/browserish', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  describe('BrowserishClient', function() {
    var getCredential;
    
    
    describe('#enroll', function() {
      
      describe('initiating enrollment', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var txn;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX');
          
          var txn = {
            deviceAccount: {
              id: 'dev_xxxXxxX0XXXxXx0X',
              otpSecret: 'XXXX0XXXXXXX0XXXXXXXXXXXXXXXX0XX',
              status: 'confirmation_pending',
              recoveryCode: 'XXXXXXX0X0XX0XXXXXXXX0X0'
            },
            enrollmentTxId: 'X0XXxxXX0xx00XXXxXxxXxxXxxx0XXx0',
            featureSwitches: {
              mfaApp: {
                enroll: true
              },
              mfaSms: {
                enroll: false
              }
            },
            transactionToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoMHwwMHh4MDB4MDAwMHgwMHgwMDAweDAwMDAiLCJleHAiOjE0ODE3NTgzMjMsImlzcyI6Imh0dHBzOi8vYWNtZS5ndWFyZGlhbi5hdXRoMC5jb20iLCJhdWQiOiJodHRwczovL2FjbWUuZ3VhcmRpYW4uYXV0aDAuY29tL2FwaSIsImF6cCI6ImJyb3dzZXIiLCJ0eGlkIjoidHhuX1hYeFhYWHgwMHhYMFh4eFh4WFhYMDB4eHhYMFh4MCJ9.aOSBJGPl6Wxn85i2wdYHREdR1u6X3aazAn0mn3zt042ayjp4MUZNE30gmFnZ2u511cfiQj-K5oIqsbLGlxXjxJRh_vZB7mlAhV7rzDD50pfw7NuaiXyMyE9Pd80eRA9K44IoZ5WP1EXVrMhjqvX_kYQ_fxuET7hKsNN-l_OL46c',
            availableAuthenticationMethods: ['push', 'otp'],
            availableEnrollmentMethods: ['push', 'otp']
          };
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, txn);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.enroll('auth0|00xx00x0000x00x0000x0000', function(_err, _txn) {
            if (_err) { return done(_err); }
            txn = _txn;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            ticket: 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX'
          });
        });
        
        it('should request MFA API to start flow', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/start-flow');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield transaction', function() {
          expect(txn).to.be.an('object')
          expect(txn.enrollmentTxId).to.equal('X0XXxxXX0xx00XXXxXxxXxxXxxx0XXx0');
        });
      }); // initiating enrollment
      
      describe('already enrolled with Google Authenticator', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var err;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX');
          
          var txn = {
            deviceAccount: {
              status: 'confirmed',
              pushNotifications: {
                enabled: false
              },
              availableMethods: ['otp'],
              methods: ['otp']
            },
            featureSwitches: {
              mfaApp: {
                enroll: true
              },
              mfaSms: {
                enroll: false
              }
            },
            transactionToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoMHwwMHh4MDB4MDAwMHgwMHgwMDAweDAwMDAiLCJleHAiOjE0ODE3NTgzMjMsImlzcyI6Imh0dHBzOi8vYWNtZS5ndWFyZGlhbi5hdXRoMC5jb20iLCJhdWQiOiJodHRwczovL2FjbWUuZ3VhcmRpYW4uYXV0aDAuY29tL2FwaSIsImF6cCI6ImJyb3dzZXIiLCJ0eGlkIjoidHhuX1hYeFhYWHgwMHhYMFh4eFh4WFhYMDB4eHhYMFh4MCJ9.aOSBJGPl6Wxn85i2wdYHREdR1u6X3aazAn0mn3zt042ayjp4MUZNE30gmFnZ2u511cfiQj-K5oIqsbLGlxXjxJRh_vZB7mlAhV7rzDD50pfw7NuaiXyMyE9Pd80eRA9K44IoZ5WP1EXVrMhjqvX_kYQ_fxuET7hKsNN-l_OL46c',
            availableAuthenticationMethods: ['push', 'otp'],
            availableEnrollmentMethods: ['push', 'otp']
          };
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, txn);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.enroll('auth0|00xx00x0000x00x0000x0000', function(_err) {
            err = _err;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            ticket: 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX'
          });
        });
        
        it('should request MFA API to start flow', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/start-flow');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield error', function() {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('You cannot enroll again. You are already enrolled.');
          expect(err.errorCode).to.equal('already_enrolled');
        });
      }); // already enrolled with Google Authenticator
      
      describe('already enrolled with Auth0 Guardian', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var err;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX');
          
          var txn = {
            deviceAccount: {
              status: 'confirmed',
              name: 'John’s iPhone 7',
              phoneNumber: null,
              pushNotifications: {
                enabled: true
              },
              availableMethods: ['push', 'otp'],
              methods: ['push', 'otp']
            },
            featureSwitches: {
              mfaApp: {
                enroll: true
              },
              mfaSms: {
                enroll: false
              }
            },
            transactionToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoMHwwMHh4MDB4MDAwMHgwMHgwMDAweDAwMDAiLCJleHAiOjE0ODE3NTgzMjMsImlzcyI6Imh0dHBzOi8vYWNtZS5ndWFyZGlhbi5hdXRoMC5jb20iLCJhdWQiOiJodHRwczovL2FjbWUuZ3VhcmRpYW4uYXV0aDAuY29tL2FwaSIsImF6cCI6ImJyb3dzZXIiLCJ0eGlkIjoidHhuX1hYeFhYWHgwMHhYMFh4eFh4WFhYMDB4eHhYMFh4MCJ9.aOSBJGPl6Wxn85i2wdYHREdR1u6X3aazAn0mn3zt042ayjp4MUZNE30gmFnZ2u511cfiQj-K5oIqsbLGlxXjxJRh_vZB7mlAhV7rzDD50pfw7NuaiXyMyE9Pd80eRA9K44IoZ5WP1EXVrMhjqvX_kYQ_fxuET7hKsNN-l_OL46c',
            availableAuthenticationMethods: ['push', 'otp'],
            availableEnrollmentMethods: ['push', 'otp']
          };
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, txn);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.enroll('auth0|00xx00x0000x00x0000x0000', function(_err) {
            err = _err;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            ticket: 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX'
          });
        });
        
        it('should request MFA API to start flow', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/start-flow');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield error', function() {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('You cannot enroll again. You are already enrolled.');
          expect(err.errorCode).to.equal('already_enrolled');
        });
      }); // already enrolled with Auth0 Guardian
      
      describe('already enrolled with SMS', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var err;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX');
          
          var txn = {
            deviceAccount: {
              status: 'confirmed',
              phoneNumber: 'XXXXXXXX1234',
              pushNotifications: {
                enabled: false
              },
              availableMethods: ['sms'],
              methods: ['sms']
            },
            featureSwitches: {
              mfaApp: {
                enroll: true
              },
              mfaSms: {
                enroll: true
              }
            },
            transactionToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoMHwwMHh4MDB4MDAwMHgwMHgwMDAweDAwMDAiLCJleHAiOjE0ODE3NTgzMjMsImlzcyI6Imh0dHBzOi8vYWNtZS5ndWFyZGlhbi5hdXRoMC5jb20iLCJhdWQiOiJodHRwczovL2FjbWUuZ3VhcmRpYW4uYXV0aDAuY29tL2FwaSIsImF6cCI6ImJyb3dzZXIiLCJ0eGlkIjoidHhuX1hYeFhYWHgwMHhYMFh4eFh4WFhYMDB4eHhYMFh4MCJ9.aOSBJGPl6Wxn85i2wdYHREdR1u6X3aazAn0mn3zt042ayjp4MUZNE30gmFnZ2u511cfiQj-K5oIqsbLGlxXjxJRh_vZB7mlAhV7rzDD50pfw7NuaiXyMyE9Pd80eRA9K44IoZ5WP1EXVrMhjqvX_kYQ_fxuET7hKsNN-l_OL46c',
            availableAuthenticationMethods: ['push', 'otp', 'sms'],
            availableEnrollmentMethods: ['push', 'otp', 'sms']
          };
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, txn);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.enroll('auth0|00xx00x0000x00x0000x0000', function(_err) {
            err = _err;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            ticket: 'XXXX0x0Xxxx0xXX0xxXX0xXxxxxxxXXX'
          });
        });
        
        it('should request MFA API to start flow', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/start-flow');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield error', function() {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('You cannot enroll again. You are already enrolled.');
          expect(err.errorCode).to.equal('already_enrolled');
        });
      }); // already enrolled with SMS
      
    }); // #enroll
    
    describe('#enrollViaSMS', function() {
      
      describe('accepted', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        before(function() {
          sinon.stub(mfaClient.httpClient, 'post').yields(null, { phoneNumber: 'XXXXXXXX1234' });
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.enrollViaSMS('dev_xxxXxxX0XXXxXx0X', '+18885551234', 'eyJ0eXAi.eyJzdWIi.aOSBJGPl', function(_err) {
            if (_err) { return done(_err); }
            done();
          });
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to send verification code via SMS', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/device-accounts/dev_xxxXxxX0XXXxXx0X/sms-enroll');
          expect(call.args[2]).to.deep.equal({
            phone_number: '+18885551234'
          });
        });
      }); // accepted
      
    }); // #enrollViaSMS
    
    describe('#sendPush', function() {
      
      describe('success', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var transactionToken;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, {});
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.sendPush('auth0|00xx00x0000x00x0000x0000', function(_err, _token) {
            if (_err) { return done(_err); }
            transactionToken = _token;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
          expect(call.args[1]).to.deep.equal({
            stateTransport: 'polling'
          });
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to send push notification', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/send-push-notification');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield transaction token', function() {
          expect(transactionToken).to.equal('eyJ0eXAi.eyJzdWIi.aOSBJGPl');
        });
      }); // success
      
      describe('failure cause by push notifications not being configured', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var err;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          var e = new Error();
          e.message = 'Push notification settings not provided.';
          e.statusCode = 404;
          e.errorCode = 'push_notification_not_configured';
          
          sinon.stub(mfaClient.httpClient, 'post').yields(e);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.sendPush('auth0|00xx00x0000x00x0000x0000', function(_err) {
            err = _err;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to send push notification', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/send-push-notification');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield error', function() {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('Push notification settings not provided.');
          expect(err.errorCode).to.equal('push_notification_not_configured');
        });
      }); // failure cause by push notifications not being configured
      
    }); // #sendPush
    
    describe('#sendSMS', function() {
      
      describe('success', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var transactionToken;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, {});
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.sendSMS('auth0|00xx00x0000x00x0000x0000', function(_err, _token) {
            if (_err) { return done(_err); }
            transactionToken = _token;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
          expect(call.args[1]).to.deep.equal({
            stateTransport: 'polling'
          });
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to send push notification', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/send-sms');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield transaction token', function() {
          expect(transactionToken).to.equal('eyJ0eXAi.eyJzdWIi.aOSBJGPl');
        });
      }); // success
      
    }); // #sendSMS
    
    describe('#transactionState', function() {
      
      describe('success', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var txn;
        
        before(function() {
          var txn = { id: 'txn_xXxXXXXxXX0XX0XxxxXxXxxx0x0XXX',
            state: 'pending',
            enrollment: 
             { id: 'dev_xxxXxxX0XXXxXx0X',
               name: 'John’s iPhone 7',
               identifier: '0000000X-000X-00X0-0X00-00X000XX000X',
               phoneNumber: 'null',
               methods: [ 'push', 'otp' ],
               availableMethods: [ 'push', 'otp' ] } };
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, txn);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.transactionState('eyJ0eXAi.eyJzdWIi.aOSBJGPl', function(_err, _txn) {
            if (_err) { return done(_err); }
            txn = _txn;
            done();
          });
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to send push notification', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/transaction-state');
          expect(call.args[2]).to.equal(null);
        });
        
        it('should yield transaction', function() {
          expect(txn.id).to.equal('txn_xXxXXXXxXX0XX0XxxxXxXxxx0x0XXX');
        });
      }); // success
      
    }); // #transactionState
    
    describe('#verifyOTP', function() {
      
      describe('a valid one-time password', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, {});
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.verifyOTP('auth0|00xx00x0000x00x0000x0000', '123456', function(_err) {
            if (_err) { return done(_err); }
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to verify one-time password', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/verify-otp');
          expect(call.args[2]).to.deep.equal({
            type: 'manual_input',
            code: '123456'
          });
        });
      }); // a valid one-time password
      
      describe('a valid one-time password, using an enrollment access token', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          sinon.stub(mfaClient.httpClient, 'post').yields(null, {});
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.verifyOTP('auth0|00xx00x0000x00x0000x0000', '123456', { accessToken: 'eyJ0eXAx.eyJzdWIx.aOSBJGPl' }, function(_err) {
            if (_err) { return done(_err); }
            done();
          });
        });
        
        it('should not get authorization credential', function() {
          expect(getCredential.callCount).to.equal(0);
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAx.eyJzdWIx.aOSBJGPl'
          });
        });
        
        it('should request MFA API to verify one-time password', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/verify-otp');
          expect(call.args[2]).to.deep.equal({
            type: 'manual_input',
            code: '123456'
          });
        });
      }); // a valid one-time password, using an enrollment access token
      
      describe('an invalid one-time password', function() {
        var guardian;
        var mfaClient = {
          httpClient: { post: function(){} }
        };
        
        
        var err;
        
        before(function() {
          getCredential = sinon.stub().yields(null, 'eyJ0eXAi.eyJzdWIi.aOSBJGPl');
          
          var e = new Error();
          e.message = 'Invalid OTP.';
          e.statusCode = 403;
          e.errorCode = 'invalid_otp';
          
          sinon.stub(mfaClient.httpClient, 'post').yields(e);
          guardian = sinon.stub().returns(mfaClient);
        });
        
        after(function() {
          mfaClient.httpClient.post.restore();
        });
        
        before(function(done) {
          var factory = $require('../../app/guardian/client', { 'auth0-guardian-js': guardian });
        
          var client = factory(getCredential);
          client.verifyOTP('auth0|00xx00x0000x00x0000x0000', '123456', function(_err) {
            err = _err;
            done();
          });
        });
        
        it('should get authorization credential', function() {
          expect(getCredential).to.have.been.calledOnce;
          var call = getCredential.getCall(0);
          expect(call.args[0]).to.equal('auth0|00xx00x0000x00x0000x0000');
        });
        
        it('should construct MFA API client', function() {
          expect(guardian).to.have.been.calledOnce;
          var call = guardian.getCall(0);
          expect(call.args[0]).to.deep.equal({
            serviceUrl: 'https://hansonhq.guardian.auth0.com',
            requestToken: 'eyJ0eXAi.eyJzdWIi.aOSBJGPl'
          });
        });
        
        it('should request MFA API to verify one-time password', function() {
          expect(mfaClient.httpClient.post).to.have.been.calledOnce;
          var call = mfaClient.httpClient.post.getCall(0);
          expect(call.args[0]).to.equal('/api/verify-otp');
          expect(call.args[2]).to.deep.equal({
            type: 'manual_input',
            code: '123456'
          });
        });
        
        it('should yield error', function() {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('Invalid OTP.');
          expect(err.errorCode).to.equal('invalid_otp');
        });
      }); // an invalid one-time password
      
    }); // #verifyOTP
    
  }); // BrowserishClient
  
});
