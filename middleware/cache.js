export const cacheMiddleware = (model,attribute,cache) => {
    return (req, res, next) => {

        const value = req.body[`${attribute}`]
        if(!value){
            res.status(400).send('Found empty data')
        }
        const key = `${model}:${value}`

        if(cache.contains(key)){
            console.log('Cache Hit')
            return res.status(200).json(cache.get(key))
        }
        else{
            console.log('Cache Miss')
            next()
        }
    }
}