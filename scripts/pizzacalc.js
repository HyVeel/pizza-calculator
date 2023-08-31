const pizzas = []

class Pizza {
    static counter = 0

    constructor(shape, name, quantity, price, ...args) {
        pizzas.push(this)
        this.id = ++Pizza.counter
        this.shape = isValidShape(shape) ?? "c" //default circular
        this.name = isValidName(name)
        this.quantity = isValidNumber(quantity)
        this.price = isValidNumber(price)

        if(this.shape == "c") {
            this.diameter = isValidNumber(args[0])
            this.calcArea = () => Math.PI * (this.diameter / 2) ** 2
            this.calcSlicePrice = () => this.price / 8
        } else if(this.shape == "r") {
            this.length = isValidNumber(args[0])
            this.width = isValidNumber(args[1])
            this.calcArea = () => this.length * this.width
        } else if(this.shape == "s") {
            this.side = isValidNumber(args[0])
            this.calcArea = () => Math.PI * this.side ** 2 / 8
            this.calcPizzaArea = () => this.calcArea() * 8
            this.calcPizzaPrice = () => this.price * 8
        }
    }

    calcTotalArea = () => this.calcArea() * this.quantity
    calcTotalPrice = () => this.price * this.quantity
    calcPricePerCm2 = () => this.price * this.quantity / this.calcTotalArea() * 100 //cents
    showName() { this.boxNode.querySelector(".pizza-box__name").style.display = "block" }
    hideName() { this.boxNode.querySelector(".pizza-box__name").style.display = "none" }

    toggleName() {
        if(this.boxNode.querySelector(".pizza-box__name").style.display == "block") {
            this.setName()
            this.hideName()
            this.update(true, false, false, false)
        } else this.showName()
    }

    setName(name) {
        this.name = isValidName(name)
        this.update(false, false, false)
    }

    setQuantity(quantity) {
        this.quantity = isValidNumber(quantity)
        this.update()
    }

    setPrice(price) {
        this.price = isValidNumber(price)
        this.update()
    }

    setDiameter(diameter) {
        this.diameter = isValidNumber(diameter)
        this.update()
    }

    setLength(length) {
        this.length = isValidNumber(length)
        this.update()
    }

    setWidth(width) {
        this.width = isValidNumber(width)
        this.update()
    }

    setSide(side) {
        this.side = isValidNumber(side)
        this.update()
    }

