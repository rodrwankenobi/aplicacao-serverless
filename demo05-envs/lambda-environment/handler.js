'use strict';
const settings = require('./config/settings')
const cheerio = require('cheerio')
const aws = require('aws-sdk')
const dynamoDb = new aws.DynamoDB.DocumentClient()
const axios = require('axios')
const uuid = require('uuid')
class Handler{
  static async main(event){
    console.log('at',new Date().toISOString(),JSON.stringify(event,null,2))
    const { data } = await axios.get(settings.commitMessagesURL)
    const $ = cheerio.load(data)
    const [commitMessage] = await $('#content').text().trim().split('\n') 
    console.log('Message',commitMessage)
    const params = {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    }
    await dynamoDb.put(params).promise()
    return {
      statusCode: 200
    }
  }
}
module.exports = {
  scheduler: Handler.main
}