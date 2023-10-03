const options = document.getElementById("options")
const main = document.getElementById("main")
const titleBar = document.getElementById("title-bar")
const infoBar = document.getElementById("info-bar")
const backgrounds = 5
const defaultTitle = "🍕 Which pizza is the best choice?"

// URL
function setParamInUrl(url, param, value) { //adds or replaces parameter in given URL
    const newUrl = new URL(url)
    newUrl.searchParams.set(param, value)
    return newUrl.href
}

function getParamFromUrl(url, param) { //gets param value from given URL
    const newUrl = new URL(url)
    return newUrl.searchParams.get(param)
}

function deleteParamFromUrl(url, param) { //deletes parameter from given URL
    const newUrl = new URL(url)
    newUrl.searchParams.delete(param)
    return newUrl.href
}

function replaceCurrentUrl(newUrl) { history.replaceState({}, "", newUrl) } //sets new URL in address bar without page reloading

// Title
function setTitle(title) {
    if(title || title === 0) {
        title = title.toString().trim()
        titleBar.innerText = title ? title : defaultTitle
    } else titleBar.innerText = defaultTitle

    updateTitleInUrl()
}

function openSetTitleBox() {
    const title = prompt("Type new title or remove it", titleBar.innerText)
    if(title != null) setTitle(title)
}

function updateTitleInUrl() {
    if(titleBar.innerText === defaultTitle) replaceCurrentUrl(deleteParamFromUrl(location.href, "title"))
    else replaceCurrentUrl(setParamInUrl(location.href, "title", titleBar.innerText))
}

function importTitleFromUrl(url) { if(getParamFromUrl(url, "title")) setTitle(getParamFromUrl(location.href, "title")) }

// Info
function showInfoBar() { infoBar.classList.remove("no-display") }
function hideInfoBar() { infoBar.classList.add("no-display") }
function setInfo(text) { infoBar.innerText = text }

// Options
function toggleOptions() {
    options.classList.toggle("no-display")
    document.body.classList.toggle("no-scroll")
}

// Misc
const getRandomInteger = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min
function setRandomBackground(min = 1, max = backgrounds) { document.body.style.backgroundImage = "url('images/backgrounds/pizza-bg" + getRandomInteger(min, max) + ".jpg')" }

function openCopyTextBox(text) {
    text = prompt("Click OK to copy this:", text)
    if(text) navigator.clipboard.writeText(text)
}

// On load
document.addEventListener("keydown", key => { if(key.code === "Escape") toggleOptions() })
setRandomBackground()
importTitleFromUrl(location.href)