const users = []

// adduser, remove user, getUser, getUsers in room

function addUser({id, username, room}) {

    //clean the data of user
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data that data is exist or not
    if(!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    // check for existing user data
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    //valid username
    if(existingUser) {
        return {
            error: 'username is already exist'
        }
    }

    // store user in an array
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
   
    //find index of user first inside an array
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter((user) =>  user.room.includes(room))
}

module.exports = {
    addUser,
    getUser,
    getUserInRoom,
    removeUser
}