    setRandomValues() {
        this.setQuantity(getRandomIntiger(1, 3))
        this.setPrice(getRandomIntiger(1000, 3000) / 100)

        if(this.shape == "c") {
            this.setDiameter(getRandomIntiger(2000, 6000) / 100)
        } else if(this.shape == "r") {
            this.setLength(getRandomIntiger(3000, 6000) / 100)
            this.setWidth(getRandomIntiger(2000, 4000) / 100)
        } else if(this.shape == "s") {
            this.setPrice((this.price / 8).toFixed(2))
            this.setSide(getRandomIntiger(1000, 4000) / 100)
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
        return exportData.join("_")
    }

    exportToUrl() {
        const newURL = prompt("Click OK to copy", encodeURI(location.origin + location.pathname + "?pizzas=" + this.exportData()))
        if(newURL) navigator.clipboard.writeText(newURL)
    }

    delete() {
        this.boxNode.remove()
        pizzas.splice(pizzas.indexOf(this), 1)
        this.update(false, false)
    }

    duplicate() { importPizzas(this.exportData()) }

    toggleExclusion() { //exclude from finding best
        this.boxNode.classList.toggle("pizza-box--exclude")
        this.update(false, false)
    }

    updateBoxInputs() {
        if(this.boxNode) {
            if(this.name) this.showName()
            this.boxNode.querySelector(".pizza-box__name").value = this.name ? this.name.replaceAll("-", " ") : ""
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
            this.boxNode.querySelector(".pizza-box__total-area").innerText = isValidNumber(this.calcTotalArea().toFixed(2)) ?? ""
            this.boxNode.querySelector(".pizza-box__total-price").innerText = isValidNumber(this.calcTotalPrice().toFixed(2)) ?? ""
            this.boxNode.querySelector(".pizza-box__price-cm2").innerText = isValidNumber(this.calcPricePerCm2().toFixed(2)) ?? ""

            if(this.shape == "c") this.boxNode.querySelector(".pizza-box__slice-price").innerText = isValidNumber(this.calcSlicePrice().toFixed(2)) ?? ""
            else if(this.shape == "s") {
                this.boxNode.querySelector(".pizza-box__pizza-area").innerText = isValidNumber(this.calcPizzaArea().toFixed(2)) ?? ""
                this.boxNode.querySelector(".pizza-box__pizza-price").innerText = isValidNumber(this.calcPizzaPrice().toFixed(2)) ?? ""
            }
        }
    }

    update(updateInputs = false, updateOutputs = true, markPizzas = true, setUrl = true) {
        if(updateInputs) this.updateBoxInputs()
        if(updateOutputs) this.updateBoxOutputs()
        if(markPizzas) markBestPizzas()
        if(setUrl) setUrlWithPizzas()
    }
}

function findBestPizzas() {
    const best = []
    for(const pizza of pizzas) {
        if(!isValidNumber(pizza.calcPricePerCm2()) || pizza.boxNode.classList.contains(("pizza-box--exclude"))) continue
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
    if(!isValidShape(shape)) return false

    const newPizza = new Pizza(shape, ...args)
    const newBox = document.createElement("div")
    newBox.className = "pizza-box"
    newBox.pizza = newPizza
    main.insertBefore(newBox, document.querySelector(".pizza-add"))
    newPizza.boxNode = newBox

    newBox.innerHTML += `
    <div class="pizza-box__options-bar">
        <p class="pizza-box__id">#${newPizza.id}</p>

        <button class="pizza-box__button" title="Add/remove name" onclick="this.parentNode.parentNode.pizza.toggleName(); this.blur()">
            <img src="images/icons/edit.png">
        </button>

        <button class="pizza-box__button" title="Randomize" onclick="this.parentNode.parentNode.pizza.setRandomValues(); this.blur()">
            <img src="images/icons/randomize.png">
        </button>

        <button class="pizza-box__button" title="Generate URL" onclick="this.parentNode.parentNode.pizza.exportToUrl(); this.blur()">
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

    <div class="pizza-box__info">
        <p>Quantity</p>
        <input class="pizza-box__quantity" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setQuantity(this.value)">
    </div>

    <div class="pizza-box__info">
        <p>Price [&#36;]</p>
        <input class="pizza-box__price" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setPrice(this.value)">
    </div>`

    if(newPizza.shape == "c") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Diameter [cm]</p>
            <input class="pizza-box__diameter" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setDiameter(this.value)">
        </div>

        <div class="pizza-box__info">
            <p>Slice price [&#36;]</p>
            <p class="pizza-box__output pizza-box__slice-price"></p>
        </div>`
    } else if(newPizza.shape == "r") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Length [cm]</p>
            <input class="pizza-box__length" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setLength(this.value)">
        </div>

        <div class="pizza-box__info">
            <p>Width [cm]</p>
            <input class="pizza-box__width" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setWidth(this.value)">
        </div>`
    } else if(newPizza.shape == "s") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Side [cm]</p>
            <input class="pizza-box__side" type="number" min="0" step="0.01" placeholder="0" oninput="this.parentNode.parentNode.pizza.setSide(this.value)">
        </div>

        <div class="pizza-box__info">
            <p>Pizza area [cm&#178;]</p>
            <p class="pizza-box__output pizza-box__pizza-area"></p>
        </div>

        <div class="pizza-box__info">
            <p>Pizza price [&#36;]</p>
            <p class="pizza-box__output pizza-box__pizza-price"></p>
        </div>`
    }

    newBox.innerHTML += `
    <div class="pizza-box__info">
        <p>Total area [cm&#178;]</p>
        <p class="pizza-box__output pizza-box__total-area"></p>
    </div>

    <div class="pizza-box__info">
        <p>Total price [&#36;]</p>
        <p class="pizza-box__output pizza-box__total-price"></p>
    </div>

    <div class="pizza-box__info">
        <p>Price per cm&#178; [&#162;]</p>
        <p class="pizza-box__output pizza-box__price-cm2"></p>
    </div>`

    hideInfoBar()
    newPizza.update(true)
}

const isValidShape = shape => ["c", "C", "r", "R", "s", "S"].includes(shape) ? shape.toLowerCase() : undefined
const isValidName = name => name ? name.trim().replaceAll(" ", "-") : undefined
const isValidNumber = number => isFinite(parseFloat(number)) ? parseFloat(number) : undefined
function addMultiplePizzas(quantity, ...args) { for(let i = 1; i <= quantity; i++) addPizza(...args) }
function deleteAllPizzas() { for(const pizza of pizzas.toReversed()) pizza.delete() }
function importPizzas(pizzasData) { for(const pizzaData of pizzasData.split(" ")) addPizza(...pizzaData.split("_")) }
function setUrlWithPizzas() { history.replaceState({}, "", exportPizzasToUrl()) } //sets new url in address bar without loading it

function exportPizzasToUrl() {
    const newUrl = new URL(location.origin + location.pathname)
    for(const pizza of pizzas) newUrl.search += (newUrl.search ? "+" : "pizzas=") + pizza.exportData()
    return encodeURI(newUrl.href)
}

function importPizzasFromUrl(url) {
    const newUrl = new URL(decodeURIComponent(url))
    if(newUrl.search.includes("pizzas")) importPizzas(newUrl.searchParams.get("pizzas"))
}

importPizzasFromUrl(location.href)