
export default function errorHandler(req, res, error) {
    // handle no response
    if (error.request) {
        console.error("No response received from Axios call:", error.request);
        return res.status(500).send({ message: "Network error or database service is unavailable." });
    }

    // handle error messages
    if (error.response) {
        const errorMessage = error.response.data?.message || "An unexpected error occurred on the server.";

        // Differentiate errors based on the URL of the failing request
        if (error.config.url.includes('/register')) {
            console.error("Error during user registration for: " + req.body.username, error.response.data);
            return res.status(error.response.status).send({
                message: `Registration failed: ${errorMessage}`
            });
        }
        if (error.config.url.includes('/login')) {
            console.error("Error during follow-up action (e.g., profile creation) for: " + req.body.username, error.response.data);
            // Important consideration: If registration succeeded but profile creation failed,
            // the user *is* registered. You might want to return a 500
            // to indicate a partial success/failure state, or provide a specific
            // message. For now, it will return the status the profile endpoint sent.
            return res.status(error.response.status).send({
                message: `login failed: ${errorMessage}.`
            });
        }
        if (error.config.url.includes('/')) {
            console.error("Error during follow-up action (e.g., profile creation) for: " + req.body.username, error.response.data);
            // Important consideration: If registration succeeded but profile creation failed,
            // the user *is* registered. You might want to return a 500
            // to indicate a partial success/failure state, or provide a specific
            // message. For now, it will return the status the profile endpoint sent.
            return res.status(error.response.status).send({
                message: `Follow-up action failed after successful registration: ${errorMessage}. User might still be registered.`
            });


    // handle unkown/undocumented errors
    return res.status(500).send({message: "unkown error occurred please try again later"});
}