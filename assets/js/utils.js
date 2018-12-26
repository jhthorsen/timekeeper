module.exports = {
  d: document,
  w: window,
  ga: window.ga || function() { console.log([].slice.call(arguments)) },
  now: function() {
    return parseInt(new Date().valueOf() / 1000, 10);
  },
  pad: function(str) {
    str = String(str || "").replace(/^0+/, "") || "0"; // Make sure we have a string
    return parseInt(str, 10) < 10 ? "0" + str : "" + str;
  },
  q: function(el, sel, cb) {
    if (cb === 1) return el.querySelector(sel);
    if (!cb) cb = 0;
    return [][cb ? "filter" : "slice"].call(el.querySelectorAll(sel), cb);
  }
};
