const elasticsearch = require('elasticsearch')

// Core ES variables for this project
const index = 'library'
const type = 'book'
const port = 9200
const host = process.env.ES_HOST || 'localhost'
const client = new elasticsearch.Client({
  host: {
    host,
    port
  }
})

/** Check the ES connection status */
async function checkConnection() {
  let isConnected = false
  while (!isConnected) {
    console.log('Connecting to Elasticsearch...')
    try {
      const health = await client.cluster.health({})
      console.log(health)
      isConnected = true
    } catch (err) {
      console.log('...connection failed, retrying...', err)
    }
  }
}

/** Clear the index, recreate it, and add mappings */
async function resetIndex() {
  if (await client.indices.exists({
      index
    })) {
    await client.indices.delete({
      index
    })
  }

  await client.indices.create({
    index
  })
  await putBookMapping()
}

/** Add book section schema mapping to ES */
async function putBookMapping() {
  const schema = {
    "title": {
      "type": "text",
      "analyzer": "english",
      "index": "true"
    },
    "title2": {
      "type": "text",
      "analyzer": "german",
      "index": "true"
    },
    "abstract": {
      "type": "text",
      "analyzer": "english",
      "index": "true"
    },
    "description": {
      "type": "text",
      "analyzer": "english",
      "index": "true"
    },
    "tag": {
      "type": "keyword",
      "fields": {
        "raw": {
          "type": "text",
          "index": "true"
        }
      }
    },
    "image": {
      "type": "text",
      "index": "false"
    },
    "imagesquare": {
      "type": "text",
      "index": "false"
    },
    "sublink1": {
      "type": "text",
      "index": "false"
    },
    "sublink2": {
      "type": "text",
      "index": "false"
    },
    "sublink3": {
      "type": "text",
      "index": "false"
    },
    "sublink4": {
      "type": "text",
      "index": "false"
    },
    "subtitle1": {
      "type": "text",
      "index": "false"
    },
    "subtitle2": {
      "type": "text",
      "index": "false"
    },
    "subtitle3": {
      "type": "text",
      "index": "false"
    },
    "subtitle4": {
      "type": "text",
      "index": "false"
    },
    "author": {
      "type": "keyword",
      "fields": {
        "raw": {
          "type": "text",
          "index": "true"
        }
      }
    }
  }

  return client.indices.putMapping({
    index,
    type,
    body: {
      properties: schema
    }
  })
}

module.exports = {
  client,
  index,
  type,
  checkConnection,
  resetIndex
}