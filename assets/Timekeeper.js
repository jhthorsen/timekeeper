import {on, now, q} from './js/util';

const DAY = 86400, HOUR = 3600, MINUTE = 60;

export default class Timekeeper {
  constructor() {
    this.inputNames = ['d', 'h', 'm', 's'];
    this.tracked = {};
  }

  attach(formEl) {
    this.baseUrl = formEl.action.replace(/\/+$/, '');
    this.formEl = formEl;
    this.alarmPlayer = q(this.formEl, '.alarm-player')[0];

    this.inputNames.forEach(name => {
      q(formEl, '[name="' + name + '"]', input => {
        this._renderInput(input, input.value);
        input.addEventListener('blur', e => this._onBlur(input, e));
        input.addEventListener('keydown', e => this._onKeydown(input, e));
      });
    });

    this.alarmPlayer.volume = 0.4; // The alarm sound is crazy loud
    this._renderAlarmLink();
    this._startOrStop({});

    on(this.formEl, 'submit', () => this.start());
    window.addEventListener('popstate', e => this._startOrStop(e));

    return this;
  }

  alarmActive() {
    return localStorage.getItem('timer_alarm') != 'off';
  }

  inputsToSeconds() {
    const formEl = this.formEl;
    return parseInt(formEl.d.value.replace(/^0+/, '') || 0, 10) * DAY
      + parseInt(formEl.h.value.replace(/^0+/, '') || 0, 10) * HOUR
      + parseInt(formEl.m.value.replace(/^0+/, '') || 0, 10) * MINUTE
      + parseInt(formEl.s.value.replace(/^0+/, '') || 0, 10);
  }

  start(seconds, epoch = now()) {
    seconds = parseInt(seconds, 10) || this.inputsToSeconds();

    if (seconds) {
      history.pushState({}, document.title, [this.baseUrl, epoch, seconds].join('/'));
      window.scrollTo(0, 0);
      setTimeout(() => q(document, '[href="#stop"]', el => el.focus()), 100);
    }

    this._startOrStop({});
  }

  stop() {
    if (this.tid) clearInterval(this.tid);
    if (location.href.match(/\/(\d+)\/(\d+)/)) history.pushState({}, document.title, this.baseUrl);
    this._state('edit');
    this.inputNames.forEach(name => this._renderInput(this.formEl[name], localStorage.getItem('timer_' + name) || '0'));
    if (!location.href.match(/\#about/)) this.formEl.m.focus();
  }

  toggleAlarm() {
    localStorage.setItem('timer_alarm', this.alarmActive() ? 'off' : 'on');
    this._renderAlarmLink();
  }

  _onBlur(input, e) {
    if (!input.value.length) this._renderInput(input, '0');
    localStorage.setItem('timer_' + input.name, input.value);
  }

  _onKeydown(input, e) {
    if (input.disabled) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return; // Do not want to capture special keys
    if (e.keyCode == 13) return [e.preventDefault(), this.start()];

    const num = (e.keyCode || e.which) - 48; // Convert keycode to {0..9}
    if (num < 0 || num > 9) return; // Tab, delete, ... is not a number

    e.preventDefault();
    const max = input.getAttribute('max');
    const v = input.value.length >= max.length ? num : parseInt(input.value + '' + num, 10);
    this._renderInput(input, v > max ? max : v < 0 ? 0 : v);
  }

  _renderAlarmLink() {
    const name = this.alarmActive() ? 'fa-bell' : 'fa-bell-slash';
    q(this.formEl, '[href="#alarm"] .fas', icon => (icon.className = icon.className.replace(/fa-\S+/, name)));
  }

  _renderCountdown() {
    const formEl = this.formEl;
    const left = [0, 0, 0, this.ends - now()];
    const title = [];

    if (left[3] <= 0) {
      if (this.tid) clearInterval(this.tid);
      setTimeout(() => this.alarmPlayer.pause(), 4000);
      if (this.alarmActive()) this.alarmPlayer.play();
      this.inputNames.forEach(name => this._renderInput(formEl[name], '0'));
      this._state('expired');
      return;
    }

    left[0] = parseInt(left[3] / DAY, 10);
    left[3] -= left[0] * DAY;
    left[1] = parseInt(left[3] / HOUR, 10);
    left[3] -= left[1] * HOUR;
    left[2] = parseInt(left[3] / MINUTE, 10);
    left[3] -= left[2] * MINUTE;

    for (let i = 0; i < left.length; i++) {
      if (left[i] || title.length) title.push(left[i] + this.inputNames[i]);
    }

    document.title = title.join(' ');
    this._renderInput(formEl.d, left[0]);
    this._renderInput(formEl.h, left[1]);
    this._renderInput(formEl.m, left[2]);
    this._renderInput(formEl.s, left[3]);
  }

  _renderInput(input, val) {
    val = String(val);
    const wrapper = input.closest('[data-shadow]');
    wrapper.dataset.shadow = val.padStart(input.name == 'd' ? 3 : 2, '0');
    input.value = val;
  }

  _startOrStop() {
    if (this.tid) clearInterval(this.tid);

    const [all, epoch, seconds] = location.href.match(/\/(\d+)\/(\d+)/) || [];
    this.seconds = parseInt(seconds, 10);
    this.ends = parseInt(epoch, 10) + this.seconds;
    if (!this.ends) return this.stop();
    if (this.ends - now() <= 0) return this._state('expired');

    this._state('countdown');
    this._renderCountdown();
    this.tid = setInterval(() => this._renderCountdown(), 1000);
  }

  _state(state) {
    if (state == 'edit') q(document, '[property="og:title"]', el => (document.title = el.content));
    if (state == 'expired') q(document, '.expired-text', el => (document.title = el.textContent));
    this.formEl.className = this.formEl.className.replace(/\s-\w+/, ' -' + state);
    q(this.formEl, 'input', el => (el.disabled = state == 'countdown'));
    q(this.formEl, '.countdown-footer', el => el.classList.add('hide'));
    q(this.formEl, '.countdown-footer.for-' + state, el => el.classList.remove('hide'));
  }
}
