
import { ProductNotFoundError, LowProductStockError } from "../../src/errors/productError"

import { describe, test, expect, beforeEach, afterEach, jest, it } from "@jest/globals"
import productDAO from "../../src/dao/productDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { ProductReview } from "../../src/components/review"
import {ExistingReviewError, NoReviewProductError} from "../../src/errors/reviewError"
import { User } from "../../src/components/user"
import { Product } from "../../src/components/product"
import { Category } from "../../src/components/product"

const mockProduct1 = new Product(
  199.99,
  "New Model",
  Category.SMARTPHONE,
  null,
  "A great new product!",
  10
);

describe("ProductDao", () => {
  const productdao = new productDAO();

  describe("registerProduct", () => {
    it("should register a new product without returning errors", async () => {
    

      const mockDBRun = jest.spyOn(db, "run").mockImplementation((query, values, callback) => {
        return callback(null);
      });

      const response = await productdao.registerProducts(
        mockProduct1.model,
        mockProduct1.category,
        mockProduct1.details,
        mockProduct1.sellingPrice,
        mockProduct1.arrivalDate,
        mockProduct1.quantity,
      );

      expect(response).toBe(true);
      expect(mockDBRun).toHaveBeenCalledTimes(1);
      mockDBRun.mockRestore();
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const expectedError = new Error('Database query failed');
      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.registerProducts(mockProduct1.model,
          mockProduct1.category,
          mockProduct1.details,
          mockProduct1.sellingPrice,
          mockProduct1.arrivalDate,
          mockProduct1.quantity,
        );
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('getAllProducts', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful retrieval of all products
    it('should retrieve all products from the database and convert them to Product objects', async () => {
      const mockProducts = [
        { selling_price: 199.99, model: 'New Model', category: Category.SMARTPHONE , arrival_date: null, details: 'A great new product!', quantity: 10 },
        { selling_price: 499.99, model: 'Powerful Laptop', category: Category.LAPTOP , arrival_date: '2023-06-10', details: 'Excellent performance', quantity: 5 },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products');
        expect(params).toEqual([]);
        return callback(null, mockProducts); // Return the mock data
      });

      const products = await productdao.getAllProducts();

      expect(products.length).toBeGreaterThanOrEqual(0); // Ensure at least no products are returned
      products.forEach((product, index) => {
        expect(product).toBeInstanceOf(Product); // Verify each product is a Product object
        expect(product.sellingPrice).toEqual(mockProducts[index].selling_price);
        expect(product.model).toEqual(mockProducts[index].model);
        expect(product.category).toEqual(mockProducts[index].category); // Use Category enum for comparison
        expect(product.arrivalDate).toEqual(mockProducts[index].arrival_date);
        expect(product.details).toEqual(mockProducts[index].details);
        expect(product.quantity).toEqual(mockProducts[index].quantity);
      });

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with empty database (no products)
    it('should return an empty array if no products are found in the database', async () => {
      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, []));

      const products = await productdao.getAllProducts();

      expect(products).toEqual([]);
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const expectedError = new Error('Database query failed');
      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getAllProducts();
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('changeProductQuantity', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful quantity update
    it('should update the quantity of a product successfully', async () => {
      const model = 'New Model';
      const newQuantity = 20;

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('UPDATE products SET quantity = ? WHERE model = ?');
        expect(params).toEqual([newQuantity, model]);
        return callback(null); // Simulate successful update
      });

      const result = await productdao.changeProductQuantity(model, newQuantity);

      expect(result).toBe(true);
      expect(mockDbRun).toHaveBeenCalledTimes(1);
    });

    // Test with negative quantity
    it('should not update the quantity with a negative value', async () => {
      const model = 'Another Model';
      const invalidQuantity = -5;
      const experror = new Error("Quantity cannot be negative")

      try {
        await productdao.changeProductQuantity(model, invalidQuantity);
      } catch (error) {
        expect(error).toEqual(experror);
      }

      // Optional: Verify that db.run was not called (or no update attempted)
      // expect(mockDbRun).not.toHaveBeenCalled(); // Consider if applicable
    });

    // Test with database update error
    it('should reject with an error on database update failure', async () => {
      const model = 'Existing Model';
      const newQuantity = 15;
      const expectedError = new Error('Database update failed');

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.changeProductQuantity(model, newQuantity);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('sellProduct', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); 
    });

    // Test successful sale (enough stock)
    test('should successfully sell a product if sufficient stock is available', async () => {
      const model = 'Popular Model';
      const initialQuantity = 10;
      const quantityToSell = 5;

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT quantity FROM products WHERE model = ?');
        expect(params).toEqual([model]);
        return callback(null, { quantity: initialQuantity }); 
      });

      const mockChangeQuantity = jest.spyOn(productdao, 'changeProductQuantity').mockImplementation((model, newQuantity) => {
        expect(model).toEqual('Popular Model'); 
        expect(newQuantity).toEqual(initialQuantity - quantityToSell);
        return Promise.resolve(true); 
      });

      const result = await productdao.sellProduct(model, quantityToSell);

      expect(result).toBe(true);
      expect(mockDbGet).toHaveBeenCalledTimes(1);
      expect(mockChangeQuantity).toHaveBeenCalledTimes(1);
    });

    // Test insufficient stock
    it('should throw a LowProductStockError if there is not enough stock to sell', async () => {
      const model = 'Limited Model';
      const initialQuantity = 2;
      const quantityToSell = 5;

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((_, __, callback) => callback(null, { quantity: initialQuantity }));

      try {
        await productdao.sellProduct(model, quantityToSell);
      } catch (error) {
        expect(error).toBeInstanceOf(LowProductStockError);
        expect(mockDbGet).toHaveBeenCalledTimes(1);
      }
    });

    // Test with database error on initial stock check
    it('should reject with an error on database error during initial stock check', async () => {
      const model = 'Another Model';
      const quantityToSell = 3;
      const expectedError = new Error('Database query failed');

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.sellProduct(model, quantityToSell);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbGet).toHaveBeenCalledTimes(1);
      }
    });

    // Test with database error during quantity update
    it('should reject with an error on database error during quantity update', async () => {
      const model = 'Existing Model';
      const initialQuantity = 8;
      const quantityToSell = 4;
      const expectedError = new Error('Database update failed');

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((_, __, callback) => callback(null, { quantity: initialQuantity }));
      const mockChangeQuantity = jest.spyOn(productdao, 'changeProductQuantity').mockImplementation(() => Promise.reject(expectedError));

      try {
        await productdao.sellProduct(model, quantityToSell);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbGet).toHaveBeenCalledTimes(1)
      }
    })
  
  })
})


