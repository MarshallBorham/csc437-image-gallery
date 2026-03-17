import { MongoClient, ObjectId } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    getAllImages() {
        const pipeline = [];
        pipeline.push({
            $lookup: {
                from: getEnvVar("USERS_COLLECTION_NAME"),
                localField: "authorId",
                foreignField: "username",
                as: "author"
            }
        });
        pipeline.push({
            $addFields: {
                author: { $first: "$author" }
            }
        });
        return this.collection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        const pipeline = [];
        pipeline.push({ $match: { _id: new ObjectId(imageId) } });
        pipeline.push({
            $lookup: {
                from: getEnvVar("USERS_COLLECTION_NAME"),
                localField: "authorId",
                foreignField: "username",
                as: "author"
            }
        });
        pipeline.push({
            $addFields: {
                author: { $first: "$author" }
            }
        });
        const results = await this.collection.aggregate(pipeline).toArray();
        return results[0] || null;
    }

    async updateImageName(imageId, newName) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }

    async createImage(src, name, authorId) {
        const result = await this.collection.insertOne({ src, name, authorId });
        return result.insertedId;
    }
}