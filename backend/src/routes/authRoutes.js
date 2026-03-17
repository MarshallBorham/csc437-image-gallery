import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = { username };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, credentialsProvider) {
    app.post("/api/users", async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password"
            });
        }

        const result = await credentialsProvider.registerUser(username, email, password);
        if (!result) {
            return res.status(409).send({
                error: "Conflict",
                message: "Username already taken"
            });
        }

        const token = await generateAuthToken(username);
        res.status(201).send({ token });
    });

    app.post("/api/auth/tokens", async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
        }

        const isValid = await credentialsProvider.verifyPassword(username, password);
        if (!isValid) {
            return res.status(401).send({
                error: "Unauthorized",
                message: "Incorrect username or password"
            });
        }

        const token = await generateAuthToken(username);
        res.status(200).send({ token });
    });
}