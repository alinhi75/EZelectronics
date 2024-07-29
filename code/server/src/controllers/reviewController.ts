import ProductDAO from "../dao/productDAO";
import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import {ProductNotFoundError} from "../errors/productError" 
import {ExistingReviewError, NoReviewProductError} from "../errors/reviewError"
import { ProductReview } from "../components/review";

class ReviewController {
    private dao: ReviewDAO
    private productdao : ProductDAO

    constructor() {
        this.dao = new ReviewDAO
        this.productdao = new   ProductDAO
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, user: User, score: number, comment: string):Promise<void> {
        const productarray = await this.productdao.getProductByModel(model);
        if (!productarray) {
            throw new ProductNotFoundError();
        }

        // Check if the customer has already reviewed the product
        const productReviews = await this.dao.getProductReviews(model)
        if (productReviews.find(review => review.user === user.username) != undefined) {
            throw new ExistingReviewError();
        }
        return await this.dao.addReview(user.username, model, score, comment);
    }

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    async getProductReviews(model: string):Promise<ProductReview[]> { 
        return await this.dao.getProductReviews(model)
    }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: User):Promise<void> {
        const productarray = await this.productdao.getProductByModel(model);
        if (!productarray) {
            throw new ProductNotFoundError();
        }

        const productReviews = await this.dao.getProductReviews(model)
        if (productReviews.find(review => review.user === user.username) === undefined) {
            throw new NoReviewProductError();
        }
        
        return await this.dao.deleteReview(user, model)
    }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string):Promise<void> { 
        const productarray = await this.productdao.getProductByModel(model);
        if (!productarray) {
            throw new ProductNotFoundError();
        }

        return await this.dao.deleteReviewsOfProduct(model)
    }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews():Promise<void> { 
        return await this.dao.deleteAllReviews()
    }
}

export default ReviewController;