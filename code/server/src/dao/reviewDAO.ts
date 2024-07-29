import db from "../db/db";
import { ProductReview } from "../components/review";
import {User} from "../components/user";
//import { } from "../errors/reviewError";

class ReviewDAO {
    /**
     * Creates a new review and saves it in the database.
     * @param userId The username of the user who wrote the review.
     * @param model The model of the product being reviewed.
     * @param score The score of the review (1-5).
     * @param date The date of the review.
     * @param comment The comment of the review.
     * @returns A Promise that resolves to true if the review has been created.
     */
    addReview(user: string, model: string, score: number, comment: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "INSERT INTO reviews(user, model, score, date, comment) VALUES(?, ?, ?, ?, ?)";
            db.run(sql, [user, model, score, new Date().toISOString().split('T')[0], comment], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Retrieves all reviews for a specific product.
     * @param model The model of the product.
     * @returns A Promise that resolves to an array of reviews.
     */
    getProductReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model = ?";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const reviews = rows.map(row => new ProductReview(row.model, row.user, row.score, row.date, row.comment));
                resolve(reviews);
            });
        });
    }

    /**
     * Deletes a specific review by a user for a product.
     * @param userId The ID of the user.
     * @param model The model of the product.
     * @returns A Promise that resolves to true if the review has been deleted.
     */
    deleteReview(user: User, model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE user = ? AND model = ?";
            db.run(sql, [user.username, model], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Deletes all reviews for a specific product.
     * @param model The model of the product.
     * @returns A Promise that resolves to true if the reviews have been deleted.
     */
    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE model = ?";
            db.run(sql, [model], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Deletes all reviews in the database.
     * @returns A Promise that resolves to true if all reviews have been deleted.
     */
    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews";
            db.run(sql, [], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Deletes all reviews by a specific user.
     * @param userId The ID of the user.
     * @returns A Promise that resolves to true if the reviews have been deleted.
     */
    deleteUserReviews(userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE user = ?";
            db.run(sql, [userId], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

export default ReviewDAO;
