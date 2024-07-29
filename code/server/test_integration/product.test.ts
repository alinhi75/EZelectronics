import { describe, test, expect, beforeEach, afterAll, jest, afterEach, beforeAll } from "@jest/globals"

import { initializeTestDatabase } from "./integrationSetup"
import { tearDownTestDatabase } from "./integrationTeardown"
import request from 'supertest'
import { app } from "../index"
import { testUserLogin, authCookie } from "./authHelper"
import ProductDAO from "../src/dao/productDAO"
import { ArrivalDateInFutureError, Utility } from "../src/utilities"
import exp from "constants"
import { Category } from "../src/components/product"


const routePath = "/ezelectronics" //Base route path for the API

/**
 * A TEST DATABASE IS CREATED WITH THE FOLLOWING PRODUCTS
 * ID  /     MODEL         /     CATEGORY   /   ARRIVAL DATE /  SELLINGPRICE  /  QUANTITY / DETAILS
    1,    iPhone 13,          Smartphone,       2024-01-01,        900,          10,       The iPhone 12 details.
    2,    Lenovo ThinkPad,    Laptop,           2024-01-01,       1000,          50,       The Lenovo ThinkPad details.
    3,    MacBook Pro,        Laptop,           2024-01-01,       2000,          20,       The MacBook Pro details.
    4,    Washing Machine,    Appliance,        2024-01-01,       500,           30,       The Washing Machine details.
    5,    Fridge,             Appliance,        2024-01-01,       400,           40,       The Fridge details.
    6,    iPhone 1000,        Smartphone,       2024-01-01,       1000,          0,        The iPhone 1000 details.
 */

const mockDate = '2024-02-02'

beforeAll(() => {
    // mock today's date
    jest.spyOn(Utility, "ensureDate").mockImplementation(async () => mockDate);
}
);

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});


beforeEach(async () => {
    await initializeTestDatabase();
    jest.clearAllMocks()
});

afterAll(async () => {
    // delete the test database
    await tearDownTestDatabase();
    jest.restoreAllMocks()
});

