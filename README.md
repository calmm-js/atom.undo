Minimalistic Undo-Redo implementation for Atoms.

[![npm version](https://badge.fury.io/js/atom.undo.svg)](http://badge.fury.io/js/atom.undo) [![Build Status](https://travis-ci.org/calmm-js/atom.undo.svg?branch=master)](https://travis-ci.org/calmm-js/atom.undo) [![](https://david-dm.org/calmm-js/atom.undo.svg)](https://david-dm.org/calmm-js/atom.undo) [![](https://david-dm.org/calmm-js/atom.undo/dev-status.svg)](https://david-dm.org/calmm-js/atom.undo?type=dev)

## Reference

### Import

You must first provide an `Atom` implementation.  You can use either

```js
import Atom from "bacon.atom"
```

or

```js
import Atom from "kefir.atom"
```

for example.  See [`bacon.atom`](https://github.com/calmm-js/bacon.atom) and
[`kefir.atom`](https://github.com/calmm-js/kefir.atom) for details.

It is also possible to create atoms in other ways, such as with storage, see
[`atom.storage`](https://github.com/calmm-js/atom.storage).

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

#### <a name="undo"></a><a name="redo"></a>[`undoable.undo()`](#undo "Undo a :: () -> ()") and [`undoable.redo()`](#redo "Undo a :: () -> ()")

Undoes or redoes a change (if any).

#### <a name="count"></a>[`undoable.undo.count`](#count "Undo a :: Property Integer") and [`undoable.redo.count`](#count "Undo a :: Property Integer")

Observable property that gives the number of times undo or redo has an effect.

#### <a name="has"></a>[`undoable.undo.has`](#has "Undo a :: Property Boolean") and [`undoable.redo.has`](#has "Undo a :: Property Boolean")

Observable property that gives a boolean on whether undo or redo has an effect.

#### <a name="initial"></a>[`undoable.initial`](#initial "Undo a :: Property a")

Observable property that gives the initial value of the undoable.

#### <a name="reset"></a>[`undoable.reset(value)`](#reset "Undo a :: a -> ()")

Resets the state of the undoable so that the given value becomes the new initial
value and all history is dropped.

### `Replace`

By default, every actual change (as determined by Ramda's
[equals](http://ramdajs.com/0.21.0/docs/#equals) function) of the value of an
undoable atom creates a new history entry.  In many cases you don't want to
generate history for every change.  The `Undo` constructor takes an optional
`replace` predicate as a parameter, which let's you control when the value is
just replaced without creating history.

The `replace` function is given as a parameter an object of the form `{date,
value, old: {date}}`, where dates have been obtained by
[`Date.now()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now).
If `replace` returns a truthy value, the latest value is replaced without
creating history.

The named import `Replace`

```js
import {Replace} from "atom.undo"
```

provides ready made replacement policies for undo.

For example, to create an undoable atom with a 2.5 second history "debounce"
period, one could write:

```js
const undoable = Undo({replace: Replace.youngerThan(2500),
                       value: initial,
                       Atom})
```

#### <a name="never"></a>[`Replace.never`](#never)

The default `never` policy is to never replace and always generate history.

#### <a name="youngerThan"></a>[`Replace.youngerThan(periodInMilliseconds)`](#youngerThan)

The `youngerThan` policy is to replace, without generating history, when the
previous entry is younger than the given period in milliseconds.
