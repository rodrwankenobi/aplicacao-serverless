'use strict';
const { get } = require('axios') 
class Handler {
  constructor({ rekoSVC, translatorSVC }){
    this.rekoSVC = rekoSVC
    this.translatorSVC = translatorSVC
  }
  async detectImageLabels(buffer){
    const result = await this.rekoSVC.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()
    const workingItems = result.Labels.filter(({ Confidence }) => Confidence > 80 );
    const names = workingItems.map(({ Name }) => Name).join(' and ')
    return { names, workingItems }
  }
  async translateText(text){
    console.log('Traduzindo para portugues...')
    console.log(text)
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    const { TranslatedText } = await this.translatorSVC.translateText(params).promise()
    return TranslatedText.split(' e ')
  }
  formatTextResults(texts,workingItems){
    const finalText = [];
    for (const indexText in texts){
      const nameInPortuguese = texts[indexText]
      const confidence = workingItems[indexText].Confidence
      finalText.push(
        `${confidence.toFixed(2)}% de ser to tipo ${nameInPortuguese}`
      )
    }
    return finalText.join('\n')
  }
  async getImageBuffer(imageUrl){
    console.log('Downloading image..')
    const response = await get(imageUrl,{
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'base64')
    return buffer
  }
  async main(event){
    try {

      // const imgBuffer = await readFile('./images/cat.jpg')
      const { imageUrl } = event.queryStringParameters
      console.log(imageUrl)
      const buffer = await this.getImageBuffer(imageUrl)
      const { names, workingItems } = await this.detectImageLabels(buffer)
      const texts = await this.translateText(names)
      const textResults = this.formatTextResults(texts,workingItems);
      console.log('Finishing...')
      return {
        status_code: 200,
        body: `A imagem tem \n`.concat(textResults)
      }
    } catch (error) {
      console.log('** ERRO *** ',error.stack)
      return {
        status_code: 500,
        body: 'Internal Server Error'
      }
    }
  }
}

//factory
const aws = require('aws-sdk')
const reko = new aws.Rekognition()
const translator = new aws.Translate()

const handler = new Handler({
  rekoSVC : reko,
  translatorSVC: translator
}) 

module.exports.main = handler.main.bind(handler)
