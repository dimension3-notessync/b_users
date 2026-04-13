
import axios from 'axios';
import validator from 'validator';
import errorHandler from "../utils/errorHandler.js";

export default async function createHandler(req, res, usersDB, tokenPort) {
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

    try {
        const registrationResponse = await axios.post(`http://${usersDB}/register`, {
            username: username,
            password: password,
            email: email,
        }, {
            stepName : "registerUser"
        });
        console.log("User named: >" + username + "< has been registered.");

        let role;
        if (registrationResponse.data.permissionLevel === 2) {
            role = "student";
        } else if (registrationResponse.data.permissionLevel === 3) {
            role = "admin";
        } else {
            role = "viewer";
        }

        const tokenResponse = await axios.post(`http://${tokenPort}`, {
            username: username,
            role: role
        },{
            stepName: "requestToken"
        });

        res.cookie('token', tokenResponse.data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 3600000
        });

        return res.status(200).send({
            message: "Account registered successfully.",
        });

    } catch (error) {
        return errorHandler(req, res, error);
    }
}
