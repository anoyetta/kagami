import actionResource from '../resources/actions/actions.json'
import classjob from '../resources/classjob/classjob.json'

const info = document.getElementById('info')

let lastTimestamp = -1;
let lastActionID = -1;
let lastCastAction = null;
let positionalActionCount = 0
let mispositionalCount = 0
let castingCount = 0
let interruptedCount = 0
let petGhostedActionCount = 0

let displayTime = 10
let scale = 1
const samuraiResources = {
  action: null,
  checkPositional: false,
  kenki: 0
}

// job specific values
const monkPositionals = [
  53, // 連撃
  56, // 崩拳
  54, // 正拳突き
  74, // 双竜脚
  61, // 双掌打
  66, // 破砕拳
]
const dragoonPositionals = [
  88,
  79,
  3554,
  3556,
]
const ninjaPositionals = [
  2255, // 旋風刃
  3563, // 強甲破点突
]
const samuraiPositionals = [
  7481, // 月光 23D
  7482, // 花車 43D
]

export const cleanup = () => {
  lastTimestamp = -1
  lastActionID = -1
  lastCastAction = null
  positionalActionCount = 0
  mispositionalCount = 0
  castingCount = 0
  interruptedCount = 0
  petGhostedActionCount = 0
}
const updateInfo = (classjob) => {
  const mispositional = (param) => {
    if (param) {
      document.getElementById('mispositional').classList.remove('hide')
      document.getElementById('mispositional').innerHTML = `mispositional: ${mispositionalCount}/${positionalActionCount}`
    }
    else document.getElementById('mispositional').classList.add('hide')
  }
  // info
  switch (classjob) {
  case 'PGL':
  case 'LNC':
  case 'MNK':
  case 'DRG':
  case 'ROG':
  case 'NIN': {
    // positional
    mispositional(true)
    break
  }
  case 'CNJ':
  case 'THM':
  case 'PLD':
  case 'WHM':
  case 'BLM':
  case 'AST':
  case 'RDM':
  case 'BLU': {
    // casting
    mispositional(false)
    break
  }
  case 'ACN':
  case 'SMN':
  case 'SCH': {
    // casting, ghosted pet actions
    mispositional(false)
    break
  }
  case 'SAM': {
    // positional, casting
    mispositional(true)
    break
  }
  case 'ADV':
  case 'GLA':
  case 'MRD':
  case 'ARC':
  case 'CRP':
  case 'BSM':
  case 'ARM':
  case 'GSM':
  case 'LTW':
  case 'ALC':
  case 'CUL':
  case 'MIN':
  case 'BOT':
  case 'FSH':
  case 'WAR':
  case 'BRD':
  case 'MCH':
  case 'DRK':
  case 'GNB':
  case 'DNC':
  default: {
    mispositional(false)
  }
  }
}
export const getPositionalCounts = () => ({ positionalActionCount, mispositionalCount })
export const updateSpeed = (value) => { displayTime = value }
export const updateScale = (value) => { scale = value }

const appendErrorIcon = (icon, errorClass) => {
  icon.classList.add(errorClass)
  const iconImage = icon.firstChild
  // console.log(icon.classList)

  if (iconImage.classList.contains('casting')) {
    iconImage.style.backgroundColor = 'transparent';
  }

  const errorIcon = document.createElement('i')
  errorIcon.classList.add('material-icons', 'error-icon')
  errorIcon.innerHTML = 'error'
  icon.appendChild(errorIcon)
}

export const handleInterrupt = (primaryCharacter, logParameter, active) => {
  const actionID = parseInt(logParameter[2], 16)
  const inturruptedAction = {
    actionID,
    // actionName: logParameter[3],
    actorID: parseInt(logParameter[0], 16),
    classes: ['interrupted'],
    castTime: 0,
    Image: '',
    CooldownGroup: [0, 0],
    ...actionResource[actionID],
    // actorName: logParameter[1],
  }

  if (inturruptedAction.actorID === primaryCharacter.charID
    && inturruptedAction.actorID === lastCastAction.actorID) {
    interruptedCount++
    appendErrorIcon(lastCastAction.icon, 'interrupted')
    if (active) updateInfo(primaryCharacter.classjob)
  }
}

export const handleJobGauge = (primaryCharacter, logParameter, active) => {
  if (parseInt(logParameter[0], 16) === primaryCharacter.charID) {
    if (logParameter[1] === '22') { // sam
      const kenki = parseInt(logParameter[2], 16) & 0xFF
      if (samuraiResources.checkPositional) {
        if (kenki - samuraiResources.kenki !== 10) {
          // samurai mispositional
          appendErrorIcon(samuraiResources.action.icon, 'mispositional')
          mispositionalCount++
          if (active) updateInfo(primaryCharacter.classjob)
        }
        samuraiResources.checkPositional = false
      }
      samuraiResources.kenki = kenki
    }
  }
}

