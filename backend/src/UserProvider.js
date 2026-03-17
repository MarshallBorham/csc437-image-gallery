import { getEnvVar } from "./getEnvVar.js";

export class UserProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const collectionName = getEnvVar("USERS_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    async createUser(username, email, password) {
        const existing = await this.collection.findOne({ username });
        if (existing) {
            return null; // signals conflict
        }
        await this.collection.insertOne({ username, email, password });
        return true;
    }
}