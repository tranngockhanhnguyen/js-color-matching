import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import {
  getColorElementList,
  getColorListElement,
  getInactiveColorElementListt,
  getPlayAgainButton,
} from './selectors.js'
import {
  createTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setBackgroundColor,
  setTimerText,
  showPlayAgainButton,
} from './utils.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
const timer = createTimer({
  seconds: GAME_TIME,
  onChange: handleTimerChange,
  onFinish: handleTimerFinished,
})

function handleTimerChange(seconds) {
  const fullSeconds = `0${seconds}s`.slice(-3)
  setTimerText(fullSeconds)
}

function handleTimerFinished() {
  gameStatus = GAME_STATUS.FINISHED
  setTimerText('YOU LOSE 😭')
  showPlayAgainButton()
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click
function handleColorClick(liElement) {
  const shouldBlocking = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElement.classList.contains('active')
  if (!liElement || isClicked || shouldBlocking) return

  // show color for clicked cell
  liElement.classList.add('active')

  // save clicked cell into selections
  selections.push(liElement)
  if (selections.length < 2) return

  // check match
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor
  if (isMatch) {
    // set color for background
    setBackgroundColor(firstColor)

    // check win
    const isWin = getInactiveColorElementListt().length === 0
    if (isWin) {
      timer.clear()
      setTimerText('YOU WIN 🎉')
      showPlayAgainButton()

      gameStatus = GAME_STATUS.FINISHED
    }

    // reset selections for the next turn
    selections = []
    return
  }

  // in case not match
  // remove active class for 2 li elements
  gameStatus = GAME_STATUS.BLOCKING
  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')

    gameStatus = GAME_STATUS.PLAYING

    // reset selections for the next turn
    selections = []
  }, 500)
}

function attachClickForColorElement() {
  // event delegation
  const ulElement = getColorListElement()
  if (ulElement)
    ulElement.addEventListener('click', (event) => {
      if (event.target.tagName !== 'LI') return

      handleColorClick(event.target)
    })
}

function initColors() {
  // ramdon 8 pairs of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT)

  // bind to li > div.overlay
  const liList = getColorElementList()
  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index]

    const overlayElement = liElement.querySelector('.overlay')
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index]
  })
}

function resetGame() {
  // reset global vars
  selections = []
  gameStatus = GAME_STATUS.PLAYING

  // reset DOM elements
  // hide play again button
  hidePlayAgainButton()

  // clear 'YOU WIN' or 'YOU LOSE'
  setTimerText('')

  // remove active class from li element
  const liList = getColorElementList()
  for (const liElement of liList) {
    liElement.classList.remove('active')
  }

  // re-generate new colors
  initColors()

  // reset timer
  startTimer()
}

function attachClickForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (playAgainButton) playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
  timer.start()
}

// Main
;(() => {
  initColors()
  attachClickForColorElement()
  attachClickForPlayAgainButton()
  startTimer()
})()
