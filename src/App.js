import './styles/main.css'

import ACTListener from './ACTListener'
import parseMessage from './parseMessage'
import uiControl from './uiControl'
import initialSettings from '../resources/settings.json'

// const getLanguage = async () => {
//   const language = await callOverlayHandler({ call: 'getLanguage' })
//   console.log(language)
// }

const checkSettings = (settings) => {
  try {
    if (Object.keys(initialSettings).some((key) => {
      if (typeof settings[key] !== typeof initialSettings[key]) {
        return true
      }
      return false
    })) {
      console.warn('kagami: some of settings fields are invalid.')
      return false
    }
    return true
  }
  catch {
    // localStorage settings has error
    console.warn('kagami: some of settings fields are missing')
    return false
  }
}
let settings = JSON.parse(localStorage.getItem('kagami'))
const initializeSettings = () => {
  settings = initialSettings
  localStorage.clear()
  localStorage.setItem('kagami', JSON.stringify(initialSettings))
}
if (settings === null) {
  console.log('kagami: initialize settings.')
  initializeSettings()
}
else if (!checkSettings(settings)) {
  console.log('kagami: reset settings.')
  initializeSettings()
}

window.addEventListener('load', () => {
  uiControl(settings)
  ACTListener(parseMessage)
})
