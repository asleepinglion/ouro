/*
 * UserModel *
 * Model for User Data Management
 *
 * @exports UserModel
 */

//require dependencies
var SuperJS = require('superjs');

//export Address model
module.exports = SuperJS.ORM.Collection.extend({

  identity: 'user',
  connection: 'db1',
  attributes: {

    id: { type: 'integer' },
    email: { type: 'email', maxLength: 255, required: true },
    phone: { type: 'string', maxLength: 10, required: true },
    password: { type: 'string', maxLength: 255, required: true },
    passwordHash : { type:'string', maxLength: 32 },
    salutation: { type:'string' },
    firstName: { type: 'string', maxLength: 40, required: true },
    lastName: { type: 'string', maxLength: 50, required: true },
    lastLoginAt: { type: 'datetime' },
    isDeleted: { type: 'boolean' },
    updatedAt: { type: 'datetime' },
    createdAt: { type: 'datetime' }

  }

});