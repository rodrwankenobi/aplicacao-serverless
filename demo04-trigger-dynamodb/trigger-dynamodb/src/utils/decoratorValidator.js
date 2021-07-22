const decoratorValidator = (fn,schema,argsType) => {
    return async function(event){
        const data = JSON.parse(event[argsType])
        const { error,value } = schema.validate(data, { abortEarly: true})
        // altera instancia de arguments
        event[argsType] = value
        if(!error){
            // arguments serve para pegar todos os argumentos que vieram da função
            // e mandar pra frente
            // o apply vai retornar a função que será executada posteriormente
            return fn.apply(this,arguments)
        }
        return {
            statusCode: 422, // entidade não pode ser processada
            body: error.message
        }
    }
}
module.exports = decoratorValidator