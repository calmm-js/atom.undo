import * as R from 'ramda'
import Atom from 'kefir.atom'
import {Observable, combine} from 'kefir'

import makeUndo from '../dist/atom.undo.cjs'

const Undo = value => makeUndo({value, Atom})

function show(x) {
  switch (typeof x) {
    case 'string':
    case 'object':
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

const toExpr = f =>
  f
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/^\s*function\s*\(\s*\)\s*{\s*(return\s*)?/, '')
    .replace(/\s*;?\s*}\s*$/, '')
    .replace(/function\s*(\([a-zA-Z]*\))\s*/g, '$1 => ')
    .replace(/{\s*return\s*([^{;]+)\s*;\s*}/g, '$1')
    .replace(/\(([a-zA-Z0-9_]+)\) =>/g, '$1 =>')

const stateOf = x => combine([x, x.undo.has, x.redo.has, x.initial])

const testEq = (expect, thunk) =>
  it(`${toExpr(thunk)} => ${show(expect)}`, done => {
    const actual = thunk()
    const check = actual => {
      if (!R.equals(actual, expect)) {
        done(Error(`Expected: ${show(expect)}, actual: ${show(actual)}`))
      } else {
        done()
      }
    }
    if (actual instanceof Observable) {
      actual.take(1).onValue(check)
    } else {
      check(actual)
    }
  })

describe('undo-redo', () => {
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    return stateOf(x)
  })
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    x.redo()
    return stateOf(x)
  })
  testEq(['b', true, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    return stateOf(x)
  })
  testEq(['c', false, false, 'c'], () => {
    const x = Undo('a')
    x.set('b')
    x.set('c')
    x.undo()
    x.reset('c')
    return stateOf(x)
  })
  testEq(['a', false, true, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.undo()
    return stateOf(x)
  })
  testEq(['b', true, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.undo()
    x.redo()
    return stateOf(x)
  })
  testEq(['c', true, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.undo()
    x.set('c')
    return stateOf(x)
  })
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    x.undo()
    return stateOf(x)
  })
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    x.revert()
    return stateOf(x)
  })
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.revert()
    return stateOf(x)
  })
  testEq(['a', false, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.set('c')
    x.revert()
    return stateOf(x)
  })
  testEq(['b', true, false, 'a'], () => {
    const x = Undo('a')
    x.set('b')
    x.revert()
    x.set('b')
    return stateOf(x)
  })
})
