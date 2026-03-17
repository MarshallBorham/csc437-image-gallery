export function registerUserRoutes(app, credentialsProvider) {
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

        res.status(201).send();
    });
}