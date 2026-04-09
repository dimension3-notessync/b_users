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
        if (permissionLevel === 1) {
            permissionLevel = 'viewer';
        }
        if (permissionLevel === 2) {
            permissionLevel = 'student';
        }
        if (permissionLevel === 3) {
            permissionLevel = 'admin';
        }

        const subscriptionsDBResponse = await axios.get(`http://${subscriptionsDB}/user/${usersDBResponse.data.userInformation.id}`, {
            stepName: "requestSubscriptionsOfUser"
        })
        const subscriptionsData = subscriptionsDBResponse.data.subscriptions; // Access the array directly
        const authorUsernames = [];
        let lecturesSubscription = false;
        const usernamePromises = subscriptionsData.map(async (subscription) => {
            // Check if it's an author subscription (not lectures and author is not -1)
            if (subscription.lectures === false && subscription.authorID !== -1) {
                try {
                    // Assuming usersDB expects { id: authorId } for fetching by ID
                    const authorInfoResponse = await axios.post(`http://${usersDB}/user`, {
                        userid: subscription.authorID
                    }, {
                        stepName: `requestAuthorInformationForSubscription`
                    });
                    return {
                        // MODIFICATION HERE: Include both userid and username
                        userid: subscription.authorID,
                        username: authorInfoResponse.data.userInformation.username
                    };
                } catch (authorError) {
                    // Log or handle error if an author's info can't be fetched
                    console.error(`Failed to fetch username for author ID ${subscription.authorID}:`, authorError.message);
                    return {
                        userid: subscription.authorID, // Still include ID even if username failed
                        username: "Unknown User (Error)"
                    };
                }
            }
            if (subscription.lectures === true) {
                lecturesSubscription = true;
            }
            return null; // For calendar subscriptions or invalid author IDs
        });

        const fetchedAuthorDetails = await Promise.all(usernamePromises);
        fetchedAuthorDetails.forEach(detail => {
            if (detail) { // Only push if it's not null (e.g., from a lecture subscription)
                authorUsernames.push(detail);
            }
        });

        return res.status(200).send({
            username: username,
            email: email,
            permissionLevel,
            lecturesSubscription: lecturesSubscription,
            subscribedAuthors: authorUsernames // New list of subscribed authors with their usernames and user IDs
        });
    } catch(error) {
        return errorHandler(req, res, error);
    }
}
