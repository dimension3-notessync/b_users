import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function passwordChangeHandler(req, res, usersDB, tokenPort) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    if (!req.body) {
        return res.status(400).send({ message: "Request body is missing" });
    }
    if (!req.body.password) {
        return res.status(400).send({ message: "password is missing" });
    }
    if (!req.body.newPassword) {
        return res.status(400).send({ message: "newPassword is missing" });
    }
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    let username;

    axios.get(`http://${tokenPort}/user/${token}`, {
        stepName : "requestUsernameByToken"
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
            return axios.put(`http://${usersDB}/change/password`, {
                username : username,
                newPassword : newPassword
            }, {
                stepName : "requestPasswordChange"
            })
        })
        .then((usersDBresponse) => {
            return res.status(200).send({message : "Password successfully changed."});
        })
        .catch(error => {
            return errorHandler(req, res, error)
        });
}