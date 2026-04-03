import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function profileHandler(req, res, usersDB, tokenPort, subscriptionsDB) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    let username;
    let email;
    let permissionLevel;

    try {
        const usernameFromTokenResponse = await axios.get(`http://${tokenPort}/user/${token}`, {
            stepName : "requestUsernameByToken"
        });
        username = usernameFromTokenResponse.data.username;

        const usersDBResponse = await axios.post(`http://${usersDB}/user`, {
            username: username
        }, {
            stepName: "requestUserInformation"
        })
        email = usersDBresponse.data.email;

        const subscriptionsDBresponse = axios.get(`http://${subscriptionsDB}/user/${usersDBresponse.data.id}`, {
            stepName : "requestSubscriptionsOfUser"
        })
        permissionLevel = usersDBResponse.data.userInformation.permissionLevel;

        return res.status(200).send({ username: username, email: email, permissionLevel, subscriptions: subscriptionsDBresponse.data});
    } catch(error) {
        return errorHandler(req, res, error);
    }
}