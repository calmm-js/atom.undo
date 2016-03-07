import R from "ramda"

const mapNoDups = (x2y, xs) => xs.map(x2y).skipDuplicates(R.equals)

const mk = (time, values) => ({time, index: 0, values})
const init = value => mk(Date.now(), [value])
const undoCount = revs => revs.values.length - revs.index - 1
const redoCount = revs => revs.index

export const Replace = {
  never: () => false,
  youngerThan: ms => ({time, old}) => time - old.time < ms
}

export default ({shouldReplace = Replace.never, value, Atom}) => {
  const revs = Atom(init(value))

  const current = revs.lens(R.lens(old => old.values[old.index], (value, old) => {
    if (R.equals(value, old.values[old.index]))
      return old
    const time = Date.now()
    return mk(time,
              [value].concat(old.values.slice(undoCount(old) &&
                                              shouldReplace({time, value, old})
                                              ? old.index + 1
                                              : old.index)))
  }))

  const op = (delta, count) => {
    const fn = () => revs.modify(
      revs => count(revs) ? {...revs, index: revs.index + delta} : revs)
    fn.count = mapNoDups(count, revs)
    fn.has = mapNoDups(n => !!n, fn.count)
    return fn
  }

  current.undo = op(+1, undoCount)
  current.redo = op(-1, redoCount)
  current.initial = mapNoDups(({values}) => values[values.length-1], revs)
  current.reset = value => revs.set(init(value))

  return current
}
