'use strict'

const {Command} = require('@adonisjs/ace')
const axios = require('axios').default
const cheerio = require('cheerio')
const mm = require('moment')
const DB = use('Database')
const Entity = use('App/Models/Entity')
const Product = use('App/Models/Product')
const Ord = use('App/Models/Ord')
const OrderLine = use('App/Models/OrderLine')
const _ = require('lodash')
const Game = use('App/Models/Game')
const Spf = require('shopify-api-node')

class GetSale extends Command {
  static get signature(){
    return 'get_sale'
  }

  static get description(){
    return 'Get list of closed orders from Shopify'
  }

  async handle(args, options){

    try {
      this.info(GetSale.description)
      /** @type {Array} **/
      let all_entities = await DB.raw(
        `SELECT id, name, shopurl, apiver, apikey, apipw
         FROM entity
         WHERE platform = 'shopify' `
      )
      if (! _.isArray(all_entities)) return 'fail db'
      if (all_entities.length !== 2) return 'fail getting data from our db'
      all_entities = all_entities[0] //get raw data; ignore col defs
      /**
       * The complete Entity Db row
       * @typedef {Object} EntityDb
       * @property {number} id
       * @property {string} name
       * @property {string} shopurl
       * @property {string} apiver
       * @property {string} apikey
       * @property {string} apipw
       */

      for (const entity of all_entities) {
        const spf = new Spf({
          shopName: entity.shopurl,
          apiKey: entity.apikey,
          password: entity.apipw
        });
        let orders = await spf.order.list({'status': 'closed'})

        for (let order of orders) {
          let ord_payload = {entity_id: entity.id, spfid: order.id, order_number: order.order_number}
          let ord_model = await Ord.findOrCreate(ord_payload, ord_payload)
          ord_model.last_synced_at = (new mm()).format('YYYY-MM-DD hh:mm:ss')
          ord_model.spf_note = order.note
          ord_model.total_price = parseFloat(order.total_price)
          ord_model.taxes_included = order.taxes_included
          ord_model.financial_status = order.financial_status || ''
          ord_model.confirmed = order.confirmed
          ord_model.total_discounts = parseFloat(order.total_discounts)
          ord_model.spf_name = order.name
          ord_model.app_id = order.app_id
          ord_model.fulfillment_status = order.fulfillment_status || ''
          ord_model.tags = order.tags
          ord_model.contact_email = order.contact_email || order.email
          ord_model.order_status_url = order.order_status_url
          const ord_model_ret = await ord_model.save()
          if (! ord_model_ret) {
            console.error(`Failed saving order model, skipping this order`)
            DB.close()
            continue
          }
          if (! order.line_items) {
            console.error(`No line items, skipping this order`)
            DB.close()
            continue
          }
          let ord_lines = order.line_items
          for (let ord_line of ord_lines) {
            const ord_line_payload = {order_id: ord_model.id, spfid: ord_line.id}
            const ord_line_model = await OrderLine.findOrCreate(ord_line_payload, ord_line_payload)
            if (! ord_line_model instanceof OrderLine) {
              console.error(`Failed saving order line`)
            }
            //linking to the product
            let prod_model = await Product.findBy('spfid', ord_line.product_id)
            if (! (prod_model instanceof Product)){
              console.error(`Error looking up product`)
            }

            ord_line_model.last_synced_at = (new mm()).format('YYYY-MM-DD hh:mm:ss')
            ord_line_model.product_id = ord_line.product_id
            ord_line_model.variant_id = ord_line.variant_id
            ord_line_model.quantity = ord_line.quantity
            ord_line_model.fulfillment_service = ord_line.fulfillment_service
            ord_line_model.requires_shipping = ord_line.requires_shipping
            ord_line_model.price = parseFloat(ord_line.price)
            ord_line_model.total_discount = parseFloat(ord_line.total_discount)
            ord_line_model.fulfillment_status = ord_line.fulfillment_status || ''

          }
        }

      }
      console.log(`After 8 secs we close db, so that process exit; no matter what is running. Time's up!`)
      setTimeout(() => {
        DB.close()
      }, 8000)
    } catch (e) {
      console.error(`error 61: `, e)
    }

    setTimeout(
      () => {
        DB
          .close()
      }

      ,
      8000
    )
  }
}

module.exports = GetSale
