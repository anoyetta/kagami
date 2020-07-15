import jobcode from '../resources/jobicons'

let primaryCharacter = {
  charID: -1,
  charName: 'kagami',
  petID: -1,
  petName: '',
}
const castingQueue = []
let lastTimestamp = -1;
let lastActionID = -1;

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
  7481, // 月光
  7482, // 花車
]
let gauge
const wyrmWaveCount = 0;

const updatePet = (logCode, logParameter) => {
  const summoned = logCode === '03'
  const [
    charID, // '1024fab4'
    charName, // 'ガルーダ・エギ'
    jobcode, // '1c'
    level, // '50'
    ownerID, // '1024fab4'
    whatisthis, // i dun no
    world, // 'Asura'
    charCode, // ifrit 1402 titan 1403 ...
  ] = logParameter
  // [7] ifrit 1402 titan 1403 garuda 1404? eos 1398 selene 1399 seraphim 8227
  // drk parse(33321) mch parse(8230)
  if (parseInt(ownerID, 16) === primaryCharacter.charID) {
    if (summoned) {
      primaryCharacter.petID = parseInt(charID, 16)
      primaryCharacter.petName = charName
    // } else {
    //   primaryCharacter.petID = -1
    //   primaryCharacter.petName = ''
    }
    // 04가늦게와서 이렇게하면망한다
    console.log(`your pet is: ${primaryCharacter.petID}, ${primaryCharacter.petName} (code: ${charCode})`)
  }
}

const handleJobGauge = (logParameter) => {
  const [
    actor,
    gauge1,
    gauge2,
    gauge3,
    gauge4,
  ] = logParameter
  const jobCode = parseInt(gauge1, 16) & 0xFF
  // console.log(jobCode, gauge1, gauge2, gauge3, gauge4)
  gauge = parseInt(gauge2, 16) & 0xFF
  console.log(gauge)
}

const handleBuff = (logTimestamp, logParameter) => {
  const buff = {
    timestamp: logTimestamp,
    buffID: parseInt(logParameter[0], 16),
    buffName: logParameter[1],
    remainTime: logParameter[2],
    actorID: parseInt(logParameter[3], 16),
    actorName: logParameter[4],
    targetID: parseInt(logParameter[5], 16),
    targetName: logParameter[6],
  }
}

const handleInterrupt = (logTimestamp, logParameter) => {
  const inturruptedAction = {
    timestamp: logTimestamp,
    actionID: parseInt(logParameter[2], 16),
    actionName: logParameter[3],
    actorID: parseInt(logParameter[0], 16),
    actorName: logParameter[1],
  }
  if (inturruptedAction.actorID === primaryCharacter.charID) {
    castingQueue.forEach((castingAction) => {
      if (castingAction.icon.classList.contains('casting')) {
        const banIcon = document.createElement('i')
        banIcon.classList.add('fas', 'fa-ban')
        castingAction.icon.classList.remove('casting')
        castingAction.icon.classList.add('interrupted')
        castingAction.icon.appendChild(banIcon)
      }
    })
  }
  // castingQueue.filter((castingAction) => {
  //   if (castingAction.actorID === inturruptedAction.actorID) {
  //     const banIcon = document.createElement('i')
  //     banIcon.classList.add('fas', 'fa-ban')
  //     castingAction.icon.classList.remove('casting')
  //     castingAction.icon.classList.add('interrupted')
  //     castingAction.icon.appendChild(banIcon)
  //     return false
  //   }
  //   return true
  // })
}

