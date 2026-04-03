
import express from 'express';
import cookieParser from 'cookie-parser'
import createHandler from "./routes/POST.js";
import deleteHandler from "./routes/DELETE.js";
import profileHandler from "./routes/me/GET.js";
import listHandler from "./routes/list/GET.js";
import permissionChangeHandler from "./routes/permission/PUT.js";
import passwordChangeHandler from "./routes/password-change/PUT.js";

const port = process.env.PORT || "undefined";
const usersDB = process.env.USERS_DB_PORT || "undefined";
const subscriptionsDB = process.env.SUBSCRIPTIONS_DB_PORT || "undefined";
const tokenPort = process.env.TOKEN_PORT || "undefined";

if (port === "undefined") {
    console.error("Critical Error: Missing PORT environment variable. Please set it.");
    process.exit(1);
}
if (usersDB=== "undefined") {
    console.error("Critical Error: Missing usersDB port environment variable. Please set it.");
    process.exit(1);
}
if (subscriptionsDB === "undefined") {
    console.error("Critical Error: Missing subscriptionsDB port environment variable. Please set it.");
    process.exit(1);
}
if (tokenPort === "undefined") {
    console.error("Critical Error: Missing tokenPort environment variable. Please set it.");
    process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cookieParser());
const router = express.Router();


// create user
router.post('/', async (req, res) => {
    createHandler(req, res, usersDB, tokenPort);
});
// delete user
router.delete('/', async (req, res) => {
    deleteHandler(req, res, usersDB, tokenPort);
})


// create using google
router.get('/create/google', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
})
// create using apple
router.get('/create/apple', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
})


// get own profile information
router.get('/me', async (req, res) => {
    profileHandler(req, res, usersDB, tokenPort, subscriptionsDB);
})
// admin gets a list of all users
router.get('/list', async (req, res) => {
    listHandler(req, res, tokenPort, usersDB);
})


// admin changes permissionLevel of an user
router.put('/permission', async (req, res) => {
    permissionChangeHandler(req, res, usersDB, tokenPort)
})


// change password while logged in
router.put('/password-change', async (req, res) => {
    passwordChangeHandler(req, res, usersDB, tokenPort);
})
// request change password whith reset link-token
router.get('/password-reset/:email', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
})
// change password whith reset link-token
router.get('/password-reset/change/:token', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
})
// change password whith reset link-token
router.put('/password-reset/change/:token', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
})


app.use('/', router);

app.listen(port, () => {
    console.log(`users-backend running on port ${port}`);
});