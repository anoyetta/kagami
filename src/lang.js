import dictionary from '../resources/lang.json'

let locale = 'EN'

export const setLanguage = (loc) => {
  if (!Object.keys(dictionary.lang).includes(loc)) return false
  locale = loc
  return true
}

export const lang = (key, loc) => {
  if (loc !== undefined) {
    return dictionary.map[key][loc]
  }
  return dictionary.map[key][locale]
}

export const updateUi = (loc) => {
  if (loc !== undefined) {
    if (Object.keys(dictionary.lang).include(loc)) {
      Object.keys(dictionary.element).forEach((key) => {
        document.getElementById(key).innerHTML = dictionary.element[key][loc]
      })
    }
  }
  else {
    Object.keys(dictionary.element).forEach((key) => {
      document.getElementById(key).innerHTML = dictionary.element[key][locale]
    })
  }
}
