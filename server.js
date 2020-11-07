const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin , getCurrentUser, getRoomUsers, userLeave} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)


// set static folder 
app.use(express.static(path.join(path.resolve(),'public')))

// waiting for connections
io.on('connection', socket => {

    let botName = "Chat Cord"

    socket.on('joinRoom',({username, room}) => {
        
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)
        // welcome current user
        socket.emit('message', formatMessage(botName,'Welcome to ChatCord'))

        console.log(user)
        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //send room users
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
    
   

    // 
    socket.on('disconnecting', (message) => {
        const user = userLeave(socket.id)
        
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

            //send room users
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    // listen for chat message 
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username,message))
    })

})

const PORT = 3000 || process.env.PORT

server.listen(PORT, ()=> console.log('Server running on port '+ PORT))
