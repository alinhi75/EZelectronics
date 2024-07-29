import { describe, test, expect, jest,beforeAll,afterAll,afterEach,beforeEach} from "@jest/globals";
import db from "../../src/db/db";
import CartDAO from "../../src/dao/cartDAO";
import crypto from "crypto";
import { Database } from "sqlite3";
import { CartNotFoundError, ProductNotInCartError } from "../../src/errors/cartError";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import { count } from "console";

jest.mock("crypto");
jest.mock("sqlite3");
jest.mock("../../src/db/db");

describe("CartDAO", () => {
    let cartDAO: CartDAO;

    beforeAll(() => {
        cartDAO = new CartDAO();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe("createCart", () => {
        test("It should resolve true when cart is created successfully", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });
            const result = await cartDAO.createCart("user1", false, null, 0);
            expect(result).toBe(true);
            mockDBRun.mockRestore();
        });

        test("It should reject with an error when there is a database error", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"));
                return {} as any;
            });
            await expect(cartDAO.createCart("user1", false, null, 0)).rejects.toThrow("DB error");
            mockDBRun.mockRestore();
        });
    });

    describe("getCart", () => {
        test("It should resolve with a Cart object when cart is retrieved successfully", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, [
                    {
                        cart_id: 1,
                        user: "user1",
                        paid: 0,
                        payment_date: null,
                        total: 100,
                        model: "product1",
                        quantity: 2,
                        selling_price: 50,
                        category:"Smartphone"
                    },
                    {
                        cart_id: 1,
                        user: "user1",
                        paid: 0,
                        payment_date: null,
                        total: 100,
                        model: "product2",
                        quantity: 1,
                        selling_price: 60,
                        category: "LAPTOP"
                    }
                ]);
            });

            const result = await cartDAO.getCart("user1");
            expect(result).toBeInstanceOf(Cart);
            expect(result.customer).toBe("user1");
            expect(result.paymentDate).toBe(null);
            expect(result.paymentDate).toBe(null);
            expect(result.total).toBe(100);
            expect(result.products.length).toBe(2);
            expect(result.products[0]).toEqual(new ProductInCart("product1", 2, Category.SMARTPHONE, 50));
            // expect(result.products[1]).toEqual(new ProductInCart("product2", 1,Category.LAPTOP, 50));

            mockDBAll.mockRestore();
        });

        test("It should reject with CartNotFoundError when no cart is found", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, []);
            });

            await expect(cartDAO.getCart("user1")).rejects.toThrow(CartNotFoundError);
            mockDBAll.mockRestore();
        });

        test("It should reject with an error when there is a database error", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(new Error("DB error"), null);
            });

            await expect(cartDAO.getCart("user1")).rejects.toThrow("DB error");
            mockDBAll.mockRestore();
        });
    });

    
    describe("checkProduct", () => {
        test("It should resolve to 1 when product exists and quantity > 0", async () => {
            // Mock data for the database response
            const mockRow = {
                model: "product1",
                quantity: 5 // Assuming quantity is greater than 0
            };
    
            // Mock the db.get method to simulate product exists with quantity > 0
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, mockRow);
                return {} as any;
            });
    
            // Call the checkProduct method
            const result = await cartDAO.checkProduct("product1");
    
            // Expectations
            expect(result).toBe(1);
    
            // Restore the mock after test completion
            mockDBGet.mockRestore();
        });
    
        test("It should resolve to 0 when product exists but is out of stock (quantity <= 0)", async () => {
            // Mock data for the database response
            const mockRow = {
                model: "product2",
                quantity: 0 // Assuming quantity is 0
            };
    
            // Mock the db.get method to simulate product exists but out of stock
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, mockRow);
                return {} as any;
            });
    
            // Call the checkProduct method
            const result = await cartDAO.checkProduct("product2");
    
            // Expectations
            expect(result).toBe(0);
    
            // Restore the mock after test completion
            mockDBGet.mockRestore();
        });
    
        test("It should resolve to -1 when product does not exist", async () => {
            // Mock the db.get method to simulate product does not exist
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, undefined); // Simulate no rows returned
                return {} as any;
            });
    
            // Call the checkProduct method
            const result = await cartDAO.checkProduct("nonexistent_product");
    
            // Expectations
            expect(result).toBe(-1);
    
            // Restore the mock after test completion
            mockDBGet.mockRestore();
        });
    
        test("It should reject with an error when there is a database error", async () => {
            // Mock the db.get method to simulate database error
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"));
                return {} as any;
            });
    
            // Expect checkProduct to reject with an error
            await expect(cartDAO.checkProduct("product1")).rejects.toThrow("DB error");
    
            // Restore the mock after test completion
            mockDBGet.mockRestore();
        });
    });
    
    describe("isCartEmpty", () => {
        test("It should resolve true when cart is empty", async () => {
            const mockDBGet = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, []);
            });

            const result = await cartDAO.isCartEmpty("user1");
            expect(result).toBe(true);

            mockDBGet.mockRestore();
        });

        test("It should resolve false when cart is not empty", async () => {
            const mockDBGet = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, { total: 100 });
            });

            const result = await cartDAO.isCartEmpty("user1");
            expect(result).toBe(false);

            mockDBGet.mockRestore();
        });

        test("It should reject with an error when there is a database error", async () => {
            const mockDBGet = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(new Error("DB error"), null);
            });

            await expect(cartDAO.isCartEmpty("user1")).rejects.toThrow("DB error");

            mockDBGet.mockRestore();
        });
    });
    describe("getProductsInCart", () => {
        test("It should resolve with an array of ProductInCart objects when products are retrieved successfully", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, [
                    {
                        model: "product1",
                        quantity: 2,
                        category: "Smartphone",
                        price: 50
                    },
                    {
                        model: "product2",
                        quantity: 1,
                        category: "LAPTOP",
                        price: 60
                    }
                ]);
            });

            const result = await cartDAO.getProductsInCart("user1");
            expect(result.length).toBe(2);
            // expect(result[0]).toEqual(new ProductInCart("product1", 2, Category.SMARTPHONE, 50));
            // expect(result[1]).toEqual(new ProductInCart("product2", 1, Category.LAPTOP, 60));

            mockDBAll.mockRestore();
        });

        test("It should reject with an error when there is a database error", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(new Error("DB error"), null);
            });

            await expect(cartDAO.getProductsInCart("user1")).rejects.toThrow("DB error");

            mockDBAll.mockRestore();
        });
    });
    describe("isOutOfStock", () => {
        test("It should resolve true when product is out of stock", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                // Simulate that there is at least one product in the cart whose available quantity in the stock is 0
                return callback(null, [{ model: "product1", quantity: 0 }]);
            });
    
            const result = await cartDAO.isOutOfStock("user1");
            expect(result).toBe(true);
    
            mockDBAll.mockRestore();
        });
    
        test("It should resolve false when no product is out of stock", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                // Simulate that no products in the cart are out of stock
                return callback(null, []);
            });
    
            const result = await cartDAO.isOutOfStock("user1");
            expect(result).toBe(false);
    
            mockDBAll.mockRestore();
        });
    
        test("It should reject with an error when there is a database error", async () => {
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                // Simulate a database error
                return callback(new Error("DB error"), null);
            });
    
            await expect(cartDAO.isOutOfStock("user1")).rejects.toThrow("DB error");
    
            mockDBAll.mockRestore();
        });
    });
    
    describe("removeProductFromCart", () => {

        // Ensure mocks are restored after each test to prevent interference
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("It should resolve true when the product is removed from the cart successfully", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { quantity: 1, selling_price: 100, cart_id: 1 });
                return {} as any;
            });
    
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });
    
            const result = await cartDAO.removeProductFromCart("user1", "product1");
            expect(result).toBe(true);
    
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });

        test("It should reject with ProductNotInCartError when the product is not in the cart", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, undefined);
                return {} as any;
            });
    
            await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow(ProductNotInCartError);
    
            mockDBGet.mockRestore();
        });
        test("It should reject with an error when there is a database error during the get operation", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"), null);
                return {} as any;
            });
    
            await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow("DB error");
    
            mockDBGet.mockRestore();
        });
        test("It should reject with an error when there is a database error during the run operation", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { quantity: 1, selling_price: 100, cart_id: 1 });
                return {} as any;
            });
    
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("DB run error"));
                return {} as any;
            });
    
            await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow("DB run error");
    
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        
        // test error of run updatetotal
        test("It should handle db.run update total error correctly", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, { quantity: 1, selling_price: 100, cart_id: 1 });
            });
    
            const mockDBRun = jest.spyOn(db, "run")
                // First call to db.run (for removing the product)
                .mockImplementationOnce((sql, params, callback) => {
                    return callback(null);
                })
                // Second call to db.run (for updating the cart total)
                .mockImplementationOnce((sql, params, callback) => {
                    return callback(new Error("DB run error"));
                });
    
            await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow("DB run error");
    
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });



        // test if quantity more than 1
        test("It should test if quantity more than 1", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { quantity: 2, selling_price: 100, cart_id: 1 });
                return {} as any;
            });
    
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });
    
            await cartDAO.removeProductFromCart("user1", "product1");
    
            expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [1, "product1"], expect.any(Function));
            expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [100, 1], expect.any(Function));
    
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        //test if db.run uipdate total error
        test("It should handle db.run update total error correctly when quantity is more than 1", async () => {
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, { quantity: 2, selling_price: 100, cart_id: 1 });
            });
    
            const mockDBRun = jest.spyOn(db, "run")
                // First call to db.run (for updating the quantity)
                .mockImplementationOnce((sql, params, callback) => {
                    return callback(null);
                })
                // Second call to db.run (for updating the cart total)
                .mockImplementationOnce((sql, params, callback) => {
                    return callback(new Error("DB run error"));
                });
    
            await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow("DB run error");
    
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
        
    });
    describe("clearCart", () => {
        test("It should resolve true when cart is cleared successfully", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });

            const result = await cartDAO.clearCart("user1");
            expect(result).toBe(true);

            mockDBRun.mockRestore();
        });

        test("It should reject with an error when there is a database error", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"));
                return {} as any;
            });

            await expect(cartDAO.clearCart("user1")).rejects.toThrow("DB error");

            mockDBRun.mockRestore();
        });
    });
    describe("deleteAllCarts", () => {
        test("It should resolve true when all carts are deleted successfully", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });
    
            const result = await cartDAO.deleteAllCarts();
            expect(result).toBe(true);
    
            mockDBRun.mockRestore();
        });
    
        test("It should reject with an error when there is a database error", async () => {
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"));
                return {} as any;
            });
    
            await expect(cartDAO.deleteAllCarts()).rejects.toThrow("DB error");
    
            mockDBRun.mockRestore();
        });
    });
    describe("getAllCarts", () => {
        test("It should resolve to an array of Cart objects when carts are retrieved successfully", async () => {
            // Mock data for the database response
            const mockRows = [
                {
                    cart_id: 1,
                    user: "user1",
                    paid: 0,
                    payment_date: null as Date | null,
                    total: 100,
                    model: "product1",
                    quantity: 2,
                    selling_price: 50,
                    category: "Category1"
                },
                {
                    cart_id: 2,
                    user: "user1",
                    paid: 0,
                    payment_date: null,
                    total: 75,
                    model: "product2",
                    quantity: 1,
                    selling_price: 75,
                    category: "Category2"
                }
                // Add more rows if needed for additional carts
            ];
    
            // Mock the db.all method to simulate database retrieval
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows);
                return {} as any;
            });
    
            // Call the getAllCarts method
            const carts = await cartDAO.getAllCarts();
    
            // Expectations
            expect(carts).toHaveLength(2); // Adjust the length based on mockRows
            expect(carts[0]).toBeInstanceOf(Cart);
            expect(carts[0].customer).toBe("user1");
            expect(carts[0].paid).toBe(0); // Assuming paid is stored as 0/1 in database
            expect(carts[0].paymentDate).toBe(null); // Assuming payment_date is null
            expect(carts[0].total).toBe(100);
            expect(carts[0].products).toHaveLength(1);
            expect(carts[0].products[0]).toBeInstanceOf(ProductInCart);
            expect(carts[0].products[0].model).toBe("product1");
            expect(carts[0].products[0].quantity).toBe(2);
            // expect(carts[0].products[0].sellingPrice).toBe(50);
            expect(carts[0].products[0].category).toBe("Category1");
    
            expect(carts[1]).toBeInstanceOf(Cart);
            expect(carts[1].customer).toBe("user1");
            expect(carts[1].paid).toBe(0); // Assuming paid is stored as 0/1 in database
            expect(carts[1].paymentDate).toBe(null); // Assuming payment_date is null
            expect(carts[1].total).toBe(75);
            expect(carts[1].products).toHaveLength(1);
            expect(carts[1].products[0]).toBeInstanceOf(ProductInCart);
            expect(carts[1].products[0].model).toBe("product2");
            expect(carts[1].products[0].quantity).toBe(1);
            // expect(carts[1].products[0].sellingPrice).toBe(75);
            expect(carts[1].products[0].category).toBe("Category2");
    
            // Restore the mock after test completion
            mockDBAll.mockRestore();
        });
    
        test("It should reject with an error when there is a database error", async () => {
            // Mock the db.all method to simulate database error
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"));
                return {} as any;
            });
    
            // Expect getAllCarts to reject with an error
            await expect(cartDAO.getAllCarts()).rejects.toThrow("DB error");
    
            // Restore the mock after test completion
            mockDBAll.mockRestore();
        });
    });
    
    describe("addToCart", () => {
        test("It should resolve true when product is added to cart successfully", async () => {
            // Mock the checkProduct method to simulate product exists and quantity > 0
            const mockCheckProduct = jest.spyOn(cartDAO, "checkProduct").mockImplementation((product) => {
                return Promise.resolve(1);
            });
    
            // Mock the db.get method to simulate product exists
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, { quantity: 5 });
                return {} as any;
            });
    
            // Mock the db.run method to simulate product added to cart
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as any;
            });
    
            // Call the addToCart method
            const result = await cartDAO.addToCart("user1", "product1");
    
            // Expectations
            expect(result).toBe(true);
            expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), ["user1", "product1"], expect.any(Function));
    
            // Restore the mocks after test completion
            mockCheckProduct.mockRestore();
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        });
    
        test("It should reject with ProductNotFoundError when product does not exist", async () => {
            // Mock the checkProduct method to simulate product does not exist
            const mockCheckProduct = jest.spyOn(cartDAO, "checkProduct").mockImplementation((product) => {
                return Promise.resolve(-1);
            });
    
            // Call the addToCart method
            await expect(cartDAO.addToCart("user1", "nonexistent_product")).rejects.toThrow(ProductNotFoundError);
    
            // Restore the mock after test completion
            mockCheckProduct.mockRestore();
        });
    
        test("It should reject with EmptyProductStockError when product is out of stock", async () => {
            // Mock the checkProduct method to simulate product exists but is out of stock
            const mockCheckProduct = jest.spyOn(cartDAO, "checkProduct").mockImplementation((product) => {
                return Promise.resolve(0);
            });
    
            // Call the addToCart method
            await expect(cartDAO.addToCart("user1", "out_of_stock_product")).rejects.toThrow();
    
            // Restore the mock after test completion
            mockCheckProduct.mockRestore();
        });

        test("It should reject with an error when there is a database error during checkProduct", async () => {
            // Mock the checkProduct method to simulate database error
            const mockCheckProduct = jest.spyOn(cartDAO, "checkProduct").mockImplementation((product) => {
                return Promise.reject(new Error("DB error"));
            });
    
            // Expect addToCart to reject with an error
            await expect(cartDAO.addToCart("user1", "product1")).rejects.toThrow("DB error");
    
            // Restore the mock after test completion
            mockCheckProduct.mockRestore();
        });
    });

    

    describe("checkoutCart", () => {
        // Mock user
        const user = "user1";
    
        // Mock cart data
        // model, quantity, category, price
        const mockCart = new Cart(user, false, "2024-1-2", 100, [
            new ProductInCart("product1", 2, Category.SMARTPHONE, 50),
            new ProductInCart("product2", 1, Category.LAPTOP, 50)
        ]);
    
        beforeEach(() => {
            // Reset mocks before each test
            jest.clearAllMocks();
        });
    
        test("It should resolve to true when checking out the cart", async () => {
            // Mock getCart to return mockCart
            jest.spyOn(cartDAO, "getCart").mockResolvedValue(mockCart);
    
            // Mock db.run for checkout
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                 // Simulate successful checkout
                 return {} as any;
            });
    
            // Call checkoutCart method
            const result = await cartDAO.checkoutCart(user);
    
            // Expectations
            expect(result).toBe(true);
            expect(db.run).toHaveBeenCalledTimes(1); // Ensure db.run was called once
    
            // Restore mocks after test
            jest.restoreAllMocks();
        });
    
        test("It should reject with a CartNotFoundError when the cart is not found", async () => {
            // Mock getCart to throw CartNotFoundError
            jest.spyOn(cartDAO, "getCart").mockRejectedValue(null);
            // Call checkoutCart method
            await expect(cartDAO.checkoutCart(user)).rejects.toThrow(CartNotFoundError);
    
            // Expectations
            expect(db.run).not.toHaveBeenCalled(); // Ensure db.run was not called
    
            // Restore mocks after test
            jest.restoreAllMocks();
        });
    
        test("It should reject with an error when there is a database error while checking out the cart", async () => {
            // Mock getCart to return mockCart
            jest.spyOn(cartDAO, "getCart").mockResolvedValue(mockCart);
    
            // Mock db.run to simulate database error
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error")); // Simulate database error
                return {} as any;
            });
    
            // Call checkoutCart method
            await expect(cartDAO.checkoutCart(user)).rejects.toThrow("DB error");
    
            // Expectations
            expect(db.run).toHaveBeenCalledTimes(1); // Ensure db.run was called once
    
            // Restore mocks after test
            jest.restoreAllMocks();
        });
        // test cart now found
        test("It should test cart now found", async () => {
            // Mock getCart to throw CartNotFoundError
            jest.spyOn(cartDAO, "getCart").mockRejectedValue(new CartNotFoundError());
    
            // Call checkoutCart method
            await expect(cartDAO.checkoutCart(user)).rejects.toThrow(CartNotFoundError);
    
            // Expectations
            expect(db.run).not.toHaveBeenCalled(); // Ensure db.run was not called
    
            // Restore mocks after test
            jest.restoreAllMocks();
        });
        // test if cart == null reject(new cart not found)
        test("It should test if cart == null reject(new cart not found)", async () => {
            // Mock getCart to return mockCart
            // const mockCart = null;
            jest.spyOn(cartDAO, "getCart").mockResolvedValue(mockCart);
            
    
            // Call checkoutCart method
            await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);
            
    
            // Expectations
            expect(db.run).toHaveBeenCalled(); // Ensure db.run was not called
            
    
            // Restore mocks after test
            jest.restoreAllMocks();
        });

    });    

    describe("isQuantityHigherThanStock", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        test("It should resolve to true when there are products in the cart with quantity higher than available stock", async () => {
            // Mock SQL query response to simulate products with quantity higher than stock
            const mockRows: Array<any> = [{ model: "product1", quantity: 5 }];
    
            // Mock db.all function to simulate query execution
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows);
                return {} as any;
            });
    
            // Call isQuantityHigherThanStock method
            const result = await cartDAO.isQuantityHigherThanStock("user1");
    
            // Expectations
            expect(result).toBe(true);
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    
        test("It should resolve to false when there are no products in the cart with quantity higher than available stock", async () => {
            // Mock SQL query response to simulate no products with quantity higher than stock
            const mockRows: Array<any> = [];
    
            // Mock db.all function to simulate query execution
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows);
                return {} as any;
            });
    
            // Call isQuantityHigherThanStock method
            const result = await cartDAO.isQuantityHigherThanStock("user1");
    
            // Expectations
            expect(result).toBe(false);
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    
        test("It should reject with an error when there is a database error", async () => {
            // Mock db.all function to simulate database error
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"), null);
                return {} as any;
            });
    
            // Call isQuantityHigherThanStock method and expect it to throw an error
            await expect(cartDAO.isQuantityHigherThanStock("user1")).rejects.toThrow("DB error");
    
            // Expectations
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    });
    describe("getCustomerCarts", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        test("It should resolve to an array of paid carts for the user", async () => {
            // Mock SQL query response to simulate paid carts
            const mockRows = [
                {
                    cart_id: 1,
                    user: "user1",
                    paid: 1,
                    payment_date: "2024-06-14T12:00:00.000Z",
                    total: 100,
                    model: "product1",
                    quantity: 2,
                    selling_price: 50,
                    category: "Category A"
                },
                {
                    cart_id: 2,
                    user: "user1",
                    paid: 1,
                    payment_date: "2024-06-14T13:00:00.000Z",
                    total: 150,
                    model: "product2",
                    quantity: 1,
                    selling_price: 150,
                    category: "Category B"
                }
            ];
    
            // Mock db.all function to simulate query execution
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows);
                return {} as any;
            });
    
            // Call getCustomerCarts method
            const result = await cartDAO.getCustomerCarts("user1");
    
            // Expectations
            expect(result).toHaveLength(2); // Ensure correct number of carts returned
            expect(result[0].customer).toBe("user1"); // Verify user of the first cart
            expect(result[0].paid).toBe(1); // Verify paid status of the first cart
            expect(result[0].products).toHaveLength(1); // Verify number of products in the first cart
            expect(result[1].customer).toBe("user1"); // Verify user of the second cart
            expect(result[1].paid).toBe(1); // Verify paid status of the second cart
            expect(result[1].products).toHaveLength(1); // Verify number of products in the second cart
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    
        test("It should reject with CartNotFoundError when no paid carts are found for the user", async () => {
            // Mock db.all function to simulate empty result set
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, []); // Simulate no rows returned
                return {} as any;
            });
    
            // Call getCustomerCarts method and expect it to throw CartNotFoundError
            await expect(cartDAO.getCustomerCarts("nonexistent_user")).rejects.toThrow(CartNotFoundError);
    
            // Expectations
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    
        test("It should reject with an error when there is a database error", async () => {
            // Mock db.all function to simulate database error
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("DB error"), null);
                return {} as any;
            });
    
            // Call getCustomerCarts method and expect it to throw an error
            await expect(cartDAO.getCustomerCarts("user1")).rejects.toThrow("DB error");
    
            // Expectations
            expect(db.all).toHaveBeenCalledTimes(1); // Ensure db.all was called once
        });
    });
    
    
    
});