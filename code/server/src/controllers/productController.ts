import { DateError } from "../utilities";
import { Product } from "../components/product";
import ProductDAO from "../dao/productDAO";
import {ProductNotFoundError, LowProductStockError,EmptyProductStockError, ProductAlreadyExistsError} from "../errors/productError"
import {UnauthorizedUserError} from "../errors/userError"
const dayjs = require('dayjs')
/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {

    private dao: ProductDAO


    constructor() {
        this.dao = new ProductDAO
    }

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @param arrivalDate The optional date in which the product arrived.
     * @returns A Promise that resolves to nothing.
     */
    async registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null):Promise<void> { 
        // Check if the product model already exists
        const existingProduct = await this.dao.getProductByModel(model);
        if (existingProduct) {
            throw new ProductAlreadyExistsError();
        }

        if(arrivalDate > dayjs().format('YYYY-MM-DD'))
            throw new DateError();
    
        await this.dao.registerProducts(model, category, arrivalDate, sellingPrice, details, quantity);
    }

    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @param changeDate The optional date in which the change occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async changeProductQuantity(model: string, newQuantity: number, changeDate: string | null):Promise<number> { 
            const product = await this.dao.getProductByModel(model);
            console.log(model, product);
            if (!product)
                throw new ProductNotFoundError();

            if(changeDate < product.arrivalDate)
                throw new DateError();
    
            const updatedQuantity = product.quantity + newQuantity;
            await this.dao.changeProductQuantity(model, updatedQuantity);
            return updatedQuantity;
    }

    /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell
     * @param quantity The number of product units that were sold.
     * @param sellingDate The optional date in which the sale occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async sellProduct(model: string, quantity: number, sellingDate: string | null):Promise<number> {

            const product = await this.dao.getProductByModel(model);
            if (!product) {
                throw new ProductNotFoundError();
            }

            const existingProduct = product;
            
            if (sellingDate < existingProduct.arrivalDate)
                throw new DateError();

            if (existingProduct.quantity === 0) {
                throw new EmptyProductStockError();
            }

            if (existingProduct.quantity < quantity) {
                throw new LowProductStockError();
            }

            const updatedQuantity = existingProduct.quantity - quantity;
            await this.dao.changeProductQuantity(model, updatedQuantity);
            return updatedQuantity;
    }
     

    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */

    async getProducts(grouping: string | null, category: string | null, model: string | null):Promise<Product[]>  {
        console.log(grouping, category, model);
        if(grouping == 'model')
            return [await this.dao.getProductByModel(model)];
        else if(grouping == 'category')
            return await this.dao.getProductsByCategory(category);
        else

        return await this.dao.getAllProducts();
    }

    /**
     * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getAvailableProducts(grouping: string | null, category: string | null, model: string | null) /**:Promise<Product[]> */ { 
        if(grouping == 'model')
            return await this.dao.getAvailableProductsByModel(model);
        else if(grouping == 'category')
            return await this.dao.getAvailableProductsByCategory(category);
        else

        return await this.dao.getAvailableProducts();
        
    }
    

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts():Promise <Boolean> { 
            return await this.dao.deleteAllProducts();
    }


    /**
     * Deletes one product, identified by its model
     * @param model The model of the product to delete
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    async deleteProduct(model: string):Promise <Boolean> { 
        const product = await this.dao.getProductByModel(model);
        if (!product) {
            throw new ProductNotFoundError();
        }
        return await this.dao.deleteProduct(model);
    }

}

export default ProductController;
