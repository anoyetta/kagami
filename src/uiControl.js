const { changeSpeed, changeScale } = require('./handleAction');

const autoAttackWindow = document.getElementById('auto-attack-window')
const playerActionsWindow = document.getElementById('player-actions-window')
const petActionsWindow = document.getElementById('pet-actions-window')

let speed = 10
let scale = 1

module.exports = () => {
  document.getElementById('reset-encounter').addEventListener('click', () => {
    window.OverlayPluginApi.endEncounter();
  })
  document.getElementById('auto-attack-switch').addEventListener('click', (e) => {
    if (e.target.checked) { // show
      autoAttackWindow.style.display = 'inherit'
    }
    else { // hide
      autoAttackWindow.style.display = 'none'
    }
  })
  document.getElementById('pet-actions-switch').addEventListener('click', (e) => {
    if (e.target.checked) { // show
      petActionsWindow.style.display = 'inherit'
    }
    else { // hide
      petActionsWindow.style.display = 'none'
    }
  })
  document.getElementById('speed-form').addEventListener('change', (e) => {
    speed = parseInt(e.target.value, 10)
    autoAttackWindow.innerHTML = ''
    playerActionsWindow.innerHTML = ''
    petActionsWindow.innerHTML = ''
    changeSpeed(speed)
  })
  document.getElementById('scale-form').addEventListener('change', (e) => {
    scale = parseFloat(e.target.value)
    document.getElementById('skilldisplayer').style.zoom = scale

    autoAttackWindow.innerHTML = ''
    playerActionsWindow.innerHTML = ''
    petActionsWindow.innerHTML = ''
    changeScale(scale)
  })
}
