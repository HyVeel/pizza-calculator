const pizzas = [] //array with all pizzas
const urlPizzaDataSeparator = "_" //separates pizza data in URL
const urlPizzasSeparator = "-" //separates pizzas in URL

class Pizza {
    static counter = 0

    constructor(shape, name, quantity, price, ...args) {
        pizzas.push(this)
        this.id = ++Pizza.counter
        this.shape = validateShape(shape) ?? "c" //default circular
        this.name = validateName(name)
        this.quantity = validateNumber(quantity)
        this.price = validateNumber(price)

        if(this.shape == "c") {
            this.diameter = validateNumber(args[0])
            this.calcArea = () => Math.PI * (this.diameter / 2) ** 2
            this.calcSlicePrice = () => this.price / 8
        } else if(this.shape == "r") {
            this.length = validateNumber(args[0])
            this.width = validateNumber(args[1])
            this.calcArea = () => this.length * this.width
        } else if(this.shape == "s") {
            this.side = validateNumber(args[0])
            this.calcArea = () => Math.PI * this.side ** 2 / 8
            this.calcPizzaArea = () => this.calcArea() * 8
            this.calcPizzaPrice = () => this.price * 8
        }
    }

    calcTotalArea = () => this.calcArea() * this.quantity
    calcTotalPrice = () => this.price * this.quantity
    calcPricePerCm2 = () => this.price * this.quantity / this.calcTotalArea() * 100 //cents
    showNameInput() { this.boxNode.querySelector(".pizza-box__name").classList.remove("no-display") }
    hideNameInput() { this.boxNode.querySelector(".pizza-box__name").classList.add("no-display") }

    toggleName() {
        if(!this.boxNode.querySelector(".pizza-box__name").classList.contains("no-display")) {
            this.setName() //clears name
            this.update(true, false, false, false) //(updateInputs, updateOutputs, markPizzas, updateUrl)
        } else this.showNameInput()
    }

    //setters doesn't update inputs because it trims dots in numbers and spaces in texts while typing
    setName(name) {
        this.name = validateName(name)
        this.update(false, false, false)
    }

    setQuantity(quantity) {
        this.quantity = validateNumber(quantity)
        this.update()
    }

    setPrice(price) {
        this.price = validateNumber(price)
        this.update()
    }

    setDiameter(diameter) {
        this.diameter = validateNumber(diameter)
        this.update()
    }

    setLength(length) {
        this.length = validateNumber(length)
        this.update()
    }

    setWidth(width) {
        this.width = validateNumber(width)
        this.update()
    }

    setSide(side) {
        this.side = validateNumber(side)
        this.update()
    }

    setRandomValues() {
        const names = ["Margherita", "Pepperoni", "Neapolitan", "Sicilian", "Four Cheese", "Chicken BBQ", "Hawaiian"]
        this.setName(names[getRandomInteger(0, names.length - 1)])
        this.setQuantity(getRandomInteger(1, 3))
        this.setPrice(getRandomInteger(1000, 3000) / 100)

        if(this.shape == "c") {
            this.setDiameter(getRandomInteger(2000, 6000) / 100)
        } else if(this.shape == "r") {
            this.setLength(getRandomInteger(3000, 6000) / 100)
            this.setWidth(getRandomInteger(2000, 4000) / 100)
        } else if(this.shape == "s") {
            this.setPrice((this.price / 8).toFixed(2))
            this.setSide(getRandomInteger(1000, 4000) / 100)
        }
        this.update(true)
    }

    exportData() {
        const exportData = [this.shape, this.name, this.quantity, this.price]
        if(this.shape == "c") exportData.push(this.diameter)
        else if(this.shape == "r") exportData.push(this.length, this.width)
        else if(this.shape == "s") exportData.push(this.side)

        for(const data of exportData.toReversed()) { //removing undefined from the end till a value is encountered
            if(data === undefined) exportData.pop()
            else break
        }
        return exportData.join(urlPizzaDataSeparator)
    }

    exportToUrl = () => setParamInUrl(location.origin + location.pathname, "pizzas", this.exportData())

    delete() {
        this.boxNode.remove()
        pizzas.splice(pizzas.indexOf(this), 1)
        this.update(false, false)
        if(pizzas.length === 0) showInfoBar()
    }

    duplicate() { importPizzas(this.exportData()) }

    toggleExclusion() { //exclude from finding best pizza
        this.boxNode.classList.toggle("pizza-box--exclude")
        this.update(false, false)
    }

