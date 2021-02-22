'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * @property {number} id
 */
class Ord extends Model {
  static get table () {
    return 'ord'
  }
  static boot () {
    super.boot()
    this.addTrait('NoTimestamp')
  }
}

module.exports = Ord
