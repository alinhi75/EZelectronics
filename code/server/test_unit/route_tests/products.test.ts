import { describe, test, expect, beforeAll, afterAll,beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import ProductController from "../../src/controllers/productController";
import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";
import { Category, Product } from "../../src/components/product";

// Mock dependencies
jest.mock("../../src/controllers/productController");
jest.mock("../../src/routers/auth");

const baseURL = "/ezelectronics/products";

// Test user roles
let testAdmin = { id: "admin", role: "Admin" };
let testManager = { id: "manager", role: "Manager" };

describe("ProductRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /products", () => {
    test("It should return a 200 success code when registering products", async () => {
      const inputProduct = {
        model: "testModel",
        category: "Smartphone",
        quantity: 10,
        details: "Test details",
        sellingPrice: 1000,
        arrivalDate: "2023-01-01"
      };

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL).send(inputProduct);
      expect(response.status).toBe(200);
      expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
        inputProduct.model,
        inputProduct.category,
        inputProduct.quantity,
        inputProduct.details,
        inputProduct.sellingPrice,
        inputProduct.arrivalDate
      );
    });
    test('It should return a 500 error code when product registration fails', async () => {
      const inputProduct = {
        model: 'testModel',
        category: 'Smartphone',
        quantity: 10,
        details: 'Test details',
        sellingPrice: 1000,
        arrivalDate: '2023-01-01'
      };
  
      // Mock validateRequest to just call next()
      jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next());
  
      // Mock registerProducts to throw an error
      jest.spyOn(ProductController.prototype, 'registerProducts').mockImplementation(() => {
        throw new Error('Failed to register product');
      });
  
      // Mock isLoggedIn to simulate an authenticated user
      jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        req.user = { /* mock user data */ };
        return next();
      });
  
      // Mock isAdminOrManager to allow access
      jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next());
  
      // Send a POST request with valid input
      const response = await request(app)
        .post('/products')
        .send(inputProduct);
  
      // Assert that the response status is 500
      expect(response.status).toBe(500);
    });
    test('It should return a 500 error code when registration fails', async () => {
      const inputProduct = {
        model: 'testModel',
        category: 'Smartphone',
        quantity: 10,
        details: 'Test details',
        sellingPrice: 1000,
        arrivalDate: '2023-01-01'
      };
  
      // Mock validateRequest to just call next()
      jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next());
  
      // Mock registerProducts to throw an error
      jest.spyOn(ProductController.prototype, 'registerProducts').mockImplementation(() => {
        throw new Error('Failed to register product');
      });
  
      // Mock isLoggedIn to simulate an authenticated user
      jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        req.user = { /* mock user data */ };
        return next();
      });
  
      // Mock isAdminOrManager to allow access
      jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next());
  
      // Send a POST request with valid input
      const response = await request(app)
        .post('/')
        .send(inputProduct);
  
      // Assert that the response status is 500
      expect(response.status).toBe(500);
    });

    test("It should return 422 if the input is invalid", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid input" });
      });
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL).send({});
      expect(response.status).toBe(422);
    });

    test("It should return 403 if the user is not an admin or manager", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = { id: "user", role: "User" };
        return next();
      });

      const response = await request(app).post(baseURL).send({});
      expect(response.status).toBe(422);
    });
    // catch error on validate request of date ba calling next(error)
    test("It should return 422 if the date is invalid", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid date" });
      });
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL).send({ arrivalDate: "invalid" });
      expect(response.status).toBe(422);
    });
    test("It should return 503 if an error occurs", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL).send({});
      expect(response.status).toBe(503);
    });
    
    test("It should handle errors and return the appropriate response", async () => {
      jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app)
          .post("/products")
          .send({
              model: "testModel",
              category: "Smartphone",
              quantity: 10,
              details: "Some details",
              sellingPrice: 500,
              arrivalDate: "2023-01-01"
          });

      expect(response.status).toBe(500); // Assuming your error handler sends a 500 status code for unhandled errors
  });

  
  });
    
  });

  describe("PATCH /products/:model", () => {
    test("It should return the new quantity after increasing product quantity", async () => {
      const inputChange = { quantity: 5, changeDate: "2023-02-01" };
      const newQuantity = 15;

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(newQuantity);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel").send(inputChange);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ quantity: newQuantity });
      expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
        "testModel",
        inputChange.quantity,
        inputChange.changeDate
      );
    });
    // test DateError
    test("It should return 422 if the date is invalid", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid date" });
      });
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel").send({ quantity: 5, changeDate: "invalid" });
      expect(response.status).toBe(422);
    });
    test("It Should return 503 if an error occurs", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel").send({ quantity: 5, changeDate: "2023-02-01" });
      expect(response.status).toBe(503);
    });
  });

  describe("PATCH /products/:model/sell", () => {
    test("It should return the new quantity after selling product units", async () => {
      const inputSale = { quantity: 3, sellingDate: "2023-03-01" };
      const remainingQuantity = 7;

      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(remainingQuantity);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testManager;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel/sell").send(inputSale);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ quantity: remainingQuantity });
      expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
        "testModel",
        inputSale.quantity,
        inputSale.sellingDate
      );
    });
    // test DateError
    test("It should return 422 if the date is invalid", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid date" });
      });
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testManager;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel/sell").send({ quantity: 3, sellingDate: "invalid" });
      expect(response.status).toBe(422);
    });
    test("It should return 503 if an error occurs", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testManager;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).patch(baseURL + "/testModel/sell").send({ quantity: 3, sellingDate: "2023-03-01" });
      expect(response.status).toBe(503);
    });
  });

  describe("ProductRoutes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /products", () => {
        test("It returns an array of products", async () => {
            const mockProducts: Product[] = [
                { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
                { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
            ];

            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(mockProducts);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
        });

        test("It returns an array of products grouped by model", async () => {
            const mockProducts: Product[] = [
                { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
                { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
            ];

            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(mockProducts);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL + "?grouping=model");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
        });

        test("It returns an array of products grouped by category", async () => {
            const mockProducts: Product[] = [
                { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
                { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
            ];

            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(mockProducts);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL + "?grouping=category");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
        });

        test("It should return 503 if an error occurs", async () => {
            jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(new Error("Test error"));
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL);
            expect(response.status).toBe(503);
        });

        test("It should return 403 if the user is not logged in", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(403).json({ error: "Unauthorized" });
            });

            const response = await request(app).get(baseURL);
            expect(response.status).toBe(403);
        });

        test("It should return 200 with an empty array when grouping is undefined or equals to category", async () => {
            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([]);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL + "?grouping=category");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test("It should return 200 with an empty array when grouping is model", async () => {
            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([]);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL + "?grouping=model");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test("It should return 503 if an error occurs with grouping undefined or model", async () => {
            jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(new Error("Test error"));
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

            const response = await request(app).get(baseURL + "?grouping=model");
            expect(response.status).toBe(503);
        });
        test("It returns false if 'grouping' parameter is missing or invalid", async () => {
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
          jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());
  
          const response = await request(app).get(baseURL + "/");
          expect(response.status).toBe(400);
  
          const invalidGroupingResponse = await request(app).get(baseURL + "/?grouping=invalidGrouping");
          expect(invalidGroupingResponse.status).toBe(400);
      });
      test("It returns false if 'category' parameter is provided when 'grouping' is 'model'", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "/?grouping=model&category=Smartphone");
        expect(response.status).toBe(400);
    });
    test("It returns false if 'model' parameter is provided when 'grouping' is 'category'", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + "/?grouping=category&model=testModel1");
      expect(response.status).toBe(400);
  });
  test("It returns false if invalid 'category' value is provided", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

    const response = await request(app).get(baseURL + "/?grouping=category&category=InvalidCategory");
    expect(response.status).toBe(400);
});
test("It returns false if 'model' parameter is empty when 'grouping' is 'model'", async () => {
  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
  jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

  const response = await request(app).get(baseURL + "/?grouping=model&model=");
  expect(response.status).toBe(400);
});
    });

  describe("DELETE /products", () => {
    test("It deletes all products", async () => {
      jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL);
      expect(response.status).toBe(200);
      expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalled();
    });
    test("It should return 503 if an error occurs", async () => {
      jest.spyOn(ProductController.prototype, "deleteAllProducts").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL);
      expect(response.status).toBe(503);
    });
    
  });

  describe("DELETE /products/:model", () => {
    test("It deletes a product by model", async () => {
      jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testAdmin;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL + "/testModel");
      expect(response.status).toBe(200);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("testModel");
    });
  });
  test("It should return 503 if an error occurs", async () => {
    jest.spyOn(ProductController.prototype, "deleteProduct").mockRejectedValueOnce(new Error("Test error"));
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testAdmin;
      return next();
    });
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

    const response = await request(app).delete(baseURL + "/testModel");
    expect(response.status).toBe(503);
  });
});
describe("ProductRoutes /available", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  describe("GET /products/available", () => {
      test("It returns an array of available products", async () => {
          const mockProducts: Product[] = [
              { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
              { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
          ];

          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProducts);
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL+"/available");
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockProducts);
      });

      test("It returns an array of available products grouped by model", async () => {
          const mockProducts: Product[] = [
              { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
              { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
          ];

          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProducts);
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL+"/available" + "?grouping=model");
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockProducts);
      });
      

      test("It returns an array of available products grouped by category", async () => {
          const mockProducts: Product[] = [
              { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
              { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
          ];

          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProducts);
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL +"/available"+ "?grouping=category&category=Smartphone");
          expect(response.status).toBe(200);
          // expect(response.body).toEqual([mockProducts[0]]);
      });

      test("It should return 503 if an error occurs", async () => {
          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(new Error("Test error"));
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL+"/available");
          expect(response.status).toBe(503);
      });

      test("It should return 403 if the user is not logged in", async () => {
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
              return res.status(403).json({ error: "Unauthorized" });
          });

          const response = await request(app).get(baseURL+"/available");
          expect(response.status).toBe(403);
      });

      test("It should return 400 if category is present without grouping", async () => {
          const response = await request(app).get(baseURL+"/available" + "?category=Smartphone");
          expect(response.status).toBe(403);
      });

      test("It should return 400 if model is present without grouping", async () => {
          const response = await request(app).get(baseURL+"/available" + "?model=testModel1");
          expect(response.status).toBe(403);
      });

      test("It should return 400 if invalid category is provided", async () => {
          const response = await request(app).get(baseURL+"/available" + "?grouping=category&category=InvalidCategory");
          expect(response.status).toBe(403);
      });

      test("It should return 400 if model is empty when grouping is model", async () => {
          const response = await request(app).get(baseURL+"/available" + "?grouping=model&model=");
          expect(response.status).toBe(403);
      });

      test("It should return 200 with an empty array when grouping is category and no products match", async () => {
          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([]);
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL+"/available" + "?grouping=category&category=Smartphone");
          expect(response.status).toBe(200);
          expect(response.body).toEqual([]);
      });

      test("It should return 200 with an empty array when grouping is model and no products match", async () => {
          jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([]);
          jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

          const response = await request(app).get(baseURL+"/available" + "?grouping=model&model=testModel1");
          expect(response.status).toBe(200);
          expect(response.body).toEqual([]);
      });
      test("It returns false if the 'grouping' parameter is not provided and 'category' is present", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "?category=Smartphone");
        expect(response.status).toBe(400);
    });
    test("It returns false if the 'grouping' parameter is not provided and 'model' is present", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + "?model=testModel1");
      expect(response.status).toBe(400);
    });
    test("It returns false if the 'grouping' parameter is invalid", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

    const response = await request(app).get(baseURL + "?grouping=invalidGrouping");
    expect(response.status).toBe(400);
    });
    test("It returns an array of available products grouped by model", async () => {
    const mockProducts: Product[] = [
      { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
      { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
    ];

    jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProducts);
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

    const response = await request(app).get(baseURL + "?grouping=model");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProducts);
    });
    test("It returns an array of available products grouped by category", async () => {
      const mockProducts: Product[] = [
          { model: "testModel1", category: Category.SMARTPHONE, quantity: 10, details: "Details 1", sellingPrice: 1000, arrivalDate: "2023-01-01" },
          { model: "testModel2", category: Category.LAPTOP, quantity: 5, details: "Details 2", sellingPrice: 2000, arrivalDate: "2023-01-02" }
      ];

      jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProducts);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + "?grouping=category&category=Smartphone");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockProducts[0]]);
      });

      test("It should return 503 if an error occurs", async () => {
        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(new Error("Test error"));
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL);
        expect(response.status).toBe(503);
      });

      test("It should return 403 if the user is not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(403).json({ error: "Unauthorized" });
        });

        const response = await request(app).get(baseURL);
        expect(response.status).toBe(403);
      });

      test("It should return 400 if invalid category is provided", async () => {
        const response = await request(app).get(baseURL + "?grouping=category&category=InvalidCategory");
        expect(response.status).toBe(403);
      });

      test("It should return 400 if model is empty when grouping is model", async () => {
        const response = await request(app).get(baseURL + "?grouping=model&model=");
        expect(response.status).toBe(403);
      });

      test("It should return 200 with an empty array when grouping is category and no products match", async () => {
        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([]);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "?grouping=category&category=Smartphone");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      test("It should return 200 with an empty array when grouping is model and no products match", async () => {
        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([]);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "?grouping=model&model=testModel1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
      test("It returns false if the 'grouping' parameter is not provided and 'category' is present", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
    
        const response = await request(app).get(baseURL + "?category=Smartphone");
        expect(response.status).toBe(422);
    });
    
    test("It returns false if the 'grouping' parameter is not provided and 'model' is present", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
    
        const response = await request(app).get(baseURL + "?model=testModel1");
        expect(response.status).toBe(422);
    });
    test("It returns false if 'grouping' parameter is not provided", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app).get(baseURL + "/available");
      expect(response.status).toBe(400);
  });
  test("It returns false if 'category' parameter is provided when 'grouping' is 'model'", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

    const response = await request(app).get(baseURL + "/available?grouping=model&category=Smartphone");
    expect(response.status).toBe(400);
});
test("It returns false if 'model' parameter is provided when 'grouping' is 'category'", async () => {
  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

  const response = await request(app).get(baseURL + "/available?grouping=category&model=testModel1");
  expect(response.status).toBe(400);
});
test("It returns false if invalid 'category' value is provided", async () => {
  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

  const response = await request(app).get(baseURL + "/available?grouping=category&category=InvalidCategory");
  expect(response.status).toBe(400);
});
test("It returns false if 'model' parameter is empty when 'grouping' is 'model'", async () => {
  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

  const response = await request(app).get(baseURL + "/available?grouping=model&model=");
  expect(response.status).toBe(400);
});
    


        });
      });