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

module.exports = GetSale
