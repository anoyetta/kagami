import './styles/main.css'

import ACTListener from './ACTListener'
import parseMessage from './parseMessage'

// const initialRender = () => {

// }

// const updateChart = () => {
//   // console.log(dps)
//   // console.log(chart)
// }

// window.addEventListener('load', initialRender)
// window.addEventListener('onOverlayDataUpdate', (e) => {
//   console.log('이게뭐야', e)
// })
const getLanguage = async () => {
  const language = await callOverlayHandler({ call: 'getLanguage' })
  console.log(language)
}
ACTListener(parseMessage)
getLanguage()

document.getElementById('reset-encounter').addEventListener('click', () => {
  window.OverlayPluginApi.endEncounter();
})
document.getElementById('auto-attack-switch').addEventListener('click', (e) => {
  if (e.target.checked) { // show
    document.getElementById('auto-attack-window').style.display = 'inherit'
  }
  else { // hide
    document.getElementById('auto-attack-window').style.display = 'none'
  }
})
document.getElementById('pet-actions-switch').addEventListener('click', (e) => {
  if (e.target.checked) { // show
    document.getElementById('pet-actions-window').style.display = 'inherit'
  }
  else { // hide
    document.getElementById('pet-actions-window').style.display = 'none'
  }
})
