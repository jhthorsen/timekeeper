const {d, w, ga, now, pad, q} = require("./utils.js");
const DAY = 86400, HOUR = 3600, MINUTE = 60;

class Timekeeper {
  constructor() {
    this.inputNames = ["d", "h", "m", "s"];
    this.tracked = {};
  }

  attach(formEl) {
    formEl.timeKeeper = this;
    this.baseUrl = formEl.action.replace(/\/+$/, "");
    this.formEl = formEl;

    this.getAlarmBtn().addEventListener("click", e => {
      e.preventDefault();
      localStorage.setItem("timer_alarm", this._renderAlarmLink(e));
    });

    q(formEl, "a.set", el => {
      el.addEventListener("click", e => { e.preventDefault(); this.stop() });
    });

    const self = this;
    this.formEl.addEventListener("submit", function(e) { self._onSubmit(this, e) });

    this.inputNames.forEach(name => {
      formEl[name].addEventListener("blur", function(e) { self._onBlur(this, e) });
      formEl[name].addEventListener("focus", function(e) { self._focus = true });
      formEl[name].addEventListener("keydown", function(e) { self._onKeydown(this, e) });
    });

    this.getAlarmPlayer().volume = 0.4; // The alarm sound is crazy loud
    this._startOrStop({});
    w.addEventListener("popstate", e => this._startOrStop(e));

    return this;
  }

  getAlarmBtn() {
    return q(this.formEl, 'a[href$="#toggle/alarm"]', 1);
  }

  getAlarmPlayer() {
    return q(this.formEl, ".alarm-sound", 1);
  }

  start(seconds, epoch) {
    if (!epoch) epoch = now();
    history.pushState({}, d.title, [this.baseUrl, epoch, seconds].join("/"));
    this._startTimer();
  }

  stop() {
    history.pushState({}, d.title, this.baseUrl);
    this._stopTimer();
  }

  _ga(event, seconds) {
    if (this.tracked[event]) return;
    ga("send", "event", "timer", event, seconds);
    this.tracked[event] = true;
  }

  _onBlur(target, e) {
    if (!target.value.length) target.value = "0";
    if (target.name != "d") target.value = pad(target.value);
    localStorage.setItem("timer_" + target.name, target.value);
  }

  _onKeydown(target, e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return; // Do not want to capture special keys
    if (target.disabled) return;

    const num = (e.keyCode || e.which) - 48; // Convert keycode to {0..9}
    if (num < -30 || num < 0 || num > 9) return; // Tab, delete, ... or not a number

    e.preventDefault();
    const max = target.getAttribute("max");
    const focus = [this._focus, this._focus = false][0];
    if (target.value.length >= max.length) return target.value = num;
    const v = parseInt((focus ? "" : target.value) + "" + num, 10);
    target.value = v > max ? max : v < 0 ? "00" : v;
  }

  _onSubmit(formEl, e) {
    e.preventDefault();
    var hms = 0;
    hms += parseInt(formEl.d.value.replace(/^0+/, "") || 0, 10) * DAY;
    hms += parseInt(formEl.h.value.replace(/^0+/, "") || 0, 10) * HOUR;
    hms += parseInt(formEl.m.value.replace(/^0+/, "") || 0, 10) * MINUTE;
    hms += parseInt(formEl.s.value.replace(/^0+/, "") || 0, 10);
    this._submitted = true;
    this.tracked.created = false;
    this.tracked.expired = false;
    this.start(hms);
  }

  _renderAlarmLink(toggle) {
    var state = localStorage.getItem("timer_alarm") || "off";
    if (toggle) state = state == "on" ? "off" : "on";
    this.getAlarmBtn().innerText = state;
    return state;
  }

  _renderCountdown() {
    var left = [0, 0, 0, this.ends - now()];
    var title = [];

    q(this.formEl, ".progressbar div", 1).style.width
      = (100 - (this.seconds - left[3]) / this.seconds * 100) + "%";

    if (left[3] <= 0) {
      if (this.tid) clearInterval(this.tid);
      setTimeout(() => { this.getAlarmPlayer().pause() }, 4000);
      if (storage.getItem("timer_alarm") == "on") this.getAlarmPlayer().play();
      this.state("expired");
      return;
    }

    left[0] = parseInt(left[3] / DAY, 10);
    left[3] -= left[0] * DAY;
    left[1] = parseInt(left[3] / HOUR, 10);
    left[3] -= left[1] * HOUR;
    left[2] = parseInt(left[3] / MINUTE, 10);
    left[3] -= left[2] * MINUTE;

    for (var i = 0; i < left.length; i++) {
      if (left[i] || title.length) title.push(left[i] + this.inputNames[i]);
    }

    d.title = title.join(" ");
    this.formEl.d.value = left[0];
    this.formEl.h.value = pad(left[1]);
    this.formEl.m.value = pad(left[2]);
    this.formEl.s.value = pad(left[3]);
  }

  _renderExpired() {
    this._state("expired");
    this.inputNames.forEach(name => { this.formEl[name].value = name == "d" ? "0" : "00" });
    if (this.seconds) this._ga("expired", "" + this.seconds);
    return true;
  }

  _renderInputValues() {
    this.inputNames.forEach(name => {
      this.formEl[name].value = localStorage.getItem("timer_" + name) || (name == "d" ? "0" : "00");
    });
  }

  _startOrStop() {
    this._startTimer() || this._stopTimer();
  }

  _startTimer() {
    const args = location.href.match(/\/(\d+)\/(\d+)/);
    if (!args) return false;
    if (this.tid) clearInterval(this.tid);
    this._state("countdown");
    q(this.formEl, "input", el => { el.disabled = true });
    q(d, 'a', 1).focus();
    this.seconds = parseInt(args[2], 10);
    this.ends = parseInt(args[1], 10) + this.seconds;
    if (this.ends - now() <= 0) return this._renderExpired();
    this.tid = setInterval(() => this._renderCountdown(), 1000);
    this._renderCountdown();
    this._ga(this._submitted ? "created" : "visited", "" + this.seconds);
    this._submitted = false;
    return true;
  }

  _stopTimer() {
    if (this.tid) clearInterval(this.tid);
    this._state("set");
    this._renderInputValues();
    q(this.formEl, "input", el => { el.disabled = false });
    this.formEl.m.focus();
  }

  _state(str) {
    this.formEl.className = this.formEl.className.replace(/\s-\w+/, " -" + str);
  }
}

module.exports = Timekeeper;
