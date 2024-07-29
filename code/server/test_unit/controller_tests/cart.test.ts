import { test, expect, jest, afterEach } from "@jest/globals"
import CartDAO from "../../src/dao/cartDAO"
import CartController from "../../src/controllers/cartController"
import { DateError } from "../../src/utilities";
import { Cart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import ProductDAO from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";

jest.mock("../../src/dao/cartDAO")
const dayjs = require('dayjs')

afterEach(() => {
    jest.clearAllMocks();
});

const user:User = {
    username: "test",
    name: "test",
    surname: "test",
    role: Role.CUSTOMER,
    address: "test",
    birthdate: "test"
}

//Unit test addToCart method in CartController
test("addToCart - Product not found", async () => {
    jest.spyOn(CartDAO.prototype, "checkProduct").mockResolvedValue(-1)
    const cartController = new CartController();
    try {
        await cartController.addToCart(user, "testProduct");
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

test("addToCart - Product out of stock", async () => {
    jest.spyOn(CartDAO.prototype, "checkProduct").mockResolvedValue(0)
    const cartController = new CartController();
    try {
        await cartController.addToCart(user, "test");
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

test("addToCart - Product added to cart", async () => {
    jest.spyOn(CartDAO.prototype, "checkProduct").mockResolvedValue(1)
    jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValue(true)
    const cartController = new CartController();
    const result = await cartController.addToCart(user, "test");
    expect(result).toBe(true);
});

//Unit test getCart method in CartController
test("getCart - Cart not found", async () => {
    jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValue(null as unknown as Cart)
    const cartController = new CartController();
    const result = await cartController.getCart(user);
    expect(result).toEqual({customer: "test", paid: false, products: [], total: 0, paymentDate: null});
});

test("getCart - Cart found", async () => {
    jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValue({customer: "test", paid: false, products: [], total: 0, paymentDate: ""})
    const cartController = new CartController();
    const result = await cartController.getCart(user);
    expect(result).toEqual({customer: "test", paid: false, products: [], total: 0, paymentDate: ""});
});

//Unit test checkoutCart method in CartController
test("checkoutCart - Empty cart", async () => {
    jest.spyOn(CartDAO.prototype, "isCartEmpty").mockResolvedValue(true)
    const cartController = new CartController();
    try {
        await cartController.checkoutCart(user);
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

test("checkoutCart - Product out of stock", async () => {
    jest.spyOn(CartDAO.prototype, "isCartEmpty").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "isOutOfStock").mockResolvedValue(true)
    const cartController = new CartController();
    try {
        await cartController.checkoutCart(user);
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

test("checkoutCart - Quantity higher than stock", async () => {
    jest.spyOn(CartDAO.prototype, "isCartEmpty").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "isOutOfStock").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "isQuantityHigherThanStock").mockResolvedValue(true)
    const cartController = new CartController();
    try {
        await cartController.checkoutCart(user);
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});

test("checkoutCart - Cart checked out", async () => {
    jest.spyOn(CartDAO.prototype, "isCartEmpty").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "isOutOfStock").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "isQuantityHigherThanStock").mockResolvedValue(false)
    jest.spyOn(CartDAO.prototype, "getProductsInCart").mockResolvedValue([{model: "test", quantity: 1, category: Category.APPLIANCE, price: 1}])
    jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValue(true)
    jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValue(true)
    const cartController = new CartController();
    const result = await cartController.checkoutCart(user);
    expect(result).toBe(true);
});

//Unit test getCustomerCarts method in CartController
test("getCustomerCarts - No carts found", async () => {
    jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValue([])
    const cartController = new CartController();
    const result = await cartController.getCustomerCarts(user);
    expect(result).toEqual([]);
});

test("getCustomerCarts - Carts found", async () => {
    jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValue([{
        customer: "test",
        paid: false,
        products: [],
        total: 0,
        paymentDate: ""
    }])
    const cartController = new CartController();
    const result = await cartController.getCustomerCarts(user);
    expect(result).toEqual([{
        customer: "test",
        paid: false,
        products: [],
        total: 0,
        paymentDate: ""
    }]);
});

//Unit test removeProductFromCart method in CartController 
test("removeProductFromCart - Product not found", async () => {
    jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValue(false)
    const cartController = new CartController();
    const result = await cartController.removeProductFromCart(user, "test");
    expect(result).toBe(false);
});

test("removeProductFromCart - Product removed", async () => {
    jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValue(true)
    const cartController = new CartController();
    const result = await cartController.removeProductFromCart(user, "test");
    expect(result).toBe(true);
});

//Unit test clearCart method in CartController
test("clearCart - Cart cleared", async () => {
    jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValue(true)
    const cartController = new CartController();
    const result = await cartController.clearCart(user);
    expect(result).toBe(true);
});

//Unit test deleteAllCarts method in CartController
test("deleteAllCarts - Carts deleted", async () => {
    jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValue(true)
    const cartController = new CartController();
    const result = await cartController.deleteAllCarts();
    expect(result).toBe(true);
});

//Unit test getAllCarts method in CartController
test("getAllCarts - No carts found", async () => {
    jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValue([])
    const cartController = new CartController();
    const result = await cartController.getAllCarts();
    expect(result).toEqual([]);
});

test("getAllCarts - Carts found", async () => {
    jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValue([{
        customer: "test",
        paid: false,
        products: [],
        total: 0,
        paymentDate: ""
    }])
    const cartController = new CartController();
    const result = await cartController.getAllCarts();
    expect(result).toEqual([{
        customer: "test",
        paid: false,
        products: [],
        total: 0,
        paymentDate: ""
    }]);
});




