import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { UserNotFoundError } from "../../src/errors/userError"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")

//Example of unit test for the createUser method
//It mocks the database run method to simulate a successful insertion and the crypto randomBytes and scrypt methods to simulate the hashing of the password
//It then calls the createUser method and expects it to resolve true

test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
        return (Buffer.from("salt"))
    })
    const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
        return Buffer.from("hashedPassword")
    })
    const result = await userDAO.createUser("username", "name", "surname", "password", "role")
    expect(result).toBe(true)
    mockRandomBytes.mockRestore()
    mockDBRun.mockRestore()
    mockScrypt.mockRestore()
})

test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
        return (Buffer.from("salt"))
    })
    const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
        return Buffer.from("hashedPassword")
    })
    await expect(userDAO.createUser("username", "name", "surname", "password", "role")).rejects.toThrowError()
    mockRandomBytes.mockRestore()
    mockDBRun.mockRestore()
    mockScrypt.mockRestore()
})

//Example of unit test for the getUserByUsername method
//It mocks the database get method to simulate a successful retrieval of a user
//It then calls the getUserByUsername method and expects it to resolve a user object
test("It should resolve a user object", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" })
        return {} as Database
    });
    const result = await userDAO.getUserByUsername("username")
    expect(result).toEqual({ username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" })
    mockDBGet.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.getUserByUsername("username")).rejects.toThrowError()
    mockDBGet.mockRestore()
})
test("It should reject a UserNotFoundError", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, null)
        return {} as Database
    });
    await expect(userDAO.getUserByUsername("username")).rejects.toThrowError(UserNotFoundError)
    mockDBGet.mockRestore()
})


//Example of unit test for the loginUser method
//It mocks the database get method to simulate a successful retrieval of a user
//It then calls the loginUser method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" })
        return {} as Database
    });
    const result = await userDAO.loginUser("username", "password")
    expect(result).toBe(true)
    mockDBGet.mockRestore()
})
test("It should resolve false", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, null)
        return {} as Database
    });
    const result = await userDAO.loginUser("username", "password")
    expect(result).toBe(false)
    mockDBGet.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.loginUser("username", "password")).rejects.toThrowError()
    mockDBGet.mockRestore()
})

//Example of unit test for the updateUser method
//It mocks the database run method to simulate a successful update
//It then calls the updateUser method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.updateUser("username", "name", "surname", "address", "birthdate")
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.updateUser("username", "name", "surname", "address", "birthdate")).rejects.toThrowError()
    mockDBRun.mockRestore()
})

//Example of unit test for the deleteUser method
//It mocks the database run method to simulate a successful deletion
//It then calls the deleteUser method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.deleteUser("username")
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.deleteUser("username")).rejects.toThrowError()
    mockDBRun.mockRestore()
})

//Example of unit test for the getAllUsers method
//It mocks the database all method to simulate a successful retrieval of all users
//It then calls the getAllUsers method and expects it to resolve an array of user objects
test("It should resolve an array of user objects", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, [{ username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" }])
        return {} as Database
    });
    const result = await userDAO.showAllUsers()
    expect(result).toEqual([{ username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" }])
    mockDBAll.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.showAllUsers()).rejects.toThrowError()
    mockDBAll.mockRestore()
})

//Example of unit test for the deleteAllUsers method
//It mocks the database run method to simulate a successful deletion
//It then calls the deleteAllUsers method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.deleteAllUsers()
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.deleteAllUsers()).rejects.toThrowError()
    mockDBRun.mockRestore()
})

//Example of unit test for the getIsUserAuthenticated method
//It mocks the database get method to simulate a successful retrieval of a user
//It then calls the getIsUserAuthenticated method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", password: "password", salt: "salt" })
        return {} as Database
    });
    const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
        return Buffer.from("hashedPassword")
    })
    const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(true)
    const result = await userDAO.getIsUserAuthenticated("username", "password")
    expect(result).toBe(true)
    mockDBGet.mockRestore()
    mockScrypt.mockRestore()
    mockTimingSafeEqual.mockRestore()
})
test("It should resolve false", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", password: "password", salt: "salt" })
        return {} as Database
    });
    const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
        return Buffer.from("hashedPassword")
    })
    const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(false)
    const result = await userDAO.getIsUserAuthenticated("username", "password")
    expect(result).toBe(false)
    mockDBGet.mockRestore()
    mockScrypt.mockRestore()
    mockTimingSafeEqual.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.getIsUserAuthenticated("username", "password")).rejects.toThrowError()
    mockDBGet.mockRestore()
})



//Example of unit test for the showAllUsersWithRole method
//It mocks the database all method to simulate a successful retrieval of all users with a specific role
//It then calls the showAllUsersWithRole method and expects it to resolve an array of user objects
test("It should resolve an array of user objects", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, [{ username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" }])
        return {} as Database
    });
    const result = await userDAO.showAllUsersWithRole("role")
    expect(result).toEqual([{ username: "username", name: "name", surname: "surname", role: "role", address: "address", birthdate: "birthdate" }])
    mockDBAll.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.showAllUsersWithRole("role")).rejects.toThrowError()
    mockDBAll.mockRestore()
})

//Example of unit test for the logoutUser method
//It mocks the database get method to simulate a successful retrieval of a user
//It then calls the logoutUser method and expects it to resolve true
test("It should resolve true", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username" })
        return {} as Database
    });
    const result = await userDAO.logoutUser("username")
    expect(result).toBe(true)
    mockDBGet.mockRestore()
})
test("It should resolve false", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, null)
        return {} as Database
    });
    const result = await userDAO.logoutUser("username")
    expect(result).toBe(false)
    mockDBGet.mockRestore()
})
test("It should reject an error", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.logoutUser("username")).rejects.toThrowError()
    mockDBGet.mockRestore()
})







