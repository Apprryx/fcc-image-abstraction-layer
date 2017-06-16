'use strict'
const express = require('express')
const session = require('express-session')
const mongo = require('mongodb')
const bodyParser = require('body-parser')
const path = process.cwd()
const app = express()
require('dotenv').load()
const Bing = require('node-bing-api')({
  accKey: process.env.accKey
})

mongo.connect(process.env.DB_URI, (err, db) => {
  if (err) {
    throw new Error('Database failed to connect!')
  } else {
    console.log('Successfully connected to MongoDB on port 27017.')
  }
  var collection = db.collection('searches')
  app.use('/public', express.static(process.cwd() + '/public'))
  app.use(bodyParser.json())
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  }))

  app.route('/')
    .get((req, res) => {
      res.sendFile(path + '/public/index.html')
    })
  app.route('/api/v1/recentsearches').get((req, res) => {
    collection.find({}, { timestamp: 1, query: 1, _id: 0 }, { limit: 10, sort: {_id: -1}}).toArray((err, docs) => {
      if (err) {
        console.error(err)
        res.json({'error': 'There was error looking up recent searches in database, please consult application logs'})
      }
      res.json(docs)
    })
  })
  app.route('/api/v1/imagesearch/:searchQuery*').get((req, res) => {
    let {searchQuery} = req.params
    let {offset} = req.query
    let searchOptions = {
      top: 10,
      skip: 0
    }
    let search = {
      query: searchQuery,
      timestamp: Math.floor(Date.now() / 1000)
    }
    if (offset && !isNaN(offset)) {
      searchOptions.skip = searchOptions.top * offset
    } else if (offset && isNaN(offset)) {
      res.json({'error': 'offset needs to be a number!'})
      return
    }
    Bing.images(searchQuery, searchOptions, (err, response, body) => {
      if (err) {
        console.log(err)
        res.json({'error': 'There was error using Bing api, please consult application logs'})
      }
      if (body.value) {
        search.result = true
        let resultArr = []
        let result = {}
        for (let i = 0; i < body.value.length; i++) {
          result = {}
          result.url = body.value[i].contentUrl
          result.alt = body.value[i].name
          result.thumbnail = body.value[i].thumbnailUrl
          result.page = body.value[i].hostPageUrl
          resultArr.push(result)
        }
        // my assumption here is, there won't be offset for first query
        // so we will save only first attemps for search, there will be 
        // less duplicities in db :) (we can at least hope)
        if (!offset) {
          collection.insertOne(search)
        }
        res.json(resultArr)
      } else if (!body.value && offset) {
        res.json({'error': 'there are no more results'})
      } else {
        res.json({'error': 'there seems to be no results for this query'})
      }
    })
  })
  let port = process.env.PORT || 8080
  app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...')
  })
})