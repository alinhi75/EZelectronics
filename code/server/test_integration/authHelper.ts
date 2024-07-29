import request from "supertest";
import { app } from "../index"

/**
 * Utility function to setup a logged in user for testing
 * @param email 
 * @param password 
 * @returns 
 */
export const testUserLogin = async (username: string, password: string) => {
    const res = await request(app)
        .post("/ezelectronics/sessions")
        .send({ username: username, password: password })
        .expect(200);
    return res;
};

/**
 * Utility function to logout a user during testing
 * @param} authCookie 
 * @returns 
 */
export const testUserLogout = async (authCookie: any) => {
    const res = await request(app)
        .delete("/ezelectronics/sessions")
        .set("Cookie", authCookie)
        .expect(200);
    return res;
};

/**
 * Return the session cookie from the response
 * @param} res 
 * @returns 
 */
export const authCookie = (res: any) => {
    return res.headers["set-cookie"][0];
};

