'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderLine extends Model {
  static get table () {
    return 'order_line'
  }
  static boot () {
    super.boot()
    this.addTrait('NoTimestamp')
  }
}

module.exports = OrderLine
