import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import ReviewController from "../../src/controllers/reviewController";
import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";
import { ProductReview } from "../../src/components/review";

const baseURL = "/ezelectronics/reviews";

// Mock dependencies
jest.mock("../../src/controllers/reviewController");
jest.mock("../../src/routers/auth");

let testCustomer = { id: "customer", role: "Customer" };

describe("ReviewRoutes", () => {
  describe("POST /reviews/:model", () => {
    test("It should return a 200 success code", async () => {
      const inputReview = { score: 5, comment: "Great product!" };
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isInt: () => ({ withMessage: () => ({}) }),
          notEmpty: () => ({ withMessage: () => ({}) }),
        })),
        param: jest.fn().mockImplementation(() => ({
          notEmpty: () => ({ withMessage: () => ({}) }),
        })),
      }));
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce();
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL + "/testModel").send(inputReview);
      expect(response.status).toBe(200);
      expect(ReviewController.prototype.addReview).toHaveBeenCalledWith("testModel", testCustomer, inputReview.score, inputReview.comment);
    });

    test("It should return 422 if the input is invalid", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        return res.status(422).json({ error: "Invalid input" });
      });
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL + "/testModel").send({});
      expect(response.status).toBe(422);
    });
    test("It should return 500 if an error occurs", async () => {
      jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next());
      jest.spyOn(ReviewController.prototype, "addReview").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

      const response = await request(app).post(baseURL + "/testModel").send({ score: 5, comment: "Great product!" });
      expect(response.status).toBe(503);
    });
  });

describe("GET /reviews/:model", () => {
    test("It returns an array of reviews", async () => {
        const mockReviews: ProductReview[] = [{ model: "testModel", user: "testUser", date: new Date().toISOString(), score: 5, comment: "Excellent!" }];
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce(mockReviews);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "/testModel");
        expect(response.status).toBe(200);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith("testModel");
        expect(response.body).toEqual(mockReviews);
    });
    test("It returns 503 if an error occurs", async () => {
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockRejectedValueOnce(new Error("Test error"));
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

        const response = await request(app).get(baseURL + "/testModel");
        expect(response.status).toBe(503);
    }); 
});

  describe("DELETE /reviews/:model", () => {
    test("It deletes a review by a user", async () => {
      jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce();
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL + "/testModel");
      expect(response.status).toBe(200);
      expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith("testModel", testCustomer);
    });
    test("It returns 503 if an error occurs", async () => {
      jest.spyOn(ReviewController.prototype, "deleteReview").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testCustomer;
        return next();
      });
      jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL + "/testModel");
      expect(response.status).toBe(503);
    });
  });

  describe("DELETE /reviews/:model/all", () => {
    test("It deletes all reviews of a product", async () => {
      jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce();
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL + "/testModel/all");
      expect(response.status).toBe(200);
      expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith("testModel");
    });
    test("It returns 503 if an error occurs", async () => {
      jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL + "/testModel/all");
      expect(response.status).toBe(503);
    });
  });

  describe("DELETE /reviews", () => {
    test("It deletes all reviews", async () => {
      jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce();
      jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

      const response = await request(app).delete(baseURL);
      expect(response.status).toBe(200);
      expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalled();
    });
  });
  test("It returns 503 if an error occurs", async () => {
    jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockRejectedValueOnce(new Error("Test error"));
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

    const response = await request(app).delete(baseURL);
    expect(response.status).toBe(503);
  });
});
