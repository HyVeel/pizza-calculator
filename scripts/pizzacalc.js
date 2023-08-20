const main = document.getElementById("main")
const infoPanel = document.getElementById("info-panel")
const pizzas = []

class Pizza
{
    static counter = 0

    constructor(quantity = 1, price)
    {
        pizzas.push(this)
        this.id = ++Pizza.counter /* useless */
        this.quantity = quantity
        this.price = price
    }

    calcTotalArea = () => this.calcArea() * this.quantity
    calcTotalPrice = () => this.price * this.quantity
    calcPricePerCm2 = () => this.price * this.quantity / this.calcTotalArea() * 100 //cents
    
    setQuantity(quantity)
    {
        this.quantity = parseInt(quantity)
        this.updateBoxOutputs()
    }

    setPrice(price)
    {
        this.price = parseFloat(price)
        this.updateBoxOutputs()
    }

    updateBoxInputs()
    {
        this.boxNode.querySelector(".pizza-quantity").value = this.quantity ?? ""
        this.boxNode.querySelector(".pizza-price").value = this.price ?? ""
    }

    updateBoxOutputs()
    {
        this.boxNode.querySelector(".pizza-total-area").innerText = Number.isFinite(this.calcTotalArea()) ? this.calcTotalArea().toFixed(2) : ""
        this.boxNode.querySelector(".pizza-total-price").innerText = Number.isFinite(this.calcTotalPrice()) ? this.calcTotalPrice().toFixed(2) : ""
        this.boxNode.querySelector(".pizza-price-cm2").innerText = Number.isFinite(this.calcPricePerCm2()) ? this.calcPricePerCm2().toFixed(2) : ""
        markBestPizzas()
    }

    exportPizza() { return [this.shape, this.quantity, this.price] }
    duplicatePizza = () => importPizza(this.exportPizza())
}

class CircularPizza extends Pizza
{
    constructor(quantity, price, diameter)
    {
        super(quantity, price)
        this.shape = "c"
        this.diameter = diameter
    }

    calcArea = () => Math.PI * (this.diameter / 2) ** 2
    calcSlicePrice = () => this.price / 8

    setDiameter(diameter)
    {
        this.diameter = parseFloat(diameter)
        this.updateBoxOutputs()
    }

    updateBoxInputs()
    {
        if(this.boxNode)
        {
            super.updateBoxInputs()
            this.boxNode.querySelector(".pizza-diameter").value = this.diameter ?? ""
        }
    }

    updateBoxOutputs()
    {
        super.updateBoxOutputs()
        this.boxNode.querySelector(".pizza-slice-price").innerText = Number.isFinite(this.calcSlicePrice()) ? this.calcSlicePrice().toFixed(2) : ""
    }

    exportPizza = () => super.exportPizza().concat(this.diameter)
}

class RectangularPizza extends Pizza
{
    constructor(quantity, price, length, width)
    {
        super(quantity, price)
        this.shape = "r"
        this.length = length
        this.width = width
    }

    calcArea = () => this.length * this.width

    setLength(length)
    {
        this.length = parseFloat(length)
        this.updateBoxOutputs()
    }

    setWidth(width)
    {
        this.width = parseFloat(width)
        this.updateBoxOutputs()
    }

    updateBoxInputs()
    {
        if(this.boxNode)
        {
            super.updateBoxInputs()
            this.boxNode.querySelector(".pizza-length").value = this.length ?? ""
            this.boxNode.querySelector(".pizza-width").value = this.width ?? ""
        }
    }

    exportPizza = () => super.exportPizza().concat(this.length, this.width)
}

class PizzaSlice extends Pizza
{
    constructor(quantity, price, side)
    {
        super(quantity, price)
        this.shape = "s"
        this.side = side
    }

    calcArea = () => Math.PI * this.side ** 2 / 8
    calcPizzaArea = () => this.calcArea() * 8
    calcPizzaPrice = () => this.price * 8

    setSide(side)
    {
        this.side = parseFloat(side)
        this.updateBoxOutputs()
    }

    updateBoxInputs()
    {
        if(this.boxNode)
        {
            super.updateBoxInputs()
            this.boxNode.querySelector(".pizza-side").value = this.side ?? ""
        }
    }

