/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/timekeeper.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/timekeeper.js":
/*!*********************************!*\
  !*** ./assets/js/timekeeper.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const {\n  d,\n  w,\n  ga,\n  now,\n  pad,\n  q\n} = __webpack_require__(/*! ./utils.js */ \"./assets/js/utils.js\");\n\nconst DAY = 86400,\n      HOUR = 3600,\n      MINUTE = 60;\n\nclass Timekeeper {\n  constructor() {\n    this.inputNames = [\"d\", \"h\", \"m\", \"s\"];\n    this.tracked = {};\n  }\n\n  attach(formEl) {\n    formEl.timeKeeper = this;\n    this.baseUrl = formEl.action.replace(/\\/+$/, \"\");\n    this.formEl = formEl;\n    this.getAlarmBtn().addEventListener(\"click\", e => {\n      e.preventDefault();\n      localStorage.setItem(\"timer_alarm\", this._renderAlarmLink(e));\n    });\n    q(formEl, \"a.set\", el => {\n      el.addEventListener(\"click\", e => {\n        e.preventDefault();\n        this.stop();\n      });\n    });\n    const self = this;\n    this.formEl.addEventListener(\"submit\", function (e) {\n      self._onSubmit(this, e);\n    });\n    this.inputNames.forEach(name => {\n      formEl[name].addEventListener(\"blur\", function (e) {\n        self._onBlur(this, e);\n      });\n      formEl[name].addEventListener(\"focus\", function (e) {\n        self._focus = true;\n      });\n      formEl[name].addEventListener(\"keydown\", function (e) {\n        self._onKeydown(this, e);\n      });\n    });\n    this.getAlarmPlayer().volume = 0.4; // The alarm sound is crazy loud\n\n    this._startOrStop({});\n\n    w.addEventListener(\"popstate\", e => this._startOrStop(e));\n    return this;\n  }\n\n  getAlarmBtn() {\n    return q(this.formEl, 'a[href$=\"#toggle/alarm\"]', 1);\n  }\n\n  getAlarmPlayer() {\n    return q(this.formEl, \".alarm-sound\", 1);\n  }\n\n  start(seconds, epoch) {\n    if (!epoch) epoch = now();\n    history.pushState({}, d.title, [this.baseUrl, epoch, seconds].join(\"/\"));\n\n    this._startTimer();\n  }\n\n  stop() {\n    history.pushState({}, d.title, this.baseUrl);\n\n    this._stopTimer();\n  }\n\n  _ga(event, seconds) {\n    if (this.tracked[event]) return;\n    ga(\"send\", \"event\", \"timer\", event, seconds);\n    this.tracked[event] = true;\n  }\n\n  _onBlur(target, e) {\n    if (!target.value.length) target.value = \"0\";\n    if (target.name != \"d\") target.value = pad(target.value);\n    localStorage.setItem(\"timer_\" + target.name, target.value);\n  }\n\n  _onKeydown(target, e) {\n    if (e.altKey || e.ctrlKey || e.metaKey) return; // Do not want to capture special keys\n\n    if (target.disabled) return;\n    const num = (e.keyCode || e.which) - 48; // Convert keycode to {0..9}\n\n    if (num < -30 || num < 0 || num > 9) return; // Tab, delete, ... or not a number\n\n    e.preventDefault();\n    const max = target.getAttribute(\"max\");\n    const focus = [this._focus, this._focus = false][0];\n    if (target.value.length >= max.length) return target.value = num;\n    const v = parseInt((focus ? \"\" : target.value) + \"\" + num, 10);\n    target.value = v > max ? max : v < 0 ? \"00\" : v;\n  }\n\n  _onSubmit(formEl, e) {\n    e.preventDefault();\n    var hms = 0;\n    hms += parseInt(formEl.d.value.replace(/^0+/, \"\") || 0, 10) * DAY;\n    hms += parseInt(formEl.h.value.replace(/^0+/, \"\") || 0, 10) * HOUR;\n    hms += parseInt(formEl.m.value.replace(/^0+/, \"\") || 0, 10) * MINUTE;\n    hms += parseInt(formEl.s.value.replace(/^0+/, \"\") || 0, 10);\n    this._submitted = true;\n    this.tracked.created = false;\n    this.tracked.expired = false;\n    this.start(hms);\n  }\n\n  _renderAlarmLink(toggle) {\n    var state = localStorage.getItem(\"timer_alarm\") || \"off\";\n    if (toggle) state = state == \"on\" ? \"off\" : \"on\";\n    this.getAlarmBtn().innerText = state;\n    return state;\n  }\n\n  _renderCountdown() {\n    var left = [0, 0, 0, this.ends - now()];\n    var title = [];\n    q(this.formEl, \".progressbar div\", 1).style.width = 100 - (this.seconds - left[3]) / this.seconds * 100 + \"%\";\n\n    if (left[3] <= 0) {\n      if (this.tid) clearInterval(this.tid);\n      setTimeout(() => {\n        this.getAlarmPlayer().pause();\n      }, 4000);\n      if (storage.getItem(\"timer_alarm\") == \"on\") this.getAlarmPlayer().play();\n      this.state(\"expired\");\n      return;\n    }\n\n    left[0] = parseInt(left[3] / DAY, 10);\n    left[3] -= left[0] * DAY;\n    left[1] = parseInt(left[3] / HOUR, 10);\n    left[3] -= left[1] * HOUR;\n    left[2] = parseInt(left[3] / MINUTE, 10);\n    left[3] -= left[2] * MINUTE;\n\n    for (var i = 0; i < left.length; i++) {\n      if (left[i] || title.length) title.push(left[i] + this.inputNames[i]);\n    }\n\n    d.title = title.join(\" \");\n    this.formEl.d.value = left[0];\n    this.formEl.h.value = pad(left[1]);\n    this.formEl.m.value = pad(left[2]);\n    this.formEl.s.value = pad(left[3]);\n  }\n\n  _renderExpired() {\n    this._state(\"expired\");\n\n    this.inputNames.forEach(name => {\n      this.formEl[name].value = name == \"d\" ? \"0\" : \"00\";\n    });\n    if (this.seconds) this._ga(\"expired\", \"\" + this.seconds);\n    return true;\n  }\n\n  _renderInputValues() {\n    this.inputNames.forEach(name => {\n      this.formEl[name].value = localStorage.getItem(\"timer_\" + name) || (name == \"d\" ? \"0\" : \"00\");\n    });\n  }\n\n  _startOrStop() {\n    this._startTimer() || this._stopTimer();\n  }\n\n  _startTimer() {\n    const args = location.href.match(/\\/(\\d+)\\/(\\d+)/);\n    if (!args) return false;\n    if (this.tid) clearInterval(this.tid);\n\n    this._state(\"countdown\");\n\n    q(this.formEl, \"input\", el => {\n      el.disabled = true;\n    });\n    q(d, 'a', 1).focus();\n    this.seconds = parseInt(args[2], 10);\n    this.ends = parseInt(args[1], 10) + this.seconds;\n    if (this.ends - now() <= 0) return this._renderExpired();\n    this.tid = setInterval(() => this._renderCountdown(), 1000);\n\n    this._renderCountdown();\n\n    this._ga(this._submitted ? \"created\" : \"visited\", \"\" + this.seconds);\n\n    this._submitted = false;\n    return true;\n  }\n\n  _stopTimer() {\n    if (this.tid) clearInterval(this.tid);\n\n    this._state(\"set\");\n\n    this._renderInputValues();\n\n    q(this.formEl, \"input\", el => {\n      el.disabled = false;\n    });\n    this.formEl.m.focus();\n  }\n\n  _state(str) {\n    this.formEl.className = this.formEl.className.replace(/\\s-\\w+/, \" -\" + str);\n  }\n\n}\n\nmodule.exports = Timekeeper;\n\n//# sourceURL=webpack:///./assets/js/timekeeper.js?");

