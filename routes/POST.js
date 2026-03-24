
import axios from 'axios';
import validator from 'validator';

export default async function createHandler(req, res, databasePort, tokenPort) {
    if (!req.body) {
        return res.status(400).send({ message: "Request body is missing" });
    }
    if (!req.body.username) {
        return res.status(400).send({ message: "username is missing" });
    }
    if (!req.body.email) {
        return res.status(400).send({ message: "email is missing" });
    }
    if (!req.body.password) {
        return res.status(400).send({ message: "password is missing" });
    }

    // SPELLCHECK USERNAME
    const username = req.body.username;
    if (username.length < 3) {
        return res.status(400).send({message : "username should be at least 3 characters"});
    }
    if (username.length > 25) {
        return res.status(400).send({message : "username can have 25 characters at most"});
    }
    if(/\s/.test(username)) {
        return res.status(400).send({ message: "username cannot contain whitespaces" });
    }
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-])*[a-zA-Z0-9]$/;
    if(!pattern.test(username)) {
        return res.status(400).send({ message: "username can only contain Letters (a-z, A-Z), numbers (0-9), underscore (_) and hyphen (-)" });
    }
    // SPELLCHECK PASSWORD
    const password = req.body.password;
    if (password.length < 12) {
        return res.status(400).send({message : "password should be at least 12 characters"});
    }
    if (password.length > 128) {
        return res.status(400).send({message : "password cannot be longer than 128 characters"});
    }
    if(/\s/.test(password)) {
        return res.status(400).send({ message: "password cannot contain whitespaces" });
    }
    // SPELLCHECK EMAIL
    const email = req.body.email;
    if (!validator.isEmail(email)) {
        return res.status(400).send({ message: "email format is invalid" });
    }


    axios.post(`http://localhost:${databasePort}/register`, { //TODO FIX IN LIVE VERSION
        username: username,
        password: password,
        email: email,
    })
        .then((registrationResponse) => {
            console.log("User named: >" + username + "< has been registered.");
            let role;
            if (registrationResponse.data.permissionLevel === 2) {
                role = "student"
            } else {
                role = "viewer";
            }
            return axios.post(`http://localhost:${tokenPort}`, { //TODO FIX IN LIVE VERSION
                username: username,
                role: role
            });
        })
        .then((followUpResponse) => {
            res.cookie('token', followUpResponse.data.token, {
                httpOnly: true, // Prevent access by JavaScript
                secure: false,   // Ensures the cookie is only sent over HTTPS //TODO FIX IN LIVE VERSION
                sameSite: 'lax', // Protects against CSRF (set to 'Lax' or 'Strict' as needed) //TODO FIX IN LIVE VERSION
                maxAge: 3600000    // Optional: Set cookie expiration (in milliseconds)
            });
            return res.status(200).send({
                message: "Account registered successfully.",
            });
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