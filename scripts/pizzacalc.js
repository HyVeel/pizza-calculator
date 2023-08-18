const main = document.getElementById("main")
const infoPanel = document.getElementById("info-panel")
const pizzas = []

class Pizza
{
    static counter = 0

    constructor(quantity = 1, price)
    {
        pizzas.push(this)
        this.id = Pizza.counter++
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
        document.querySelector("#" + this.boxNode.id + " input[name='quantity']").value = this.quantity ?? ""
        document.querySelector("#" + this.boxNode.id + " input[name='price']").value = this.price ?? ""
    }

    updateBoxOutputs()
    {
        document.querySelector("#" + this.boxNode.id + " .pizza-total-area").innerText = Number.isFinite(this.calcTotalArea()) ? this.calcTotalArea().toFixed(2) : ""
        document.querySelector("#" + this.boxNode.id + " .pizza-total-price").innerText = Number.isFinite(this.calcTotalPrice()) ? this.calcTotalPrice().toFixed(2) : ""
        document.querySelector("#" + this.boxNode.id + " .pizza-price-cm2").innerText = Number.isFinite(this.calcPricePerCm2()) ? this.calcPricePerCm2().toFixed(2) : ""
        markBestPizzas()
    }
}

class CircularPizza extends Pizza
{
    constructor(quantity, price, diameter)
    {
        super(quantity, price)
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
            document.querySelector("#" + this.boxNode.id + " input[name='diameter']").value = this.diameter
        }
    }

    updateBoxOutputs()
    {
        super.updateBoxOutputs()
        document.querySelector("#" + this.boxNode.id + " .pizza-slice-price").innerText = Number.isFinite(this.calcSlicePrice()) ? this.calcSlicePrice().toFixed(2) : ""
    }
}

class RectangularPizza extends Pizza
{
    constructor(quantity, price, length, width)
    {
        super(quantity, price)
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
            document.querySelector("#" + this.boxNode.id + " input[name='length']").value = this.length
            document.querySelector("#" + this.boxNode.id + " input[name='width']").value = this.width
        }
    }
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

function addPizza(shape, quantity, price, x, y)
{
    if(infoPanel) infoPanel.remove()

    let newPizza
    if(shape == "c") newPizza = new CircularPizza(quantity, price, x)
    else if(shape == "r") newPizza = new RectangularPizza(quantity, price, x, y)

    const newPizzaBox = document.createElement("div")
    newPizzaBox.id = "id-" + newPizza.id
    newPizzaBox.classList.add("pizza-box")
    main.insertBefore(newPizzaBox, document.getElementById("pizza-add"))
    newPizza.boxNode = newPizzaBox

    newPizzaBox.innerHTML += `
    <img src="images/icons/` + shape + `-pizza.png">

    <div class="pizza-info">
        <p>Quantity</p>
        <input name="quantity" type="number" min="0" placeholder="0" oninput="pizzas[` + newPizza.id + `].setQuantity(this.value)">
    </div>

    <div class="pizza-info">
        <p>Price [&#36;]</p>
        <input name="price" type="number" min="0" placeholder="0" oninput="pizzas[` + newPizza.id + `].setPrice(this.value)">
    </div>`

    if(shape == "c")
    {
        newPizzaBox.innerHTML += `
        <div class="pizza-info">
            <p>Diameter [cm]</p>
            <input name="diameter" type="number" min="0" placeholder="0" oninput="pizzas[` + newPizza.id + `].setDiameter(this.value)">
        </div>
        
        <div class="pizza-info">
            <p>Slice price [&#36;]</p>
            <p class="output pizza-slice-price"></p>
        </div>`
    }
    else if(shape == "r")
    {
        newPizzaBox.innerHTML += `
        <div id="pizza-length"  class="pizza-info">
            <p>Length [cm]</p>
            <input name="length" type="number" min="0" placeholder="0" oninput="pizzas[` + newPizza.id + `].setLength(this.value)">
        </div>

        <div id="pizza-width"  class="pizza-info">
            <p>Width [cm]</p>
            <input name="width" type="number" min="0" placeholder="0" oninput="pizzas[` + newPizza.id + `].setWidth(this.value)">
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