const handleAction = async (logCode, logTimestamp, logParameter) => {
  console.log(logParameter)
  const action = {
    timestamp: logTimestamp,
    actionID: parseInt(logParameter[2], 16),
    actionName: logParameter[3],
    actorID: parseInt(logParameter[0], 16),
    actorName: logParameter[1],
    targetID: logParameter[4],
    targetName: logParameter[5],
    casting: logCode === '20'
  }

  // AoE action will make multiple log. no duplicate allowed
  if ((action.timestamp === lastTimestamp && action.actionID === lastActionID)) return

  // only parse primaryCharacter and pet action
  if (!(action.actorID === primaryCharacter.charID
  || action.actorID === primaryCharacter.petID)) return

  // no mount action
  if (action.actionID === 4) return

  // no invalid actionID
  if (action.actionID > 21000) {
    if (action.actionID > 0x4000000) {
      // mount icons: 59000 ~ 59399 (266 total)
      const mountID = action.actionID & 0xffffff
      console.log(await fetch(`https://xivapi.com/mount/${mountID}`)
        .then((res) => res.json())
        .then((json) => json.Icon))
    }
    else if (action.actionID > 0x2000000) {
      // item icons: (30999 total)
      let itemID = action.actionID & 0xffffff
      if (itemID > 1000000) itemID -= 1000000 // hq item
      console.log(await fetch(`https://xivapi.com/item/${itemID}`)
        .then((res) => res.json())
        .then((json) => json.Icon))
    }
    return
  }

  lastTimestamp = action.timestamp
  lastActionID = action.actionID

  if (action.actionID === 7 || action.actionID === 8) { // autoattack
    // console.log('평타요')
    const aaicon = document.createElement('span')
    aaicon.classList.add('aaicon')
    document.getElementById('playeraa').appendChild(aaicon)
    setTimeout(() => {
      document.getElementById('playeraa').removeChild(aaicon)
    }, 10000)
    return
  }
  const actionIcon = document.createElement('div')
  actionIcon.classList.add('icon', 'fetching')
  action.icon = actionIcon
  if (action.actorID === primaryCharacter.charID) {
    document.getElementById('playerskills').appendChild(actionIcon)
    setTimeout(() => {
      document.getElementById('playerskills').removeChild(actionIcon)
    }, 10000)
  }
  else if (action.actorID === primaryCharacter.petID) {
    document.getElementById('petskills').appendChild(actionIcon)
    setTimeout(() => {
      document.getElementById('petskills').removeChild(actionIcon)
    }, 10000)
  }

  const fetchingIcon = document.createElement('i')
  fetchingIcon.classList.add('fas', 'fa-spinner', 'fetching-icon')
  actionIcon.appendChild(fetchingIcon)
  // actionIcon.classList.add('icon-loading')
  const actionApi = await getActionApi(action.actionID)

  const actionTooltip = document.createElement('span')
  actionTooltip.innerHTML = action.actionName
  actionTooltip.classList.add('tooltip')
  actionIcon.appendChild(actionTooltip)

  // check positional
  const positional = checkPositional(action, logParameter)
  if (!positional) {
    const exclamationIcon = document.createElement('i')
    exclamationIcon.classList.add('fas', 'fa-exclamation')
    actionIcon.classList.add('mispositional')
    actionIcon.appendChild(exclamationIcon)

    const tooltipAdditionalText = document.createElement('div')
    tooltipAdditionalText.classList.add('additional')
    tooltipAdditionalText.innerHTML = '(方向指定ミス)'
    actionTooltip.appendChild(tooltipAdditionalText)
  }

  // check casting
  if (action.casting) {
    actionIcon.classList.add('casting')
    castingQueue.push(action)
  }
  else {
    castingQueue.forEach((castingAction) => {
      if (castingAction.actorID === action.actorID
        && castingAction.icon.classList.contains('casting')) {
        castingAction.icon.classList.add('casted')
      }
    })
  }

  // wyrmwavecount

  const image = new Image()
  image.src = `https://xivapi.com${actionApi.Icon}`
  actionIcon.classList.remove('fetching')
  actionIcon.appendChild(image)
  actionIcon.removeChild(fetchingIcon)
}

const checkPositional = (action, logParameter) => {
  if (monkPositionals.includes(action.actionID)) {
    // monk rear/flank check
    return logParameter.slice(8, 13).includes('1B')
  }
  if (dragoonPositionals.includes(action.actionID)) {
    // dragoon rear/flank check
    const succeedCode = action.actionID === 88 ? '11B' : '1B' // 桜花は11Bにコードが変わる
    return logParameter.slice(12, 15).includes(succeedCode)
  }
  if (ninjaPositionals.includes(action.actionID)) {
    // ninja rear/flank check
    const succeedCode = '11B'
    return logParameter.slice(12, 15).includes(succeedCode)
  }
  if (action.actionID === 2258) {
    // だまし討ち
    const succeedCode = '1E71' // 1E710003 1E710203 1E710303
    // failedCode: 00710003 00710203
    return logParameter[6].contains(succeedCode)
  }
  // TODO: samurai positional check
  // if (samuraiActions.includes(action.actionID)) {
  //   // samurai rear/flank check by kenki gauge up
  //   // const kenki = gauge
  //   // let updatedKenki = kenki
  //   // const getUpdatedKenki = () => {
  //   //   if(kenki === updatedKenki) {
  //   //     setTimeout(getUpdatedKenki, 50)
  //   //     console.log(kenki, updatedKenki)
  //   //     return
  //   //   }
  //   //   updatedKenki = gauge

  //   //   console.log(kenki, updatedKenki)
  //   //   console.log(action)
  //   // }
  //   // getUpdatedKenki()
  // }

  return true
}
const getActionApi = async (actionID) => fetch(`https://xivapi.com/Action/${actionID}`)
  .then((res) => res.json())
  // .then((json) => {
  //   // const src = `https://xivapi.com${json.Icon}`
  //   console.log(json)
  //   return json
  // })

