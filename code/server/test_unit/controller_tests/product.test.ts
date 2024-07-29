import { test, expect, jest, afterEach } from "@jest/globals"
import ProductController from "../../src/controllers/productController"
import ProductDAO from "../../src/dao/productDAO"
import { Category, Product } from "../../src/components/product";
import { DateError } from "../../src/utilities";
import { ProductNotFoundError } from "../../src/errors/productError";

jest.mock("../../src/dao/productDAO")
const dayjs = require('dayjs')


afterEach(() => {
    jest.clearAllMocks();
});

// Unit test for registerProducts method in ProductController
test("It should return the product created", async () => {
    jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValue(true)
    const controller = new ProductController()
    const response = await controller.registerProducts("model", "category", 22, "description", 10, "10-10-2021")
    
    expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(1);

    expect(response).toBe(undefined)
});

// Unit test for registerProducts method in ProductController when the product already exists
test("It should return an error when the product already exists", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 10, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.registerProducts("modelFuture", "category", 22, "description", 10, "10-10-2021")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test for registerProducts method in ProductController when the arrival date is in the future
test("It should return an error when the arrival date is in the future", async () => {
    jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValue(true)
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product);


    const controller = new ProductController()
    
    try {
        await controller.registerProducts("model", "category", 22, "description", 10, dayjs().add(1, 'year').format('YYYY-MM-DD'))
    }
    catch (error) {
        expect(error).toBeInstanceOf(DateError);
    }
});

// Unit test for changeProductQuantity method in ProductController
test("It should return the new quantity of the product", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValue(true)
    const controller = new ProductController()
    const response = await controller.changeProductQuantity("model", 5, "2021-10-11")
    
    expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);
    expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);

    expect(response).toBe(15)
});

// Unit tests for changeProductQuantity method in ProductController if product is not found
test("It should return an error when the product is not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product);
    const controller = new ProductController()
    
    try {
        await controller.changeProductQuantity("model", 5, "2021-10-11")
    }
    catch (error) {
        expect(error).toBeInstanceOf(ProductNotFoundError);
    }
});

// Unit test for changeProductQuantity method in ProductController when the change date is before the arrival date
test("It should return an error when the change date is before the arrival date", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.changeProductQuantity("model", 5, "2021-10-09")
    }
    catch (error) {
        expect(error).toBeInstanceOf(DateError);
    }
});

// Unit test for sellProduct method in ProductController
test("It should return the new quantity of the product after sell", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValue(true)
    const controller = new ProductController()
    const response = await controller.sellProduct("model", 5, "2021-10-11")
    
    expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);
    expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);

    expect(response).toBe(5)
});

// Unit test for sellProduct method in ProductController
test("It should return an error when the product is not found", async () => {
    const product:Product = {
        model: "modelNULL", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.sellProduct("model", 5, "2021-10-11")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test for sellProduct method in ProductController
test("It should return an error when the selling date is before the arrival date", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.sellProduct("model", 5, "2021-10-09")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test for sellProduct method in ProductController
test("It should return an error when the product is out of stock", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 0, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.sellProduct("model", 5, "2021-10-11")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test for sellProduct method in ProductController
test("It should return an error when the quantity to sell is greater than the available quantity", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.sellProduct("model", 15, "2021-10-11")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test for sellProduct method in ProductController if product is not found
test("It should return an error when the product is not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product);
    const controller = new ProductController()
    
    try {
        await controller.sellProduct("model", 5, "2021-10-11")
    }
    catch (error) {
        expect(error).toBeInstanceOf(ProductNotFoundError);
    }
});

// Unit test for getProductByModel method in the getProducts controller method ProductDAO
test("It should return the product found", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    const response = await controller.getProducts("model", null, "model")
    expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test for getProductsByCategory method in the getProducts controller method ProductDAO
test("It should return the products found by category", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductsByCategory").mockResolvedValue([product])
    const controller = new ProductController()
    const response = await controller.getProducts("category", "Appliance", null)
    expect(ProductDAO.prototype.getProductsByCategory).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test for getAllProducts method in the getProducts controller method ProductDAO
test("It should return all products", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValue([product])
    const controller = new ProductController()
    const response = await controller.getProducts(null, null, null)
    expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test for getAvailableProductsByModel method in the getAvailableProducts controller method ProductDAO
test("It should return the available products found by model", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getAvailableProductsByModel").mockResolvedValue([product])
    const controller = new ProductController()
    const response = await controller.getAvailableProducts("model", null, "model")
    expect(ProductDAO.prototype.getAvailableProductsByModel).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test for getAvailableProductsByCategory method in the getAvailableProducts controller method ProductDAO
test("It should return the available products found by category", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getAvailableProductsByCategory").mockResolvedValue([product])
    const controller = new ProductController()
    const response = await controller.getAvailableProducts("category", "Appliance", null)
    expect(ProductDAO.prototype.getAvailableProductsByCategory).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test for getAvailableProducts method in the getAvailableProducts controller method ProductDAO
test("It should return all available products", async () => {
    const product:Product = {
        model: "model", 
        category: Category.SMARTPHONE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValue([product])
    const controller = new ProductController()
    const response = await controller.getAvailableProducts(null, null, null)
    expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);

    expect(response).toStrictEqual([product])
});

// Unit test deleteAllProducts method in ProductController
test("It should return true when all products are deleted", async () => {
    jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValue(true)
    const controller = new ProductController()
    const response = await controller.deleteAllProducts()
    
    expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);

    expect(response).toBe(true)
});

// Unit test deleteProduct method in ProductController
test("It should return true when a product is deleted", async () => {
    const product:Product = {
        model: "model", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValue(true)
    const controller = new ProductController()
    const response = await controller.deleteProduct("model")
    
    expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);
    expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);

    expect(response).toBe(true)
});

// Unit test deleteProduct method in ProductController
test("It should return an error when the product is not found", async () => {
    const product:Product = {
        model: "modelNULL", 
        category: Category.APPLIANCE,
        quantity: 10, 
        arrivalDate: "2021-10-10", 
        sellingPrice: 22, 
        details: "description"}
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(product)
    const controller = new ProductController()
    
    try {
        await controller.deleteProduct("model")
    }
    catch (error) {
        expect(error).toBeInstanceOf(Error);
    }
});

// Unit test deleteProduct method in ProductController if product is not found
test("It should return an error when the product is not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product);
    const controller = new ProductController()
    
    try {
        await controller.deleteProduct("model")
    }
    catch (error) {
        expect(error).toBeInstanceOf(ProductNotFoundError);
    }
});


