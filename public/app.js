// Make connection
const socket = io()

const overlay = document.querySelector('.overlay')
const nameInput = document.querySelector('#user-name')
const joinButton = document.querySelector('.join-btn')
const waiting = document.querySelector('.waiting')

const tileSelection = document.querySelectorAll('.tile-selection > button')

const gameInfo = document.querySelector('i')
const gameInfoPanel = document.querySelector('.game-info-panel')

const clock = document.querySelector('.clock')
const disp = document.querySelector('.dice-display')

const areas = document.querySelectorAll('.area')
const p2Yard = document.querySelector('.p2-tiles-container')
const p1Yard = document.querySelector('.p1-tiles-container')
const townSquare = document.querySelector('.town-square')


let playerName = ''
let timerOn = false
let dice
let tileStyle = 'images'

let gameDuration = 130

for (let selection of tileSelection) {
    selection.addEventListener('click', () => {
        console.log(selection.id)
        tileStyle = selection.id
    })
}

// TODO - names must be unique.  get back end to check names are different and send alert second player if so
joinButton.addEventListener('click', handleJoinClick)

gameInfo.addEventListener('click', () => {
    gameInfoPanel.classList.toggle('hidden') // better to do a transition in from below or somthing, or toggle in from side??
})

socket.on('waiting', data => {
    waiting.innerText = `${data.opponent} is ready to play!`
})

socket.on('tileArrays', data => {
    console.log(data)
    overlay.classList.add('hidden')
    dice = data.currentRoll
    for (let area of areas) area.innerHTML = ''
    makeTiles(data.townSquareArray, townSquare, tileStyle)
    makeTiles(data.p2YardArray, p2Yard, tileStyle)
    makeTiles(data.p1YardArray, p1Yard, tileStyle)

    // display dice roll  TODO - make dice more prominant
    disp.innerHTML = `
    <span>${dice[0]}</span><span>${dice[1]}</span> 
    `
    disp.children[0].classList.add(`${tileStyle}-${dice[0]}`)
    disp.children[1].classList.add(`${tileStyle}-${dice[1]}`)

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
    if (!timerOn) timer(gameDuration)
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
/*
to choose tile styles - 
    option on overlay for first player to select (add a default if no selection)
    eg nums, colors, images

            whatever type is chosen is passed  into makeTiles() as 3rd arg.  this is concatinated with its tileNum set as a class
            eg colors-3

            .colors-3 sets background color in css
*/
function makeTiles(array, area, tileStyle) {

    for (let tileNums of array) {
        let tile = document.createElement('div')
        tile.classList.add('tile')
        tile.dataset.value = tileNums
        tile.innerHTML = `
            <div class="tileSection">${tileNums[0]}</div>
            <div class="tileSection">${tileNums[1]}</div>
        `
        // add classes for tile styling
        tile.children[0].classList.add(`${tileStyle}-${tileNums[0]}`)
        tile.children[1].classList.add(`${tileStyle}-${tileNums[1]}`)
        console.dir(tile)
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
<h1>SAMOAN TENNIS</h1>
<section class="begin-game-container">
    <div class="start-container">
        <input type="text" id="user-name" placeholder="enter name">
        <button class="join-btn">PLAY</button>
        <div class="waiting"></div>
    </div>

</section>

<i class="fa-solid fa-circle-info"></i>

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