const parseLogLine = (logSplit) => {
  const [
    logCode,
    logTimestamp,
    ...logParameter
  ] = logSplit
  switch (logCode) {
  case '00': {
    // console.log(logCode, logTimeStamp, logParameter)
    break
  }
  case '01': {
    // new zone
    // logParameter[1] : zone name
    break
  }
  case '02': {
    // whats this?
    // ["1024fab4", "Ram Toshiya", "5494139e55eca005aab352afd0656920"]
    console.log(logCode, logTimestamp, logParameter)
    break
  }
  // {
  //   // new character?
  //   // console.log(logCode, logTimestamp, logParameter)
  //   updatePet(logParameter)
  //   break
  // }
  case '03':
  case '04': {
    // unsubscribe character?
    // console.log(logCode, logTimestamp, logParameter)
    updatePet(logCode, logParameter)
    break
  }
  case '11': {
    // ["7", "102893a7", "10073f84", "1024fab4", "10264aea", "10025a1b", "10283272", "10239cfb", "fcaca6caa66d74bab6d833307d2222aa"]
    // ["6", "10073f84", "1024fab4", "10264aea", "10025a1b", "10283272", "10239cfb", "a2cee72a1831d4bca2e76bbc427b6fa1"]
    // ["0", "", "029116646da21a70b1515b3b528970f2"] ???????
    break
  }
  case '12': {
    // char info: jobcode, str, dex, vit, int, mnd, stats
    // console.log(logCode, logTimestamp, logParameter)
    break
  }
  case '20': // start casting
  case '21': // action
  case '22': {
    // hits on AoE action
    handleAction(logCode, logTimestamp, logParameter)
    break
  }
  case '23': {
    // cancel casting
    handleInterrupt(logTimestamp, logParameter)
    break
  }
  case '24': {
    // DoT / HoT tick
    break
  }
  case '25': {
    // death
    // console.log(logCode, logTimestamp, logParameter)
    break
  }
  case '26': {
    // get buffs
    handleBuff(logTimestamp, logParameter)
    break
  }
  case '27': {
    // ["10025A1B", "Minerva Swan", "0000", "0000", "0014", "0000", "0000", "0000", "", "e4351091ce019063f96af05bffa820bf"]
    console.log(logCode, logTimestamp, logParameter)
    break
  }
  case '30': {
    // buff ends
    handleBuff(logTimestamp, logParameter)
    break
  }
  case '31': {
    // job gauge
    // handleJobGauge(logParameter)
    break
  }
  case '33': {
    // ["80037569", "80000004", "A8B", "00", "00", "00", "deb0f7a8c61281c53c3e6885eaf69ad8"]
    console.log(logCode, logTimestamp, logParameter)
    break
  }
  case '34': {
    // pet logs? (does not includes owner info and baha/pheonix)
    break
  }
  case '35': {
    // ["1024FAB4", "Ram Toshiya", "4000B957", "バハムート・プライム", "0000", "0000", "0004", "4000B957", "000F", "0719", "", "0f66487698da4e739748d9697913ffc3"]
    // ["4000BBFE", "ファイアホーン", "102893A7", "Noie Traryd", "6A8B", "0000", "0005", "102893A7", "000F", "7FA6", "", "9e7af6150c16be1650b0b5f7b49b4fe1"]
    console.log(logCode, logTimestamp, logParameter)
    break
  }
  case '36':
  case '37':
  case '38':
  case '39': {
    // status/existence related logs?
    break
  }
  case '251': {
    // connection logs
    break
  }
  default: {
    console.log(logCode, logTimestamp, logParameter)
  }
  }
}

const changePrimaryPlayer = (message) => {
  // const {
  //   charID, charName
  // } = message
  // console.log(charID, charName)
  primaryCharacter = {
    ...primaryCharacter,
    ...message,
  }
  console.log(primaryCharacter)
}

const updateCombatData = (message) => {
  // combatData field info: http://kuroneko-mikan.hatenablog.com/entry/2015/04/23/200037
  const {
    Encounter, Combatant, isActive
  } = message
  // console.log(Encounter, Combatant, isActive)
  const { duration, title, } = Encounter

  // update header infos
  const myjobcode = jobcode.indexOf(Combatant.YOU.Job.toUpperCase())

  const dps = Combatant.YOU.ENCDPS.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rdps = Encounter.ENCDPS.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dpercent = Combatant.YOU['damage%']
  document.getElementById('duration').innerHTML = duration
  document.getElementById('title').innerHTML = title.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  document.getElementById('info').innerHTML = `${dps} DPS / ${rdps} RDPS  (${dpercent})`

  // todo: re-render가 필요없을경우 생략해야함~
  const icon = document.getElementById('jobicon')
  icon.classList.remove(...icon.classList)
  icon.classList.add('jobicon', `jobicon-${myjobcode !== -1 ? myjobcode : '00'}`)
}

const parseMessage = (event) => {
  const {
    type, message,
  } = event
  switch (type) {
  case 'LogLine': {
    parseLogLine(message)
    break
  }
  case 'ChangePrimaryPlayer': {
    changePrimaryPlayer(message)
    break
  }
  case 'CombatData': {
    updateCombatData(message)
    break
  }
  default: {}
  }
}

export default parseMessage
