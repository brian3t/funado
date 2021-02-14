'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Entity extends Model {
  static get table () {
    return 'entity'
  }
}

module.exports = Entity
