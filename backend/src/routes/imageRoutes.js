import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(app, imageProvider) {
    app.get("/api/images", async (req, res) => {
        await waitDuration(1000);
        const images = await imageProvider.getAllImages();
        res.json(images);
    });

    app.get("/api/images/:id", async (req, res) => {
        const imageId = req.params.id;

        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        const image = await imageProvider.getOneImage(imageId);
        if (!image) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        res.json(image);
    });

    app.patch("/api/images/:id", async (req, res) => {
        const imageId = req.params.id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({
                error: "Bad Request",
                message: "Request body must include a 'name' field"
            });
        }

        if (name.length > MAX_NAME_LENGTH) {
            return res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        const image = await imageProvider.getOneImage(imageId);
        if (!image) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        if (image.authorId !== req.userInfo.username) {
            return res.status(403).send({
                error: "Forbidden",
                message: "This user does not own this image"
            });
        }

        const matchedCount = await imageProvider.updateImageName(imageId, name);
        if (matchedCount === 0) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        res.status(204).send();
    });
}