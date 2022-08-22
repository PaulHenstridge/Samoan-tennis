const express = require('express')
const socket = require('socket.io')

const path = require('path')
const http = require('http')

// App setup
const app = express()
const server = http.createServer(app)

// Static files
app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log('server running on 4000')
})

// trying to avoid Cors blocking.  masy have been VS live server issue...?
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     next()
// })

// Socket setup
const io = socket(server)


let activePlayers = []

let tilesArray = []

let p2YardArray = []
let p1YardArray = []
let townSquareArray = []

let currentRoll


io.on('connection', socket => {
    console.log(`socket ${socket.id} connected`)

    socket.on('start', (data) => {
        console.log(data)
        // clear arrays for 'play again'
        tilesArray = []
        p2YardArray = []
        p1YardArray = []
        townSquareArray = []

        if (activePlayers.length < 2) {
            activePlayers.push(data.playerName)
            console.log('active players:', activePlayers)
        }

        if (activePlayers.length < 2) {

            socket.broadcast.emit('waiting', { opponent: data.playerName }) // TODO  -  handle this on client side
        } else {
            // both players ready, create arrays and send to browser
            for (let i = 1; i <= 6; i++) {
                for (let j = i; j <= 6; j++) {
                    tilesArray.push([i, j])
                }
            }

            currentRoll = rollDice()

            let shuffledArray = shuffle(tilesArray)
            townSquareArray = [...shuffledArray]
            io.sockets.emit('tileArrays', { townSquareArray, p2YardArray, p1YardArray, currentRoll })
            console.log('tilesarray sent')
        }
    })

    socket.on('correct', data => {
        // update arrays and send to browser along with new dice roll
        console.log(data)
        let originatingArray = data.whereFound === 'town-square' ? townSquareArray : data.whereFound === 'p1-yard' ? p1YardArray : p2YardArray
        let destinationArray = data.playerName === activePlayers[0] ? p1YardArray : p2YardArray
        updateArrays(originatingArray, destinationArray)
        currentRoll = rollDice()
        io.sockets.emit('tileArrays', { townSquareArray, p2YardArray, p1YardArray, currentRoll })
    })

    socket.on('gameOver', async () => {

        await io.sockets.emit('finalScore', {
            p1Name: activePlayers[0],
            p1Score: p1YardArray.length,
            p2Name: activePlayers[1],
            p2Score: p2YardArray.length
        })
        //clear active players so 'play again' reqs both players to join before start
        setTimeout(() => { activePlayers = [] }, 500)
    })
    // bottom of socket connection **************************************
})

// functions

function shuffle(array) { // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));  //<- semi-colon required here so both lines not read as one
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

function updateArrays(arrFrom, arrTo) {
    let removedElement
    arrFrom.forEach((el, idx) => {
        if ((el[0] === currentRoll[0] && el[1] === currentRoll[1])
            ||
            (el[1] === currentRoll[0] && el[0] === currentRoll[1])) {

            removedElement = arrFrom.splice(idx, 1)
            console.log({ removedElement })
            arrTo.push(removedElement[0])
        }
    })
}


const rollDie = () => Math.floor(Math.random() * 6) + 1

const rollDice = () => [rollDie(), rollDie()]


