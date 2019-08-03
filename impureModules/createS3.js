const config = require('config')
const AWS = require('aws-sdk')

const createS3 = ({ bucketName }) => (new AWS.S3({
  params: {
    Bucket: bucketName
  },
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey
  }
}))

module.exports = { createS3 }
