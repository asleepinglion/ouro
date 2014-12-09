##{{upper-camel-case projectName}} App
A simple starting point for a SuperJS application. All classes in SuperJS are extendable with the
`extend` method. See the SuperJS documentation for more information:
[http://github.com/asleepinglion/superjs](http://github.com/asleepinglion/superjs) 

###Basic Structure

#####app.js
The application starting point contains the instantiation of the SuperJS.Application class. The class could be extended 
to override functionality, such as the middleware loaded. You can also hook into events such as the `started` event.

#####config
There are three configuration files, data, security, and server settings.
Please check those files for more detailed descriptions.

#####modules
You can either create modules inside the module folder by naming a folder after the module, such as `user` and then 
inside that folder have a `controller.js` and a `model.js` OR you can have `controllers` and `models` folders which 
contain files like `user.js`. Larger applications will probably prefer the modules method, but this is user preference.

#####models
Models define the available models for the API. The configuration of models is dependent on the engine used. See the 
`data.js` configuration file for more information.

#####controllers
Any method prefixed with an undescore or where the first letter is Uppercased is turned into an exposed endpoint that is
web accessible will receive two params, the `req` object provided by express, and a `callback` which needs to be called
at the end of your method otherwise the process will be blocked. Controllers are entirely extendable, so you can 
create base classes and abstract common functionality. There is a base `Controller` class available in the SuperJS 
package or you can use the `Rest Enabled` controller classes provided by the database engine. You can also hook into
events such as the `beforeAction` and `afterAction` events.