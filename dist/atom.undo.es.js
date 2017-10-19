import { acyclicEqualsU, assocPartialU } from 'infestines';
import { lens } from 'partial.lenses';

var mapNoDups = function mapNoDups(x2y, xs) {
  return xs.map(x2y).skipDuplicates(acyclicEqualsU);
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

var last = function last(_ref) {
  var values = _ref.values;
  return values[values.length - 1];
};

var Replace = {
  never: function never() {
    return false;
  },
  youngerThan: function youngerThan(ms) {
    return function (_ref2) {
      var time = _ref2.time,
          old = _ref2.old;
      return time - old.time < ms;
    };
  }
};

var atom_undo = (function (_ref3) {
  var _ref3$replace = _ref3.replace,
      replace = _ref3$replace === undefined ? Replace.never : _ref3$replace,
      value = _ref3.value,
      Atom = _ref3.Atom;

  var revs = Atom(init(value));

  var current = revs.view(lens(function (old) {
    return old.values[old.index];
  }, function (value, old) {
    if (acyclicEqualsU(value, old.values[old.index])) return old;
    var time = Date.now();
    return mk(time, [value].concat(old.values.slice(undoCount(old) && replace({ time: time, value: value, old: old }) ? old.index + 1 : old.index)));
  }));

  function op(delta, count) {
    var fn = function fn() {
      return revs.modify(function (revs) {
        return count(revs) ? assocPartialU("index", revs.index + delta, revs) : revs;
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
  current.initial = mapNoDups(last, revs);
  current.reset = function (value) {
    return revs.set(init(value));
  };
  current.revert = function () {
    return current.reset(last(revs.get()));
  };

  return current;
});

export { Replace };
export default atom_undo;
