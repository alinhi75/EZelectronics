import db from "../db/db";
import { Cart, ProductInCart } from "../components/cart";
import {
    CartNotFoundError,
    ProductInCartError,
    ProductNotInCartError,
    WrongUserCartError,
    EmptyCartError
} from "../errors/cartError"; // Import relevant error classes
import { ProductNotFoundError } from "../errors/productError";

class CartDAO {
    /**
     * Creates a new cart for a user.
     * @param user The username of the user.
     * @param paid Whether the cart is paid.
     * @param paymentDate The date of payment (if paid).
     * @param total The total amount of the cart.
     * @returns A Promise that resolves to true if the cart has been created.
     */
    createCart(user: string, paid: boolean, paymentDate: string | null, total: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO carts(user, paid, payment_date, total) VALUES(?, ?, ?, ?)";
            db.run(sql, [user, paid, paymentDate, total], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    
    /**
     * Retrieves the unpaid cart for a specific user along with the products in the cart.
     * @param user The username of the user.
     * @returns A Promise that resolves to a Cart object.
     */
    getCart(user: string): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            const sql = `
                SELECT c.id as cart_id, c.user, c.paid, c.payment_date, c.total, 
                       cp.model, cp.quantity, p.selling_price, p.category
                FROM carts c
                LEFT JOIN cart_products cp ON c.id = cp.cart_id
                LEFT JOIN products p ON cp.model = p.model
                WHERE c.user = ? AND c.paid = 0`;

            db.all(sql, [user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length === 0) {
                    reject(new CartNotFoundError());
                    return;
                }

                const firstRow = rows[0];
                const cart = new Cart(firstRow.user, firstRow.paid, firstRow.payment_date, firstRow.total, []);

                rows.forEach(row => {
                    if (row.model) {
                        const productInCart = new ProductInCart(row.model, row.quantity, row.category, row.selling_price);
                        cart.products.push(productInCart);
                    }
                });

                resolve(cart);
            });
        });
    }

    /**
     * Check if a product is an existing product and has quantity > 0.
     * @param product The model of the product.
     * @returns A Promise that resolves to -1 if the product does not exist, 0 if the product is out of stock, 1 if the product is available.
     */
    checkProduct(product: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.get(sql, [product], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(-1);
                } else if (row.quantity <= 0) {
                    resolve(0);
                } else {
                    resolve(1);
                }
            });
        });
    }

     /**
     * Adds a product to the current user's unpaid cart.
     * @param user The username of the user.
     * @param product The model of the product.
     * @returns A Promise that resolves to true if the product has been added to the cart.
     */
    addToCart(user: string, product: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                // Get the user's unpaid cart
                try{
                    const cart = await this.getCart(user);
                }
                catch(err){
                    await this.createCart(user, false, null, 0);
                }

                // Get the product details
                const productSql = "SELECT model, selling_price FROM products WHERE model = ?";
                db.get(productSql, [product], (err: Error | null, productRow: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!productRow) {
                        reject(new ProductNotFoundError());
                        return;
                    }

                    const { model, selling_price } = productRow;

                    // Check if the product is already in the cart
                    const checkProductSql = "SELECT * FROM cart_products WHERE cart_id = (SELECT id FROM carts WHERE user = ? AND paid = 0)  AND model = ?";
                    db.get(checkProductSql, [user, model], (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (row) {
                            // If product is already in the cart, increase quantity by 1
                            const updateQuantitySql = "UPDATE cart_products SET quantity = quantity + 1 WHERE cart_id = (SELECT id FROM carts WHERE user = ? AND paid = 0) AND model = ?";
                            db.run(updateQuantitySql, [user, model], (err: Error | null) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                // Update the total in the cart
                                const updateTotalSql = "UPDATE carts SET total = total + ? WHERE id = (SELECT id FROM carts WHERE user = ? AND paid = 0) ";
                                db.run(updateTotalSql, [selling_price, user], (err: Error | null) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            });
                        } else {
                            // If product is not in the cart, add it with quantity 1
                            const addProductSql = "INSERT INTO cart_products(cart_id, model, quantity) VALUES((SELECT id FROM carts WHERE user = ? AND paid = 0), ?, 1)";
                            db.run(addProductSql, [user, model], (err: Error | null) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                // Update the total in the cart
                                const updateTotalSql = "UPDATE carts SET total = total + ? WHERE id = (SELECT id FROM carts WHERE user = ? AND paid = 0)";
                                db.run(updateTotalSql, [selling_price, user], (err: Error | null) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            });
                        }
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Checkout the current cart.
     * @param user The username of the user.
     * @returns A Promise that resolves to true if the cart has been checked out.
     */
    checkoutCart(user: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
                // Get the user's unpaid cart
                const carts = await this.getCart(user);
                if (!carts) {
                    reject(new CartNotFoundError());
                    return;
                }
                const paymentDate = new Date().toISOString(); // current date and time

                // Mark the cart as paid
                const checkoutSql = "UPDATE carts SET paid = 1, payment_date = ? WHERE paid = 0 AND user = ?";
                db.run(checkoutSql, [paymentDate, user], (err: Error | null) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            
        });
    }

    /**
     * Get all products in the current cart of the user.
     * @param user The username of the user.
     * @returns A Promise that resolves to an array of products in the cart.
     */
    getProductsInCart(user: string): Promise<ProductInCart[]> {
        return new Promise<ProductInCart[]>((resolve, reject) => {
            const sql = `
                SELECT cp.model, cp.quantity, p.selling_price, p.category
                FROM cart_products cp
                JOIN products p ON cp.model = p.model
                WHERE cp.cart_id = (SELECT id FROM carts WHERE user = ? AND paid = 0)
            `;
            db.all(sql, [user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(row => new ProductInCart(row.model, row.quantity, row.category, row.selling_price));
                resolve(products);
            });
        });
    }

    /**
     * Check if the cart is empty.
     * @param user The username of the user.
     * @returns A Promise that resolves to true if the cart is empty.
     */
    isCartEmpty(user: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "SELECT * FROM cart_products WHERE cart_id = (SELECT id FROM carts WHERE user = ? AND paid = 0)";
            db.all(sql, [user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Check if there is at least one product in the cart whose available quantity in the stock is 0
     * @param user The username of the user.
     * @returns A Promise that resolves to true if there is at least one product in the cart whose available quantity in the stock is 0.
     */
    isOutOfStock(user: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
                SELECT * FROM cart_products
                WHERE cart_id = (
                    SELECT id FROM carts WHERE user = ? AND paid = 0
                ) AND model IN (
                    SELECT model FROM products WHERE quantity = 0
                )`;
            db.all(sql, [user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Check if there is at least one product in the cart whose quantity is higher than the available quantity in the stock
     * @param user The username of the user.
     * @returns A Promise that resolves to true if there is at least one product in the cart whose quantity is higher than the available quantity in the stock.
     */
    isQuantityHigherThanStock(user: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
                SELECT * FROM cart_products
                WHERE cart_id = (
                    SELECT id FROM carts WHERE user = ? AND paid = 0
                ) AND model IN (
                    SELECT model FROM products WHERE quantity < (
                        SELECT quantity FROM cart_products WHERE cart_id = (
                            SELECT id FROM carts WHERE user = ? AND paid = 0
                        ) AND model = products.model
                    )
                )`;
            db.all(sql, [user, user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
    

    /**
     * Shows the history of paid carts.
     * @param user The username of the user.
     * @returns A Promise that resolves to an array of paid carts.
     */
    getCustomerCarts(user: string): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = `
                SELECT c.id as cart_id, c.user, c.paid, c.payment_date, c.total,
                       cp.model, cp.quantity, p.selling_price, p.category
                FROM carts c
                LEFT JOIN cart_products cp ON c.id = cp.cart_id
                LEFT JOIN products p ON cp.model = p.model
                WHERE c.user = ? AND c.paid = 1
            `;
            db.all(sql, [user], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length === 0) {
                    reject(new CartNotFoundError());
                    return;
                }

                const cartsMap: { [key: string]: Cart } = {};

                rows.forEach(row => {
                    if (!cartsMap[row.cart_id]) {
                        cartsMap[row.cart_id] = new Cart(row.user, row.paid, row.payment_date, row.total, []);
                    }

                    if (row.model) {
                        const productInCart = new ProductInCart(row.model, row.quantity, row.category, row.selling_price);
                        cartsMap[row.cart_id].products.push(productInCart);
                    }
                });

                const carts = Object.values(cartsMap);
                resolve(carts);
            });
        });
    }

    /**
     * Removes a product from the current unpaid cart.
     * @param user The username of the user.
     * @param product The model of the product.
     * @returns A Promise that resolves to true if the product has been removed.
     */
    removeProductFromCart(user: string, product: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const getProductPriceAndQuantitySql = `
                SELECT cp.quantity, p.selling_price, c.id as cart_id
                FROM cart_products cp
                JOIN products p ON cp.model = p.model
                JOIN carts c ON cp.cart_id = c.id
                WHERE c.user = ? AND c.paid = 0 AND cp.model = ?`;

            db.get(getProductPriceAndQuantitySql, [user, product], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    reject(new ProductNotInCartError());
                    return;
                }

                const { quantity, selling_price, cart_id } = row;
                const amountToSubtract = selling_price;

                if (quantity > 1) {
                    const updateQuantitySql = `
                        UPDATE cart_products
                        SET quantity = quantity - 1
                        WHERE cart_id = ? AND model = ?`;

                    db.run(updateQuantitySql, [cart_id, product], function (err: Error | null) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const updateTotalSql = `
                            UPDATE carts
                            SET total = total - ?
                            WHERE id = ?`;

                        db.run(updateTotalSql, [amountToSubtract, cart_id], (err: Error | null) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(true);
                            }
                        });
                    });
                } else {
                    const removeProductSql = `
                        DELETE FROM cart_products
                        WHERE cart_id = ? AND model = ?`;

                    db.run(removeProductSql, [cart_id, product], function (err: Error | null) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const updateTotalSql = `
                            UPDATE carts
                            SET total = total - ?
                            WHERE id = ?`;

                        db.run(updateTotalSql, [amountToSubtract, cart_id], (err: Error | null) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(true);
                            }
                        });
                    });
                }
            });
        });
    }

    /**
     * Removes all products from the cart.
     * @param user The username of the user.
     * @returns A Promise that resolves to true if all products have been removed.
     */
    clearCart(user: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
                DELETE FROM cart_products
                WHERE cart_id = (
                    SELECT id FROM carts WHERE user = ? AND paid = 0
                )`;

            db.run(sql, [user], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to true if all carts have been deleted.
     */
    deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM carts";
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
     * Retrieves the list of all carts of all users.
     * @returns A Promise that resolves to an array of all carts.
     */
    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = `
                SELECT c.id as cart_id, c.user, c.paid, c.payment_date, c.total,
                       cp.model, cp.quantity, p.selling_price, p.category
                FROM carts c
                LEFT JOIN cart_products cp ON c.id = cp.cart_id
                LEFT JOIN products p ON cp.model = p.model
            `;

            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const cartsMap: { [key: string]: Cart } = {};

                rows.forEach(row => {
                    if (!cartsMap[row.cart_id]) {
                        cartsMap[row.cart_id] = new Cart(row.user, row.paid, row.payment_date, row.total, []);
                    }

                    if (row.model) {
                        const productInCart = new ProductInCart(row.model, row.quantity, row.category, row.selling);
                        cartsMap[row.cart_id].products.push(productInCart);
                    }
                });

                const carts = Object.values(cartsMap);
                resolve(carts);
            });
        });
    }
    /*getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = "SELECT * FROM carts";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const carts = rows.map(row => new Cart(row.user, row.paid, row.payment_date, row.total, []));
                resolve(carts);
            });
        });
    }*/
}

export default CartDAO;