    updateBoxInputs() {
        if(this.boxNode) {
            if(this.name) {
                this.showNameInput()
                this.boxNode.querySelector(".pizza-box__name").value = this.name
            } else {
                this.hideNameInput()
                this.boxNode.querySelector(".pizza-box__name").value = ""
            }

            this.boxNode.querySelector(".pizza-box__quantity").value = this.quantity ?? ""
            this.boxNode.querySelector(".pizza-box__price").value = this.price ?? ""

            if(this.shape == "c") this.boxNode.querySelector(".pizza-box__diameter").value = this.diameter ?? ""
            else if(this.shape == "r") {
                this.boxNode.querySelector(".pizza-box__length").value = this.length ?? ""
                this.boxNode.querySelector(".pizza-box__width").value = this.width ?? ""
            } else if(this.shape == "s") this.boxNode.querySelector(".pizza-box__side").value = this.side ?? ""
        }
    }

    updateBoxOutputs() {
        if(this.boxNode) {
            this.boxNode.querySelector(".pizza-box__total-area").innerText = validateNumber(this.calcTotalArea().toFixed(2)) ?? ""
            this.boxNode.querySelector(".pizza-box__total-price").innerText = validateNumber(this.calcTotalPrice().toFixed(2)) ?? ""
            this.boxNode.querySelector(".pizza-box__price-cm2").innerText = validateNumber(this.calcPricePerCm2().toFixed(2)) ?? ""

            if(this.shape == "c") this.boxNode.querySelector(".pizza-box__slice-price").innerText = validateNumber(this.calcSlicePrice().toFixed(2)) ?? ""
            else if(this.shape == "s") {
                this.boxNode.querySelector(".pizza-box__pizza-area").innerText = validateNumber(this.calcPizzaArea().toFixed(2)) ?? ""
                this.boxNode.querySelector(".pizza-box__pizza-price").innerText = validateNumber(this.calcPizzaPrice().toFixed(2)) ?? ""
            }
        }
    }

    update(updateInputs = false, updateOutputs = true, markPizzas = true, updateUrl = true) {
        if(updateInputs) this.updateBoxInputs() //used on buttons use (setRandomValues, toggleName) and in addPizza
        if(updateOutputs) this.updateBoxOutputs() //used on every numeric input change
        if(markPizzas) markBestPizzas()
        if(updateUrl) updatePizzasInUrl() //used on every input value change
    }
}

function findBestPizzas() {
    const best = []
    for(const pizza of pizzas) {
        if(!validateNumber(pizza.calcPricePerCm2()) || pizza.boxNode.classList.contains(("pizza-box--exclude"))) continue
        else if(!best[0]) best.push(pizza)
        else if(pizza.calcPricePerCm2() < best[0].calcPricePerCm2()) {
            best.length = 0 //clearing array
            best.push(pizza)
        } else if(pizza.calcPricePerCm2() === best[0].calcPricePerCm2()) {
            if(pizza.calcPricePerCm2() === 0) {
                if(pizza.calcTotalArea() > best[0].calcTotalArea()) {
                    best.length = 0
                    best.push(pizza)
                } else if(pizza.calcTotalArea() === best[0].calcTotalArea()) best.push(pizza)
            } else best.push(pizza)
        }
    }
    return best
}

function markBestPizzas() {
    removeBestPizzaMarks()
    for(const pizza of findBestPizzas()) pizza.boxNode.classList.add("pizza-box--best")
}

function removeBestPizzaMarks() { for(const box of document.querySelectorAll(".pizza-box--best")) box.classList.remove("pizza-box--best") }

