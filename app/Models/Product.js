'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * @property {number} id
 */
class Product extends Model {
  static get table () {
    return 'product'
  }
  static boot () {
    super.boot()
    this.addTrait('NoTimestamp')
  }
}

module.exports = Product
