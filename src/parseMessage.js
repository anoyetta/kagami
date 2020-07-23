import jobcode from '../resources/jobicons'
import { handleAction, handleInterrupt } from './handleAction';

let primaryCharacter = {
  charID: -1,
  charName: 'kagami',
  petID: -1,
  petName: '',
}

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
  case '22': // multi-target action
  {
    handleAction(primaryCharacter, logCode, logTimestamp, logParameter)
    break
  }
  case '23': {
    // cancel casting
    handleInterrupt(primaryCharacter, logParameter)
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
  case '33': { // no idea about this
    // ["80037569", "80000004", "A8B", "00", "00", "00", "deb0f7a8c61281c53c3e6885eaf69ad8"]
    // ["8003756C", "40000007", "00", "01", "00", "00", "6fa67b88b7299d622ac8341fbe1d9c13"]
    // ["8003756C", "80000004", "13EB", "00", "00", "00", "7976c4ec041735f73b665ae81134f0aa"]
    // console.log(logCode, logTimestamp, logParameter)
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

  const dps = Combatant.YOU !== undefined ? Combatant.YOU.ENCDPS.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : 0
  const rdps = Encounter.ENCDPS.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dpercent = Combatant.YOU['damage%']
  document.getElementById('duration').innerHTML = duration
  // document.getElementById('title').innerHTML = title.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  document.getElementById('title').innerHTML = `${dps} DPS / ${rdps} RDPS  (${dpercent})`

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
