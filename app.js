
import express from 'express';
import cookieParser from 'cookie-parser'
import createHandler from "./routes/POST.js";
import deleteHandler from "./routes/DELETE.js";
import profileHandler from "./routes/me/GET.js";
import listHandler from "./routes/list/GET.js";
import permissionChangeHandler from "./routes/permission/PUT.js";

const port = process.env.PORT || 4600;
const usersDB = process.env.USERS_DB_PORT || 11300;
const subscriptionsDB = process.env.SUBSCRIPTIONS_DB_PORT || 11200;
const tokenPort = process.env.TOKEN_PORT || 11000;

if (!port) {
    console.error("Critical Error: Missing PORT environment variable. Please set it.");
    process.exit(1);
}
if (!usersDB) {
    console.error("Critical Error: Missing usersdb port environment variable. Please set it.");
    process.exit(1);
}
if (!subscriptionsDB) {
    console.error("Critical Error: Missing subscriptionsdb port environment variable. Please set it.");
    process.exit(1);
}
if (!tokenPort) {
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
    listHandler(req, res);
})


// admin changes permissionLevel of an user
router.put('/permission', async (req, res) => {
    permissionChangeHandler(req, res, usersDB, tokenPort)
})


// change password while logged in
router.put('/password-change', async (req, res) => {
    return res.status(404).send('We are sorry, this feature has not been implemented yet.');
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