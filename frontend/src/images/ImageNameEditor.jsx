import { useState } from "react";

export function ImageNameEditor({ imageId, initialValue, onNameSaved, authToken }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
    }

    async function handleSubmitPressed() {
        setError("");
        setIsLoading(true);
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: nameInput })
            });
            if (!response.ok) {
                throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
            }
            onNameSaved(nameInput);
            setIsEditingName(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name
                    <input
                        required
                        disabled={isLoading}
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                    />
                </label>
                <button disabled={nameInput.length === 0 || isLoading} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                <div aria-live="polite">
                    {isLoading && <p>Renaming image...</p>}
                    {error && <p>{error}</p>}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}