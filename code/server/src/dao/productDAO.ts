import db from "../db/db";
import { Product } from "../components/product";
import { ProductNotFoundError, LowProductStockError } from "../errors/productError";

class ProductDAO {
    /**
     * Creates a new product and saves it in the database.
     * @param model The model of the product.
     * @param category The category of the product.
     * @param arrivalDate The arrival date of the product.
     * @param sellingPrice The selling price of the product.
     * @param quantity The quantity of the product in stock.
     * @returns A Promise that resolves to true if the product has been created.
     */
    registerProducts(model: string, category: string, arrivalDate: string | null, sellingPrice: number, details: string | null, quantity: number ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO products(model, category, arrival_date, selling_price, details, quantity) VALUES(?, ?, ?, ?, ?, ?)";
            db.run(sql, [model, category, arrivalDate, sellingPrice, details, quantity], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Retrieves all products from the database.
     * @returns A Promise that resolves to an array of products.
     */
    getAllProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(row => new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity));
                console.log(products);
                resolve(products);
            });
        });
    }

    /**
     * Changes the quantity of a product.
     * @param model The model of the product.
     * @param quantity The new quantity of the product.
     * @returns A Promise that resolves to true if the quantity has been updated.
     */
    // changeProductQuantity(model: string, quantity: number): Promise<boolean> {
    //     return new Promise<boolean>((resolve, reject) => {

    //         const sql = "UPDATE products SET quantity = ? WHERE model = ?";
    //         db.run(sql, [quantity, model], (err: Error | null) => {

    //             if (err || quantity < 0) {
    //                 reject(err);
    //             } else {
    //                 resolve(true);
    //             }
    //         });
    //     });
    // }

    changeProductQuantity(model: string, quantity: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
      
          if (quantity < 0) {
            reject(new Error("Quantity cannot be negative"));
            return;
          }
      
          const sql = "UPDATE products SET quantity = ? WHERE model = ?";
          db.run(sql, [quantity, model], (err: Error | null) => {
      
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      }

    /**
     * Sells a product by decreasing its quantity.
     * @param model The model of the product.
     * @param quantity The quantity to be sold.
     * @returns A Promise that resolves to true if the product has been sold.
     */
    sellProduct(model: string, quantity: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "SELECT quantity FROM products WHERE model = ?";
            db.get(sql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row.quantity < quantity) {
                    reject(new LowProductStockError());
                    return;
                }
                this.changeProductQuantity(model, row.quantity - quantity).then(() => {
                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Retrieves all available products (quantity > 0) from the database.
     * @returns A Promise that resolves to an array of available products.
     */
    getAvailableProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE quantity > 0";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(row => new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity));
                resolve(products);
            });
        });
    }

    /**
     * Deletes a product from the database.
     * @param model The model of the product.
     * @returns A Promise that resolves to true if the product has been deleted.
     */
    deleteProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products WHERE model = ?";
            db.run(sql, [model], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Deletes all products from the database.
     * @returns A Promise that resolves to true if all products have been deleted.
     */
    deleteAllProducts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products";
            db.run(sql, [], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Retrieves all products with a specific category.
     * @param category The category of the products.
     * @returns A Promise that resolves to an array of products.
     */
    getProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE category = ?";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(row => new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity));
                resolve(products);
            });
        });
    }

    /**
     * Retrieves product with a specific model.
     * @param model The model of the product.
     * @returns A Promise that resolves to a product.
     */
    getProductByModel(model: string): Promise<Product> {
        return new Promise<Product>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.get(sql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                if(row){
                    const product = new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity);
                    resolve(product);
                    return;
                }

                console.log(row);
                resolve(row);
            });
        });
    }

    /**
     * Retrieves all available products with a specific category.
     * @param category The category of the products.
     * @returns A Promise that resolves to an array of products.
     */
    getAvailableProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE category = ? and quantity > 0";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(row => new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity));
                resolve(products);
            });
        });
    }

    /**
     * Retrieves all available products with a specific model.
     * @param model The model of the products.
     * @returns A Promise that resolves to an array of products.
     */
    getAvailableProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ? and quantity > 0";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    // return;
                }
                const products = rows.map(row => new Product(row.selling_price, row.model, row.category, row.arrival_date, row.details, row.quantity));
                resolve(products);
            });
        });
    }
}

export default ProductDAO;
