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
          prod_model.title = product.title
          const prod_save_res = await prod_model.save()
          if (! prod_save_res) return 'failed updating product lucid'
        }
        let a = 1

      }
      console.log(`After 5 secs we close db, so that process exit; no matter what is running. Time's up!`)
      setTimeout(() => {
        Database.close()
      }, 8000)
    } catch (e) {
      console.error(`error 61: `, e)
    }
    setTimeout(() => {
      Database.close()
    }, 8000)
  }
}

module.exports = GetProdList
