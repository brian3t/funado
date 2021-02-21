'use strict'

const {Command} = require('@adonisjs/ace')
const axios = require('axios').default
const cheerio = require('cheerio')
const mm = require('moment')
const DB = use('Database')
const Entity = use('App/Models/Entity')
const Product = use('App/Models/Product')
const _ = require('lodash')
const Game = use('App/Models/Game')
const Spf = require('shopify-api-node')

class GetProdList extends Command {
  static get signature(){
    return 'get_prod_list'
  }

  static get description(){
    return 'Get list of products from Shopify'
  }

  async handle(args, options){
    try {
      this.info(GetProdList.description)
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
        let products = await spf.product.list()
        for (let product of products) {
          const prod_payload = {spfid: product.id, entity_id: entity.id, title: product.title}
          /** @type Product **/
          let prod_model = await Product.findOrCreate(prod_payload, prod_payload)
          if (! (prod_model instanceof Product)) return 'failed updating Product lucid'
          prod_model.spfid = product.id
          prod_model.title = product.title
          prod_model.body_html = product.body_html
          if (!product.variants || !_.isArray(product.variants)) return 'err: missing variants'
          let prod_var = product.variants[0]
          prod_model.price = parseInt(prod_var.price)
          prod_model.sku = prod_var.sku
          prod_model.fulfillment_service = prod_var.fulfillment_service
          prod_model.weight = prod_var.weight
          prod_model.weight_unit = prod_var.weight_unit
          prod_model.inventory_item_id = prod_var.inventory_item_id
          prod_model.inventory_quantity = prod_var.inventory_quantity
          prod_model.requires_shipping = prod_var.requires_shipping
          prod_model.variantid = prod_var.id
          if (!product.image || !_.isObject(product.image)) return 'err: missing image'
          let prod_image = product.image
          prod_model.img = prod_image.src

          const prod_save_ret = await prod_model.save()
          if (! prod_save_ret) return 'failed updating product lucid'
        }
        let a = 1

      }
      console.log(`After 5 secs we close db, so that process exit; no matter what is running. Time's up!`)
      setTimeout(() => {
        DB.close()
      }, 8000)
    } catch (e) {
      console.error(`error 61: `, e)
    }
    setTimeout(() => {
      DB.close()
    }, 8000)
  }
}

module.exports = GetProdList
