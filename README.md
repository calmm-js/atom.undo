Minimalistic Undo-Redo implementation for Atoms.

[![npm version](https://badge.fury.io/js/atom.undo.svg)](http://badge.fury.io/js/atom.undo) [![](https://david-dm.org/calmm-js/atom.undo.svg)](https://david-dm.org/calmm-js/atom.undo)

## Reference

### Import

You must first provide an `Atom` implementation.  You can use either

```js
import Atom from "bacon.atom"
```

or

```js
import Atom from "kefir-atom"
```

for example.

The default import

```js
import Undo from "atom.undo"
```

is a function to create an undoable atom.

### Undoable

To create an undoable atom, you must pass an initial value and the desired
`Atom` constructor:

```js
const undoable = Undo({value: initial, Atom})
```

The return value is a lensed atom with additional properties for controlling
history.

#### undoable.undo() and undoable.redo()

Undoes or redoes a change (if any).

#### undoable.undo.count and undoable.redo.count

Observable property that gives the number of times undo or redo has an effect.

#### undoable.undo.has and undoable.redo.has

Observable property that gives a boolean on whether undo or redo has an effect.

#### undoable.initial

Observable property that gives the initial value of the undoable.

#### undoable.reset(value)

Resets the state of the undoable so that the given value becomes the new initial
value and all history is dropped.

### Replace

By default, every actual change (as determined by Ramda's
[equals](http://ramdajs.com/0.19.0/docs/#equals) function) of the value of an
undoable atom creates a new history entry.  In many cases you don't want to
generate history for every change.  The `Undo` constructor takes an optional
`replace` predicate as a parameter, which let's you control when the value is
just replaced without creating history.

The `replace` function is given as a parameter an object of the form `{date,
value, old: {date}}`, where dates have been obtained by `Date.now()`.  If
`replace` returns a truthy value, the latest value is replaced without creating
history.

The named import `Replace`

```js
import {Replace} from "atom.undo"
```

provides ready made replacement policies for undo.

#### Replace.never

The default `never` policy is to never replace and always generate history.

#### Replace.youngerThan(periodInMilliseconds)

The `youngerThan` policy is to replace, without generating history, when the
previous entry is younger than the given period in milliseconds.
