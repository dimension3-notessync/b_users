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
        return res.status(400).send({ message: "Token is missing" });
    }
    let username;
    axios.get(`http://${tokenPort}/user/${token}`, {
        stepName: "requestUsernameByToken"
    })
        .then((usernameFromTokenResponse) => {
            username = usernameFromTokenResponse.data.username;
            return axios.post(`http://${usersDB}/login`, {
                username: username,
                password: password
            }, {
                stepName : "validatePassword"
            });
        })
        .then((loginResponse) => {
            return axios.delete(`http://:${usersDB}/delete/${username}`, {
                stepName : "validatePassword"
            });
        })
        .then((deleteResponse) => {
            res.clearCookie('token');
            return res.status(200).send({message : "account successfully deleted"});
        })
        .catch(error => {
            return errorHandler(req, res, error)
    });
}