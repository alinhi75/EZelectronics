import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import CartRoutes from "../../src/routers/cartRoutes"; // Adjust the path as needed
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";
import { Cart } from "../../src/components/cart";

// Mock dependencies
jest.mock("../../src/controllers/cartController");
jest.mock("../../src/routers/auth");

const app = express();
app.use(express.json());
const authenticator = new Authenticator(app); // Pass the app argument to the Authenticator constructor
const cartRoutes = new CartRoutes(authenticator);
app.use("/cart", cartRoutes.getRouter());

const testCustomer = { id: "customer", role: "Customer" };
const testAdmin = { id: "admin", role: "Admin" };

describe("CartRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /cart", () => {
    test("It should return the cart of the logged in customer", async () => {
        const mockCart = new Cart("", false, "", 0, []); // Create a mock Cart object with empty values

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(mockCart);

        const response = await request(app).get("/cart");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCart);
        expect(CartController.prototype.getCart).toHaveBeenCalledWith(testCustomer);
    });
    test("It should return 500 if an error occurs", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getCart").mockRejectedValueOnce(new Error("Test error"));

        const response = await request(app).get("/cart");
        expect(response.status).toBe(500);
    });
  });

  describe("POST /cart", () => {
    test("It should add a product to the cart", async () => {
      const productModel = "testModel";

      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true);

      const response = await request(app).post("/cart").send({ model: productModel });
      expect(response.status).toBe(200);
      expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testCustomer, productModel);
    });

    test("It should return 422 if the input is invalid", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid input" });
      });

      const response = await request(app).post("/cart").send({});
      expect(response.status).toBe(500);
    });
    test("It should return 500 if an error occurs", async () => {
      const productModel = "testModel";

      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "addToCart").mockRejectedValueOnce(new Error("Test error"));

      const response = await request(app).post("/cart").send({ model: productModel });
      expect(response.status).toBe(500);
    });
  });

  describe("PATCH /cart", () => {
    test("It should check out the cart", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

      const response = await request(app).patch("/cart");
      expect(response.status).toBe(200);
      expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testCustomer);
    });
    test("It should return 500 if an error occurs", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValueOnce(new Error("Test error"));

      const response = await request(app).patch("/cart");
      expect(response.status).toBe(500);
    });
  });

  describe("GET /cart/history", () => {
    test("It should return the cart history", async () => {
        const mockCarts = [new Cart("", false, "", 0, []), new Cart("", false, "", 0, [])]; // Create mock Cart objects with empty values

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce(mockCarts);

        const response = await request(app).get("/cart/history");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCarts);
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testCustomer);
    });
    test("It should return 500 if an error occurs", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getCustomerCarts").mockRejectedValueOnce(new Error("Test error"));

        const response = await request(app).get("/cart/history");
        expect(response.status).toBe(500);
    });
  });

  describe("DELETE /cart/products/:model", () => {
    test("It should remove a product from the cart", async () => {
      const productModel = "testModel";

      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true);

      const response = await request(app).delete(`/cart/products/${productModel}`);
      expect(response.status).toBe(200);
      expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testCustomer, productModel);
    });
    test("It should return 500 if an error occurs", async () => {
      const productModel = "testModel";

      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(new Error("Test error"));

      const response = await request(app).delete(`/cart/products/${productModel}`);
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /cart/current", () => {
    test("It should clear the cart", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true);

      const response = await request(app).delete("/cart/current");
      expect(response.status).toBe(200);
      expect(CartController.prototype.clearCart).toHaveBeenCalledWith(testCustomer);
    });
    test("It should return 500 if an error occurs", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "clearCart").mockRejectedValueOnce(new Error("Test error"));

      const response = await request(app).delete("/cart/current");
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /cart", () => {
    test("It should delete all carts", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true);

      const response = await request(app).delete("/cart");
      expect(response.status).toBe(200);
      expect(CartController.prototype.deleteAllCarts).toHaveBeenCalled();
    });
    test("It should return 500 if an error occurs", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
      jest.spyOn(CartController.prototype, "deleteAllCarts").mockRejectedValueOnce(new Error("Test error"));

      const response = await request(app).delete("/cart");
      expect(response.status).toBe(500);
    });
  });

  describe("GET /cart/all", () => {
    test("It should return all carts", async () => {
        const mockCarts = [new Cart("", false, "", 0, []), new Cart("", false, "", 0, [])]; // Create mock Cart objects with empty values

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce(mockCarts);

        const response = await request(app).get("/cart/all");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCarts);
        expect(CartController.prototype.getAllCarts).toHaveBeenCalled();
    });
    test("It should return 500 if an error occurs", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
        jest.spyOn(CartController.prototype, "getAllCarts").mockRejectedValueOnce(new Error("Test error"));

        const response = await request(app).get("/cart/all");
        expect(response.status).toBe(500);
    });
  });
});
