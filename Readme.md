## sfdc-node
	>Node.js wrapper for the Salesforce REST API leverging express and the OAuth 2.0 packages.  
	>The sample application can be found here: https://github.com/gidzone/nodejs-sfdc-sample

## Quickstart
	>Here is how to configure sfdc-node to authenticate with Salesforce via OAuth in order to make calls using the Salesforce REST API.
	>This quick start assumes the following:
	>	* remote access application has been set up via Setup->Develop->Remote Access
	>	* an express based application has been created
	
	`
	//app.js
	var sfdc = require('./sfdc-node'); //or require('sfdc-node')
	
	//OAuth Configuration
	var clientId = '<enter your client id from Setup->Develop->Remote Access>';
	var clientSecret = '<enter your client secret from Setup->Develop->Remote Access>';
	var redirectUri = 'http://localhost:5000/auth-callback';
	
	//These are set after authorize is called
	var token;
	var instance;

	// Configuration
	app.configure(function(){
	  
		//Default Express based application configuration
		app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(__dirname + '/public'));

		//pass the app and callback path to configureCallback to set up the route for the callback for the 
		//sfdc remote access authentication as well as a method to call when the call back happens
		
		sfdc.configureCallback(app, '/auth-callback',redirectUri, function(results, response){
			//use this call back method to perform any custom code after the authorziation process 
			//for example, grabbing the access_token, instance, refresh token code, or display a landing page

			//set the token, instnace, and code that is returned after the authorization calls to sfdc
			token = results.access_token
			instance = results.instance_url;
			code = results.code;
			
			//Redirect the user to the default landing page
			response.redirect('/query');
		});
	});
	
	//Call the authorize method to process the inital callback with the code.  The OAuth library does not process 302s.  
	//Salesforce reeturns a 302 to push the user to login page
	app.post('/', function(req, res){
		//Click a button to intialize authentication
		sfdc.authorize(clientId, clientSecret, 'https://login.salesforce.com', redirectUri, 'popup', function(result, statusCode, location){
			//if a 302 response is returned redirect
			//HACK: Need to call back to authorize to process the 302.  OAuth library does not do this automatically
			if(statusCode == 302){
				res.redirect(location, 302);
			} else {
				res.end(result);
			}
		});
	});
	
	//
	app.get('/create/:sobject', function(req, res) {
	  res.render('create', {
	    title: 'Create ' + req.params.sobject
	  });
	});

	//Call sfdc create passing the request body (JSON), type of sobject, token, instance and callback fucntion to process the result
	//NOTE: in order to pass req.body directly to the create method ensure the element names in the form match the field name on the SObject.  
	//For example, <input name='Custom_Field__c' type='text'/>  will map to {Custom_Field__c:Value} in request.body.
	app.post('/create/:sobject', function(req, res) {
	  sfdc.create(req.body, req.params.sobject, token, instance, function(results){
			if(results.id){
				res.end("<html><h2><a href='"+ instance +"/"+results.id +"' target='_blank'>" + req.params.sobject + " created</h2><br></html>");
			} else {
				var message = "<ul>";
				for(i=0; i<results.length; i++){				
					//console.log(i);
					message = message + "<li>" + results[i].message + "</li>";
				}
				message = message + "</ul>";
				console.log(message);
				res.end("<html><h2>Error:</h2>"+ message + "</html>");
			}
		});
		`
## License 

	(The MIT License)

	Copyright (c) 2011 Sanjay Gidwani &lt;sanjay.gidwani@gmail.com&gt;

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	'Software'), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	