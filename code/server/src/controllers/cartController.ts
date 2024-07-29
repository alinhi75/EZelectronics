import { CartNotFoundError, EmptyCartError, ProductInCartError, ProductNotInCartError } from "../errors/cartError";
import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import { Cart } from "../components/cart";
import { EmptyProductStockError, ProductNotFoundError } from "../errors/productError";
import ProductDAO from "../dao/productDAO";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private dao: CartDAO
    private productDao: ProductDAO

    constructor() {
        this.dao = new CartDAO;
        this.productDao = new ProductDAO;
    }

    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param productId - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */
    async addToCart(user: User, product: string): Promise<boolean> {
        const productAvailable = await this.dao.checkProduct(product);
        if(productAvailable < 0)
            throw new ProductNotFoundError();
        if(productAvailable === 0)
            throw new EmptyProductStockError();

        return await this.dao.addToCart(user.username, product);
    }


    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    async getCart(user: User): Promise<Cart> {
        const cart = await this.dao.getCart(user.username);
        if (cart == null) {
            return new Cart(user.username, false, null, 0, []);
        }
        return cart;
    }

    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     * 
     */
    async checkoutCart(user: User): Promise<boolean> {
        const isCartEmpty = await this.dao.isCartEmpty(user.username);
        if(isCartEmpty)
            throw new EmptyCartError();
        const isOutOfStock = await this.dao.isOutOfStock(user.username);
        if(isOutOfStock)
            throw new EmptyProductStockError();
        const isQuantityHigherThanStock = await this.dao.isQuantityHigherThanStock(user.username);
        if(isQuantityHigherThanStock)
            throw new EmptyProductStockError();

        const productsInCart = await this.dao.getProductsInCart(user.username);
        const checkout = await this.dao.checkoutCart(user.username);
        if(checkout){
            productsInCart.forEach(async product => {
                await this.productDao.sellProduct(product.model, product.quantity);
            });
        }
        return checkout;
    }

    /**
     * Retrieves all paid carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        return await this.dao.getCustomerCarts(user.username);
    }
    /**
     * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
     * @param user The user who owns the cart.
     * @param product The model of the product to remove.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeProductFromCart(user: User, product: string): Promise<boolean> {
        return await this.dao.removeProductFromCart(user.username, product);
    }

    /**
     * Removes all products from the current cart.
     * @param user - The user who owns the cart.
     * @returns A Promise that resolves to `true` if the cart was successfully cleared.
     */
    async clearCart(user: User): Promise<boolean> {
        return await this.dao.clearCart(user.username);
    }

    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts(): Promise<boolean> {
        return await this.dao.deleteAllCarts();
    }

    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts(): Promise<Cart[]> {
        return await this.dao.getAllCarts();
    }
}

export default CartController