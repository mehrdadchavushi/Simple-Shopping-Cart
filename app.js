let cart = [];
const productDom = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartBtn = document.querySelector(".cart-btn");
const closeCart = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");

class Product {
  async getProducts() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const id = item.sys.id;
        const img = item.fields.image.fields.file.url;
        return { title, price, img, id };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class View {
  displayProducts(products) {
    let res = "";
    products.map((item) => {
      res += `<article class="product">
      <div class="img-container">
        <img 
        class="product-img" 
        src="${item.img}"
        alt="${item.title}" />
        <button 
        class="bag-btn" 
        data-id="${item.id}">
        افرودن به سبد خرید
        </button>
        </div>
        <h3>${item.title}</h3>
        <h4>${item.price}</h4>
        </article>`;
    });
    productDom.innerHTML = res;
  }
  getButtonAction() {
    const allButton = [...document.querySelectorAll(".bag-btn")];
    allButton.forEach((btn) => {
      let id = btn.dataset.id;
      btn.addEventListener("click", (e) => {
        const cartItem = { ...Storage.getData(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCartItem(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCartSidebar();
      });
    });
  }

  setCartValues(cart) {
    let totalPrice = 0;
    let totalItem = 0;

    cart.map((item) => {
      totalPrice = totalPrice + item.price * item.amount;
      totalItem = totalItem + item.amount;
    });
    cartTotal.innerText = totalPrice;
    cartItems.innerText = totalItem;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = ` 
    <img src= ${item.img} alt=${item.title} />
    <div>
      <h4> ${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>حذف</span>
    </div>
    <div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class="item-amount">${item.amount}</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(div);
  }

  initApp() {
    cart = Storage.getCart();
    this.populate(cart);
    this.setCartValues(cart);

    cartBtn.addEventListener("click", this.showCartSidebar);
    closeCart.addEventListener("click", this.closeCartSidebar);
  }

  populate(cart) {
    cart.forEach((item) => {
      return this.addCartItem(item);
    });
  }

  cartProcess() {
    clearCartBtn.addEventListener("click", () => this.clearCart());
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        this.removeCartItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      }
      if (e.target.classList.contains("fa-chevron-up")) {
        let addItem = e.target;
        let id = addItem.dataset.id;
        let product = cart.find((item) => {
          return item.id == id;
        });
        product.amount += 1;
        Storage.saveCartItem(cart);
        this.setCartValues(cart);

        addItem.nextElementSibling.innerText = product.amount;
      }
      if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;

        let product = cart.find((item) => {
          return item.id === id;
        });

        product.amount = product.amount - 1;

        if (product.amount > 0) {
          Storage.saveCartItem(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = product.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeCartItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => {
      return item.id;
    });
    cartItems.forEach((item) => {
      return this.removeCartItem(item);
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeCartItem(id) {
    cart = cart.filter((item) => {
      return item.id !== id;
    });
    Storage.saveCartItem(cart);
    this.setCartValues(cart);
  }

  showCartSidebar() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }

  closeCartSidebar() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }
}

class Storage {
  static saveData(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getData(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id === id);
  }
  static saveCartItem(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const view = new View();
  const product = new Product();

  view.initApp();

  product
    .getProducts()
    .then((data) => {
      view.displayProducts(data);
      Storage.saveData(data);
    })
    .then(() => {
      view.getButtonAction();
      view.cartProcess();
    });
});