describe("Product API routes", () => {

    describe("POST /ezelectronics/products", () => {


        test("It should return a 200 success code and add the set of products", async () => {

            const productsBefore = await new ProductDAO().filterProducts()
            const productBeforeCount = productsBefore.length
            expect(productBeforeCount).toBe(6)

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    model: "iPhone 14",
                    category: "Smartphone",
                    quantity: 5,
                    details: "",
                    sellingPrice: 200,
                    arrivalDate: "2024-01-01"
                })
                .expect(200)

            // check that the product was added
            const productsAfter = await new ProductDAO().filterProducts()
            const productAfterCount = productsAfter.length
            expect(productAfterCount).toBe(productBeforeCount + 1)
            expect(productsAfter.map((product: any) => product.model)).toContain("iPhone 14")

        })

        test("It should return a 401 unauthorized code when the user is not logged in", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .send({
                    score: 5,
                    comment: "Great product!"
                })
                .expect(401)
        })

        test("It should return a 401 code when the user is not an admin or manager", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .send({
                    score: 5,
                    comment: "Great product!"
                })
                .expect(401)
        })

        test("It should return a 422 code when the request body is invalid", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    model: "",
                    category: "Smartphone",
                    quantity: 5,
                    details: "",
                    sellingPrice: 200,
                    arrivalDate: "2024-01-01"

                })
                .expect(422)
        })

        test("It should return a 409 code when the model already exists", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    model: "iPhone 13",
                    category: "Smartphone",
                    quantity: 5,
                    details: "",
                    sellingPrice: 200,
                    arrivalDate: "2024-01-01"
                })
                .expect(409)
        });

        test("It should return a 400 code when the arrival date is after the current date", async () => {
            jest.spyOn(Utility, 'ensureDateIsNotInFuture').mockImplementation(async () => {
                throw new ArrivalDateInFutureError();
            });
            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    model: "iPhone 14",
                    category: "Smartphone",
                    quantity: 5,
                    details: "",
                    sellingPrice: 200,
                    arrivalDate: "2025-01-01"
                })
                .expect(400)
        });
    })

    describe("PATCH /ezelectronics/products/:model", () => {
        test("It should return a 200 success code and increase the quantity of the product", async () => {
            const productsBefore = await new ProductDAO().filterProducts()
            const productBefore = productsBefore.find((product: any) => product.model === "iPhone 13")
            expect(productBefore.quantity).toBe(10)

            await request(app)
                .patch(`${routePath}/products/iPhone 13`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    quantity: 3
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.quantity).toBe(13)
                });

            // check that the product quantity was increased
            const productsAfter = await new ProductDAO().filterProducts()
            const productAfter = productsAfter.find((product: any) => product.model === "iPhone 13")
            expect(productAfter.quantity).toBe(13)
        })

        test("It should return a 401 unauthorized code when the user is not logged in", async () => {
            await request(app)
                .patch(`${routePath}/products/iPhone13`)
                .send({
                    quantity: 3
                })
                .expect(401)
        })

        test("It should return a 401 code when the user is not an admin or manager", async () => {
            await request(app)
                .patch(`${routePath}/products/iPhone13`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .send({
                    quantity: 3
                })
                .expect(401)
        })

        test("It should return a 422 code when the request body is invalid", async () => {
            await request(app)
                .patch(`${routePath}/products/iPhone13`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    quantity: -3
                })
                .expect(422)
        })

        test("It should return a 404 code when the model does not exist", async () => {
            await request(app)
                .patch(`${routePath}/products/iPhone14`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    quantity: 3
                })
                .expect(404)
        });

        test("It should return a 400 code when the change date is before the arrival", async () => {
            jest.spyOn(Utility, "ensureDate").mockImplementation(async () => "2020-01-01");
            await request(app)
                .patch(`${routePath}/products/iPhone 13`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    quantity: 3,
                    changeDate: "2023-01-01"
                })
                .expect(400)
        });


        describe("PATCH /ezelectronics/products/:model/sell", () => {
            test("It should return a 200 success code and decrease the quantity of the product", async () => {
                const productsBefore = await new ProductDAO().filterProducts()
                const productBefore = productsBefore.find((product: any) => product.model === "iPhone 13")
                expect(productBefore.quantity).toBe(10)

                await request(app)
                    .patch(`${routePath}/products/iPhone 13/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: 3,
                        sellingDate: "2024-01-02"
                    })
                    .expect(200)
                    .then((response) => {
                        expect(response.body.quantity).toBe(7)
                    });

                // check that the product quantity was decreased
                const productsAfter = await new ProductDAO().filterProducts()
                const productAfter = productsAfter.find((product: any) => product.model === "iPhone 13")
                expect(productAfter.quantity).toBe(7)
            })

            test("It should return a 401 unauthorized code when the user is not logged in", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone13/sell`)
                    .send({
                        quantity: 3,
                        sellingDate: "2024-01-02"
                    })
                    .expect(401)
            })

            test("It should return a 401 code when the user is not an admin or manager", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone13/sell`)
                    .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                    .send({
                        quantity: 3,
                        sellingDate: "2024-01-02"
                    })
                    .expect(401)
            })

            test("It should return a 422 code when the request body is invalid", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone13/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: -3,
                        sellingDate: "2024-01-02"
                    })
                    .expect(422)
            })

            test("It should return a 404 code when the model does not exist", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone14/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: 3,
                        sellingDate: "2024-01-02"
                    })
                    .expect(404)
            });

            test("It should return a 400 code when the selling date is before the arrival", async () => {
                jest.spyOn(Utility, "ensureDate").mockImplementation(async () => "2020-01-01");
                await request(app)
                    .patch(`${routePath}/products/iPhone 13/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: 3,
                        sellingDate: "2023-01-01"
                    })
                    .expect(400)
            });

            test("It should return a 409 code when the quantity is greater than the available quantity", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone 13/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: 11,
                        sellingDate: "2024-01-02"
                    })
                    .expect(409)
            });

            test("It should return a 409 code when the quantity available is 0", async () => {
                await request(app)
                    .patch(`${routePath}/products/iPhone 1000/sell`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .send({
                        quantity: 1,
                        sellingDate: "2024-01-02"
                    })
                    .expect(409)
            });


        });

    });


    describe("GET /ezelectronics/products", () => {
        test("It should return a 200 success code and return all products", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(6)
                });
        })

        test("It should return a 200 success code grouping by category", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "category", category: Category.SMARTPHONE })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(2)
                    for (let product of response.body) {
                        expect(product.category).toBe(Category.SMARTPHONE)
                    }
                });
        });


        test("It should return a 200 success code grouping by model", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 13" })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(1)
                    expect(response.body[0].model).toBe("iPhone 13")
                });
        });


        // test missing query params
        type QueryParams = { grouping: string | null, category: string | null, model: string | null }
        test.each<[QueryParams]>([
            [{ grouping: null, category: Category.SMARTPHONE, model: null }],
            [{ grouping: "category", category: null, model: null }],
            [{ grouping: "category", category: Category.SMARTPHONE, model: "iPhone 13" }],
            [{ grouping: "model", category: null, model: null }],
            [{ grouping: "model", category: Category.SMARTPHONE, model: "iPhone 13" }],
        ])("It should return a 422 when the request body is invalid", async (queryParams) => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query(queryParams)
                .expect(422)
        });


        test("It should return a 404 code when the model does not exist, grouping by model", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 14" })
                .expect(404)
        });

        test("It should return a 401 unauthorized code when the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .expect(401)
        })

        test("It should return a 401 code when the user is not an admin or manager", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

        test("It should return a 422 code when the request body is invalid", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "category", model: "iPhone 13" })
                .expect(422)
        })

        test("It should return a 200 success code and return all products with a specific category", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "category", category: "Smartphone" })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(2)
                });
        })

        test("It should return a 200 success code and return the product with a specific model", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 13" })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(1)
                    expect(response.body[0].model).toBe("iPhone 13")
                });
        })

        test("It should return a 404 code when the model does not exist", async () => {
            await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 14" })
                .expect(404)
        });

    });

    describe("GET /ezelectronics/products/available", () => {
        test("It should return a 200 success code and return all available products", async () => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(5)
                });
        })

        test("It should return a 200 success code grouping by category", async () => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "category", category: Category.SMARTPHONE })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(1)
                    for (let product of response.body) {
                        expect(product.category).toBe(Category.SMARTPHONE)
                    }
                });


        });

        test("It should return a 200 success code grouping by model", async () => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 13" })
                .expect(200)
                .then((response) => {
                    expect(response.body.length).toBe(1)
                    expect(response.body[0].model).toBe("iPhone 13")
                });
        });

        test("It should return a 422 when the request body is invalid", async () => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "category", model: "iPhone 13" })
                .expect(422)
        });

        test("It should return a 404 code when the model does not exist", async () => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query({ grouping: "model", model: "iPhone 14" })
                .expect(404)
        });

        type QueryParams = { grouping: string | null, category: string | null, model: string | null }
        test.each<[QueryParams]>([
            [{ grouping: null, category: Category.SMARTPHONE, model: null }],
            [{ grouping: "category", category: null, model: null }],
            [{ grouping: "category", category: Category.SMARTPHONE, model: "iPhone 13" }],
            [{ grouping: "model", category: null, model: null }],
            [{ grouping: "model", category: Category.SMARTPHONE, model: "iPhone 13" }],
        ])("It should return a 422 when the request body is invalid", async (queryParams) => {
            await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .query(queryParams)
                .expect(422)
        });

        describe("DELETE /ezelectronics/products/:model", () => {
            test("It should return a 200 success code and delete the product", async () => {
                const productsBefore = await new ProductDAO().filterProducts()
                const productBefore = productsBefore.find((product: any) => product.model === "iPhone 13")
                expect(productBefore).toBeDefined()

                await request(app)
                    .delete(`${routePath}/products/iPhone 13`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .expect(200)

                // check that the product was deleted
                const productsAfter = await new ProductDAO().filterProducts()
                const productAfter = productsAfter.find((product: any) => product.model === "iPhone 13")
                expect(productAfter).toBeUndefined()
            })

            test("It should return a 401 unauthorized code when the user is not logged in", async () => {
                await request(app)
                    .delete(`${routePath}/products/iPhone13`)
                    .expect(401)
            })

            test("It should return a 401 code when the user is not an admin or manager", async () => {
                await request(app)
                    .delete(`${routePath}/products/iPhone13`)
                    .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                    .expect(401)
            })

            test("It should return a 404 code when the model does not exist", async () => {
                await request(app)
                    .delete(`${routePath}/products/iPhone 14`)
                    .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                    .expect(404)
            });

        });


    })

    describe("DELETE /ezelectronics/products", () => {
        test("It should return a 200 success code and delete all products", async () => {
            const productsBefore = await new ProductDAO().filterProducts()
            const productBeforeCount = productsBefore.length
            expect(productBeforeCount).toBe(6)

            await request(app)
                .delete(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)

            // check that the products were deleted
            const productsAfter = await new ProductDAO().filterProducts()
            const productAfterCount = productsAfter.length
            expect(productAfterCount).toBe(0)
        })

        test("It should return a 401 unauthorized code when the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/products`)
                .expect(401)
        })

        test("It should return a 401 code when the user is not an admin or manager", async () => {
            await request(app)
                .delete(`${routePath}/products`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

    });


});