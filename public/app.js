// Make connection
const socket = io()

const overlay = document.querySelector('.overlay')
const nameInput = document.querySelector('#user-name')
const joinButton = document.querySelector('.join-btn')
const waiting = document.querySelector('.waiting')

const clock = document.querySelector('.clock')
const disp = document.querySelector('.dice-display')

const areas = document.querySelectorAll('.area')
const p2Yard = document.querySelector('.p2-yard')
const p1Yard = document.querySelector('.p1-yard')
const townSquare = document.querySelector('.town-square')


let playerName = ''
let timerOn = false
let dice

// TODO - names must be unique.  get back end to check names are different and send alert second player if so
joinButton.addEventListener('click', handleJoinClick)

socket.on('waiting', data => {
    waiting.innerText = `${data.opponent} is ready to play!`
})

socket.on('tileArrays', data => {
    console.log(data)
    overlay.classList.add('hidden')
    dice = data.currentRoll
    for (let area of areas) area.innerHTML = ''
    makeTiles(data.townSquareArray, townSquare)
    makeTiles(data.p2YardArray, p2Yard)
    makeTiles(data.p1YardArray, p1Yard)

    // display dice roll  TODO - make dice more prominant
    disp.innerHTML = `
    <p><span>${dice[0]}</span><span>${dice[1]}</span> 
    `

    let allTiles = document.querySelectorAll('.tile')
    for (let tile of allTiles) {
        tile.addEventListener('click', () => {


            if ((dice[0] === parseInt(tile.dataset.value[0]) && dice[1] === parseInt(tile.dataset.value[2]))
                ||
                (dice[0] === parseInt(tile.dataset.value[2]) && dice[1] === parseInt(tile.dataset.value[0]))) {

                let whereFound = tile.parentNode.classList[1]

                socket.emit('correct', { playerName, dice, whereFound })
            }
        })
    }

    //start timer
    if (!timerOn) timer(2)
})

socket.on('finalScore', data => {
    console.log(data)
    overlay.classList.remove('hidden')
    overlay.innerHTML = gameOverHTML(data)

    const again = document.querySelector('.again')
    const quit = document.querySelector('.quit')

    again.addEventListener('click', () => {
        socket.emit('start', { playerName })
    })
    quit.addEventListener('click', () => {
        overlay.innerHTML = beginHTML
        // adding listener to new instance of joinButton
        document.querySelector('.join-btn').addEventListener('click', handleJoinClick)

    })
})
/*
TODO - on quit, the old names are retained, even when new ones are added.  figure out why.
*/
// ############ functions  #################

function handleJoinClick() {
    playerName = nameInput.value
    socket.emit('start', { playerName })
    waiting.innerText = 'waiting for another player...'
}



function shuffle(array) { // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));  //<- semi-colon required here so both lines not read as one
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

function makeTiles(array, area) {

    for (let tileNums of array) {
        let tile = document.createElement('div')
        tile.classList.add('tile')
        tile.dataset.value = tileNums
        tile.innerHTML = `
            <div class="tileSection">${tileNums[0]}</div>
            <div class="tileSection">${tileNums[1]}</div>
        `
        area.appendChild(tile)
    }

}

function timer(duration) {
    let count = duration
    timerOn = true
    let int = setInterval(() => {
        clock.innerHTML = `<h1>${count}</h1>`
        count--
        if (count === -1) {
            clearInterval(int)
            // end game
            socket.emit('gameOver', {})
            timerOn = false
        }
    }, 1000)
}



const compareScore = () => {
    console.log(`Player1: ${p1Yard.childNodes.length}, Player2: ${p2Yard.childNodes.length}`)
    let p1Score = p1Yard.childNodes.length
    let p2Score = p2Yard.childNodes.length

}

const gameOverHTML = (data) => {
    return `
    <div class="scores-container">
        <h1>Game Over!</h1>
        
        <h2>The scores were: </h2>
        
        <h3><strong>${data.p1Name}</strong> :${data.p1Score}</h3>
        <h3><strong>${data.p2Name}</strong> :${data.p2Score}</h3>
        
        <h1>${data.p1Score === data.p2Score ? 'nobody' : data.p1Score > data.p2Score ? data.p1Name : data.p2Name} wins!</h1>
        
        <button class="again">Play again</button>
        <button class="quit">Quit</button>
        <span class="waiting"></span>

    </div>
    
    `
}

const beginHTML = `
    <section class="begin-game-container">
        <div class="start-container">
            <input type="text" id="user-name" placeholder="enter name">
            <button class="join-btn">PLAY</button>
            <div class="waiting"></div>
        </div>
    </section>
`



/* TODO - add a clock, options to set game time.
    when time is up
        click listeners deactivated
        game-over event sent ot server
            server calculates winner / or just do in browser with numbr of nodes in each area?
    
    add some deays and animations/ transitions
    replace bnumbers with colours/symols/images..
        have options of what tiles to use
    
    get rid of old buttons
    make dice bigger - in middle?
    make all fit inside one screen!

    add chat window


*/