const uuid = require('uuid')
const Joi = require('@hapi/joi')
const decoratorValidator = require('./utils/decoratorValidator')
const enumParams = require('./utils/globalEnum')
class Handler{
    constructor({ dynamoDbSvc }){
        this.dynamoDbSvc = dynamoDbSvc
        this.dynamoDbTable = process.env.DYNAMODB_TABLE
    }
    static validator(){
        return Joi.object({
            nome: Joi.string().max(100).min(2).required(), 
            poder: Joi.string().max(100).min(2).required()
        })
    }
    async insertItem(params){
        this.dynamoDbSvc.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });
    }
    prepareData(data){
        const params = {
            TableName: this.dynamoDbTable,
            Item: {
                ...data,
                id: uuid.v1(),
                createdAt: new Date().toISOString()
            }
        }
        return params
    }
    handlerSuccess(data){
        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }
        return response
    }
    handlerError(data){
        return {
            statusCode: data.statusCode || 501, 
            headers: {'Content-Type': 'text/plain'},
            body: 'Couldn\'t create item!'
        }
    }
    async main(event){
        try {
            // LINHA ABAIXO COMENTADA POIS O DECORATOR ESTA MODIFICANDO A INSTANCIA
            //const data = JSON.parse(event.body)
            const data = event.body
            const dbParams = this.prepareData(data)
            await this.insertItem(dbParams)
            return this.handlerSuccess(data)
        } catch (error) {
            console.error('Erro ', error.stack)
            return this.handlerError({ statusCode: 500 })
        }
    }
}
// factory
const AWS = require('aws-sdk')
const dynamoDB  = new AWS.DynamoDB.DocumentClient()

const handler = new Handler({
    dynamoDbSvc: dynamoDB
})
module.exports = decoratorValidator(handler.main.bind(handler),Handler.validator(),enumParams.ARG_TYPE.BODY)