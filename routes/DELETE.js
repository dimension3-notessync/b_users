import axios from "axios";
import errorHandler from "../utils/errorHandler.js";

export default async function deleteHandler(req, res, usersDB, tokenPort) {
    if (!req.body) {
        return res.status(400).send({ message: "Request body is missing" });
    }
    if (!req.body.password) {
        return res.status(400).send({ message: "password is missing" });
    }
    const password = req.body.password;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing, please login" });
    }

    try {
        const usernameFromTokenResponse = await axios.get(`http://${tokenPort}/user/${token}`, {
            stepName: "requestUsernameByToken"
        });
        const username = usernameFromTokenResponse.data.username;

        await axios.post(`http://${usersDB}/login`, {
            username: username,
            password: password
        }, {
            stepName: "validatePassword"
        });

        await axios.delete(`http://${usersDB}/delete/${username}`, {
            stepName: "deleteUser" // Changed stepName to be more descriptive
        });

        res.clearCookie('token');
        return res.status(200).send({ message: "account successfully deleted" });
    } catch (error) {
        return errorHandler(req, res, error);
    }
}