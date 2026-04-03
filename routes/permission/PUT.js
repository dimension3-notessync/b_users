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
    const permissionLevel = req.body.permissionLevel;
    if (permissionLevel > 3 || permissionLevel < 1) {
        return res.status(400).send({ message: "permissionLevel currently only allows 1, 2 or 3" });
    }
    const username = req.body.username;

    axios.post(`http://${tokenPort}/permissionLevel`, {
        token: token,
        allowedRoles: ["admin"]
    }, {
        stepName : "adminCheck"
    })
        .then((adminCheckResponse) => {
            return axios.put(`http://${usersDB}/change/permissionLevel`, {
                username : username,
                permissionLevel : permissionLevel
            }, {
                stepName : "requestPermissionLevelChange"
            })
        })
        .then((usersDBresponse) => {
            return res.status(200).send({users: usersDBresponse.data});
        })
        .catch(error => {
            return errorHandler(req, res, error)
        });
}