const main = document.getElementById("main")
const titleBar = document.getElementById("title-bar")
const infoBar = document.getElementById("info-bar")
const backgrounds = 5

const getRandomIntiger = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min
function setRandomBackground(min = 1, max = backgrounds) { document.body.style.backgroundImage = "url('images/backgrounds/pizza-bg" + getRandomIntiger(min, max) + ".jpg')" }
function setTitle(text) { if(titleBar) titleBar.innerText = text }
function setInfo(text) { if(infoBar) infoBar.innerText = text }
function hideTitleBar() { if(titleBar) titleBar.style.display = "none" }
function hideInfoBar() { if(infoBar) infoBar.style.display = "none" }
function showTitleBar() { if(titleBar) titleBar.style.display = "block" }
function showInfoBar() { if(infoBar) infoBar.style.display = "block" }

setRandomBackground()