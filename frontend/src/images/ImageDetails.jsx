import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.jsx";

export function ImageDetails({ authToken }) {
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch(`/api/images/${id}`, {
                    headers: { "Authorization": `Bearer ${authToken}` }
                });
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setImage(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }
        doFetch();
    }, [id, authToken]);

    function handleNameSaved(newName) {
        setImage({ ...image, name: newName });
    }

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!image) return <h2>Image not found</h2>;

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor
                imageId={id}
                initialValue={image.name}
                onNameSaved={handleNameSaved}
                authToken={authToken}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    );
}