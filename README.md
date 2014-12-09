#SuperJS - A Super Extendable Framework for Rapid Development of APIs.

> **Disclaimer:** SuperJS is under heavy development at the moment, and breaking changes are likely. The intent is to publish a stable release during the first quarter of 2015.

`SuperJS` is a database-independent, event-driven request engine that uses polymorphic classes to enable the rapid development of application programming interfaces. By abstracting from common base classes with methods that can be modified or overridden, the entire system becomes configurable. Layers can be combined together to develop more productively with less duplication of code and greater organization.

`SuperJS` was built with client side Javascript in mind and although I'm sure it can be used to do more, the primary purpose is to provide a central JSON backend for rich client side applications. It's designed to scale and enable production-ready applications.


####Installation
It's easy to get started with SuperJS using a global npm package and the provided SuperJS CLI tool.

- Run `npm install -g superjs`
- Navigate to the folder where you want to create a project.
- Run `superjs new <projectName>`
- Run `npm intall` inside the new project folder.
- Update the `config/data.js` settings to point to a real database
- Create a resource for your API by executing `superjs gen resource <resourceName>`
- Run `node start.js`

####Testing The API:

By default security is disabled and all REST routes are publicly available. Content-type `application/json` is required
on POST, PUT, and DELETE requests. All REST routes have RPC routes that match, for example a GET on a table is also 
available at `http://127.0.0.1:8888/yourtable/search` and a POST is also available at 
`http://127.0.0.1:8888/yourtable/create`. 

- GET http://127.0.0.1:8888 to check if the server is up.
- GET http://127.0.0.1:8888/describe to describe available controllers and methods.
- GET http://127.0.0.1:8888/yourtable to get the contents of `yourtable`
- POST http://127.0.0.1:8888/yourtable to create a new `yourtable` record.
- PUT http://127.0.0.1:8888/yourtable to update a yourtable` record

###Overview

Super.JS is an API framework for Node.JS which provides a clean way to structure and extend an application using a 
[Simple Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) model that fully supports method overriding 
and calling parent methods via _super. 

- **Simple Inheritance** Everything inherits from a simple base class which itself inherits from Node's native 
EventEmitter class.

- **Clean Folder Structure** Either store controllers and models grouped by resource (e.g. 
modules/address/controller.js, modules/address/model.js) or grouped by type (e.g. controllers/address.js, 
models/address.js).

- **Automatic Routing** Requests route to controller methods automatically. A simple underscore prefix allows some 
methods to remain internal and unexposed. 

- **Authentication** Incorporates Custom Authentication Hooks allowing you to implement whatever authentication method 
works for you. The default provided example in the Starter kit demonstrates a token based approach.

- **Public Methods** An array on the controller lets you configure specific methods to bypass authentication and
remain open to the public.

