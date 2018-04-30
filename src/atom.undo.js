import {acyclicEqualsU, assocPartialU} from 'infestines'
import {lens} from 'partial.lenses'

const mapNoDups = (x2y, xs) => xs.map(x2y).skipDuplicates(acyclicEqualsU)

const mk = (time, values) => ({time, index: 0, values})
const init = value => mk(Date.now(), [value])
const undoCount = revs => revs.values.length - revs.index - 1
const redoCount = revs => revs.index

const last = ({values}) => values[values.length - 1]

export const Replace = {
  never: () => false,
  youngerThan: ms => ({time, old}) => time - old.time < ms
}

export default ({replace = Replace.never, value, Atom}) => {
  const revs = Atom(init(value))

  const current = revs.view(
    lens(
      old => old.values[old.index],
      (value, old) => {
        if (acyclicEqualsU(value, old.values[old.index])) return old
        const time = Date.now()
        return mk(
          time,
          [value].concat(
            old.values.slice(
              undoCount(old) && replace({time, value, old})
                ? old.index + 1
                : old.index
            )
          )
        )
      }
    )
  )

  function op(delta, count) {
    const fn = () =>
      revs.modify(
        revs =>
          count(revs) ? assocPartialU('index', revs.index + delta, revs) : revs
      )
    fn.count = mapNoDups(count, revs)
    fn.has = mapNoDups(n => !!n, fn.count)
    return fn
  }

  current.undo = op(+1, undoCount)
  current.redo = op(-1, redoCount)
  current.initial = mapNoDups(last, revs)
  current.reset = value => revs.set(init(value))
  current.revert = () => current.reset(last(revs.get()))

  return current
}
