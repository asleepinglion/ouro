#SuperJS 
**Super Extendable JSON API Framework for Node.JS**

*Disclaimer: This framework is under development and breaking changes are likely to occur.*

###Overview

Super.JS is an API framework for Node.JS which provides a clean way to structure and extend an application using a [Simple Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) model that fully supports method overriding and calling parent methods via _super. 

- **Simple Inheritance** Everything inherits from a simple base class which itself inherits from Node's native EventEmitter class.

- **Clean Folder Structure** Either store controllers and models grouped by resource (e.g. modules/address/controller.js, modules/address/model.js) or grouped by type (e.g. controllers/address.js, models/address.js).

- **Automatic Routing** Requests route to controller methods automatically. A simple underscore prefix allows some methods to remain internal and unexposed. 

- **Authentication** Incorporates Custom Authentication Hooks allowing you to implement whatever authentication method works for you. The default provided example demonstrates a token based approach. 

- **Public Methods** A simple array on the controller lets you configure specific methods to bypass authentication and remain open to the public.

- **Adapter-based ORM** Incorporates Sail.JS' Waterline ORM. Multiple connections can be configured for a variety of databases (MySQL, Mongo, etc).

- **CRUD Methods** An extended controller class provides CRUD methods out of the box, including an additional describe method which either describes available controllers (if directed towards the API root url) or model attributes (if directed towards a controller).

- **REST & RPC** Rest methods (GET, POST, PUT, DELETE) are automatically wired, but their underlying methods (search, create, update, delete) are also available over GET and POST. Additional RPC methods can be created by simply creating a function on the controller.

- **Event Driven** Events are emitted on the application and controllers on server start and before and after executing actions (controller methods). This allows easy secondary asynchronous operations. For example, you could send a notification via pusher when a record of certain criteria is added to the database without delaying the response to the user/process who initiated the request.

- **Easy Overrides** Full support for super methods provides the ability to override methods of a parent class and call the parent method from inside the extended method ( *this.super()* ).

- **Before/After Action Hooks** Easily modify the response object before or after the action requested is executed by overriding the controllers _beforeAction and _afterAction methods. 

- **JSON Response** Automatic management of JSON response object. Simply modify the resposne object during the chain of execution and it is automatically passed back to the user at the end of the request.

**TODO**

- Permissions - Role Based Access Controls and permissions check before handling requests.
- Build Process - Using GRUNT or another build system, such as Gulp or Broccoli.
- CLI/Scaffolding - CLI tool to generate applications, controllers, and models as well as configure the application.
- Unit Tests - Yeah I know...
- Inline Documentation - Detailed inline markdown-based documentation and documentation generation build process.
- Cluster Support - Automatic master & workers to take advantage of multiple processors and provide gracefull crashes using Node's Domain and Child Process mechanisms.
- Rate & Blacklist Middleware - Incorporate middleware for rate limiting and blacklisting IPs.
- Promises - Refactor request execution using promises instead of callbacks. (The ORM already uses promises.)


**Installation**

```
npm install superjs

```

**Folder Structure**

```
#module-based structure
app
- app.js
- config
- - data.js
- - security.js
- modules
- - user
- - - controller.js
- - - model.js

#type-based structure
app
- app.js
- config
- - data.js
- - security.js
- controllers
- - user.js
- models
- - user.js

```


**SuperJS Class**

```
var SuperJS = require('superjs');

var MyClass = SuperJS.Class.extend({

	//constructor 
	_init: function() {
	
		//all classes support the events
		this.on('someEvent', this._myInternalMethod);
	},

	_myInternalMethod: function() {	
		console.log("I'm an internal method...");
	},

	myExposedMethod: function() {
		this.emit('someEvent');
	}

});
```

**SuperJS Application** 

```
/*
 * API Application *
 */

//require dependencies
var SuperJS = require('superjs');

//instantiate the application
var App = new SuperJS.Application();

//bind to server started event
App.on('serverStarted', function() {

  //welcome message
  console.log('\nThe Server has Started!!!\n');

});

//start the server
App.startServer();

```
**SuperJS Model**

```
var SuperJS = require('superjs');

//Waterline under the hood; i.e., SuperJS.ORM = require('waterline');
module.exports = SuperJS.ORM.Collection.extend({

  identity: 'address',
  connection: 'myConnection',
  attributes: {
    id: { type: 'int' },
    type: { type: 'string', in: ['house','apartment','hotel','business','townhome','other'], defaultsTo: 'house' },
    address: { type: 'string', required: true, maxLength: 255 },
    address2: { type: 'string', maxLength: 100 },
    city: { type: 'string', required: true, maxLength: 50 },
    zip: { type: 'string', required: true, maxLength: 5, minLength: 5 },
    state: { type: 'string', required: true, maxLength: 2, uppercase: true },
    updatedAt: { type: 'datetime' },
    createdAt: { type: 'datetime' }
  }

});

```

**SuperJS Controller**

```
var SuperJS = require('superjs');

module.exports = SuperJS.Controller.extend({

  name: 'myController',
	
  _init: function(app) {

    //call bass class constructor
    this._super(app);

    //bind events to trigger secondary procedures
    this.on('beforeAction', function(req) {
      //e.g. send event to request log
      console.log('beforeAction event triggered:', req.action);
    });

    this.on('afterAction', function(req, response) {
      //e.g. send event to request log
      console.log('afterAction event triggered:', req.action);
    });

  },
	
  //methods without a leading underscore are exposed and
  //accessible via 127.0.0.1:8888/myController/myMethod
  myMethod: function(req, callback) {
  	callback({"message": "I'm a message!"});
  }

});

```

**SuperJS CrudController**

```

var SuperJS = require('superjs');

var AddressControler = module.exports = SuperJS.CrudController.extend({

  name: 'address',
  public: ['search'],

  _init: function(app) {

    //call bass class constructor
    this._super(app);

    //bind events to trigger secondary procedures
    this.on('beforeAction', function(req) {
      //e.g. send event to request log
      console.log('beforeAction event triggered:', req.action);
    });

    this.on('afterAction', function(req, response) {
      //e.g. send event to request log
      console.log('afterAction event triggered:', req.action);
    });

  },

  testMethod: function(req, callback) {
    callback({'test':true});
  },

  //example: override beforeAction method (attach user info)
  //requires authentication strategy and user model
  _beforeAction: function(req, callback) {

    if( req.user ) {
      var basicUserInfo = {id: req.user.id, fullName: req.user.firstName + ' ' + req.user.lastName};
      var response = {user: basicUserInfo};
      callback(response);
    } else {
      callback({});
    }
  }


});
```

**Data (config/data.js)**

```
/*
 * Database Configuration
 *
 * You can use the database configuration to setup connections to
 * multiple data sources. The data layer is provided by the Waterline
 * ORM (part of the Sails.JS architecture).
 */

module.exports = {

  //set default options for all connections
  defaults: {
    migrate: "safe"
  },

  adapters: {
    mysql: require('sails-mysql')
  },

  //describe connections (adapters must be installed)
  connections: {

    myConnection: {
      adapter: "mysql",
      database: "database",
      user: "username",
      password: "password",
      host: "127.0.0.1",
      port: 3306,
      pool: true
    }
  }

};

```

**Security (config/security.js)**

```
/*
 * Security Configuration *
 *
 * Use the security configuration to manage the security of your application: *
 *
 */

module.exports = {

  //enable or disable api security
  enabled: true,

  //name of the controller which has auth methods
  //controllerName: 'user',

  //security secret used for creating tokens
  secret: 'your-dirty-little-secret',

  //token expiration length in seconds
  tokenExpiration: 1800

};

```
