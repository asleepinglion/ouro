var esprima = require('esprima');
var fs = require('fs');
var colors = require('colors');

var controller = fs.readFileSync('./modules/user/controller.js', {encoding: 'utf8'});

console.log(colors.cyan('SuperJS Introspection:'));

//parse the JS file into ADT
var ast = esprima.parse(controller);

//return console.log(JSON.stringify(adt));

//find the extension object so we can parse the methods & actions
ast.body.map(function(node) {

  //we are looking for an assignment expression
  if( node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' ) {

    //make sure we found the right assignment expression
    if (node.expression.right.type === 'CallExpression' &&
      node.expression.right.callee.type === 'MemberExpression' &&
      node.expression.right.callee.object.object.name === 'SuperJS' &&
      node.expression.right.callee.object.property.name === 'Controller' &&
      node.expression.right.callee.property.name === 'extend') {

      //the first argument of the extend method should be an object expression
      if (node.expression.right.arguments.length >= 1 && node.expression.right.arguments[0].type === 'ObjectExpression') {
        var classExtArgs = node.expression.right.arguments[0];

        //loop through the properties in our extended object
        classExtArgs.properties.map(function (property) {

          //find all functions
          if (property.type === 'Property' && property.value.type === 'FunctionExpression') {

            //check whether the function is an internal method or external action
            var firstCharacter = property.key.name.substr(0, 1);
            if (firstCharacter === '_' || (firstCharacter === firstCharacter.toUpperCase() && firstCharacter !== firstCharacter.toLowerCase())) {
              console.log(colors.green('external action: ') + property.key.name);
            } else {
              console.log(colors.yellow('internal method: ') + property.key.name);
            }
          }
        });
      }
    }
  }

});

