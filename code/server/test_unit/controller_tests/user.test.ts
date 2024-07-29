import { test, expect, jest,afterEach } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { Role, User } from "../../src/components/user";

jest.mock("../../src/dao/userDAO")

afterEach(() => {
    jest.clearAllMocks();
});

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters

test("It should return true if user is created", async () => {
    const testUser = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: "Manager"
    }
    jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the createUser method of the controller with the test user object
    const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

    //Check if the createUser method of the DAO has been called once with the correct parameters
    expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role);
    expect(response).toBe(true); //Check if the response is true
});

//unit test for the createUser method of the UserController
//The test checks if the method throws an error when the DAO method returns false
//The test also expects the DAO method to be called once with the correct parameters

test("It should throw an error", async () => {
    const testUser = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: "Manager"
    }
    jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(false); //Mock the createUser method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the createUser method of the controller with the test user object
    try {
        await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
    } catch (error) {
        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role);
        expect(error).toBeInstanceOf(Error); //Check if the error is an instance of Error
    }
});

//unit test for the getUsers method of the UserController
//The test checks if the method returns an array of users when the DAO method returns an array of users
//The test also expects the DAO method to be called once

test("It should return an array of users", async () => {
    const testUsers:User[] = [ 
        {
            username: "test1",
            name: "test1",
            surname: "test1",
            role: Role.MANAGER,
            address: "test1",
            birthdate: "20-03-2024"
        },
        {
            username: "test2",
            name: "test2",
            surname: "test2",
            role: Role.CUSTOMER,
            address: "test2",
            birthdate: "20-03-2024"
        }
    ]
    jest.spyOn(UserDAO.prototype, "showAllUsers").mockResolvedValueOnce(testUsers); //Mock the showAllUsers method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the getUsers method of the controller
    const response = await controller.getUsers();

    //Check if the showAllUsers method of the DAO has been called once
    expect(UserDAO.prototype.showAllUsers).toHaveBeenCalledTimes(1);
    expect(response).toEqual(testUsers); //Check if the response is equal to the test users array
});

//unit test for the getUsersByRole method of the UserController
//The test checks if the method returns an array of users when the DAO method returns an array of users
//The test also expects the DAO method to be called once with the correct parameter

test("It should return an array of users with the specified role", async () => {
    const testUsers:User[] = [ 
        {
            username: "test1",
            name: "test1",
            surname: "test1",
            role: Role.MANAGER,
            address: "test1",
            birthdate: "20-03-2024"
        },
        {
            username: "test2",
            name: "test2",
            surname: "test2",
            role: Role.CUSTOMER,
            address: "test2",
            birthdate: "20-03-2024"
        }
    ]
    jest.spyOn(UserDAO.prototype, "showAllUsersWithRole").mockResolvedValueOnce(testUsers); //Mock the showAllUsersWithRole method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the getUsersByRole method of the controller with the test role
    const response = await controller.getUsersByRole("Manager");

    //Check if the showAllUsersWithRole method of the DAO has been called once with the correct parameter
    expect(UserDAO.prototype.showAllUsersWithRole).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.showAllUsersWithRole).toHaveBeenCalledWith("Manager");
    expect(response).toEqual(testUsers); //Check if the response is equal to the test users array
});

//unit test for the getUserByUsername method of the UserController
//The test checks if the method returns the requested user when the DAO method returns the requested user
//The test also expects the DAO method to be called once with the correct parameter

test("It should return the requested user", async () => {
    const testUser:User = {
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the getUserByUsername method of the controller with the test user object
    const response = await controller.getUserByUsername(testUser, testUser.username);

    //Check if the getUserByUsername method of the DAO has been called once with the correct parameter
    expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testUser.username);
    expect(response).toEqual(testUser); //Check if the response is equal to the test user object
});

//unit test for the getUserByUsername method of the UserController
//The test checks if the method throws an error when the requested user is not the same as the user calling the method
//The test also expects the DAO method to be called once with the correct parameter

