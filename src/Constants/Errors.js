const { Errors } = require('./Constants')

class Error{
    constructor(){
        throw new Error(`The error class must not be initialized!`)
    }

    makeerror(error, ...args) {
        if(!Errors[error]) throw new TypeError(`The error ${error} is invalid!`)

        let err = Errors[error].replace()
    }
}