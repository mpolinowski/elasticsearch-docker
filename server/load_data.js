const fs = require('fs')
const path = require('path')
const esConnection = require('./connection')

/** Read an individual book txt file, and extract the title, tag, and paragraphs */
function parseBookFile(filePath) {
  // Read text file
  const book = fs.readFileSync(filePath, 'utf8')

  // Find book title, description and tag
  const title = book.match(/^Title:\s(.+)$/m)[1]
  const title2 = book.match(/^Title2:\s(.+)$/m)[1]
  const author = book.match(/^Author:\s(.+)$/m)[1]
  const description = book.match(/^Description:\s(.+)$/m)[1]
  const abstract = book.match(/^Abstract:\s(.+)$/m)[1]
  const tag = book.match(/^Tags:\s(.+)$/m)[1]
  const sublink1 = book.match(/^Sublink1:\s(.+)$/m)[1]
  const subtitle1 = book.match(/^Subtitle1:\s(.+)$/m)[1]
  const sublink2 = book.match(/^Sublink2:\s(.+)$/m)[1]
  const subtitle2 = book.match(/^Subtitle2:\s(.+)$/m)[1]
  const sublink3 = book.match(/^Sublink3:\s(.+)$/m)[1]
  const subtitle3 = book.match(/^Subtitle3:\s(.+)$/m)[1]
  const sublink4 = book.match(/^Sublink4:\s(.+)$/m)[1]
  const subtitle4 = book.match(/^Subtitle4:\s(.+)$/m)[1]
  const image = book.match(/^Image:\s(.+)$/m)[1]
  const imagesquare = book.match(/^Imagesquare:\s(.+)$/m)[1]

  console.log(`Article :: ${title} :: ${sublink1}`)

  // Find metadata header and footer
  const startOfBookMatch = book.match(/^\*{3}\s*START OF THIS ARTICLE.+\*{3}$/m)
  const startOfBookIndex = startOfBookMatch.index + startOfBookMatch[0].length
  const endOfBookIndex = book.match(/^\*{3}\s*END OF THIS ARTICLE.+\*{3}$/m).index

  // Clean book text and split into array of paragraphs
  const paragraphs = book
    .slice(startOfBookIndex, endOfBookIndex) // Remove header and footer
    .split(/\n\s+\n/g) // Split each paragraph into it's own array entry
    .map(line => line.replace(/\r\n/g, ' ').trim()) // Remove paragraph line breaks and whitespace
    .filter((line) => (line && line !== '')) // Remove empty lines

  console.log(`Parsed ${paragraphs.length} Paragraphs\n`)
  return {
    title,
    title2,
    author,
    description,
    abstract,
    tag,
    sublink1,
    subtitle1,
    sublink2,
    subtitle2,
    sublink3,
    subtitle3,
    sublink4,
    subtitle4,
    image,
    imagesquare,
    paragraphs
  }
}

/** Bulk index the book data in ElasticSearch */
async function insertBookData(
  title,
  title2,
  author,
  description,
  abstract,
  tag,
  sublink1,
  subtitle1,
  sublink2,
  subtitle2,
  sublink3,
  subtitle3,
  sublink4,
  subtitle4,
  image,
  imagesquare,
  paragraphs) {
  let bulkOps = [] // Array to store bulk operations

  // Add an index operation for each section in the book
  for (let i = 0; i < paragraphs.length; i++) {
    // Describe action
    bulkOps.push({
      index: {
        _index: esConnection.index,
        _type: esConnection.type
      }
    })

    // Add document
    bulkOps.push({
      title,
      title2,
      author,
      description,
      abstract,
      tag,
      sublink1,
      subtitle1,
      sublink2,
      subtitle2,
      sublink3,
      subtitle3,
      sublink4,
      subtitle4,
      image,
      imagesquare,
      location: i,
      text: paragraphs[i]
    })

    if (i > 0 && i % 500 === 0) { // Do bulk insert after every 500 paragraphs
      await esConnection.client.bulk({
        body: bulkOps
      })
      bulkOps = []
      console.log(`Indexed Paragraphs ${i - 499} - ${i}`)
    }
  }

  // Insert remainder of bulk ops array
  await esConnection.client.bulk({
    body: bulkOps
  })
  console.log(`Indexed Paragraphs ${paragraphs.length - (bulkOps.length / 2)} - ${paragraphs.length}\n\n\n`)
}

/** Clear ES index, parse and index all files from the books directory */
async function readAndInsertBooks() {
  await esConnection.checkConnection()

  try {
    // Clear previous ES index
    await esConnection.resetIndex()

    // Read books directory
    let files = fs.readdirSync('./books').filter(file => file.slice(-4) === '.txt')
    console.log(`Found ${files.length} Files`)

    // Read each book file, and index each paragraph in elasticsearch
    for (let file of files) {
      console.log(`Reading File - ${file}`)
      const filePath = path.join('./books', file)
      const {
        title,
        title2,
        author,
        description,
        abstract,
        tag,
        sublink1,
        subtitle1,
        sublink2,
        subtitle2,
        sublink3,
        subtitle3,
        sublink4,
        subtitle4,
        image,
        imagesquare,
        paragraphs
      } = parseBookFile(filePath)
      await insertBookData(
        title,
        title2,
        author,
        description,
        abstract,
        tag,
        sublink1,
        subtitle1,
        sublink2,
        subtitle2,
        sublink3,
        subtitle3,
        sublink4,
        subtitle4,
        image,
        imagesquare,
        paragraphs)
    }
  } catch (err) {
    console.error(err)
  }
}

readAndInsertBooks()