test("It should throw an error", async () => {
    const testUser:User = { 
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the getUserByUsername method of the controller with the test user object
    try {
        await controller.getUserByUsername(testUser, "wrong");
    } catch (error) {
        //Check if the getUserByUsername method of the DAO has been called once with the correct parameter
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith("wrong");
        expect(error).toBeInstanceOf(Error); //Check if the error is an instance of Error
    }
});

//unit test for the deleteUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameter

test("It should return true when user is deleted", async () => {
    const testUser:User = { 
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the deleteUser method of the controller with the test user object
    const response = await controller.deleteUser(testUser, testUser.username);

    //Check if the deleteUser method of the DAO has been called once with the correct parameter
    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username);
    expect(response).toBe(true); //Check if the response is true
});

//unit test for the deleteUser method of the UserController
//The test checks if the method throws an error when the requested user is not the same as the user calling the method
//The test also expects the DAO method to be called once with the correct parameter

test("It should throw an error when user not the one calling", async () => {
    const testUser:User = {
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the deleteUser method of the controller with the test user object
    try {
        await controller.deleteUser(testUser, "wrong");
    } catch (error) {
        //Check if the deleteUser method of the DAO has been called once with the correct parameter
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(Error); //Check if the error is an instance of Error
    }
});

//unit test for the deleteUser method of the UserController with user as ADMIN
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameter

test("It should return true when user is ADMIN", async () => {
    const adminUser:User = { 
        username: "test",
        name: "test",
        surname: "admin",
        role: Role.ADMIN,
        address: "test",
        birthdate: "20-03-2024"
    }
    const testUser:User = { 
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the deleteUser method of the controller with the test user object
    const response = await controller.deleteUser(adminUser, testUser.username);

    //Check if the deleteUser method of the DAO has been called once with the correct parameter
    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username);
    expect(response).toBe(true); //Check if the response is true
});

//unit test for the deleteAll method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once

test("It should return true if all user are deleted", async () => {
    jest.spyOn(UserDAO.prototype, "deleteAllUsers").mockResolvedValueOnce(true); //Mock the deleteAllUsers method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the deleteAll method of the controller
    const response = await controller.deleteAll();

    //Check if the deleteAllUsers method of the DAO has been called once
    expect(UserDAO.prototype.deleteAllUsers).toHaveBeenCalledTimes(1);
    expect(response).toBe(true); //Check if the response is true
});

//unit test for the updateUserInfo method of the UserController
//The test checks if the method returns the updated user when the DAO method updates the user
//The test also expects the DAO method to be called once with the correct parameters

test("It should return the updated user", async () => {
    const testUser:User = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "updateUser").mockResolvedValueOnce(true); //Mock the updateUser method of the DAO
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the updateUserInfo method of the controller with the test user object
    const response = await controller.updateUserInfo(testUser, "new", "new", "new", "new", testUser.username);

    //Check if the updateUser method of the DAO has been called once with the correct parameters
    expect(UserDAO.prototype.updateUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.updateUser).toHaveBeenCalledWith(testUser.username, "new", "new", "new", "new");
    expect(response).toEqual(testUser); //Check if the response is equal to the test user object
});

//unit test for the updateUserInfo method of the UserController
//The test checks if the method throws an error when the requested user is not the same as the user calling the method
//The test also expects the DAO method to be called once with the correct parameters

test("It should throw an error when not the same as calling", async () => {
    const testUser:User = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "updateUser").mockResolvedValueOnce(true); //Mock the updateUser method of the DAO
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the updateUserInfo method of the controller with the test user object
    try {
        await controller.updateUserInfo(testUser, "new", "new", "new", "new", "wrong");
    } catch (error) {
        //Check if the updateUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.updateUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(Error); //Check if the error is an instance of Error
    }
});

//unit test for the updateUserInfo method of the UserController
//The test checks if the method throws an error when the DAO method does not update the user
//The test also expects the DAO method to be called once with the correct parameters

test("It should throw an error when not updated", async () => {
    const testUser:User = { //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        role: Role.MANAGER,
        address: "test",
        birthdate: "20-03-2024"
    }
    jest.spyOn(UserDAO.prototype, "updateUser").mockResolvedValueOnce(false); //Mock the updateUser method of the DAO
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
    const controller = new UserController(); //Create a new instance of the controller
    //Call the updateUserInfo method of the controller with the test user object
    try {
        await controller.updateUserInfo(testUser, "new", "new", "new", "new", testUser.username);
    } catch (error) {
        //Check if the updateUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.updateUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.updateUser).toHaveBeenCalledWith(testUser.username, "new", "new", "new", "new");
        expect(error).toBeInstanceOf(Error); //Check if the error is an instance of Error
    }
});

