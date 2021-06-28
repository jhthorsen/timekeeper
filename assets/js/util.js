export function on(el, type, cb) {
  el.addEventListener(type, e => {
    e.preventDefault();
    cb(e);
  });
};

export function now() {
  return parseInt(new Date().valueOf() / 1000, 10);
};

export function q(parentEl, sel, cb) {
  const els = sel == ':children' ? parentEl.children : parentEl.querySelectorAll(sel);
  if (!cb) return [].slice.call(els, 0);
  const res = [];
  for (let i = 0; i < els.length; i++) res.push(cb(els[i], i));
  return res;
}
