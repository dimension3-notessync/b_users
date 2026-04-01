import axios from "axios";
import errorHandler from "../../utils/errorHandler.js";

export default async function profileHandler(req, res, usersDB, tokenPort, subscriptionsDB) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    let username;
    let email;

    axios.get(`http://localhost:${tokenPort}/user/${token}`, { //TODO FIX IN LIVE VERSION
        stepName : "requestUsernameByToken"
    })
        .then((usernameFromTokenResponse) => {
            username = usernameFromTokenResponse.data.username;
            return axios.post(`http://localhost:${usersDB}/user`, { //TODO FIX IN LIVE VERSION
                username: username
            }, {
                stepName : "requestUserInformation"
            })
        })
        .then((usersDBresponse) => {
            email = usersDBresponse.data.email;
            return axios.get(`http://localhost:${subscriptionsDB}/user/${usersDBresponse.data.id}`, { //TODO FIX IN LIVE VERSION
                stepName : "requestSubscriptionsOfUser"
            })
        })
        .then((subscriptionsDBresponse) => {
            return res.status(200).send({ username: username, email: email, subscriptions: subscriptionsDBresponse.data});
        })
        .catch(error => {
            errorHandler(req, res, error);
        });
}