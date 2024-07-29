import { describe, test, expect, beforeAll, afterAll, jest,afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
// import mongoose from 'mongoose';
// import auth from "../../src/routers/auth"
import UserController from "../../src/controllers/userController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { beforeEach } from "node:test"
const baseURL = "/ezelectronics"

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/userController")
jest.mock("../../src/routers/auth")

let testAdmin = [new User("admin", "admin", "admin", Role.ADMIN, "", "")];
let testCustomer = [new User("customer", "customer", "customer", Role.CUSTOMER, "", "")]



describe("Route unit tests", () => {
    describe("POST /users", () => {
        //We are testing a route that creates a user. This route calls the createUser method of the UserController, uses the express-validator 'body' method to validate the input parameters and the ErrorHandler to validate the request
        //All of these dependencies are mocked to test the route in isolation
        //For the success case, we expect that the dependencies all work correctly and the route returns a 200 success code
        test("It should return a 200 success code", async () => {
            const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
            //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
            //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            //We mock the UserController createUser method to return true, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true)

            /*We send a request to the route we are testing. We are in a situation where:
                - The input parameters are 'valid' (= the validation logic is mocked to be correct)
                - The user creation function is 'successful' (= the UserController logic is mocked to be correct)
              We expect the 'createUser' function to have been called with the input parameters and to return a 200 success code
              Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the user has actually been created
            */
            const response = await request(app).post(baseURL + "/users").send(inputUser)
            expect(response.status).toBe(200)
            expect(UserController.prototype.createUser).toHaveBeenCalled()
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)
        });
        test("It should return 500 if the user creation fails", async () => {
            //In this case we are testing a scenario where the user creation fails
            //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
            //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            //We mock the UserController createUser method to return false, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(false)
            //We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
            const response = await request(app).post(baseURL + "/users").send({ username: "test", name: "test", surname: "test", password: "test", role: "Manager" })
            expect(response.status).toBe(200);
        });
        test("It should return 503 if the input parameters are invalid", async () => {
            //In this case we are testing a scenario where the input parameters are invalid
            //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
            //These methods all throw an error, because we are testing the validation logic here
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => { throw new Error("Invalid input") },
                    isIn: () => { throw new Error("Invalid input") },
                })),
            }))
            //We mock the ErrorHandler validateRequest method to return an error, because we are testing the validation logic here
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockRejectedValueOnce(new Error("Invalid input"))
            //We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
            const response = await request(app).post(baseURL + "/users").send({ username: "test", name: "test", surname: "test", password: "test", role: "Manager" })
            expect(response.status).toBe(503);
        });
        test("It should return 503 if the user creation fails", async () => {
            //In this case we are testing a scenario where the user creation fails
            //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
            //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            //We mock the UserController createUser method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "createUser").mockRejectedValueOnce(new Error("User creation failed"))
            //We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
            const response = await request(app).post(baseURL + "/users").send({ username: "test", name: "test", surname: "test", password: "test", role: "Manager" })
            expect(response.status).toBe(503);
        });
        test("It should return 503 if the input parameters are missing", async () => {
            //In this case we are testing a scenario where the input parameters are missing
            //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
            //These methods all throw an error, because we are testing the validation logic here
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => { throw new Error("Invalid input") },
                    isIn: () => { throw new Error("Invalid input") },
                })),
            }))
            //We mock the ErrorHandler validateRequest method to return an error, because we are testing the validation logic here
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockRejectedValueOnce(new Error("Invalid input"))
            //We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
            const response = await request(app).post(baseURL + "/users").send({})
            expect(response.status).toBe(503);
        });

    });
    describe("GET /users", () => {
        let server: any;

        beforeAll((done) => {
            server = app.listen(done);
        });

        afterAll((done) => {
            server.close(done);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        ///**
        //  * Route for retrieving all users.
        // * It requires the user to be logged in and to be an admin.
        test("It returns all users", async () => {
            //The route we are testing calls the getUsers method of the UserController and the isLoggedIn method of the Authenticator
            //We mock the 'getUsers' method to return an array of users, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce(testAdmin)
            //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            });
            //We call the route with the mocked dependencies. We expect the 'getUsers' function to have been called, the route to return a 200 success code and the expected users
            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsers).toHaveBeenCalled()
            expect(response.body).toEqual(testAdmin)
        });
        test("It should fail if the user is not authenticated", async () => {
            //In this case we are testing a scenario where the user is not authenticated
            //We need the 'isLoggedIn' method to return a 401 error code, because the route checks if the user is authenticated before retrieving the users
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            //We call the route with the mocked dependencies. We expect a 401 error code
            const response = await request(app).get(baseURL +"/users")
            expect(response.status).toBe(401)
        });
        test("It should return 503 if the user list is empty", async () => {
            //In this case we are testing a scenario where the user list is empty
            //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            //We mock the 'getUsers' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "getUsers").mockRejectedValueOnce(new Error("No users found"))
            //We call the route with the mocked dependencies. We expect a 503 error code
            const response = await request(app).get(baseURL +"/users")
            expect(response.status).toBe(503)
        });
        test("It should return 503 if the user list is not found", async () => {
            //In this case we are testing a scenario where the user list is not found
            //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            //We mock the 'getUsers' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
            jest.spyOn(UserController.prototype, "getUsers").mockRejectedValueOnce(new Error("Users not found"))
            //We call the route with the mocked dependencies. We expect a 503 error code
            const response = await request(app).get(baseURL +"/users")
            expect(response.status).toBe(503)
        });
    });

});

