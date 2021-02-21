# Fundyay Adonis fullstack application

This is the fullstack app for AdonisJs Fundyay, it comes pre-configured with:

1. Bodyparser
2. Session
3. Authentication
4. Web security middleware
5. CORS
6. Edge template engine
7. Lucid ORM
8. Migrations and seeds

Additional libraries:
- https://www.npmjs.com/package/shopify-api-node
- https://shopify.dev/docs/admin-api/rest/reference

## Setup
- Add .env file to determine db settings, etc..
- Use the adonis command to install the blueprint

```bash
adonis new yardstick
```

or manually clone the repo and then run `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

Serving Fundyay:
Console app:
- pull all products from Shopify get_prod_list
- pull all sales from Shopify get_sale
- 
