import { getEnvVar } from "./getEnvVar.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.credsCollection = this.mongoClient.db().collection(
            getEnvVar("CREDS_COLLECTION_NAME")
        );
        this.usersCollection = this.mongoClient.db().collection(
            getEnvVar("USERS_COLLECTION_NAME")
        );
    }

    async registerUser(username, email, password) {
        const existing = await this.credsCollection.findOne({ username });
        if (existing) {
            return false;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await this.credsCollection.insertOne({
            username,
            password: hashedPassword
        });

        await this.usersCollection.insertOne({
            username,
            email
        });

        return true;
    }

    async verifyPassword(username, password) {
        const creds = await this.credsCollection.findOne({ username });
        if (!creds) {
            return false;
        }
        return bcrypt.compare(password, creds.password);
    }
}