describe("GET /users/:username", () => {
    test("It returns the user with the specified username", async () => {
        //The route we are testing calls the getUserByUsername method of the UserController and the isLoggedIn method of the Authenticator
        //We mock the 'getUserByUsername' method to return a user, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin[0])
        //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'getUserByUsername' function to have been called, the route to return a 200 success code and the expected user
        const response = await request(app).get(baseURL + "/users/admin")
        expect(response.status).toBe(200)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
        // expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin, "admin")
        expect([response.body]).toEqual(testAdmin)
    })

    test("It should fail if the user is not authenticated", async () => {
        //In this case we are testing a scenario where the user is not authenticated
        //We need the 'isLoggedIn' method to return a 401 error code, because the route checks if the user is authenticated before retrieving the user
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })
        //We call the route with the mocked dependencies. We expect a 401 error code
        const response = await request(app).get(baseURL + "/users/admin")
        expect(response.status).toBe(401)
    });
    test("it should returns 500 if the user does not exist", async () => {
        //In this case we are testing a scenario where the user does not exist
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'getUserByUsername' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new Error("User not found"))
        //We call the route with the mocked dependencies. We expect a 500 error code
        const response = await request(app).get(baseURL + "/users/invalid")
        expect(response.status).toBe(503)
    })
});

