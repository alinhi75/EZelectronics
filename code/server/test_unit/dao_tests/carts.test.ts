// import { describe, test, expect, jest,beforeAll,afterAll } from "@jest/globals";
// import db from "../../src/db/db";
// import CartDAO from "../../src/dao/cartDAO";
// import crypto from "crypto";
// import { Database } from "sqlite3";
// import { CartNotFoundError, ProductNotInCartError } from "../../src/errors/cartError";
// import { ProductNotFoundError } from "../../src/errors/productError";
// import { Cart, ProductInCart } from "../../src/components/cart";
// import { Category } from "../../src/components/product";

// jest.mock("crypto");
// jest.mock("sqlite3");
// jest.mock("../../src/db/db");

// describe("CartDAO", () => {
//     let cartDAO: CartDAO;

//     beforeAll(() => {
//         cartDAO = new CartDAO();
//     });

//     afterAll(() => {
//         jest.clearAllMocks();
//     });

//     describe("createCart", () => {
//         test("It should resolve true when cart is created successfully", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(null);
//                 return {} as any;
//             });
//             const result = await cartDAO.createCart("user1", false, null, 0);
//             expect(result).toBe(true);
//             mockDBRun.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(new Error("DB error"));
//                 return {} as any;
//             });
//             await expect(cartDAO.createCart("user1", false, null, 0)).rejects.toThrow("DB error");
//             mockDBRun.mockRestore();
//         });
//     });

//     describe("getCart", () => {
//         test("It should resolve with a Cart object when cart is retrieved successfully", async () => {
//             const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
//                 return callback(null, [
//                     {
//                         cart_id: 1,
//                         user: "user1",
//                         paid: 0,
//                         payment_date: null,
//                         total: 100,
//                         model: "product1",
//                         quantity: 2,
//                         selling_price: 50,
//                         category:"Smartphone"
//                     },
//                     {
//                         cart_id: 1,
//                         user: "user1",
//                         paid: 0,
//                         payment_date: null,
//                         total: 100,
//                         model: "product2",
//                         quantity: 1,
//                         selling_price: 60,
//                         category: "LAPTOP"
//                     }
//                 ]);
//             });

//             const result = await cartDAO.getCart("user1");
//             expect(result).toBeInstanceOf(Cart);
//             expect(result.customer).toBe("user1");
//             expect(result.paymentDate).toBe(null);
//             expect(result.paymentDate).toBe(null);
//             expect(result.total).toBe(100);
//             expect(result.products.length).toBe(2);
//             expect(result.products[0]).toEqual(new ProductInCart("product1", 2, Category.SMARTPHONE, 50));
//             // expect(result.products[1]).toEqual(new ProductInCart("product2", 1,Category.LAPTOP, 50));

//             mockDBAll.mockRestore();
//         });

//         test("It should reject with CartNotFoundError when no cart is found", async () => {
//             const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
//                 return callback(null, []);
//             });

//             await expect(cartDAO.getCart("user1")).rejects.toThrow(CartNotFoundError);
//             mockDBAll.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
//                 return callback(new Error("DB error"), null);
//             });

//             await expect(cartDAO.getCart("user1")).rejects.toThrow("DB error");
//             mockDBAll.mockRestore();
//         });
//     });
//     describe("checkProduct", () => {
//         test("It should resolve 1 when product is in cart", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(null, { quantity: 1 });
//             });

//             const result = await cartDAO.checkProduct("product1");
//             expect(result).toBe(1);

//             mockDBGet.mockRestore();
//         });

//         test("It should reject with ProductNotInCartError when product is not in cart", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(null, undefined);
//             });

//             await expect(cartDAO.checkProduct("user1")).resolves.toBe(-1);

//             mockDBGet.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(new Error("DB error"), null);
//             });

//             await expect(cartDAO.checkProduct("product1")).rejects.toThrow("DB error");

//             mockDBGet.mockRestore();
//         });
//     });
//     describe("addToCart", () => {
//         test("It should resolve true when product is added to cart successfully", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(null);
//                 return {} as any;
//             });

