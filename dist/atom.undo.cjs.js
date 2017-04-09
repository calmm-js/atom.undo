'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var infestines = require('infestines');
var partial_lenses = require('partial.lenses');

var mapNoDups = function mapNoDups(x2y, xs) {
  return xs.map(x2y).skipDuplicates(infestines.acyclicEqualsU);
};

var mk = function mk(time, values) {
  return { time: time, index: 0, values: values };
};
var init = function init(value) {
  return mk(Date.now(), [value]);
};
var undoCount = function undoCount(revs) {
  return revs.values.length - revs.index - 1;
};
var redoCount = function redoCount(revs) {
  return revs.index;
};

var Replace = {
  never: function never() {
    return false;
  },
  youngerThan: function youngerThan(ms) {
    return function (_ref) {
      var time = _ref.time,
          old = _ref.old;
      return time - old.time < ms;
    };
  }
};

var atom_undo = (function (_ref2) {
  var _ref2$replace = _ref2.replace,
      replace = _ref2$replace === undefined ? Replace.never : _ref2$replace,
      value = _ref2.value,
      Atom = _ref2.Atom;

  var revs = Atom(init(value));

  var current = revs.view(partial_lenses.lens(function (old) {
    return old.values[old.index];
  }, function (value, old) {
    if (infestines.acyclicEqualsU(value, old.values[old.index])) return old;
    var time = Date.now();
    return mk(time, [value].concat(old.values.slice(undoCount(old) && replace({ time: time, value: value, old: old }) ? old.index + 1 : old.index)));
  }));

  function op(delta, count) {
    var fn = function fn() {
      return revs.modify(function (revs) {
        return count(revs) ? infestines.assocPartialU("index", revs.index + delta, revs) : revs;
      });
    };
    fn.count = mapNoDups(count, revs);
    fn.has = mapNoDups(function (n) {
      return !!n;
    }, fn.count);
    return fn;
  }

  current.undo = op(+1, undoCount);
  current.redo = op(-1, redoCount);
  current.initial = mapNoDups(function (_ref3) {
    var values = _ref3.values;
    return values[values.length - 1];
  }, revs);
  current.reset = function (value) {
    return revs.set(init(value));
  };

  return current;
});

exports.Replace = Replace;
exports['default'] = atom_undo;