function addPizza(shape, ...args) {
    if(!validateShape(shape)) return false

    const newPizza = new Pizza(shape, ...args)
    const newBox = document.createElement("div")
    newBox.className = "pizza-box"
    newBox.pizza = newPizza
    main.insertBefore(newBox, document.querySelector(".pizza-add"))
    newPizza.boxNode = newBox

    newBox.innerHTML += `
    <div class="pizza-box__options-bar">
        <p class="pizza-box__id">#${newPizza.id}</p>
        <img class="pizza-box__best" title="Best choice!" src="images/icons/best.png">

        <button class="pizza-box__button" title="Add/remove name" onclick="this.parentNode.parentNode.pizza.toggleName(); this.blur()">
            <img src="images/icons/edit.png">
        </button>

        <button class="pizza-box__button" title="Randomize" onclick="this.parentNode.parentNode.pizza.setRandomValues(); this.blur()">
            <img src="images/icons/randomize.png">
        </button>

        <button class="pizza-box__button" title="Generate URL" onclick="openCopyBox(this.parentNode.parentNode.pizza.exportToUrl()); this.blur()">
            <img src="images/icons/link.png">
        </button>

        <button class="pizza-box__button pizza-box__compare" title="Exclude/include in comparison" onclick="this.parentNode.parentNode.pizza.toggleExclusion(); this.blur()">
            <img src="images/icons/compare.png">
        </button>

        <button class="pizza-box__button" title="Duplicate" onclick="this.parentNode.parentNode.pizza.duplicate(); this.blur()">
            <img src="images/icons/duplicate.png">
        </button>

        <button class="pizza-box__button" title="Delete" onclick="this.parentNode.parentNode.pizza.delete()">
            <img src="images/icons/delete.png">
        </button>
    </div>

    <img class="pizza-box__image" src="images/${newPizza.shape}-pizza.png">
    <input class="pizza-box__name" type="text" placeholder="Pizza name" oninput="this.parentNode.pizza.setName(this.value)">

    <div class="pizza-box__data">
        <p>Quantity</p>
        <input class="pizza-box__quantity" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setQuantity(this.value)">
    </div>

    <div class="pizza-box__data">
        <p>Price [&#36;]</p>
        <input class="pizza-box__price" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setPrice(this.value)">
    </div>`

    if(newPizza.shape == "c") {
        newBox.innerHTML += `
        <div class="pizza-box__data">
            <p>Diameter [cm]</p>
            <input class="pizza-box__diameter" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setDiameter(this.value)">
        </div>

        <div class="pizza-box__data">
            <p>Slice price [&#36;]</p>
            <p class="pizza-box__output pizza-box__slice-price"></p>
        </div>`
    } else if(newPizza.shape == "r") {
        newBox.innerHTML += `
        <div class="pizza-box__data">
            <p>Length [cm]</p>
            <input class="pizza-box__length" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setLength(this.value)">
        </div>

        <div class="pizza-box__data">
            <p>Width [cm]</p>
            <input class="pizza-box__width" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setWidth(this.value)">
        </div>`
    } else if(newPizza.shape == "s") {
        newBox.innerHTML += `
        <div class="pizza-box__data">
            <p>Side [cm]</p>
            <input class="pizza-box__side" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setSide(this.value)">
        </div>

        <div class="pizza-box__data">
            <p>Pizza area [cm&#178;]</p>
            <p class="pizza-box__output pizza-box__pizza-area"></p>
        </div>

        <div class="pizza-box__data">
            <p>Pizza price [&#36;]</p>
            <p class="pizza-box__output pizza-box__pizza-price"></p>
        </div>`
    }

    newBox.innerHTML += `
    <div class="pizza-box__data">
        <p>Total area [cm&#178;]</p>
        <p class="pizza-box__output pizza-box__total-area"></p>
    </div>

    <div class="pizza-box__data">
        <p>Total price [&#36;]</p>
        <p class="pizza-box__output pizza-box__total-price"></p>
    </div>

    <div class="pizza-box__data">
        <p>Price per cm&#178; [&#162;]</p>
        <p class="pizza-box__output pizza-box__price-cm2"></p>
    </div>`

    hideInfoBar()
    newPizza.update(true)
    return true
}

const validateShape = shape => ["c", "C", "r", "R", "s", "S"].includes(shape) ? shape.toLowerCase() : undefined
const validateName = name => name ? name.replaceAll(RegExp(urlPizzaDataSeparator + "|" + urlPizzasSeparator, "g"), " ").trim() : undefined //replaces url separators with " "
const validateNumber = number => isFinite(parseFloat(number)) ? parseFloat(number) : undefined
function addMultiplePizzas(quantity, ...args) { for(let i = 1; i <= quantity; i++) addPizza(...args) }
function deleteAllPizzas() { for(const pizza of pizzas.toReversed()) pizza.delete() }
function setRandomValuesToAllPizzas() { for(const pizza of pizzas) pizza.setRandomValues() }
function importPizzas(pizzasData) { for(const pizzaData of pizzasData.split(urlPizzasSeparator)) addPizza(...pizzaData.split(urlPizzaDataSeparator)) }

function exportAllPizzasData() {
    let exportData = ""
    for(const pizza of pizzas) exportData += (exportData ? urlPizzasSeparator : "") + pizza.exportData()
    return exportData
}

function importPizzasFromUrl(url) {
    const newUrl = new URL(url)
    if(newUrl.searchParams.has("pizzas")) importPizzas(newUrl.searchParams.get("pizzas"))
}

function openImportFromUrlBox() {
    const url = prompt("Paste URL with pizzas to add")
    if(url) importPizzasFromUrl(url)
}

function updatePizzasInUrl() {
    if(pizzas.length === 0) replaceCurrentUrl(deleteParamFromUrl(location.href, "pizzas"))
    else replaceCurrentUrl(setParamInUrl(location.href, "pizzas", exportAllPizzasData()))
}

// On load
importPizzasFromUrl(location.href)