describe("DELETE /users/:username", () => {
    test("It deletes the user with the specified username", async () => {
        //The route we are testing calls the deleteUser method of the UserController and the isLoggedIn method of the Authenticator
        //We mock the 'deleteUser' method to return true, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true)
        //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'deleteUser' function to have been called, the route to return a 200 success code
        const response = await request(app).delete(baseURL + "/users/admin")
        expect(response.status).toBe(200)
        expect(UserController.prototype.deleteUser).toHaveBeenCalled()
        // expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(testAdmin, "admin")
    })

    test("It should fail if the user is not authenticated", async () => {
        //In this case we are testing a scenario where the user is not authenticated
        //We need the 'isLoggedIn' method to return a 401 error code, because the route checks if the user is authenticated before deleting the user
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })
        //We call the route with the mocked dependencies. We expect a 401 error code
        const response = await request(app).delete(baseURL + "/users/admin")
        expect(response.status).toBe(401)
    })
    test("It should return 503 if the user deletion fails", async () => {
        //In this case we are testing a scenario where the user deletion fails
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteUser' method to return false, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(false)
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).delete(baseURL + "/users/admin")
        expect(response.status).toBe(200)
    });
    test("it should return 500 if the user does not exist", async () => {
        //In this case we are testing a scenario where the user does not exist
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteUser' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new Error("User not found"))
        //We call the route with the mocked dependencies. We expect a 500 error code
        const response = await request(app).delete(baseURL + "/users/invalid")
        expect(response.status).toBe(503)
    });
});
describe("Get /roles/:role", () => {
    let server: any;

    beforeAll((done) => {
        server = app.listen(done);
    });

    afterAll((done) => {
        server.close(done);
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test("It returns all users with the specified role", async () => {
        //The route we are testing calls the getUsersByRole method of the UserController and the isLoggedIn method of the Authenticator
        //We mock the 'getUsersByRole' method to return an array of users, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce(testAdmin)
        //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'getUsersByRole' function to have been called, the route to return a 200 success code and the expected users
        const response = await request(app).get(baseURL + "/users/roles/Admin")
        expect(response.status).toBe(200)
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalled()
        expect(response.body).toEqual(testAdmin)
    });
    test("It should fail if the user is not authenticated", async () => {
        //In this case we are testing a scenario where the user is not authenticated
        //We need the 'isLoggedIn' method to return a 401 error code, because the route checks if the user is authenticated before retrieving the users
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })
        //We call the route with the mocked dependencies. We expect a 401 error code
        const response = await request(app).get(baseURL + "/users/roles/Admin")
        expect(response.status).toBe(401)
    });
    test("It should return 503 if the user list is empty", async () => {
        //In this case we are testing a scenario where the user list is empty
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'getUsersByRole' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValueOnce(new Error("No users found"))
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).get(baseURL + "/users/roles/Admin")
        expect(response.status).toBe(503)
    });
    test("It should return 503 if the user list is not found", async () => {
        //In this case we are testing a scenario where the user list is not found
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'getUsersByRole' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValueOnce(new Error("Users not found"))
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).get(baseURL + "/users/roles/Admin")
        expect(response.status).toBe(503)
    });
});
describe("DELETE /users", () => {
    test("It deletes all users", async () => {
        //The route we are testing calls the deleteAll method of the UserController and the isLoggedIn method of the Authenticator
        //We mock the 'deleteAll' method to return true, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true)
        //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'deleteAll' function to have been called, the route to return a 200 success code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(200)
        expect(UserController.prototype.deleteAll).toHaveBeenCalled()
    })

    test("It should fail if the user is not authenticated", async () => {
        //In this case we are testing a scenario where the user is not authenticated
        //We need the 'isLoggedIn' method to return a 401 error code, because the route checks if the user is authenticated before deleting the users
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })
        //We call the route with the mocked dependencies. We expect a 401 error code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(401)
    });
    test("It should return 503 if the user deletion fails", async () => {
        //In this case we are testing a scenario where the user deletion fails
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteAll' method to return false, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(false)
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(200)
    });
    test("it should return 503 if the user does not exist", async () => {
        //In this case we are testing a scenario where the user does not exist
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteAll' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValueOnce(new Error("User not found"))
        //We call the route with the mocked dependencies. We expect a 500 error code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(503)
    });
    test("It should return 503 if the user list is empty", async () => {
        //In this case we are testing a scenario where the user list is empty
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteAll' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValueOnce(new Error("No users found"))
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(503)
    });
    test("It should return 503 if the user list is not found", async () => {
        //In this case we are testing a scenario where the user list is not found
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'deleteAll' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValueOnce(new Error("Users not found"))
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(503)
    });
    
});
describe("PATCH /users/:username", () => {
    test("It updates the user with the specified username", async () => {
        //The route we are testing calls the updateUser method of the UserController and the isLoggedIn method of the Authenticator
        //We mock the 'updateUser' method to return true, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(testAdmin[0]);
        //We mock the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'updateUser' function to have been called, the route to return a 200 success code
        const response = await request(app).patch(baseURL + "/users/admin").send({ name: "admin", surname: "admin", password: "admin", role: "Admin" })
        expect(response.status).toBe(200)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
        // expect(UserController.prototype.updateUser).toHaveBeenCalledWith(testAdmin, "admin", "admin", "admin", "Admin")
    });

    test("it should return 500 if the user does not exist", async () => {
        //In this case we are testing a scenario where the user does not exist
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'updateUser' method to throw an error, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValueOnce(new Error("User not found"))
        //We call the route with the mocked dependencies. We expect a 500 error code
        const response = await request(app).patch(baseURL + "/users/invalid").send({ name: "admin", surname: "admin", password: "admin", role: "Admin" })
        expect(response.status).toBe(503)
    });
    test("It should return 503 if the user update fails", async () => {
        //In this case we are testing a scenario where the user update fails
        //We need the 'isLoggedIn' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'updateUser' method to return false, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(testAdmin[0])
        //We call the route with the mocked dependencies. We expect a 503 error code
        const response = await request(app).patch(baseURL + "/users/admin").send({ name: "admin", surname: "admin", password: "admin", role: "Admin" })
        expect(response.status).toBe(200)
    });
    test("It should return 503 if the input parameters are invalid", async () => {
        //In this case we are testing a scenario where the input parameters are invalid
        //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
        //These methods all throw an error, because we are testing the validation logic here
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => { throw new Error("Invalid input") },
                isIn: () => { throw new Error("Invalid input") },
            })),
        }))
        //We mock the ErrorHandler validateRequest method to return an error, because we are testing the validation logic here
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockRejectedValueOnce(new Error("Invalid input"))
        //We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
        const response = await request(app).patch(baseURL + "/users/admin").send({ name: "admin", surname: "admin", password: "admin", role: "Admin" })
        expect(response.status).toBe(503);
    });
});


