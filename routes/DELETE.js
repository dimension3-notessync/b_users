import axios from "axios";

export default async function deleteHandler(req, res, databasePort, tokenPort) {
    if (!req.body) {
        return res.status(400).send({ message: "Request body is missing" });
    }
    if (!req.body.password) {
        return res.status(400).send({ message: "password is missing" });
    }
    const password = req.body.password;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send({ message: "Token is missing" });
    }
    let username;
    axios.get(`http://localhost:${tokenPort}/user/${token}`, { //TODO FIX IN LIVE VERSION
    })
        .then((usernameFromTokenResponse) => {
            username = usernameFromTokenResponse.data.username;
            return axios.post(`http://localhost:${databasePort}/login`, { //TODO FIX IN LIVE VERSION
                username: username,
                password: password
            })
        })
        .then((loginResponse) => {
            return axios.delete(`http://localhost:${databasePort}/delete/${username}`, { //TODO FIX IN LIVE VERSION
            })
        })
        .then((deleteResponse) => {
            res.clearCookie('token');
            return res.status(200).send({message : "account successfully deleted"});
        })
        .catch(error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx.
            const errorMessage = error.response.data?.message || "An unexpected error occurred on the server.";

            // Differentiate errors based on the URL of the failing request
            if (error.config.url.includes('/register')) {
                console.error("Error during user registration for: " + req.body.username, error.response.data);
                return res.status(error.response.status).send({
                    message: `Registration failed: ${errorMessage}`
                });
            } else if (error.config.url.includes('/login')) {
                console.error("Error during follow-up action (e.g., profile creation) for: " + req.body.username, error.response.data);
                // Important consideration: If registration succeeded but profile creation failed,
                // the user *is* registered. You might want to return a 500
                // to indicate a partial success/failure state, or provide a specific
                // message. For now, it will return the status the profile endpoint sent.
                return res.status(error.response.status).send({
                    message: `login failed: ${errorMessage}.`
                });
            } else if (error.config.url.includes('/')) {
                console.error("Error during follow-up action (e.g., profile creation) for: " + req.body.username, error.response.data);
                // Important consideration: If registration succeeded but profile creation failed,
                // the user *is* registered. You might want to return a 500
                // to indicate a partial success/failure state, or provide a specific
                // message. For now, it will return the status the profile endpoint sent.
                return res.status(error.response.status).send({
                    message: `Follow-up action failed after successful registration: ${errorMessage}. User might still be registered.`
                });
            }
        } else if (error.request) {
            // The request was made but no response was received (e.g., network error, server down)
            console.error("No response received from Axios call:", error.request);
            return res.status(500).send({ message: "Network error or database service is unavailable." });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up Axios request:", error.message);
            return res.status(500).send({ message: "An unexpected client-side error occurred while making a request." });
        }
    });
}