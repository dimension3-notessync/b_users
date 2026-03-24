
import express from 'express';
import createHandler from "./routes/POST.js";
import deleteHandler from "./routes/DELETE.js";
import profileHandler from "./routes/me/GET.js";

const port = process.env.PORT || 4600;
const databasePort = process.env.DATABASE_PORT || 11300;
const tokenPort = process.env.TOKEN_PORT || 11000;

if (!port) {
    console.error("Critical Error: Missing PORT environment variable. Please set it.");
    process.exit(1);
}
if (!databasePort) {
    console.error("Critical Error: Missing databasePort environment variable. Please set it.");
    process.exit(1);
}
if (!tokenPort) {
    console.error("Critical Error: Missing tokenPort environment variable. Please set it.");
    process.exit(1);
}

const app = express();
app.use(express.json());
const router = express.Router();


// create user
router.post('/', async (req, res) => {
    createHandler(req, res, databasePort, tokenPort);
});

// delete user
router.delete('/', async (req, res) => {
    deleteHandler(req, res, databasePort);
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
    profileHandler(req, res, databasePort, tokenPort);
})

app.use('/api/users', router);

app.listen(port, () => {
    console.log(`users-backend running on port ${port}`);
});