- **Database Independent** SuperJS allows you to integrate with any database backend by providing a lightweight
interface for hooking into the request engine. Currently two ORMs have been implemented:
[thinky ORM](https://github.com/asleepinglion/superjs-think) for thinky, a rethinkDB ORM, and Sail.JS' 
[Waterline ORM](https://github.com/asleepinglion/superjs-waterline) which allows for multiple connections can be 
configured for a variety of databases (MySQL, Mongo, etc).

- **CRUD Methods** Extended controller classes for each database engine provide CRUD methods out of the box, including
an additional describe method which describes available controllers and methods.

- **REST & RPC** Rest methods (GET, POST, PUT, DELETE) are automatically wired, but their underlying methods (search, 
create, update, delete) are also available over GET and POST. Additional RPC methods can be created by simply creating 
a function on the controller.

- **Event Driven** Events are emitted on the application and controllers on server start and before and after executing 
actions (controller methods). This allows easy secondary asynchronous operations. For example, you could send a 
notification via pusher when a record of certain criteria is added to the database without delaying the response to the 
user/process who initiated the request.

- **Easy Overrides** Full support for super methods provides the ability to override methods of a parent class and call 
the parent method from inside the extended method ( *this.super()* ).

- **Before/After Action Hooks** Easily modify the response object before or after the action requested is executed by 
overriding the controller's or application's _beforeAction and _afterAction methods.

- **JSON Response** Automatic management of JSON response object. Simply modify the response object during the chain of
execution and it is automatically passed back to the user at the end of the request.

**TODO**

- Permissions - Role Based Access Controls and permissions check before handling requests.
- Build Process - Using GRUNT or another build system, such as Gulp or Broccoli.
- CLI/Scaffolding - CLI tool to generate applications, controllers, and models as well as configure the application.
- Unit Tests - Yeah I know...
- Inline Documentation - Detailed inline markdown-based documentation and documentation generation in build process.
- Cluster Support - Automatic master & workers to take advantage of multiple processors and provid graceful crashes using Node's Domain and Child Process mechanisms.
- Rate & Blacklist Middleware - Incorporate middleware for rate limiting and blacklisting IPs.
- Promises - Refactor request execution using promises instead of callbacks. (The implemented ORMs already use promises.)

## Database Independent

`SuperJS` enables full database independency by abstracting the specifics of querying the database backend into `Engines`, node packages that house extended `Model` and `Controller` classes. This allows you to work with any low-level library or high-level ORM you choose and use multiple database engines within the same application.

Currently two Engines for high-level ORMs have been developed, one which works with the `waterline` ORM from the Sails.JS project (that itself supports many backends), and `thinky` a RethinkDB ORM. It wraps both of these ORMs in a consistent way to avoid as many differences as possible. However each engine has its own syntax and for which full encapsulation is not pratical.

## Inheritance

The base `Class` provides an `extend` method to allow one class to pass its behavior on to another and even call parent methods from within child classes via super methods. Since every class extends from a common base, all classes have the `extend` method, and therefore you can modify or override any part of a `SuperJS` application.

The syntax for extension is essentially identical to that of Ember.JS. This was done on purpose; partly because its just a clean way of doing it, but also partly because of the preference of using Ember on the client side and further reducing the affects of context-switching. You simply pass in an object containing your methods and variables as the first variable of the extend method.

**Defining and Extending Classes**

```javascript
var Class = require('superjs-base');

var Person = Class.extend({
  init: function() {
	console.log('I am a person');
  },

  jump: function() {
	this.emit('jumping');
  }
});

var Female = Person.extend({
  init: function() {
	this._super();
	console.log('I am a female.');
  }
});

var Ninja = Female.extend({
  init: function() {
	this._super();
	console.log('I am a ninja.');

	this.on('jumping', function() {
	  console.log("I'm jumping like a sexy ninja.");
	});
  }
});

```

A `Person` class is created from the `SuperJS` base `Class` by passing in an object to the `extend` method containing defintions for the `init` method and `jump` methods. `init` is the constructor for the class, and is called automatically when the class is instantiated.

Two other classes are created, `Female` and `Ninja`, each calling the `extend` method of the former, each passing in an object with its own constructor, each calling its parent constructor via `this._super`.

When the final class `Ninja` is then instantiated, each of the constructors are executed:

**Instantiating the Ninja class**
```javascript
var ninja = new Ninja();

"I am a person"
"I am a female."
"I am a ninja."
```

Since the `_super` methods were called first in the constructor before any other instructions, the eldest parent executes first. This is a pretty useful pattern for layering on functionality and can be seen throughout SuperJS.

**Emitting and Responding to Events**

There is one other thing to note about the above example. The eldest class, `Parent` contains a method called `jump` which emits a `jumping` event. Calling the `jump` method on a `Person` or `Female` class will in fact emit an event, and one could subscribe to it, but the `Ninja` class is the only one that does so in its constructor.

```javascript
ninja.jump();

"I'm jumping like a sexy ninja"
```

This functionality is possible because the base `Class` in SuperJS is itself extended from Node's [EventEmitter class](http://nodejs.org/api/events.html).

##Installing SuperJS

Using the node package manager, installing SuperJS is simple. You can either add a reference to `superjs` in your project's package.json or use the command line.

```bash
npm install superjs --save
```

When starting a new project, its helpful to use the SuperJS Starter Kit:

```bash
npm install superjs-starter
```

In the future, the plan is to create a CLI command line application to assist in the configuration, scaffolding, and generation of controllers and models.

## Configuration

There are several configuration files which allow you to modify the behavior of the API as well as specify essential information, such as the port the server is to run on, the database connections to make, and the security settings for the application. Configuration files are located in the `config` folder and simply export javascript objects via `module.exports`:

```javascript```
module.exports = {

  //settings go here

};
```

#### Data Configuration (config/data.js)

The data configuration provides a simple way for you specify database connection information including the engine to use. The internals of the structure depend slightly on the engine used.

**Installing a Database Engine**

Since the data layer is independent of the overall SuperJS architecture, it is necessary to either create or install a database engine. This is pretty easy, just use NPM to install:

```bash
#to install the Thinky ORM
npm install superjs-thinky


#to install the Waterline ORM
npm install superjs-waterline
```

**Selecting the Engine**

The very first part of the data configuration file should be the declaration of which backend engine to use.

>**Note:** At the moment only one engine can be used by SuperJS at a time. In the future, the engine will be specified inside the connection instead of outside of it to allow for multiple engines to be used.

```javascript
engine: 'engine-type',
```

**Setting up the Waterline Engine**

When setting up the data configuration for Waterline, we simply set the engine variable to `waterline` and the rest of the configuration maps directly into Waterline. For more information on the settings and options specific to Waterline, please check out the [Waterline documentation](https://github.com/balderdashy/waterline-docs).

```javascript
module.exports = {

  //set the engine to use
  engine: 'waterline',

  //set default options for all connections
  defaults: {
    migrate: "safe"
  },

  adapters: {
    mysql: require('sails-mysql')
  },

  //describe connections (adapters must be installed)
  connections: {

    default: {
      adapter: "mysql",
      database: "test",
      user: "user",
      password: "password",
      host: "127.0.0.1",
      port: 3306,
      pool: true
    }

  }

};
```

**Setting up the Thinky Engine**

When setting up the data configuration for thinky, we simply set the engine to `thinky` and the rest of the configuration maps directly into Thinky. For more information on the settings and options specific to Thinky, please check out the [Thinky documentation](http://thinky.io/).

```javascript
module.exports = {

  //set the engine to use
  engine: 'thinky',

  connections: {

    gfkdev: {
      db: 'test',
      host: '127.0.0.1',
      port: 28015
    }
  }

};
```

#### Security Configuration (config/security.js)

The security configuration lets you specify the authentication schema for your API. SuperJS is unopinionated with regard to the specifics of your security protocols and leaves the implementation up to the API's author(s).

```javascript
module.exports = {

  //enable or disable api security
  enabled: false,

  //name of the controller which has auth methods
  controllerName: 'user',

  //security secret used for creating tokens
  secret: 'bGVib3dza2l3YW50c2hpc3J1Z2JhY2s=',

  //token expiration length in seconds
  tokenExpiration: 1800

};
```

If the `enabled` option is set to true, before any request action is executed, as long as the action is not a public method, SuperJS will try to execute an `authorize` method on the controller specified by the `controllerName` setting. If no `controllerName` is specified, it defaults to the `user` controller.

The `authorize` method receives two parameters, the express `request` object, and a special `callback` that expects two arguments: an `error` object and a `user`.
You can write any security checks you desire in the contents of the `_authorize` method.

If you are successful at authorizing the user, you should execute the callback with a null error object as the first parameter and the user object as the second parameter. The user object will be attached to the `request` object that is passed to the requested method.

If your security checks fail, you should execute the callback with a simple JSON object describing the error. The error object is returned as part of the failed authorization.

**JWT token-based Authentication**

In the example below, our `user` controller contains two methods, a publicly accessible `authenticate` method which can be used to acquire an authentication token, and the `authorize` method that checks the validity of the token before each request:

```javascript
//require dependencies
var SuperJS = require('superjs-waterline'),
    jwt = require('jwt-simple');

module.exports = SuperJS.Controller.extend({

  name: 'user',

  //make the authenticate method publicly accessible
  public: ['authenticate'],

  //authenticate method to obtain access token
  authenticate: function(req, next) {

    //maintain reference to self
    var self = this;

    //obtain reference to parameters
    var username = req.param('username');
    var password = req.param('password');

    //make sure credentials are present
    if( !username || !password )
      return next({success: false, message: 'You must provide credentials to authenticate.'});

    //attempt to authenticate the user credentials
    this.model.findOne()
      .where({
        or: [{email: username }, {phone: username } ],
        passwordHash: password
      })
      .then(function(user) {

        //if a user was found, create token, and update the db
        if(user) {

          //get current time in seconds
          var currentTime = Math.round((Date.now() / 1000));

          //setup token payload
          var payload = {userId: user.id, expires: currentTime + self.app.config.security.tokenExpiration };

          //generate token
          var token = jwt.encode(payload, self.app.config.security.secret);

          //update user with new accessToken
          self.model.update({id: user.id}, {accessToken: token})
            .then(function(user) {
              return next({success: true, message: "Token successfully created.", user: user, token: token});
            })
            .fail(function(err) {
              return next({success: false, message: "Failed to update token after authentication.", error: err});
            });

        } else {
          return next({success: false, message: "The credentials you provided were not valid."});
        }

      })
      .fail(function(err) {
        return next({success: false, message: "An error occurred trying to authenticate.", error: err});
      });
  },

  authorize: function(req, next) {

    //maintain reference to self
    var self = this;

    //make sure the authorization header exists
    if( !req.headers['authorization'] )
      return next({code: "no_auth_header", details: "The authorization header was not present."});

    //obtain reference to access token
    var accessToken = req.headers['authorization'];
    accessToken = accessToken.split(' ')[1];

    //make sure token is present
    if( !accessToken )
      return next({code: "no_token", details: "An access token was not provided."});

    //attempt to decode the token
    try {
      var decodedToken = jwt.decode(accessToken, this.app.config.security.secret);
    } catch (err) {
      return next({code: "invalid_token", details: "The access token provided was invalid."});
    }

    //get current time in milliseconds
    var currentTime = Math.round((Date.now() / 1000));

    //check that the token has not expired
    if( decodedToken.expires <= currentTime )
      return next({code: "expired_token", details: "The access token provided has expired."});

    //attempt to authenticate token
    this.model.findOne()
      .where({
        accessToken: accessToken
      })
      .then(function(user) {

        //if a user was found, assign to request & return
        if(user)
         return next(null, user);
        else
          return next({code: "invalid_token", details: "Access token was invalid."});

      })
      .fail(function(err) {
        return next(err);
      });
  }

});
```


#### Server Configuration (config/server.js)

The server configuration contains general variables to allow you to modify the behavior of the API, such as logging and host information.

```javascript
module.exports = {

  //server port to use
  port: 8888,

  //types to log
  log: ['errors', 'warnings', 'notices'],

  //log engine
  logEngine: 'console'

};
```

## Application

The `Application` class sets up the request engine by reading the configuration files and automatically loading any available models and controllers. Besides providing a few simple routes, such as the default route which simply states the API's status, it redirects all requests to an appropriate controller method based on the request type and path. And depending on the security configuration, the application will check the authorization before executing the route.

The `Application` class also manages the response object, instantiating a new JSON object upon the initial request and populating that object with information throughout. Before and after every request, `hooks` are triggered which allow you to add or manipulate the response object gefore it's returned to the user. By default all responses include the `name` of the api, the `version` of the api, a `success` status, and the `duration` of the request processing time in milliseconds.

####Creating an Application

To create a `SuperJS` application, you simply instantiate the class:

```javascript
var SuperJS = require('superjs');

var App = new SuperJS.Application();
```
As with any class you can extend the `Application` class if you want to override or add additional methods, however, typical use cases should not require such extension.

####Binding to Events
Additionally you can bind to events that the `Application` class emits. For example, the `started` event:

```javascript
App.on('started', function() {
  console.log('Application Started...');
});
```

####Starting the Server

To start the server and begin listenting for HTTP request we need to execute the `start` method.

```javascript
App.start();
```

The server will start and begin listening for requests at http://localhost:8888/, or the custom port you specified in the server configuration.

## Models

Models abstract the specifics of the database backend as well as define schema and validations. Most of these things however, are dependent on the `engine` being used.

Models can be either located in the `models` folder with a filename that represents the resource or grouped together with a controller in a subfolder whose name represents the resource in the `modules` folder. For example, to create a new user model we could create a file named `user.js` in the `models` folder like `models/user.js` or a `model.js` file in the `modules/user` folder like `modules/user/model.js`. The latter approach is the suggested one, as it helps with the organization of larger projects.

####Thinky RethinkDB ORM

Create a new folder in the modules folder for our `user` model (`modules/user/model.js`):

```javascript
var SuperJS = require('superjs-thinky');

module.exports = SuperJS.Model.extend({

  //a name for our model is required
  name: 'user',

  //we must specify which connection this model will use
  connection: 'default',

  //the attributes are passed
  attributes: {

    name: { type: 'string' },
    role: { type: 'string' },
    email: { type: 'string' }

  }

});
```

For more information on available types and setting up validations, check out the [Thinky documentation](http://thinky.io/documentation/).

####Waterline ORM

Or to use the Waterline ORM, setup the model like so:

```javascript
var SuperJS = require('superjs-waterline');

//export User model
module.exports = SuperJS.Model.extend({

  identity: 'territory',
  connection: 'thedude_staging',
  attributes: {

    name: { type: 'string', required: true, maxLength: 100 },
    role: { type: 'string', required: true, maxLength: 100 },
    email: { type: 'string', required: true, maxLength: 100 }
  }
});
```

For more information on the available types and setting up validations for waterline, check out the [Waterline documenation](https://github.com/balderdashy/waterline-docs).

## Controllers

Controllers are the heart of a SuperJS application. You can create a custom controller by extending from the base Controller class inside the SuperJS core or you can extend from one of the Controller classes provided by the database engine of your choosing. The Controller classes that are packaged with the database engines extend the core Controller class with basic CRUD methods: `search`, `create`, `update`, and `delete`.

As with Models, Controllers can be either located in a `controllers` folder with a filename that represents the resource or grouped together with a model in a subfolder whose name represents the resource in the `modules` folder. For example, to create a new user controller we could create a file called `controllers/user.js` or a file such as `modules/user/controller.js`.

> **Important:** In order to expose a method, you need to designate it as an external method, by either prefixing the method name with an underscore or making the first letter of the name upper-cased.

**Extending the Core Controller Class**

Create a new folder in the modules folder for our `user` controller (`controllers/user/controller.js`):

```javascript
var SuperJS = require('superjs');

//export the extended class directly
module.exports = SuperJS.Controller.extend({

  //it's necessary to name the controller
  name: 'user',

  Test: function(req, done) {

    //the first paramter, the req variable, is passed in from express and contains all
    //info regarding the req, including the body and query parameters.

    //when you are done, you must use the callback function to prevent blocking
    //the event loop, the callback expects an object for which the application
    //merges into the response object.
    done({success: true, message: 'this is a test message.'});
  },

  internalMethod: function() {
    //this method is not exposed by the API
  }

});
```

If you launch the SuperJS application, by passing the app.js to node, the server will start and the above test method will be available at: http://localhost:8888/user/test. The `internalMethod` will not be available because it is not designated as an external method with an undescore prefix or upper-cased first letter.

**Extending a Database Engine Controller Class**

Assuming you have a running RethinkDB server and have configured the data configuration with its connection, and have created a `user` model, lets create a controller that extends from the database engines controller:

```javascript
var SuperJS = require('superjs-thinky');

//export the extended class directly
module.exports = SuperJS.Controller.extend({

  //it's necessary to name the controller
  name: 'user'

});

```

As you can see there is not much to it, we can add methods to this controller as needed just like before. The big difference is that since this controller extends from the the `superjs-thinky` Controller, it has several default methods. Again assuming the model and data configuration are correctly setup, if you launch the server you will be able to `search`, `create`, `update`, and `delete` users.

The convenient CRUD methods are available either as RPC calls or as REST calls. For example you can search records by making a GET request to http://localhost:8888/user/search or you can make a GET request to http://localhost:8888/user. You can add a record by making a POST request to http://localhost:8888/user by passing in a JSON object into to the body of the request or by making a POST request to http://localhost:8888/user/create.

To understand how these underlying methods work, take a look at the source inside the engine: `node_modules/superjs-thinky/Controller.js`.

**Public Methods**

If you have an active security configuration, you may still want some methods to be available without requiring the user to have to be authorized.

An obvious example of this is the `authenticate` method that you would likely want to make available on the User controller to allow a user to become authorized.

Specifying public methods is easy; simply add the name of the method to an array by the name of `public` on the controller:

```javascript
var SuperJS = require('superjs-waterline');

module.exports = SuperJS.Controller.extend({

  name: 'user',

  //make the authenticate method publicly accessible
  public: ['Authenticate']

});
```

## Before & After Hooks

The Application class and all Controllers have a couple hooks that can be used to manipulate the request and response objects before or after the routed method. Basically these are methods that are called before and after the routed method if and only if they exist. The `beforeAction` hook will have two paramters, the request object and a callback that must be called to continue the route. The `afterAction` hook will have three paramters, the request object, the response object, and a callback.

**Modifying the response object to adhere to Ember Data expectations**

For example, you might manipulate the response object for every controller by adding a `afterAction` method to our application. To to this, would extend the Application class like so:

```javascript
//require dependencies
var SuperJS = require('superjs');

//extend application
var API = SuperJS.Application.extend({

  //override afterAction to make the response object ember-data-friendly
  afterAction: function(req, res) {

    //init ember response object
    var emberResponse = {};

    //init meta data
    emberResponse.meta = {};

    //store results under controller name
    emberResponse[req.controller] = res.response.results;

    //delete results off main object
    delete res.response.results;

    //store all other data in meta
    for( var key in res.response ) {
      emberResponse.meta[key] = res.response[key];
    }

    //overwrite response object
    res.response = emberResponse;
  }

});

//instantiate the application
var api = new API();

//start the server
api.start();
```

**Manipulating the response from the Controller Based on Whether the User Exists**

```javascript

var SuperJS = require('superjs-waterline');

module.exports = SuperJS.Controller.extend({

  beforeAction: function(req, callback) {

    if( req.user ) {
      var basicUserInfo = {id: req.user.id, fullName: req.user.firstName + ' ' + req.user.lastName};
      var response = {user: basicUserInfo};
      callback(response);
    } else {
      callback({});
    }
  }
}
```

## Before & After Events

Before and after events can be used to trigger things outside of the response to the user. This allows you to respond to the user while still triggering secondary processes. **Lengthy operations should still occur using a child process or worker, you must not block the IO.**

The `beforeAction` event will receive one paramter: the request object, and the `afterAction` event will receive two paramters: the request object and the response.

In the constructor for the controller, simply bind to the beforeAction event:

```javascript
init: function(app) {

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

}
```

## Super Methods

As you have already seen in a few places above, if you want to override a method of a parent class, you simply extend the object and replace the method. However, if you don't want to completely replace the method and wish to add to it; you have to call the parent's method using the `_super` method. You must make sure your overloaded method takes in the same parameters and passes it to the parent via `_super`.

For example, the constructor of a Controller expects to receive the `app` object which is passed into it when the class is instantiated by the SuperJS application. This can be seen in the overloaded method in the previous event binding example.