import * as R                from "ramda"
import Atom                  from "kefir.atom"
import {Observable, combine} from "kefir"

import makeUndo from "../src/atom.undo"

const Undo = value => makeUndo({value, Atom})

function show(x) {
  switch (typeof x) {
  case "string":
  case "object":
    return JSON.stringify(x)
  default:
    return `${x}`
  }
}

const stateOf = x => combine([x, x.undo.has, x.redo.has, x.initial])

const testEq = (expr, expect) => it(`${expr} => ${show(expect)}`, () => {
  const actual = eval(`(Undo, stateOf) => ${expr}`)(Undo, stateOf)
  const check = actual => {
    if (!R.equals(actual, expect))
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
  }
  if (actual instanceof Observable)
    actual.take(1).onValue(check)
  else
    check(actual)
})

describe("undo-redo", () => {
  testEq('{var x = Undo("a"); return stateOf(x)}', ["a", false, false, "a"])
  testEq('{var x = Undo("a"); x.redo(); return stateOf(x)}', ["a", false, false, "a"])
  testEq('{var x = Undo("a"); x.set("b"); return stateOf(x)}', ["b", true, false, "a"])
  testEq('{var x = Undo("a"); x.set("b"); x.set("c"); x.undo(); x.reset("c"); return stateOf(x)}', ["c", false, false, "c"])
  testEq('{var x = Undo("a"); x.set("b"); x.undo(); return stateOf(x)}', ["a", false, true, "a"])
  testEq('{var x = Undo("a"); x.set("b"); x.undo(); x.redo(); return stateOf(x)}', ["b", true, false, "a"])
  testEq('{var x = Undo("a"); x.set("b"); x.undo(); x.set("c"); return stateOf(x)}', ["c", true, false, "a"])
  testEq('{var x = Undo("a"); x.undo(); return stateOf(x)}', ["a", false, false, "a"])
})
