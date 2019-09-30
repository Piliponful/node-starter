const config = require('config')
const AWS = require('aws-sdk')

const createS3 = ({ bucketName }) => {
  const s3 = new AWS.S3({
    params: {
      Bucket: bucketName
    },
    credentials: {
      accessKeyId: config.aws.accessKey,
      secretAccessKey: config.aws.secretAccessKey
    }
  })

  return s3
}

module.exports = { createS3 }
