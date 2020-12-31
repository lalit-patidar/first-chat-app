const path = require('path')
const http = require('http') // we need http module because for socket.io otherwise express handel inside it
const express = require('express');
const socketio = require('socket.io'); // loading socket.io module here to use real time chat application
const filterBadWords = require('bad-words');
const {userMessages} = require('./utils/messages')
const { addUser, getUser, getUserInRoom, removeUser } = require('./utils/users')

// we have to creat an app
const app = express()
const server = http.createServer(app)
// here we are calling socket.io fucntion with server parameter 
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log(`new connection setup`)
    
    //listning username and room info from browser
    socket.on('join', (options, callback) => {

        //storing user dats from here
        const {error, user} = addUser({ id: socket.id, ...options})

        if(error) {
            return callback(error)
        }

       // for joining an endividuals room
       socket.join(user.room)

       socket.emit('Message', userMessages('admin', 'welcome☻'))
       // here to send the message when new user is connected with server except who is connected 
       socket.broadcast.to(user.room).emit('Message', userMessages(user.username ,`${user.username} has joined!`)) //here we are perform some changes for send this connection message to only room memebers not to others
      
       // sending user data here for render user list in sidebar to everyone
        io.to(user.room).emit('userList', {
            room: user.room,
            username: getUserInRoom(user.room)
        })
    })


    socket.on('userData', ({userInput}, callback) => {
        // console.log('room is here', room)
        const user = getUser(socket.id)
        let filter = new filterBadWords()

        if(filter.isProfane(userInput)){
             callback('profanity is not allowed here')
        }

      io.to(user.room).emit('Message', userMessages(user.username, userInput))
        callback()
    })

    // like connect socket has also diconnection argumnet when we use it then  it tell us wheather the user is connect or not if connect then not work
    // if user is disconnect then its working
    socket.on('disconnect', () => {
        //removing user here to acknowlagede to user that some one goes oofline
        const user = removeUser(socket.id)
        if(user) {

            io.to(user.room).emit('Message', userMessages(user.username, `${user.username} has left`)) //to send the everyone who is connected its runs only when user diconnect
            // send user data from userlist to render on the screen
            io.to(user.room).emit('userList', {
                room: user.room,
                username: getUserInRoom(user.room)
            })
        }
       
    })

    // to accepting the location by the client 
    socket.on('send-location', ({latitude, longitude, room}, callback) => {
        console.log(latitude, longitude, room)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', userMessages(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        
        callback('the address link was send successfully')
    })
})

server.listen(port, () => {
    console.log('port is running on 3000')
})

let time = new Date().getTime()

console.log(typeof time)

