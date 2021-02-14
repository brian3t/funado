'use strict'

const {Command} = require('@adonisjs/ace')
const axios = require('axios').default
const cheerio = require('cheerio')
const mm = require('moment')
const Database = use('Database')
const Entity = use('App/Models/Entity')
const Game = use('App/Models/Game')

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
      const all_entities = await Entity.findBy('platform', 'shopify')
      console.log(`After 5 secs we close db, so that process exit; no matter what is running. Time's up!`)
      setTimeout(() => {
        Database.close()
      }, 5000)
    } catch (e) {
      console.error(`error 61: `, e)
    }
  }
}

module.exports = GetProdList
