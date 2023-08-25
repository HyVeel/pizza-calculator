const main = document.getElementById("main")
const titlePanel = document.getElementById("title-panel")
const infoPanel = document.getElementById("info-panel")
const backgrounds = 5

const getRandom = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min

function setRandomBackground(min = 1, max = backgrounds) {
    document.body.style.backgroundImage = "url('images/backgrounds/pizza-bg" + getRandom(min, max) + ".jpg')"
    return document.body.style.backgroundImage
}

function setTitle(text) { if(titlePanel) titlePanel.innerText = text }
function setInfo(text) { if(infoPanel) infoPanel.innerText = text }
function hideTitlePanel() { if(titlePanel) titlePanel.style.display = "none" }
function hideInfoPanel() { if(infoPanel) infoPanel.style.display = "none" }
function showTitlePanel() { if(titlePanel) titlePanel.style.display = "block" }
function showInfoPanel() { if(infoPanel) infoPanel.style.display = "block" }

setRandomBackground()