describe('ProductDAO', () => {
  describe('getAvailableProducts', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // Test successful retrieval of available products
    it('should retrieve all products with positive quantity from the database', async () => {
      const mockProducts = [
        { selling_price: 199.99, model: 'New Model', category: Category.SMARTPHONE, arrival_date: null, details: 'A great new product!', quantity: 10 },
        { selling_price: 499.99, model: 'Powerful Laptop', category: Category.LAPTOP, arrival_date: '2023-06-10', details: 'Excellent performance', quantity: 5 },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products WHERE quantity > 0');
        expect(params).toEqual([]);
        return callback(null, mockProducts); 
      });

      const availableProducts = await productdao.getAvailableProducts();

      expect(availableProducts.length).toBeGreaterThanOrEqual(0); 
      availableProducts.forEach((product, index) => {
        expect(product).toBeInstanceOf(Product); 
        expect(product.sellingPrice).toEqual(mockProducts[index].selling_price);
        expect(product.model).toEqual(mockProducts[index].model);
        expect(product.category).toEqual(mockProducts[index].category); 
        expect(product.arrivalDate).toEqual(mockProducts[index].arrival_date);
        expect(product.details).toEqual(mockProducts[index].details);
        expect(product.quantity).toEqual(mockProducts[index].quantity);
        expect(product.quantity).toBeGreaterThan(0); 
      });

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no products are found in the database', async () => {
      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, []));

      const availableProducts = await productdao.getAvailableProducts();

      expect(availableProducts).toEqual([]);
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const expectedError = new Error('Database query failed');
      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getAvailableProducts();
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('deleteProduct', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // Test successful product deletion
    it('should successfully delete a product from the database', async () => {
      const model = 'Outdated Model';

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('DELETE FROM products WHERE model = ?');
        expect(params).toEqual([model]);
        return callback(null); 
      });

      const result = await productdao.deleteProduct(model);

      expect(result).toBe(true);
      expect(mockDbRun).toHaveBeenCalledTimes(1);
    });

    // Test with database deletion error
    it('should reject with an error on database deletion failure', async () => {
      const model = 'Another Model';
      const expectedError = new Error('Database deletion failed');

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.deleteProduct(model);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('deleteAllProducts', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful product deletion (all)
    it('should successfully delete all products from the database', async () => {
      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('DELETE FROM products');
        expect(params).toEqual([]); // Empty params for deleting all
        return callback(null); // Simulate successful deletion
      });

      const result = await productdao.deleteAllProducts();

      expect(result).toBe(true);
      expect(mockDbRun).toHaveBeenCalledTimes(1);
    });

    // Test with database deletion error
    it('should reject with an error on database deletion failure', async () => {
      const expectedError = new Error('Database deletion failed');

      const mockDbRun = jest.spyOn(db, 'run').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.deleteAllProducts();
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbRun).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('getProductsByCategory', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful retrieval of products by category
    it('should retrieve products belonging to the specified category', async () => {
      const category = Category.LAPTOP; // Assuming Category is an enum
      const mockProducts = [
        { selling_price: 499.99, model: 'Powerful Laptop', category: Category.LAPTOP, arrival_date: '2023-06-10', details: 'Excellent performance', quantity: 5 },
        { selling_price: 899.99, model: 'Gaming Laptop', category: Category.LAPTOP, arrival_date: '2024-05-15', details: 'High-end graphics', quantity: 2 },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products WHERE category = ?');
        expect(params).toEqual([category]);
        return callback(null, mockProducts); // Return the mock data
      });

      const categoryProducts = await productdao.getProductsByCategory(category);

      expect(categoryProducts.length).toBeGreaterThanOrEqual(0); // Ensure at least no products are returned
      categoryProducts.forEach((product, index) => {
        expect(product).toBeInstanceOf(Product); 
        expect(product.sellingPrice).toEqual(mockProducts[index].selling_price);
        expect(product.model).toEqual(mockProducts[index].model);
        expect(product.category).toEqual(mockProducts[index].category); 
        expect(product.arrivalDate).toEqual(mockProducts[index].arrival_date);
        expect(product.details).toEqual(mockProducts[index].details);
        expect(product.quantity).toEqual(mockProducts[index].quantity);
      });

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with empty database (no products in the category)
    it('should return an empty array if no products belong to the specified category', async () => {
      const category = 'Headphones'; 

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, []));

      const categoryProducts = await productdao.getProductsByCategory(category);

      expect(categoryProducts).toEqual([]);
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const category = Category.LAPTOP; // Assuming Category is an enum
      const expectedError = new Error('Database query failed');

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getProductsByCategory(category);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('getProductByModel', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); 
    });

    // Test successful retrieval of a product by model
    it('should retrieve a product with the specified model from the database', async () => {
      const model = 'Unique Model';
      const mockProduct = { selling_price: 299.99, model: model, category: Category.SMARTPHONE, arrival_date: "", details: 'A great phone!', quantity: 1 };

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products WHERE model = ?');
        expect(params).toEqual([model]);
        return callback(null, mockProduct); // Return the mock data
      });

      const product = await productdao.getProductByModel(model);

      expect(product).toBeInstanceOf(Product); 
      expect(product.sellingPrice).toEqual(mockProduct.selling_price);
      expect(product.model).toEqual(mockProduct.model);
      expect(product.category).toEqual(mockProduct.category); 
      expect(product.arrivalDate).toEqual(mockProduct.arrival_date);
      expect(product.details).toEqual(mockProduct.details);
      expect(product.quantity).toEqual(mockProduct.quantity);

      expect(mockDbGet).toHaveBeenCalledTimes(1);
    });

    // Test with non-existent product (no matching model)
    it('should resolve to null if no product is found with the specified model', async () => {
      const model = 'Nonexistent Model';

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((_, __, callback) => callback(null, null));

      const product = await productdao.getProductByModel(model);

      expect(product).toBeNull();
      expect(mockDbGet).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const model = 'Another Model';
      const expectedError = new Error('Database query failed');

      const mockDbGet = jest.spyOn(db, 'get').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getProductByModel(model);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbGet).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('getAvailableProductsByCategory', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful retrieval of available products in a category
    it('should retrieve available products (quantity > 0) belonging to the specified category', async () => {
      const category = Category.LAPTOP; // Assuming Category is an enum
      const mockProducts = [
        { selling_price: 499.99, model: 'Powerful Laptop', category: Category.LAPTOP, arrival_date: '2023-06-10', details: 'Excellent performance', quantity: 5 },
        { selling_price: 899.99, model: 'Gaming Laptop', category: Category.LAPTOP, arrival_date: '2024-05-15', details: 'High-end graphics', quantity: 2 },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products WHERE category = ? and quantity > 0');
        expect(params).toEqual([category]);
        return callback(null, mockProducts); // Return the mock data
      });

      const availableProducts = await productdao.getAvailableProductsByCategory(category);

      expect(availableProducts.length).toBeGreaterThanOrEqual(0); // Ensure at least no products are returned
      availableProducts.forEach((product, index) => {
        expect(product).toBeInstanceOf(Product); // Verify each product is a Product object
        expect(product.sellingPrice).toEqual(mockProducts[index].selling_price);
        expect(product.model).toEqual(mockProducts[index].model);
        expect(product.category).toEqual(mockProducts[index].category); // Use Category enum for comparison
        expect(product.arrivalDate).toEqual(mockProducts[index].arrival_date);
        expect(product.details).toEqual(mockProducts[index].details);
        expect(product.quantity).toEqual(mockProducts[index].quantity);
        expect(product.quantity).toBeGreaterThan(0); // Verify positive quantity for available products
      });

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with empty database (no available products in the category)
    it('should return an empty array if no available products belong to the specified category', async () => {
      const category = 'Headphones'; // Assuming this category might not exist

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, []));

      const availableProducts = await productdao.getAvailableProductsByCategory(category);

      expect(availableProducts).toEqual([]);
      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const category = Category.SMARTPHONE; // Assuming Category is an enum
      const expectedError = new Error('Database query failed');

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getAvailableProductsByCategory(category);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });
});