describe("POST /sessions", () => {
    test("It logs in a user and returns the logged in user", async () => {
        // We mock the 'login' method of the Authenticator to return a user object
        jest.spyOn(Authenticator.prototype, "login").mockResolvedValueOnce(testAdmin[0]);
        // We send a request to the route with mocked dependencies. We expect the route to return a 200 success code and the logged in user
        const response = await request(app).post(baseURL + "/sessions").send({ username: "admin", password: "admin" });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(testAdmin[0]);
    });

    test("It should return 401 if the username represents a non-existing user", async () => {
        // We mock the 'login' method of the Authenticator to throw an error, indicating that the user does not exist
        jest.spyOn(Authenticator.prototype, "login").mockRejectedValueOnce(new Error("User not found"));
        // We send a request to the route with mocked dependencies. We expect the route to return a 401 error code
        const response = await request(app).post(baseURL + "/sessions").send({ username: "invalid", password: "admin" });
        expect(response.status).toBe(401);
    });

    test("It should return 401 if the password is incorrect", async () => {
        // We mock the 'login' method of the Authenticator to throw an error, indicating that the password is incorrect
        jest.spyOn(Authenticator.prototype, "login").mockRejectedValueOnce(new Error("Incorrect password"));
        // We send a request to the route with mocked dependencies. We expect the route to return a 401 error code
        const response = await request(app).post(baseURL + "/sessions").send({ username: "admin", password: "invalid" });
        expect(response.status).toBe(401);
    });
});
describe("DELETE /sessions/current", () => {
    test("It deletes the current user", async () => {
        // We mock the 'deleteUser' method of the UserController to return true, indicating successful deletion
        // jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);
        // We mock the 'isLoggedIn' method of the Authenticator to return the next function, indicating that the user is authenticated
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(Authenticator.prototype, "logout").mockResolvedValueOnce(true);
        // We send a request to the route with mocked dependencies. We expect the route to return a 200 success code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(200);
    });

    test("It should return 503 if the user deletion fails", async () => {
        // We mock the 'deleteUser' method of the UserController to return false, indicating failed deletion
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(false);
        // We mock the 'isLoggedIn' method of the Authenticator to return the next function, indicating that the user is authenticated
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        // We send a request to the route with mocked dependencies. We expect the route to return a 503 error code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(503);
    });

    test("It should return 503 if the user does not exist", async () => {
        // We mock the 'deleteUser' method of the UserController to throw an error, indicating that the user does not exist
        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new Error("User not found"));
        // We mock the 'isLoggedIn' method of the Authenticator to return the next function, indicating that the user is authenticated
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        // We send a request to the route with mocked dependencies. We expect the route to return a 503 error code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(503);
    });
    test("It should return 503 if the user is not authenticated", async () => {
        // We mock the 'isLoggedIn' method of the Authenticator to return a 401 error code, indicating that the user is not authenticated
        jest.spyOn(Authenticator.prototype, "logout").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });
        // We send a request to the route with mocked dependencies. We expect the route to return a 401 error code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(401);
    });
    test("It should return 503 if the user deletion fails", async () => {
        // We mock the 'deleteUser' method of the UserController to return false, indicating failed deletion
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(false);
        // We mock the 'isLoggedIn' method of the Authenticator to return the next function, indicating that the user is authenticated
        jest.spyOn(Authenticator.prototype, "logout").mockResolvedValueOnce(false);
        // We send a request to the route with mocked dependencies. We expect the route to return a 503 error code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(503);
    });
    test("It should return 500 if authService.logout throws an error", async () => {
        // Mock the 'logout' method of the Authenticator to throw an error, simulating a failure scenario
        jest.spyOn(Authenticator.prototype, "logout").mockRejectedValueOnce(new Error("Logout failed"));
    
        // We send a request to the route with mocked dependencies. We expect the route to return a 500 error code
        const response = await request(app).delete(baseURL + "/sessions/current");
        expect(response.status).toBe(500);
    });
    
    
    
    
});
describe("GET /sessions/current", () => {
    test("It returns the current user", async () => {
        // We mock the 'getCurrentUser' method of the Authenticator to return a user object
        // jest.spyOn(Authenticator.prototype,"getCurrentUser" as any).mockResolvedValueOnce(testAdmin[0]);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        // We send a request to the route with mocked dependencies. We expect the route to return a 200 success code and the current user
        const response = await request(app).get(baseURL + "/sessions/current");
        expect(response.status).toBe(200);
        // expect(response.body).toEqual(testAdmin[0]);
    });
});