/*things we need:
    dice roller
        simple Math.random()*6
        later icons/images can be used in place of numbers

    way to create 21 tiles


    3 'places' - town square, player 1's yard, player 2's yard
        html and corrosponding JS array

    way for tiles in town square to be positioned randomly

    way to move tiles between areas

    way to track scores

    way to allow 2 player (sockets)


    create pair in array in DOM.
        add click listener
            send to server
            update arrays
            update DOM
            run score/win checker()


*/
const disp = document.querySelector('.display')
const rollButton = document.querySelector('#roll-dice')
const startBtn = document.querySelector('#start-game')

const myYard = document.querySelector('.my-yard')
const oppYard = document.querySelector('.opponants-yard')
const townSquare = document.querySelector('.town-square')

let tilesArray = []

let myYardArray = []
let oppYardArray = []
let townSquareArray = []

let currentRoll

const makeTiles = () => {
    for (let i = 1; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            tilesArray.push([i, j])
        }
    }

    let shuffledArray = shuffle(tilesArray)
    townSquareArray = [...shuffledArray]

    for (let tileNums of shuffledArray) {
        console.log(tileNums)
        let tile = document.createElement('div')
        tile.classList.add('tile')
        tile.dataset.value = tileNums
        tile.innerHTML = `
            <div class="tileSection">${tileNums[0]}</div>
            <div class="tileSection">${tileNums[1]}</div>
        `
        townSquare.appendChild(tile)
    }

    let allTiles = document.querySelectorAll('.tile')
    for (let tile of allTiles) {
        tile.addEventListener('click', () => {

            if ((currentRoll[0] === parseInt(tile.dataset.value[0]) && currentRoll[1] === parseInt(tile.dataset.value[2]))
                ||
                (currentRoll[0] === parseInt(tile.dataset.value[2]) && currentRoll[1] === parseInt(tile.dataset.value[0]))) {

                // }

                // if (currentRoll.includes(parseInt(tile.dataset.value[0])) && currentRoll.includes(parseInt(tile.dataset.value[2]))) {
                // if tile matches curent roll
                let targetIdx
                let removedElement
                townSquareArray.forEach((el, idx) => {
                    if (el.includes(currentRoll[1]) && el.includes(currentRoll[0])) {
                        targetIdx = idx
                        removedElement = townSquareArray.splice(targetIdx, 1)
                    }
                })

                // TODO - do above for other arrays.  if its in ownYard do nothing, if oppYard move to ownYard

                console.log(removedElement)
                console.log(townSquareArray)

                tile.remove()

                myYardArray.push(removedElement)

                let movedTile = document.createElement('div')
                movedTile.classList.add('tile')
                movedTile.dataset.value = removedElement
                movedTile.innerHTML = `
                    <div class="tileSection">${removedElement[0]}</div>
                    <div class="tileSection">${removedElement[1]}</div>
                `
                myYard.appendChild(tile)
                // move tile to players yard (if not there already)
                //Element.remove() to remove from 1st area
                // create new element and append to appropriate area
                // remove tile array from former area array, add to new one

            }
        })
    }
}

const rollDie = () => Math.floor(Math.random() * 6) + 1

const rollDice = () => [rollDie(), rollDie()]

function shuffle(array) { // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));  //<- semi-colon required here so both lines not read as one
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

startBtn.addEventListener('click', () => {
    makeTiles()
})

rollButton.addEventListener('click', () => {
    currentRoll = rollDice()
    disp.innerHTML = `
    <p><span>${currentRoll[0]}</span><span>${currentRoll[1]}</span> 
`
})








