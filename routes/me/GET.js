import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function profileHandler(req, res, usersDB, tokenPort, subscriptionsDB) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    let username;
    let email;

    axios.get(`http://${tokenPort}/user/${token}`, {
        stepName : "requestUsernameByToken"
    })
        .then((usernameFromTokenResponse) => {
            username = usernameFromTokenResponse.data.username;
            return axios.post(`http://${usersDB}/user`, {
                username: username
            }, {
                stepName : "requestUserInformation"
            })
        })
        .then((usersDBresponse) => {
            email = usersDBresponse.data.email;
            return axios.get(`http://${subscriptionsDB}/user/${usersDBresponse.data.id}`, {
                stepName : "requestSubscriptionsOfUser"
            })
        })
        .then((subscriptionsDBresponse) => {
            return res.status(200).send({ username: username, email: email, subscriptions: subscriptionsDBresponse.data});
        })
        .catch(error => {
            return errorHandler(req, res, error);
        });
}