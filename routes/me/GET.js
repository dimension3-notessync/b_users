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
        email = usersDBResponse.data.userInformation.email;
        permissionLevel = usersDBResponse.data.userInformation.permissionLevel;

        const subscriptionsDBResponse = await axios.get(`http://${subscriptionsDB}/user/${usersDBResponse.data.userInformation.id}`, {
            stepName: "requestSubscriptionsOfUser"
        })

        return res.status(200).send({ username: username, email: email, permissionLevel, subscriptions: subscriptionsDBResponse.data});
    } catch(error) {
        return errorHandler(req, res, error);
    }
}