//             const result = await cartDAO.addToCart("user1", "product1");
//             expect(result).toBe(true);

//             mockDBRun.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(new Error("DB error"));
//                 return {} as any;
//             });

//             await expect(cartDAO.addToCart("user1", "product1")).rejects.toThrow("DB error");

//             mockDBRun.mockRestore();
//         });
//     });
//     describe("checkoutCart", () => {
//         test("It should resolve true when cart is checked out successfully", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(null);
//                 return {} as any;
//             });

//             const result = await cartDAO.checkoutCart("user1");
//             expect(result).toBe(true);

//             mockDBRun.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(new Error("DB error"));
//                 return {} as any;
//             });

//             await expect(cartDAO.checkoutCart("user1")).rejects.toThrow("DB error");

//             mockDBRun.mockRestore();
//         });
//     });
//     describe("getProductsInCart", () => {
//         test("It should resolve with an array of ProductInCart objects when products are retrieved successfully", async () => {
//             const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
//                 return callback(null, [
//                     {
//                         model: "product1",
//                         quantity: 2,
//                         category: "Smartphone",
//                         price: 50
//                     },
//                     {
//                         model: "product2",
//                         quantity: 1,
//                         category: "LAPTOP",
//                         price: 60
//                     }
//                 ]);
//             });

//             const result = await cartDAO.getProductsInCart("user1");
//             expect(result.length).toBe(2);
//             // expect(result[0]).toEqual(new ProductInCart("product1", 2, Category.SMARTPHONE, 50));
//             // expect(result[1]).toEqual(new ProductInCart("product2", 1, Category.LAPTOP, 60));

//             mockDBAll.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
//                 return callback(new Error("DB error"), null);
//             });

//             await expect(cartDAO.getProductsInCart("user1")).rejects.toThrow("DB error");

//             mockDBAll.mockRestore();
//         });
//     });
//     describe("isCartEmpty", () => {
//         test("It should resolve true when cart is empty", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(null, { total: 0 });
//             });

//             const result = await cartDAO.isCartEmpty("user1");
//             expect(result).toBe(true);

//             mockDBGet.mockRestore();
//         });

//         test("It should resolve false when cart is not empty", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(null, { total: 100 });
//             });

//             const result = await cartDAO.isCartEmpty("user1");
//             expect(result).toBe(false);

//             mockDBGet.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(new Error("DB error"), null);
//             });

//             await expect(cartDAO.isCartEmpty("user1")).rejects.toThrow("DB error");

//             mockDBGet.mockRestore();
//         });
//     });
//     describe("isOutOfStock", () => {
//         test("It should resolve true when product is out of stock", async () => {
//             const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
//                 return callback(null, { quantity: 0 });
//             });

//             const result = await cartDAO.isOutOfStock("product1");
//             expect(result).toBe(true);

//             mockDBGet.mockRestore();
//         });

//     });
//     describe("removeProductFromCart", () => {
//         test("It should resolve true when product is removed from cart successfully", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(null);
//                 return {} as any;
//             });

//             const result = await cartDAO.removeProductFromCart("user1", "product1");
//             expect(result).toBe(true);

//             mockDBRun.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(new Error("DB error"));
//                 return {} as any;
//             });

//             await expect(cartDAO.removeProductFromCart("user1", "product1")).rejects.toThrow();

//             mockDBRun.mockRestore();
//         });
//     });
//     describe("clearCart", () => {
//         test("It should resolve true when cart is cleared successfully", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(null);
//                 return {} as any;
//             });

//             const result = await cartDAO.clearCart("user1");
//             expect(result).toBe(true);

//             mockDBRun.mockRestore();
//         });

//         test("It should reject with an error when there is a database error", async () => {
//             const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
//                 callback(new Error("DB error"));
//                 return {} as any;
//             });

//             await expect(cartDAO.clearCart("user1")).rejects.toThrow("DB error");

//             mockDBRun.mockRestore();
//         });
//     });
// });
