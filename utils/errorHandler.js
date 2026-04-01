
export default function errorHandler(req, res, error, action) {
    // handle error messages
    if (error.response) {
        const errorMessage = error.response.data?.message || "An unexpected error occurred on the server.";
        const failedStep = error.config?.stepName;

        if (failedStep === 'registerUser') {
            console.error("Error while registering user:", error.response.data);
            return res.status(error.response.status).send({ message: `Registering failed: ${errorMessage}` });
        }
        if (failedStep === 'requestToken') {
            console.error("Error while requesting token:", error.response.data);
            return res.status(error.response.status).send({ message: `Creating token failed, user was created: ${errorMessage}` });
        }
        if (failedStep === 'requestUsernameByToken') {
            console.error("Error while reading token:", error.response.data);
            return res.status(error.response.status).send({ message: `Reading token failed: ${errorMessage}` });
        }
        if (failedStep === 'validatePassword') {
            console.error("Error while matching password with username from token:", error.response.data);
            return res.status(error.response.status).send({ message: `Password error: ${errorMessage}` });
        }
        if (failedStep === 'requestUserInformation') {
            console.error("Error while requesting user information by username:", error.response.data);
            return res.status(error.response.status).send({ message: `User information error: ${errorMessage}` });
        }
        if (failedStep === 'requestSubscriptionsOfUser') {
            console.error("Error while requesting subscription information by userid:", error.response.data);
            return res.status(error.response.status).send({ message: `Subscription-reading error: ${errorMessage}` });
        }
        if (failedStep === 'adminCheck') {
            console.error("Error while matching user token with admin role:", error.response.data);
            return res.status(error.response.status).send({ message: `Error non-admin access: ${errorMessage} // If you are an admin, try logging out and in again.` });
        }
        if (failedStep === 'requestAllUsers') {
            console.error("Error while trying to get all users:", error.response.data);
            return res.status(error.response.status).send({ message: `Error requesting the information of all users: ${errorMessage}` });
        }
    }

    // handle no response
    if (error.request) {
        console.error("No response received from Axios call:", error.request);
        return res.status(500).send({ message: "Network error or database service is unavailable. Please try again later." });
    }

    // handle unkown/undocumented errors
    return res.status(500).send({message: "Unkown error occurred please try again later."});
}