import { describe, test, expect, beforeAll, afterAll, jest, afterEach, beforeEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { initializeTestDatabase } from "./integrationSetup"
import { tearDownTestDatabase } from "./integrationTeardown"
import UserDAO from "../src/dao/userDAO"
import UserController from "../src/controllers/userController"
import { Utility } from "../src/utilities"
import { testUserLogin, authCookie } from "./authHelper"



const routePath = "/ezelectronics" //Base route path for the API

// test("1", () => {
//     expect(1).toBe(1)
// })


afterEach(() => {
    jest.clearAllMocks();
});


beforeEach(async () => {
    await initializeTestDatabase();
    jest.clearAllMocks()
});

afterAll(async () => {
    // delete the test database
    await tearDownTestDatabase();
});

describe("User API routes", () => {
    describe("POST /ezelectronics/users", () => {
        test("It should return a 200 success code and create a new user", async () => {

            // take the count of users in the mock database before creating a new user
            // (pretend DAO is working and should not be tested here, we are testing the API routes here)
            const defaultUsersInTestDbCount = (await new UserDAO().getUsers()).length

            await request(app)
                .post(`${routePath}/users`)
                .send({
                    username: "test",
                    name: "test",
                    surname: "test",
                    password: "test",
                    role: "Customer"
                })
                .expect(200)

            // check that user was created
            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)

            // check that the count of users in the mock database has increased by one
            expect(users.body).toHaveLength(defaultUsersInTestDbCount + 1)
        })

        //Tests for error conditions can be added in separate 'test' blocks.
        //We can group together tests for the same condition, no need to create a test for each body parameter, for example
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "", name: "test", surname: "test", password: "test", role: "Customer" }) //We send a request with an empty username. The express-validator checks will catch this and return a 422 error code
                .expect(422)
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "", surname: "test", password: "test", role: "Customer" }).expect(422) //We can repeat the call for the remaining body parameters
        })

        test("It should return 409 if the username already exists", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send({
                    username: "admin1",
                    name: "test",
                    surname: "test",
                    password: "test",
                    role: "Customer"
                })
                .expect(409)
        });
    })


    describe("GET /ezelectronics/users", () => {
        test("It should return a 200 success code and all users", async () => {
            await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveLength(9) //There are 9 users in the test database
                })
        })

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/users`)
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin", async () => {
            await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })


        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "getUsers").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(503)

        });
    });



    describe("GET /ezelectronics/users/roles/:role", () => {

        test("It should return a 200 success code and all users of a specific role", async () => {
            await request(app)
                .get(`${routePath}/users/roles/Customer`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveLength(3) //There are 3 users with the role "Customer" in the test database
                })
        })

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/users/roles/Customer`)
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin", async () => {
            await request(app)
                .get(`${routePath}/users/roles/Customer`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

        test("It should return a 422 if role is not one of existing", async () => {
            await request(app)
                .get(`${routePath}/users/roles/FAKE_ROLE`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(422)
        })

        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "getUsersByRole").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .get(`${routePath}/users/roles/Customer`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(503)

        });
    });



    describe("GET /ezelectronics/users/:username", () => {

        test("It should return a 200 success code and the user with the specified username", async () => {
            await request(app)
                .get(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(200)
                .then((response) => {
                    expect(response.body.username).toBe("customer1")
                })
        })

        test("It should return a 200 success code admin can retrieve anyone", async () => {
            await request(app)
                .get(`${routePath}/users/manager1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)
                .then((response) => {
                    expect(response.body.username).toBe("manager1")
                })
        })

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/users/admin1`)
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin and is retrieving someone else", async () => {
            await request(app)
                .get(`${routePath}/users/manager1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

        test("it should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .get(`${routePath}/users/FAKE_USER`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(404)
        })

        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "getUserByUsername").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .get(`${routePath}/users/admin1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(503)

        });
    });


    describe("DELETE /ezelectronics/users/:username", () => {

        test("It should return a 200 success code and delete the user with the specified username", async () => {
            await request(app)
                .delete(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(200)

            // check that user was deleted
            const users = await (new UserDAO().getUsers())

            // check that the count of users in the mock database has decreased by one
            expect(users).toHaveLength(8) //There are 9 users in the test database
        })

        test("It should return a 200 success code and delete the user with the specified username if the user is an admin", async () => {
            await request(app)
                .delete(`${routePath}/users/manager1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)

            // check that user was deleted
            const users = await (new UserDAO().getUsers())

            // check that the count of users in the mock database has decreased by one
            expect(users).toHaveLength(8) //There are 9 users in the test database
        });

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/users/customer1`)
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin and is deleting someone else", async () => {
            await request(app)
                .delete(`${routePath}/users/manager1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

        test("It should return a 401 error code if the user is an admin and is deleting another admin", async () => {
            await request(app)
                .delete(`${routePath}/users/admin2`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(401)
        })

        test("it should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .delete(`${routePath}/users/FAKE_USER`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(404)
        })

        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "deleteUser").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .delete(`${routePath}/users/admin1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(503)

        });
    });


    describe("DELETE /ezelectronics/users", () => {

        test("It should return a 200 success code, admin can delete all users, but admin", async () => {
            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(200)

            // check that all users were deleted
            const users = await (new UserDAO().getUsers())

            // check that the count of users in the mock database is 0
            expect(users).toHaveLength(3) //There are 9 users in the test database

            for (let i = 0; i < users.length; i++) {
                expect(users[i].role).toBe("Admin")
            }
        });

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/users`)
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin (customer)", async () => {
            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin (manager)", async () => {
            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("manager1", "manager1")))
                .expect(401)
        })

        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "deleteAll").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .expect(503)

        });
    });

    describe("PATCH /ezelectronics/users/:username", () => {
        test("It should return a 200 success code and update the user with the specified username", async () => {
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(200)

            // check that user was updated
            const user = await (new UserDAO().getUserByUsername("customer1"))

            // check that the user in the mock database has been updated
            expect(user.name).toBe("newName")
            expect(user.surname).toBe("newSurname")
            expect(user.address).toBe("newAddress")
            expect(user.birthdate).toBe("2000-01-01")
        })

        test("It should return a 200 success code and update the user with the specified username if the user is an admin", async () => {
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(200)

            // check that user was updated
            const user = await (new UserDAO().getUserByUsername("customer1"))

            // check that the user in the mock database has been updated
            expect(user.name).toBe("newName")
            expect(user.surname).toBe("newSurname")
            expect(user.address).toBe("newAddress")
            expect(user.birthdate).toBe("2000-01-01")
        });

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(401)
        })

        test("It should return a 401 error code if the user is not an admin and is updating someone else", async () => {
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer2", "customer2")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(401)
        })

        test("It should return a 401 error code if the user is an admin and is updating another admin", async () => {
            await request(app)
                .patch(`${routePath}/users/admin2`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "admin2"
                })
                .expect(401)
        })

        test("it should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .patch(`${routePath}/users/FAKE_USER`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "FAKE_USER"
                })
                .expect(404)
        })

        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1"))
                )
                .send({
                    name: "",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(422)
        });


        test("It should return a 400 error code if birthdate is in the future", async () => {
            // mock today's date
            const mockDate = '2021-01-01'
            jest.spyOn(Utility, "ensureDate").mockImplementation(async () => mockDate);
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1"))
                )
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2021-01-02",
                    username: "customer1"
                })
                .then((response) => {
                    console.log(response.body)
                    expect(response.status).toBe(400)
                })
        });


        test("It is not possible to change username and role", async () => {
            await request(app)
                .patch(`${routePath}/users/admin1`)
                .set("Cookie", authCookie(await testUserLogin("admin1", "admin1"))
                )
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "newUsername",
                    role: "Manager"
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.username).toBe("admin1")
                    expect(response.body.role).toBe("Admin")
                })

            // check that user was updated
            const user = await (new UserDAO().getUserByUsername("admin1"))
            expect(user.username).toBe("admin1")
            expect(user.role).toBe("Admin")
        });

        test("It should return a 503 error if controller throws an error", async () => {
            // force the controller to throw an error
            jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation(() => {
                throw new Error("Test error")
            });
            await request(app)
                .patch(`${routePath}/users/customer1`)
                .set("Cookie", authCookie(await testUserLogin("customer1", "customer1")))
                .send({
                    name: "newName",
                    surname: "newSurname",
                    address: "newAddress",
                    birthdate: "2000-01-01",
                    username: "customer1"
                })
                .expect(503)

        });
    });

});


describe("Auth API routes", () => {

    describe("POST /ezelectronics/sessions", () => {
        test("It should return a 200 success code and create a new session", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({ username: "customer1", password: "customer1" })
                .expect(200)
        })

        test("It should return a 401 error code if the password is incorrect", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({ username: "customer1", password: "wrongPassword" })
                .expect(401)
        })

        test("It should return a 401 error code if the username is incorrect", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({ username: "wrongUsername", password: "customer1" })
                .expect(401)
        })

    });

    describe("DELETE /ezelectronics/sessions/current", () => {
        test("It should return a 200 success code and delete the session", async () => {
            const res = await testUserLogin("customer1", "customer1")
            await request(app)
                .delete(`${routePath}/sessions/current`)
                .set("Cookie", authCookie(res))
                .expect(200)
        })

        test("It should return a 404 error code if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/sessions`)
                .expect(404)
        })
    });

    describe("GET /ezelectronics/sessions/current", () => {
        test("It should return a 200 success code and retrieve the current session", async () => {
            const res = await testUserLogin("customer1", "customer1")
            await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", authCookie(res))
                .expect(200)
                .then((response) => {
                    expect(response.body.username).toBe("customer1")
                })
        })

        test("It should return a 200 code if the user is not logged in but empty body", async () => {
            await request(app)
                .get(`${routePath}/sessions/current`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toBeFalsy()
                })
        })
    });

});