const checkPositional = (action, logParameter) => {
  if (monkPositionals.includes(action.actionID)) {
    // monk rear/flank check
    positionalActionCount++

    return logParameter.slice(8, 13).includes('1B')
  }
  if (dragoonPositionals.includes(action.actionID)) {
    // dragoon rear/flank check
    positionalActionCount++

    const succeedCode = action.actionID === 88 ? '11B' : '1B' // 桜花は11Bにコードが変わる
    return logParameter.slice(8, 15).includes(succeedCode)
  }
  if (ninjaPositionals.includes(action.actionID)) {
    // ninja rear/flank check
    positionalActionCount++

    const succeedCode = '11B'
    return logParameter.slice(12, 15).includes(succeedCode)
  }
  if (action.actionID === 2258) {
    // だまし討ち
    positionalActionCount++

    const succeedCode = '1E71' // 1E710003 1E710203 1E710303
    // failedCode: 00710003 00710203
    return logParameter[6].includes(succeedCode)
  }
  if (samuraiPositionals.includes(action.actionID)) {
    // samurai rear/flank check
    positionalActionCount++
    const comboCode = '4F71' // 4F710*03
    console.log(logParameter)
    if (logParameter[6].includes(comboCode)) { // combo bonus.
      // eval kenki
      samuraiResources.action = action
      samuraiResources.checkPositional = true
      return true
      // this will always return true, continue check on handleJobGauge()
    }
    return false
  }

  return true
}

const showActionIcon = (action) => {
  const icon = document.createElement('div')
  icon.classList.add('icon')

  const fetchingIcon = document.createElement('div')
  fetchingIcon.classList.add('spinner', 'flex-row')
  for (let i = 1; i <= 3; i++) {
    const circle = document.createElement('div')
    circle.classList.add(`bounce${i}`)
    fetchingIcon.appendChild(circle)
  }
  icon.appendChild(fetchingIcon)

  const image = new Image()
  image.src = `https://xivapi.com${action.Image}`
  image.classList.add(...action.classes)
  icon.appendChild(image)
  image.addEventListener('load', () => {
    icon.removeChild(fetchingIcon)
  })

  if (action.classes.includes('mispositional')) {
    appendErrorIcon(icon, 'mispositional')
  }
  let castingBarLength = 0
  if (action.castTime !== 0) {
    castingBarLength = (action.castTime / (displayTime * scale))
    image.style.paddingRight = `${castingBarLength}vw`
  }
  icon.animate(
    {
      right: [`-${castingBarLength}vw`, '100%'],
    },
    {
      duration: displayTime * 1000 + action.castTime * 10,
      iterations: 1,
    }
  )

  return icon
}

const autoAttack = () => {
  const icon = document.createElement('div')
  icon.classList.add('icon')
  const image = new Image()
  image.src = 'https://xivapi.com/i/000000/000101.png'
  icon.appendChild(image)
  icon.animate(
    {
      right: [0, '100%'],
    },
    {
      duration: displayTime * 1000,
      iterations: 1,
    }
  )

  document.getElementById('auto-attack-window').appendChild(icon)
  setTimeout(() => {
    try { document.getElementById('auto-attack-window').removeChild(icon) }
    catch {} // ignore error
  }, displayTime * 1000)
}

export const handleAction = async (primaryCharacter, logCode, logTimestamp, logParameter, active) => {
  let actionWindow = null
  const actionID = parseInt(logParameter[2], 16)
  const action = {
    timestamp: logTimestamp,
    actionID,
    actionName: logParameter[3],
    actorID: parseInt(logParameter[0], 16),
    // actorName: logParameter[1],
    // targetID: logParameter[4],
    // targetName: logParameter[5],
    classes: [],
    castTime: logCode === '20' ? Math.ceil(parseFloat(logParameter[6]) * 100) - 65 : 0,
    icon: null,
    Image: '',
    CooldownGroup: [0, 0],
    ...actionResource[actionID],
  }

  // AoE action will make multiple logs and no duplicate allowed
  if ((action.timestamp === lastTimestamp && action.actionID === lastActionID)) return

  lastTimestamp = action.timestamp
  lastActionID = action.actionID

  // only parse primaryCharacter and pet action
  if (action.actorID === primaryCharacter.charID) {
    actionWindow = document.getElementById('player-actions-window')
  }
  else if (action.actorID === primaryCharacter.petID) {
    actionWindow = document.getElementById('pet-actions-window')
  }
  else return

  // auto-attack
  if (actionID === 7 || actionID === 8) {
    autoAttack()
    return
  }

  // check invalid actionID
  if (actionID > 21000) {
    if (actionID > 0x4000000) {
      // mount icons: 59000 ~ 59399 (266 total)
      const mountID = action.actionID & 0xffffff
      action.Image = (await fetch(`https://xivapi.com/mount/${mountID}`)
        .then((res) => res.json())
        .then((json) => json.IconSmall))
    }
    else if (actionID > 0x2000000) {
      // item icons: (30999 total)
      let itemID = actionID & 0xffffff

      // hq item. currently xivapi is not supporting hq item/icons
      if (itemID > 1000000) itemID -= 1000000

      action.Image = (await fetch(`https://xivapi.com/item/${itemID}`)
        .then((res) => res.json())
        .then((json) => json.Icon))
    }
  }
  else {
    // add classes
    const casting = logCode === '20'
    const positional = checkPositional(action, logParameter)
    const gcd = action.CooldownGroup.includes(58)
    if (casting) {
      castingCount++
      action.classes.push('casting')
      lastCastAction = action
    }
    if (!positional) {
      action.classes.push('mispositional')
      mispositionalCount++
    }
    if (gcd) action.classes.push('gcd')
    else action.classes.push('ogcd')
  }

  const icon = showActionIcon(action)

  action.icon = icon
  actionWindow.appendChild(icon)
  setTimeout(() => {
    try { actionWindow.removeChild(icon) }
    catch {} // ignore error
  }, displayTime * 1000 + action.castTime * 100)
  if (active) updateInfo(primaryCharacter.classjob)
}
