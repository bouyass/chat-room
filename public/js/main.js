const socket = io()
const chatForm = document.getElementById('chat-form')
const quitButton = document.querySelector('.btn')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

// get username and room from the URL 
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})



// join chat room
socket.emit('joinRoom', {username, room})

// get room users
socket.on('roomUsers', ({room, users})=> {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message', message => {
   outputMessage(message)

   // scroll down 
   chatMessages.scrollTop = chatMessages.scrollHeight
   // clear the input

})


// leaving the room
quitButton.addEventListener("click", (e) => {
    socket.emit('disconnecting', 'I left the room')
})

//message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // get the message text
    const messge = e.target.elements.msg.value
    // emitting a message to the server 
    socket.emit('chatMessage', messge)
    e.target.elements.msg.value = ""
    e.target.elements.msg.focus()
})

function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span> ${message.time} </span></p>
        <p class="text">
        <p class="text">
			${message.text}
		</p>
    `

    document.querySelector('.chat-messages').appendChild(div)
}

// output room name
function outputRoomName(room){
    roomName.innerText = room
}

// output room users
function outputUsers(users){
    usersList.innerHTML = `
        ${users.map(user => `<li> ${user.username} </li>`).join('')}
    `
}   