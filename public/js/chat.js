const socket = io()
let $messageForm = document.querySelector('form')
let $messageFormInput = $messageForm.querySelector('input')
let $messageFormButton = $messageForm.querySelector('button')
let $locationButton = document.getElementById('send-location')
let $userMessage = document.getElementById('user-messages')
let $renderLocation = document.getElementById('location-url')
// here we setup the connection with server to listen and thake the data from the server we have to set that expression 

//templates 
const locationTemplate = document.getElementById('show-location').innerHTML
const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML
//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

function autoScroll() {
    const newMessage = $userMessage.lastElementChild

    //take the height and margin of the new msg and adding with together to findout total height
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHight = newMessage.offsetHeight + newMessageMargin
    
    // visible height of message container
    const visibleHeight = $userMessage.offsetHeight

    // scroll height of the message container
    const scrollHeight = $userMessage.scrollHeight

    //to know how far i have scrolled
    const containerHeight = $userMessage.scrollTop + visibleHeight

    // apply condition to set scroll at bottom by default
    if (scrollHeight - newMessageHight <= containerHeight) {
        $userMessage.scrollTop = $userMessage.scrollHeight
    }

    console.log(scrollHeight)
    console.log(containerHeight)
    console.log(scrollHeight - newMessageHight <= containerHeight)
    
}

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('h:m a')
    })

    $userMessage.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

socket.on('Message', (message) => {
    console.log(message)
    // document.querySelector('#message').textContent = response

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m a')
    })

    $userMessage.insertAdjacentHTML('beforeend', html) // this method is used to set the html content inside an html content
    autoScroll()
})


socket.on('userList', ({ room, username}) => {
     const html = Mustache.render(sidebarTemplate, {
         room,
         username
     })
     document.getElementById('sidebar-conatiner').innerHTML = html
    console.log(room, username)
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(e.path[0][0].value)
    //block sumbit button after submit
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('userData', { userInput: e.target.elements.userMessage.value, room }, (error) => {
         // enable the disabled submit button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('the message was delivered successfully')
    }) 
})

// here fatching our location from the browser and send location to the server  

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('do not support navigator inside the browser')
    }
  
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        $locationButton.removeAttribute('disabled')
       socket.emit('send-location', {latitude: position.coords.latitude, longitude: position.coords.longitude, room}, (resMessage) => {
           console.log(resMessage)
       })
    })
})


// emiting username and room info from browser to server

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})