    updateBoxOutputs()
    {
        super.updateBoxOutputs()
        this.boxNode.querySelector(".slice-pizza-area").innerText = Number.isFinite(this.calcPizzaArea()) ? this.calcPizzaArea().toFixed(2) : ""
        this.boxNode.querySelector(".slice-pizza-price").innerText = Number.isFinite(this.calcPizzaPrice()) ? this.calcPizzaPrice().toFixed(2) : ""
    }

    exportPizza = () => super.exportPizza().concat(this.side)
}

function findBestPizzas()
{
    let best = []
    for(const pizza of pizzas)
    {
        if(!isFinite(pizza.calcPricePerCm2())) continue
        else if(!best[0]) best.push(pizza)
        else if(pizza.calcPricePerCm2() < best[0].calcPricePerCm2())
        {
            best = []
            best.push(pizza)
        }
        else if(pizza.calcPricePerCm2() == best[0].calcPricePerCm2())
        {
            if(pizza.calcPricePerCm2() == 0)
            {
                if(pizza.calcTotalArea() > best[0].calcTotalArea())
                {
                    best = []
                    best.push(pizza)
                }
                else if(pizza.calcTotalArea() == best[0].calcTotalArea()) best.push(pizza)
            }
            else best.push(pizza)
        }
    }
    return best
}

function markBestPizzas()
{
    removeBestPizzaMarks()
    for(const pizza of findBestPizzas()) pizza.boxNode.classList.add("best")
}

function removeBestPizzaMarks() { for(const box of document.querySelectorAll(".best")) box.classList.remove("best") }

function addPizza(shape, quantity, price, ...args)
{
    let newPizza
    if(shape == "c") newPizza = new CircularPizza(quantity, price, args[0])
    else if(shape == "r") newPizza = new RectangularPizza(quantity, price, args[0], args[1])
    else if(shape == "s") newPizza = new PizzaSlice(quantity, price, args[0])
    else return false

    if(infoPanel) infoPanel.remove()

    const newPizzaBox = document.createElement("div")
    newPizzaBox.className = "pizza-box"
    newPizzaBox.pizza = newPizza
    main.insertBefore(newPizzaBox, document.getElementById("pizza-add"))
    newPizza.boxNode = newPizzaBox

    newPizzaBox.innerHTML += `
    <img src="images/icons/` + newPizza.shape + `-pizza.png">

    <div class="pizza-info">
        <p>Quantity</p>
        <input class="pizza-quantity" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setQuantity(this.value)">
    </div>

    <div class="pizza-info">
        <p>Price [&#36;]</p>
        <input class="pizza-price" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setPrice(this.value)">
    </div>`

    if(shape == "c")
    {
        newPizzaBox.innerHTML += `
        <div class="pizza-info">
            <p>Diameter [cm]</p>
            <input class="pizza-diameter" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setDiameter(this.value)">
        </div>
        
        <div class="pizza-info">
            <p>Slice price [&#36;]</p>
            <p class="output pizza-slice-price"></p>
        </div>`
    }
    else if(shape == "r")
    {
        newPizzaBox.innerHTML += `
        <div class="pizza-info">
            <p>Length [cm]</p>
            <input class="pizza-length" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setLength(this.value)">
        </div>

        <div class="pizza-info">
            <p>Width [cm]</p>
            <input class="pizza-width" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setWidth(this.value)">
        </div>`
    }
    else if(shape == "s")
    {
        newPizzaBox.innerHTML += `
        <div class="pizza-info">
            <p>Side [cm]</p>
            <input class="pizza-side" type="number" min="0" placeholder="0" oninput="this.parentNode.parentNode.pizza.setSide(this.value)">
        </div>
        
        <div class="pizza-info">
            <p>Pizza area [cm&#178;]</p>
            <p class="output slice-pizza-area"></p>
        </div>
        
        <div class="pizza-info">
            <p>Pizza price [&#36;]</p>
            <p class="output slice-pizza-price"></p>
        </div>`
    }

    newPizzaBox.innerHTML += `
    <div class="pizza-info">
        <p>Total area [cm&#178;]</p>
        <p class="output pizza-total-area"></p>
    </div>

    <div class="pizza-info">
        <p>Total price [&#36;]</p>
        <p class="output pizza-total-price"></p>
    </div>

    <div class="pizza-info">
        <p>Price per cm&#178; [&#162;]</p>
        <p class="output pizza-price-cm2"></p>
    </div>`

    newPizza.updateBoxInputs()
    newPizza.updateBoxOutputs()
}

importPizza = pizza => addPizza(...pizza)