const userMessages = (username,text) => {
    return {
        username,
        text, 
        createdAt: new Date().getTime()
    }
}

module.exports = {
    userMessages
}