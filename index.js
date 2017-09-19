'use strict'
// clean up the results field of the fetches table to address:
// https://github.com/openaq/openaq-api/issues/351
const { Client } = require('pg')
const client = new Client({
  user: null,
  host: null,
  database: null,
  password: null,
  port: 5432,
  ssl: true
})

client.connect()
client.query(`SELECT * FROM fetches WHERE time_started > '2017-08-10T00:00:00Z'`)
  .then(res => {
    return res.rows
      .map(fetch => {
        if (Array.isArray(fetch.results)) {
          fetch.results.map(fetchResult => {
            delete fetchResult.results
          })
        }
        return client.query('UPDATE fetches SET results = $1 WHERE id= $2', [JSON.stringify(fetch.results), fetch.id])
          .then(() => fetch.id)
          .catch(err => console.log(err))
      })
  })
  .then((updates) => {
    return Promise.all(updates).then(res => console.log(`ID's updated: ${res}`))
  })
  .catch(err => console.log(err.stack))
  .then(() => client.end())
