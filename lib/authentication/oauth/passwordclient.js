var AuthenticationClient = require('auth0').AuthenticationClient;


function PasswordClient(url) {
  console.log('CONSTRUCT AUTH0 PASSWORD CLIENT');
  
  
  var token = process.env['AUTH0_TOKEN'];
  
 
  this._client = new AuthenticationClient({
    domain: 'hansonhq.auth0.com',
    clientId: 'wvaTP5EkEjKxGyLAIzUnsnG6uhyRUTkX',
    clientSecret: process.env['AUTH0_CLIENT_SECRET']
    //token: token
  });
  
  this._realm = 'Username-Password-Authentication';
  
}

PasswordClient.prototype.verify = function(username, password, cb) {
  console.log('VERIFY');
  console.log(username);
  console.log(password);
  
  this._client.passwordGrant({ username: username, password: password, realm: this._realm }, function(err, user) {
    console.log(err);
    console.log(user);
    
    // Returns an access_token and id_token
  });
}

module.exports = PasswordClient;