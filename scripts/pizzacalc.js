const pizzas = []

class Pizza {
    static counter = 0

    constructor(shape = "c", quantity = 1, price, ...args) {
        pizzas.push(this)
        this.id = ++Pizza.counter
        this.shape = shape
        this.quantity = quantity
        this.price = price

        if(shape === "c") {
            this.diameter = args[0]
            this.calcArea = () => Math.PI * (this.diameter / 2) ** 2
            this.calcSlicePrice = () => this.price / 8

            this.setDiameter = diameter => {
                this.diameter = parseFloat(diameter)
                this.updateBoxOutputs()
            }
        } else if(shape === "r") {
            this.length = args[0]
            this.width = args[1]
            this.calcArea = () => this.length * this.width

            this.setLength = length => {
                this.length = parseFloat(length)
                this.updateBoxOutputs()
            }

            this.setWidth = width => {
                this.width = parseFloat(width)
                this.updateBoxOutputs()
            }
        } else if(shape === "s") {
            this.side = args[0]
            this.calcArea = () => Math.PI * this.side ** 2 / 8
            this.calcPizzaArea = () => this.calcArea() * 8
            this.calcPizzaPrice = () => this.price * 8

            this.setSide = side => {
                this.side = parseFloat(side)
                this.updateBoxOutputs()
            }
        }
    }

    calcTotalArea = () => this.calcArea() * this.quantity
    calcTotalPrice = () => this.price * this.quantity
    calcPricePerCm2 = () => this.price * this.quantity / this.calcTotalArea() * 100 //cents

    setQuantity(quantity) {
        this.quantity = parseInt(quantity)
        this.updateBoxOutputs()
    }

    setPrice(price) {
        this.price = parseFloat(price)
        this.updateBoxOutputs()
    }

    deletePizza() {
        this.boxNode.remove()
        pizzas.splice(pizzas.indexOf(this), 1)
        markBestPizzas()
    }

    exportPizza() {
        if(this.shape === "c") return [this.shape, this.quantity, this.price, this.diameter]
        else if(this.shape === "r") return [this.shape, this.quantity, this.price, this.length, this.width]
        else if(this.shape === "s") return [this.shape, this.quantity, this.price, this.side]
    }

    duplicatePizza() { importPizza(this.exportPizza()) }

    updateBoxInputs() {
        this.boxNode.querySelector(".pizza-box__quantity").value = this.quantity ?? ""
        this.boxNode.querySelector(".pizza-box__price").value = this.price ?? ""

        if(this.shape === "c") this.boxNode.querySelector(".pizza-box__diameter").value = this.diameter ?? ""
        else if(this.shape === "r") {
            this.boxNode.querySelector(".pizza-box__length").value = this.length ?? ""
            this.boxNode.querySelector(".pizza-box__width").value = this.width ?? ""
        } else if(this.shape === "s") this.boxNode.querySelector(".pizza-box__side").value = this.side ?? ""
    }

    updateBoxOutputs() {
        this.boxNode.querySelector(".pizza-box__total-area").innerText = Number.isFinite(this.calcTotalArea()) ? this.calcTotalArea().toFixed(2) : ""
        this.boxNode.querySelector(".pizza-box__total-price").innerText = Number.isFinite(this.calcTotalPrice()) ? this.calcTotalPrice().toFixed(2) : ""
        this.boxNode.querySelector(".pizza-box__price-cm2").innerText = Number.isFinite(this.calcPricePerCm2()) ? this.calcPricePerCm2().toFixed(2) : ""

        if(this.shape === "c") this.boxNode.querySelector(".pizza-box__slice-price").innerText = Number.isFinite(this.calcSlicePrice()) ? this.calcSlicePrice().toFixed(2) : ""
        else if(this.shape === "s") {
            this.boxNode.querySelector(".pizza-box__pizza-area").innerText = Number.isFinite(this.calcPizzaArea()) ? this.calcPizzaArea().toFixed(2) : ""
            this.boxNode.querySelector(".pizza-box__pizza-price").innerText = Number.isFinite(this.calcPizzaPrice()) ? this.calcPizzaPrice().toFixed(2) : ""
        }
        markBestPizzas()
    }
}

function findBestPizzas() {
    const best = []
    for(const pizza of pizzas) {
        if(!isFinite(pizza.calcPricePerCm2())) continue
        else if(!best[0]) best.push(pizza)
        else if(pizza.calcPricePerCm2() < best[0].calcPricePerCm2()) {
            best.length = 0
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

function addPizza(shape, quantity, price, ...args) {
    if(!["c", "r", "s", undefined].includes(shape)) return false

    hideInfoPanel()

    const newPizza = new Pizza(shape, quantity, price, ...args)
    const newBox = document.createElement("div")
    newBox.className = "pizza-box"
    newBox.pizza = newPizza
    main.insertBefore(newBox, document.querySelector(".pizza-add"))
    newPizza.boxNode = newBox

    newBox.innerHTML += `
    <img class="pizza-box__image" src="images/` + newPizza.shape + `-pizza.png">

    <div class="pizza-box__info">
        <p>Quantity</p>
        <input class="pizza-box__quantity" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setQuantity(this.value)">
    </div>

    <div class="pizza-box__info">
        <p>Price [&#36;]</p>
        <input class="pizza-box__price" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setPrice(this.value)">
    </div>`

    if(newPizza.shape === "c") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Diameter [cm]</p>
            <input class="pizza-box__diameter" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setDiameter(this.value)">
        </div>

        <div class="pizza-box__info">
            <p>Slice price [&#36;]</p>
            <p class="pizza-box__output pizza-box__slice-price"></p>
        </div>`
    } else if(newPizza.shape === "r") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Length [cm]</p>
            <input class="pizza-box__length" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setLength(this.value)">
        </div>

        <div class="pizza-box__info">
            <p>Width [cm]</p>
            <input class="pizza-box__width" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setWidth(this.value)">
        </div>`
    } else if(newPizza.shape === "s") {
        newBox.innerHTML += `
        <div class="pizza-box__info">
            <p>Side [cm]</p>
            <input class="pizza-box__side" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setSide(this.value)">
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
    </div>

    <p class="pizza-box__id">#` + newPizza.id + `</p>

    <div class="pizza-box__buttons">
        <button class="pizza-box__duplicate" title="Duplicate" tabindex="0" onclick="this.parentNode.parentNode.pizza.duplicatePizza(); this.blur()">
            <img src="images/icons/duplicate.png">
        </button>

        <button class="pizza-box__delete" title="Delete" tabindex="0" onclick="this.parentNode.parentNode.pizza.deletePizza()">
            <img src="images/icons/delete.png">
        </button>
    </div>`

    newPizza.updateBoxInputs()
    newPizza.updateBoxOutputs()
}

function addMultiplePizzas(quantity, ...args) { for(let i = 1; i <= quantity; i++) addPizza(...args) }
function deleteAllPizzas() { for(const pizza of pizzas.toReversed()) pizza.deletePizza() }
function importPizza(pizzaData) { addPizza(...pizzaData) }