/***/ }),

/***/ "./assets/js/utils.js":
/*!****************************!*\
  !*** ./assets/js/utils.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\n  d: document,\n  w: window,\n  ga: window.ga || function () {\n    console.log([].slice.call(arguments));\n  },\n  now: function () {\n    return parseInt(new Date().valueOf() / 1000, 10);\n  },\n  pad: function (str) {\n    str = String(str || \"\").replace(/^0+/, \"\") || \"0\"; // Make sure we have a string\n\n    return parseInt(str, 10) < 10 ? \"0\" + str : \"\" + str;\n  },\n  q: function (el, sel, cb) {\n    if (cb === 1) return el.querySelector(sel);\n    if (!cb) cb = 0;\n    return [][cb ? \"filter\" : \"slice\"].call(el.querySelectorAll(sel), cb);\n  }\n};\n\n//# sourceURL=webpack:///./assets/js/utils.js?");

/***/ }),

/***/ "./assets/sass/timekeeper.scss":
/*!*************************************!*\
  !*** ./assets/sass/timekeeper.scss ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./assets/sass/timekeeper.scss?");

/***/ }),

/***/ "./assets/timekeeper.js":
/*!******************************!*\
  !*** ./assets/timekeeper.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./sass/timekeeper.scss */ \"./assets/sass/timekeeper.scss\");\n\nconst {\n  q\n} = __webpack_require__(/*! ./js/utils.js */ \"./assets/js/utils.js\");\n\nconst Timekeeper = __webpack_require__(/*! ./js/timekeeper.js */ \"./assets/js/timekeeper.js\");\n\nconst t = new Timekeeper().attach(document.querySelector(\".timer-app\"));\nq(document, 'a[href*=\"set:\"]', el => {\n  el.addEventListener(\"click\", e => {\n    e.preventDefault();\n    var url = t.baseUrl;\n    history.pushState({}, document.title, url);\n  });\n});\n\n//# sourceURL=webpack:///./assets/timekeeper.js?");

/***/ })

/******/ });