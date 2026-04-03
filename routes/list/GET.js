import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function listHandler(req, res, tokenPort, usersDB) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }

    try {
        const adminCheckResponse = await axios.post(`http://${tokenPort}/permissionLevel`, {
            token: token,
            allowedRoles: ["admin"]
        }, {
            stepName: "adminCheck"
        });

        const usersDBresponse = await axios.get(`http://${usersDB}/all`, {
            stepName: "requestAllUsers"
        });

        return res.status(200).send({ users: usersDBresponse.data.data });

    } catch (error) {
        return errorHandler(req, res, error);
    }
}