describe('ProductDAO', () => {
  describe('getAvailableProductsByModel', () => {
    let productdao: productDAO;

    beforeEach(() => {
      productdao = new productDAO();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clear all mock function calls
    });

    // Test successful retrieval of available products with a specific model
    it('should retrieve available products (quantity > 0) with the specified model from the database', async () => {
      const model = 'Unique Model';
      const mockProducts = [
        { selling_price: 299.99, model: model, category: Category.SMARTPHONE, arrival_date: "", details: 'A great phone!', quantity: 1 },
      ];

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
        expect(sql).toEqual('SELECT * FROM products WHERE model = ? and quantity > 0');
        expect(params).toEqual([model]);
        return callback(null, mockProducts); // Return the mock data
      });

      const availableProducts = await productdao.getAvailableProductsByModel(model);

      expect(availableProducts.length).toBeGreaterThanOrEqual(0); // Ensure at least no products are returned
      availableProducts.forEach((product, index) => {
        expect(product).toBeInstanceOf(Product); // Verify each product is a Product object
        expect(product.sellingPrice).toEqual(mockProducts[index].selling_price);
        expect(product.model).toEqual(mockProducts[index].model);
        expect(product.category).toEqual(mockProducts[index].category); // Use Category enum for comparison
        expect(product.arrivalDate).toEqual(mockProducts[index].arrival_date);
        expect(product.details).toEqual(mockProducts[index].details);
        expect(product.quantity).toEqual(mockProducts[index].quantity);
        expect(product.quantity).toBeGreaterThan(0); // Verify positive quantity for available products
      });

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with non-existent product (no matching model)
    it('should reject with a ProductNotFoundError if no product is found with the specified model', async () => {
      const model = 'Nonexistent Model';

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(null, []));

      try {
        await productdao.getAvailableProductsByModel(model);
      } catch (error) {
        expect(error).toBeInstanceOf(ProductNotFoundError); // Verify the specific error type
      }

      expect(mockDbAll).toHaveBeenCalledTimes(1);
    });

    // Test with database query failure
    it('should reject with an error on database query failure', async () => {
      const model = 'Another Model';
      const expectedError = new Error('Database query failed');

      const mockDbAll = jest.spyOn(db, 'all').mockImplementation((_, __, callback) => callback(expectedError));

      try {
        await productdao.getAvailableProductsByModel(model);
      } catch (error) {
        expect(error).toEqual(expectedError);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
      }
    });
  });
});