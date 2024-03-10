const AsyncHandler = (requestHandler) => {
    return (req , res , next ) => {
        Promise
        .resolve(requestHandler(re , res , next))
        .catch((err) => {
            next(err)
        })
    }
}

export { AsyncHandler }