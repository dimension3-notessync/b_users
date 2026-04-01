import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function listHandler(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }

    axios.post(`http://localhost:${tokenPort}/permissionLevel`, { //TODO FIX IN LIVE VERSION
        token: token,
        allowedRoles: "admin"
    }, {
        stepName : "adminCheck"
    })
        .then((adminCheckResponse) => {
            return axios.get(`http://localhost:${usersDB}/all`, { //TODO FIX IN LIVE VERSION
                stepName : "requestAllUsers"
            })
        })
        .then((usersDBresponse) => {
            return res.send(200).send({users: usersDBresponse.data});
        })
        .catch(error => {
            errorHandler(req, res, error)
        });
}