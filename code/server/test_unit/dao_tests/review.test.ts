import { describe, test, expect, beforeEach, afterEach, jest, it } from "@jest/globals"
import db from '../../src/db/db'; 
import { ProductReview } from "../../src/components/review";
import ReviewDAO from  "../../src/dao/reviewDAO"
import { User, Role} from "../../src/components/user";

describe('ReviewDAO', () => {
    describe('addReview', () => {
      let reviewdao: ReviewDAO;
  
      beforeEach(() => {
        reviewdao = new ReviewDAO();
      });
  
      afterEach(() => {
        jest.clearAllMocks(); // Clear all mock function calls
      });
  
      it('should add a new review to the database', async () => {
        const newReview = {
          user: 'johndoe',
          model: 'Unique Model',
          score: 5,
          comment: 'Excellent product!',
          date: new Date().toISOString().split('T')[0], 
        };
  
        const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
          expect(sql).toEqual('INSERT INTO reviews(user, model, score, date, comment) VALUES(?, ?, ?, ?, ?)');
          expect(params).toEqual([newReview.user, newReview.model, newReview.score, newReview.date, newReview.comment]);
          return callback(null);
        });
  
        await reviewdao.addReview(newReview.user, newReview.model, newReview.score, newReview.comment);
  
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      });
  
      // Database error handling
      it('should reject the promise on database insertion failure', async () => {
        const expectedError = new Error('Database error adding review');
  
        const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));  
        try {
          await reviewdao.addReview('janedoe', 'Another Model', 4, 'Great value!');
        } catch (error) {
          expect(error).toEqual(expectedError);
          expect(mockDbRun).toHaveBeenCalledTimes(1);
        }
      });   
    });
  });

  describe('getProductReviews', () => {
    let reviewdao: ReviewDAO;
    let mockDbAll: jest.Mock; // Mock for db.all

    beforeEach(() => {
      reviewdao = new ReviewDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Successful retrieval of reviews
    it('should retrieve all reviews for a specific product model', async () => {
      const model = 'Popular Model';
      const mockReviews = [
        { model, user: 'janesmith', score: 4, date: '2024-06-12', comment: 'Great value for money!' },
        { model, user: 'alice', score: 5, date: '2024-06-13', comment: 'Highly recommended!' },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM reviews WHERE model = ?');
        expect(params).toEqual([model]);
        return callback(null, mockReviews); // Simulate successful retrieval
      });

      const reviews = await reviewdao.getProductReviews(model);

      expect(reviews).toEqual(mockReviews.map(row => new ProductReview(row.model, row.user, row.score, row.date, row.comment)));
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Empty reviews case
    it('should return an empty array if no reviews found for the product', async () => {
      const model = 'New Model'; // No reviews exist for this model

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, [])); 

      const reviews = await reviewdao.getProductReviews(model);

      expect(reviews).toEqual([]); // Empty array expected
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Database error handling (optional)
    it('should reject the promise on database retrieval failure', async () => {
      const model = 'Another Model';
      const expectedError = new Error('Database error retrieving reviews');

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await reviewdao.getProductReviews(model);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('deleteReview', () => {
    let reviewdao: ReviewDAO;
    let mockDbRun: jest.Mock; // Mock for db.run

    beforeEach(() => {
      reviewdao = new ReviewDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Successful review deletion (User object)
    it('should delete the review and resolve the promise for a valid User object', async () => {
      const user = new User('johndoe', 'John', 'Doe', Role.CUSTOMER, "", ""); 
      const model = 'Unique Model';

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('DELETE FROM reviews WHERE user = ? AND model = ?');
        expect(params).toEqual([user.username, model]);
        return callback(null); // Simulate successful deletion
      });

      await reviewdao.deleteReview(user, model);

      expect(mockDbRun).toHaveBeenCalledTimes(1);
    });

    // Successful review deletion (user ID as string) - optional if applicable
    it('should delete the review and resolve the promise for a user ID string (optional)', async () => {
       const user = new User('johndoe', 'John', 'Doe', Role.CUSTOMER, "", ""); 
       const model = 'Unique Model';

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('DELETE FROM reviews WHERE user = ? AND model = ?');
        expect(params).toEqual([user.username, model]);
        return callback(null); 
      });

      await reviewdao.deleteReview(user, model);

      expect(mockDbRun).toHaveBeenCalledTimes(1);
    });

    // Database error handling
    it('should reject the promise on database deletion failure', async () => {
      const user = new User('alice', 'Alice', 'Smith', Role.MANAGER, "", "");
      const model = 'Yet Another Model';
      const expectedError = new Error('Database error deleting review');

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await reviewdao.deleteReview(user, model);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      }
    });

    // Non-existent review deletion (optional)
    it('should resolve the promise even if the review does not exist', async () => {
      const user = new User('bob', 'Bob', 'Jones', Role.CUSTOMER, "", "");
      const model = 'Non-Existent Model';

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('DELETE FROM reviews WHERE user = ? AND model = ?');
        expect(params).toEqual([user.username, model]);
        return callback(null); // Simulate successful deletion (even though no rows affected)
      });

      await reviewdao.deleteReview(user, model);

      expect(mockDbRun).toHaveBeenCalledTimes(1); // No error expected
    });

    describe('deleteReviewsOfProduct', () => {
        let reviewdao: ReviewDAO;
        let mockDbRun: jest.Mock; // Mock for db.run
    
        beforeEach(() => {
          reviewdao = new ReviewDAO();
        });
    
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mock function calls
        });
    
        // Successful review deletion
        it('should delete all reviews for the product and resolve the promise', async () => {
          const model = 'Unique Model';
    
          const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
            expect(sql).toEqual('DELETE FROM reviews WHERE model = ?');
            expect(params).toEqual([model]);
            return callback(null); // Simulate successful deletion
          });
    
          await reviewdao.deleteReviewsOfProduct(model);
    
          expect(mockDbRun).toHaveBeenCalledTimes(1);
        });
    
        // Database error handling
        it('should reject the promise on database deletion failure', async () => {
          const model = 'Another Model';
          const expectedError = new Error('Database error deleting reviews');
    
          const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));
    
          try {
            await reviewdao.deleteReviewsOfProduct(model);
            ('Expected an error to be thrown');
          } catch (error) {
            expect(error).toEqual(expectedError);
            expect(mockDbRun).toHaveBeenCalledTimes(1);
          }
        });
      });

      describe('deleteAllReviews', () => {
        let reviewdao: ReviewDAO;
        let mockDbRun: jest.Mock; // Mock for db.run
    
        beforeEach(() => {
          reviewdao = new ReviewDAO();
        });
    
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mock function calls
        });
    
        // Successful review deletion
        it('should delete all reviews and resolve the promise', async () => {
    
            const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
            expect(sql).toEqual('DELETE FROM reviews');
            expect(params).toEqual([]); // Empty parameter list for DELETE ALL
            return callback(null); // Simulate successful deletion
          });
    
          await reviewdao.deleteAllReviews();
    
          expect(mockDbRun).toHaveBeenCalledTimes(1);
        });
    
        // Database error handling
        it('should reject the promise on database deletion failure', async () => {
          const expectedError = new Error('Database error deleting all reviews');
    
          const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));
    
          try {
            await reviewdao.deleteAllReviews();
          } catch (error) {
            expect(error).toEqual(expectedError);
            expect(mockDbRun).toHaveBeenCalledTimes(1);
          }
        });
      });

      describe('deleteUserReviews', () => {
        let reviewdao: ReviewDAO;
        let mockDbRun: jest.Mock; // Mock for db.run
    
        beforeEach(() => {
          reviewdao = new ReviewDAO();
        });
    
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mock function calls
        });
    
        // Successful review deletion
        it('should delete all reviews for the user and resolve with true', async () => {
          const userId = 'johndoe';
    
          const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
            expect(sql).toEqual('DELETE FROM reviews WHERE user = ?');
            expect(params).toEqual([userId]);
            return callback(null); // Simulate successful deletion
          });
    
          const result = await reviewdao.deleteUserReviews(userId);
    
          expect(mockDbRun).toHaveBeenCalledTimes(1);
          expect(result).toBe(true);
        });
    
        // Database error handling
        it('should reject the promise on database deletion failure', async () => {
          const userId = 'janedoe';
          const expectedError = new Error('Database error deleting user reviews');
    
          const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));
    
          try {
            await reviewdao.deleteUserReviews(userId);
          } catch (error) {
            expect(error).toEqual(expectedError);
            expect(mockDbRun).toHaveBeenCalledTimes(1);
          }
        });
      });

});

