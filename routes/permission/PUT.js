import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function permissionChangeHandler(req, res, usersDB, tokenPort) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    if (!req.body) {
        return res.status(400).send({ message: "Request body is missing" });
    }
    if (!req.body.username) {
        return res.status(400).send({ message: "username is missing" });
    }
    if (!req.body.permissionLevel) {
        return res.status(400).send({ message: "permissionLevel is missing" });
    }
    const username = req.body.username;
    const permissionLevel = req.body.permissionLevel;

    axios.post(`http://localhost:${tokenPort}/permissionLevel`, { //TODO FIX IN LIVE VERSION
        token: token,
        allowedRoles: "admin"
    }, {
        stepName : "adminCheck"
    })
        .then((adminCheckResponse) => {
            return axios.put(`http://localhost:${usersDB}/permissionLevel`, { //TODO FIX IN LIVE VERSION
                username : username,
                permissionLevel : permissionLevel
            }, {
                stepName : "requestPermissionLevelChange"
            })
        })
        .then((usersDBresponse) => {
            return res.send(200).send({users: usersDBresponse.data});
        })
        .catch(error => {
            errorHandler(req, res, error)
        });
}