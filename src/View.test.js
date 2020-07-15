import { screen } from '@testing-library/dom'
import fs from 'fs'

const html = fs.readFileSync('../dist/index.html', 'utf8')

jest.dontMock('fs')

describe('button', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString()
  })
  afterEach(() => {
    jest.resetModules()
  })

  it('canvas exists', () => {
    expect(screen.getByLabelText('더 보기')).toBeTruthy()
  })
})
