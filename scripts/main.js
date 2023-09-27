const options = document.getElementById("options")
const main = document.getElementById("main")
const titleBar = document.getElementById("title-bar")
const infoBar = document.getElementById("info-bar")
const backgrounds = 5

// URL
function replaceCurrentUrl(newUrl) { history.replaceState({}, "", newUrl)/* ; console.log(location.href) *//*  */ } //sets new url in address bar without page reloading
function updateTitleInUrl() { replaceCurrentUrl(setParamInUrl(location.href, "title", titleBar.innerText)) }

function setParamInUrl(url, param, value) { //adds or replaces parameter in given url
    const newUrl = new URL(url)
    newUrl.searchParams.set(param, value)
    return newUrl.href
}

function getParamFromUrl(url, param) { //gets param value from given url
    const newUrl = new URL(url)
    return newUrl.searchParams.get(param)
}

function deleteParamFromUrl(url, param) { //deletes parameter from given url
    const newUrl = new URL(url)
    newUrl.searchParams.delete(param)
    return newUrl.href
}

// Title
function showTitleBar() { if(titleBar) titleBar.classList.remove("no-display") }
function hideTitleBar() { if(titleBar) titleBar.classList.add("no-display") }

function setTitle(title) { //URL: no param -> default title, param == "" -> remove title, param != "" -> new title
    if(title || title === 0) {
        if(titleBar) titleBar.innerText = title.trim()
        showTitleBar()
    } else {
        if(titleBar) titleBar.innerText = ""
        hideTitleBar()
    }
    updateTitleInUrl()
}

function openSetTitleBox() {
    const title = prompt("Type new title or remove it", titleBar.innerText)
    if(title != null) setTitle(title)
}

// Info
function showInfoBar() { if(infoBar) infoBar.classList.remove("no-display") }
function hideInfoBar() { if(infoBar) infoBar.classList.add("no-display") }
function setInfo(text) { if(infoBar) infoBar.innerText = text }

// Options
function toggleOptions() {
    if(options) options.classList.toggle("no-display")
    document.body.classList.toggle("no-scroll")
}

// Misc
const getRandomInteger = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min
function setRandomBackground(min = 1, max = backgrounds) { document.body.style.backgroundImage = "url('images/backgrounds/pizza-bg" + getRandomInteger(min, max) + ".jpg')" }

function openCopyBox(text) {
    text = prompt("Click OK to copy this:", text)
    if(text) navigator.clipboard.writeText(text)
}

// On load
setRandomBackground()
if(getParamFromUrl(location.href, "title") != null) setTitle(getParamFromUrl(location.href, "title"))