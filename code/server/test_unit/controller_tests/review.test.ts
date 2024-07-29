import { test, expect, jest, afterEach } from "@jest/globals"
import ReviewDAO from "../../src/dao/reviewDAO"
import ReviewController from "../../src/controllers/reviewController"
import { DateError } from "../../src/utilities";
import { ProductReview } from "../../src/components/review";
import { Role, User } from "../../src/components/user";
import ProductDAO from "../../src/dao/productDAO";
import { Category, Product } from "../../src/components/product";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";

jest.mock("../../src/dao/reviewDAO")
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

//Unit test addReview method in ReviewController
test("addReview - Product not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product)
    const reviewController = new ReviewController();
    try {
        await reviewController.addReview("testProduct", user, 5, "test");
    }
    catch (e) {
        expect(e).toBeInstanceOf(ProductNotFoundError);
    }
});

test("addReview - User already reviewed product", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue({} as Product)
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([{user: "test"}] as ProductReview[])
    const reviewController = new ReviewController();
    try {
        await reviewController.addReview("testProduct", user, 5, "test");
    }
    catch (e) {
        expect(e).toBeInstanceOf(ExistingReviewError);
    }
});

test("addReview - Review added", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue({model: "testProduct", category: Category.LAPTOP, sellingPrice: 1000, arrivalDate: "2023-12-10", details: "", quantity: 10} )
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([] as ProductReview[])
    jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValue()
    const reviewController = new ReviewController();
    const result = await reviewController.addReview("testProduct", user, 5, "test");
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);
});

//Unit test getProductReviews method in ReviewController
test("getProductReviews - Reviews found", async () => {
    const review: ProductReview = {
        user: "test",
        model: "test",
        score: 5,
        date: "2023-12-10",
        comment: "test"
    }
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([review])
    const reviewController = new ReviewController();
    const result = await reviewController.getProductReviews("testProduct");
    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
    expect(result).toEqual([review]);
});

test("getProductReviews - No reviews found", async () => {
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([] as ProductReview[])
    const reviewController = new ReviewController();
    const result = await reviewController.getProductReviews("testProduct");
    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
});

//Unit test deleteReview method in ReviewController
test("deleteReview - Product not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product)
    const reviewController = new ReviewController();
    try {
        await reviewController.deleteReview("testProduct", user);
    }
    catch (e) {
        expect(e).toBeInstanceOf(ProductNotFoundError);
    }
});

test("deleteReview - No review found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue({} as Product)
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([] as ProductReview[])
    const reviewController = new ReviewController();
    try {
        await reviewController.deleteReview("testProduct", user);
    }
    catch (e) {
        expect(e).toBeInstanceOf(NoReviewProductError);
    }
});

test("deleteReview - Review deleted", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue({model: "testProduct", category: Category.LAPTOP, sellingPrice: 1000, arrivalDate: "2023-12-10", details: "", quantity: 10} )
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValue([{user: "test"}] as ProductReview[])
    jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValue()
    const reviewController = new ReviewController();
    const result = await reviewController.deleteReview("testProduct", user);
    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);
});

//Unit test deleteReviewsOfProduct method in ReviewController
test("deleteReviewsOfProduct - Product not found", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue(null as unknown as Product)
    const reviewController = new ReviewController();
    try {
        await reviewController.deleteReviewsOfProduct("testProduct");
    }
    catch (e) {
        expect(e).toBeInstanceOf(ProductNotFoundError);
    }
});

test("deleteReviewsOfProduct - Reviews deleted", async () => {
    jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValue({model: "testProduct", category: Category.LAPTOP, sellingPrice: 1000, arrivalDate: "2023-12-10", details: "", quantity: 10} )
    jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockResolvedValue()
    const reviewController = new ReviewController();
    const result = await reviewController.deleteReviewsOfProduct("testProduct");
    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);
});

//Unit test deleteAllReviews method in ReviewController
test("deleteAllReviews - Reviews deleted", async () => {
    jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValue()
    const reviewController = new ReviewController();
    const result = await reviewController.deleteAllReviews();
    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);
});

