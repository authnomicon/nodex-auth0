var guardian = require('auth0-guardian-js');
var AlreadyEnrolledError = require('auth0-guardian-js/lib/errors/already_enrolled_error');


function BrowserishClient(options, getCredential) {
  this._serviceURL = options.serviceURL;
  this._getCredential = getCredential;
}

BrowserishClient.prototype.enroll = function(userID, cb) {
  this._getCredential(userID, 'ticket', function(err, ticket) {
    if (err) { return cb(err); }
  
    var client = guardian({
      serviceUrl: 'https://hansonhq.guardian.auth0.com',
      ticket: ticket
    });
    // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apistart-flow
    client.httpClient.post('/api/start-flow', client.credentials, null, function(err, txn) {
      if (err) { return cb(err); }
      if (!txn.enrollmentTxId) {
        return cb(new AlreadyEnrolledError());
      }
      return cb(null, txn);
    });
  });
}

BrowserishClient.prototype.enrollViaSMS = function(deviceID, phone, txid, cb) {
  var client = guardian({
    serviceUrl: 'https://hansonhq.guardian.auth0.com',
    requestToken: txid
  });
  
  // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apidevice-accountsidsms-enroll
  var data = {
    phone_number: phone
  };
  client.httpClient.post('/api/device-accounts/' + deviceID + '/sms-enroll', client.credentials, data, function(err, out) {
    if (err) {
      return cb(err);
    }
    return cb(null);
  });
};

BrowserishClient.prototype.sendPush = function(userID, cb) {
  this._getCredential(userID, { stateTransport: 'polling' }, function(err, token) {
    if (err) { return cb(err); }
    
    var client = guardian({
      serviceUrl: 'https://hansonhq.guardian.auth0.com',
      requestToken: token
    });
    
    // TODO: Implement an immediate error, if SMS only, passing the token so
    //       sms can be attempted
    
    // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apisend-push-notification
    client.httpClient.post('/api/send-push-notification', client.credentials, null, function(err, out) {
      if (err) {
        return cb(err);
      }
      return cb(null, token);
    });
  });
};

BrowserishClient.prototype.sendSMS = function(userID, cb) {
  this._getCredential(userID, { stateTransport: 'polling' }, function(err, token) {
    if (err) { return cb(err); }
    
    var client = guardian({
      serviceUrl: 'https://hansonhq.guardian.auth0.com',
      requestToken: token
    });
    
    // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apisend-sms
    client.httpClient.post('/api/send-sms', client.credentials, null, function(err, out) {
      if (err) {
        return cb(err);
      }
      
      return cb(null, token);
    });
  });
};

BrowserishClient.prototype.transactionState = function(txid, cb) {
  var client = guardian({
    serviceUrl: 'https://hansonhq.guardian.auth0.com',
    requestToken: txid
  });
  
  client.httpClient.post('/api/transaction-state', client.credentials, null, function(err, txn) {
    if (err) {
      return cb(err);
    }
    return cb(null, txn);
  });
};

BrowserishClient.prototype.verifyOTP = function(userID, otp, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  function proceed(err, token) {
    if (err) { return cb(err); }
  
    var client = guardian({
      serviceUrl: 'https://hansonhq.guardian.auth0.com',
      requestToken: token
    });
  
    // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apiverify-otp
    var data = {
      type: 'manual_input',
      code: otp
    };
  
    client.httpClient.post('/api/verify-otp', client.credentials, data, function(err) {
      if (err) {
        return cb(err);
      }
      return cb();
    });
  }
  
  if (options.accessToken) {
    // This condition is used during enrollment.  In order to complete
    // enrollment, an initial one-time password generated by the authenticator
    // needs to be verified.  The verification request requires the access token
    // issued for the enrollment transaction.
    proceed(null, options.accessToken);
  } else {
    this._getCredential(userID, proceed);
  }
};

BrowserishClient.prototype.recoverAccount = function(userID, code, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  this._getCredential(userID, function(err, token) {
    if (err) { return cb(err); }
  
    var client = guardian({
      serviceUrl: 'https://hansonhq.guardian.auth0.com',
      requestToken: token
    });
  
    // https://github.com/auth0/auth0-mfa-api/wiki/API-Design#post-apirecover-account
    var data = {
      recovery_code: code
    };
  
    client.httpClient.post('/api/recover-account', client.credentials, data, function(err, out) {
      console.log('AUTH0 RECOVER ACCOUNT RESPONSE!');
      console.log(err);
      console.log(out)
      return;
      
      if (err) {
        return cb(err);
      }
      return cb();
    });
  });
};



exports = module.exports = function(getCredential) {
  var client = new BrowserishClient({
    domain: 'hansonhq.auth0.com'
  }, getCredential);
  return client;
};

exports['@implements'] = 'http://schemas.modulate.io/js/opt/auth0/guardian/Client';
exports['@singleton'] = true;
exports['@require'] = [ './browserish/credential' ];
