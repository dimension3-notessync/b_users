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

    axios.get(`http://localhost:${tokenPort}/user/${token}`, { //TODO FIX IN LIVE VERSION
        stepName : "requestUsernameByToken"
    })
        .then((usernameFromTokenResponse) => {
            username = usernameFromTokenResponse.data.username;
            return axios.post(`http://localhost:${usersDB}/login`, { //TODO FIX IN LIVE VERSION
                username: username,
                password: password
            }, {
                stepName : "validatePassword"
            });
        })
        .then((loginResponse) => {
            return axios.put(`http://localhost:${usersDB}/change/password`, { //TODO FIX IN LIVE VERSION
                username : username,
                password : newPassword
            }, {
                stepName : "requestPasswordChange"
            })
        })
        .then((usersDBresponse) => {
            return res.send(200).send({users: usersDBresponse.data});
        })
        .catch(error => {
            errorHandler(req, res, error)
        });
}