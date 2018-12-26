require("./sass/timekeeper.scss");

const {q} = require("./js/utils.js");
const Timekeeper = require("./js/timekeeper.js");

const t = new Timekeeper().attach(document.querySelector(".timer-app"));

q(document, 'a[href*="set:"]', el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    var url = t.baseUrl
    history.pushState({}, document.title, url);
  });
});
