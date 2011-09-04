var https = require('https');
var url = require('url');

var OAuth= require("oauth").OAuth2;

var _oAuth;
var SFDC_API_VERSION = '22';


//this route processes the callback from salesforce after the auth code request is succesful;
//This path is what is placed in the Redirect URL box of the Remote Access settings
exports.configureCallback = function(app, sfdcCallbackPath, redirectUri, callback) {
  app.get(sfdcCallbackPath, function(req, res){
		
		var code;
		var token;
		//check for the code that is returned from salesforce
		if(req.param('code') != null){
			code = req.param('code');

			//exchange the code for a token
		 	getOAuthToken(code, redirectUri, function(results){
				console.log(results)
				//call the method	
				callback(results, res)
			});
			
		} else {
			res.end("<html><h1>Code was not returned</h1></html>")
		}
	});
	
	console.log('SFDC REST OAuth Callback Configured');
}

function getOAuthToken(code, redirectUri, callback){
	console.log(redirectUri);
	_oAuth.getOAuthAccessToken(code, { grant_type: 'authorization_code', redirect_uri:redirectUri, format: 'json'}, 
		function( error, access_token, refresh_token, results ){
			if(error){
				console.log('in error');
				console.log(error);
				return error;
			} else {
					
					console.log(access_token);
					console.log(results.instance_url);
					results['code'] = code;
					console.log(results);
					callback(results);
				}
			});
}

exports.authorize = function(clientId, clientSecret, baseUrl, redirect_uri, display, callback) {
		_oAuth = new OAuth(clientId,  clientSecret,  baseUrl, "/services/oauth2/authorize", "/services/oauth2/token")
		
		var options = { 
			response_type: 'code', 
			client_id: clientId,
			redirect_uri: redirect_uri,
			display: display };
			
		//get the auth url
		var authUrl = _oAuth.getAuthorizeUrl(options);
		
		//get the token 
		_oAuth._request('GET', authUrl, '', '', '', function(data, result, response) {
			
			if(data!= null){
				console.log(data);
				return data.data;
			} 
			
			//HACK: Need to call back to authorize to process the 302.  OAuth library  does not do this automatically
			callback(result, response.statusCode, response.headers.location);
		});
};


//SFDC Rest API Calls
exports.create = function (object, type, token, instance, callback){
	data = '';
	
	//parse the url
	var url = (require('url').parse(instance));
	
	//stringify json
	strObject = JSON.stringify(object);
	
	var options = {
		host: url['host'],
		port: 443,
		path: '/services/data/v' + SFDC_API_VERSION + '.0/sobjects/'+type,
		method: 'POST',
		headers: {
			'Host': url['host'],
			'Content-Length': strObject.length,
			'Authorization': 'OAuth '+ token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}	
	}
	
	var req = https.request(options, function(res) {
	  res.setEncoding('utf8');  
		res.on('data', function (chunk) {
			data+=chunk;
	  });
		
		res.on('end', function(d) {
			if(callback){
				callback(JSON.parse(data));
			}
		});
	}).on('error', function(e) {
		console.log('Error: '+ e);
		//  errorCallback(e);
	});
	
	//console.log(req);

	req.write(strObject);
	req.end();
};

exports.update = function (id, object, type, token, instance, callback){
	data = '';
	
	//parse the url
	var url = (require('url').parse(instance));
	//stringify json
	strObject = JSON.stringify(object);
	
	var options = {
		host: url['host'],
		port: 443,
		path: '/services/data/v' + SFDC_API_VERSION + '.0/sobjects/'+type+'/'+id,
		method: 'PATCH',
		headers: {
			'Host': url['host'],
			'Content-Length': strObject.length,
			'Authorization': 'OAuth '+ token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}	
	}
	
	var req = https.request(options, function(res) {
	  res.setEncoding('utf8');
	  
		res.on('data', function (chunk) {
	    console.log('BODY: ' + chunk);
			data+=chunk;
	  });
		
		res.on('end', function(d) {
			if(callback){
				callback(JSON.parse(data));
			}
		});
	}).on('error', function(e) {
		console.log('Error: '+ e);
		//  errorCallback(e);
	});
	
	//console.log(req);

	req.write(strObject);
	req.end();
};

exports.upsert = function (extId, object, type, token, instance, callback){
	data = '';
	
	//parse the url
	var url = (require('url').parse(instance));
	//stringify json
	strObject = JSON.stringify(object);
	
	var options = {
		host: url['host'],
		port: 443,
		path: '/services/data/v' + SFDC_API_VERSION + '.0/sobjects/'+type+'/'+extId,
		method: 'PATCH',
		headers: {
			'Host': url['host'],
			'Content-Length': strObject.length,
			'Authorization': 'OAuth '+ token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}	
	}
	
	var req = https.request(options, function(res) {
	  res.setEncoding('utf8');
	  
		res.on('data', function (chunk) {
			data+=chunk;
	  });
		
		res.on('end', function(d) {
			if(callback){
				callback(JSON.parse(data));
			}
		});
	}).on('error', function(e) {
		console.log('Error: '+ e);
		//  errorCallback(e);
	});
	
	//console.log(req);

	req.write(strObject);
	req.end();
};

exports.delete = function (id, object, type, token, instance, callback){
	data = '';
	
	//parse the url
	var url = (require('url').parse(instance));
	//stringify json
	strObject = JSON.stringify(object);
	
	var options = {
		host: url['host'],
		port: 443,
		path: '/services/data/v' + SFDC_API_VERSION + '.0/sobjects/'+type+'/'+id,
		method: 'DELETE',
		headers: {
			'Host': url['host'],
			'Content-Length': strObject.length,
			'Authorization': 'OAuth '+ token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}	
	}
	
	var req = https.request(options, function(res) {
	  res.setEncoding('utf8');
	  
		res.on('data', function (chunk) {
			data+=chunk;
	  });
		
		res.on('end', function(d) {
			if(callback){
				console.log(data);
				callback(JSON.parse(data));
			}
		});
	}).on('error', function(e) {
		console.log('Error: '+ e);
		//  errorCallback(e);
	});
	
	//console.log(req);

	req.write(strObject);
	req.end();	
};

exports.query = function (query, token, instance, callback){
	var data ='';
	//parse the url
	var url = (require('url').parse(instance));
	var options = {
		host: url['host'],
		port: 443,
		path: '/services/data/v' + SFDC_API_VERSION + '.0/query?q='+escape(query),
		method: 'GET',
		headers: {
			'Host': url['host'],
			'Authorization': 'OAuth '+ token,
			'Accept':'application/jsonrequest',
			'Cache-Control':'no-cache,no-store,must-revalidate',
			'Content-type':'application/json; charset=UTF-8'
		}	
	}
	
	var req = https.request(options, function(res) {
	  res.setEncoding('utf8');
	  
		res.on('data', function (chunk) {
	    console.log('BODY: ' + chunk);
			data+=chunk;
	  });
		
		res.on('end', function(d) {
			if(callback){
				callback(JSON.parse(data));
			}
		});
	}).on('error', function(e) {
		console.log('Error: '+ e);
		//  errorCallback(e);
	});
	
	//console.log(req);

	//req.write(strObject);
	req.end();
};