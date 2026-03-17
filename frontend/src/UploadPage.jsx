import { useActionState, useState } from "react";
import { useNavigate } from "react-router";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }) {
    const [previewUrl, setPreviewUrl] = useState("");
    const navigate = useNavigate();

    const [result, dispatch, isPending] = useActionState(
        async (prevState, formData) => {
            try {
                const response = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${authToken}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    setPreviewUrl("");
                    return { error: `Upload failed: ${response.status} ${response.statusText}` };
                }

                const data = await response.json();
                navigate(`/images/${data.id}`);
                return null;
            } catch (e) {
                setPreviewUrl("");
                return { error: "Network error. Please try again." };
            }
        },
        null
    );

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const url = await readAsDataURL(file);
            setPreviewUrl(url);
        }
    }

    const fileInputId = crypto.randomUUID();

    return (
        <>
            <h2>Upload</h2>
            <form action={dispatch}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        disabled={isPending}
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isPending} />
                    </label>
                </div>
                {previewUrl && (
                    <div>
                        <img style={{ width: "20em", maxWidth: "100%" }} src={previewUrl} alt="" />
                    </div>
                )}
                <input type="submit" value="Confirm upload" disabled={isPending} />
            </form>
            <div aria-live="polite">
                {result?.error && <p>{result.error}</p>}
            </div>
        </>
    );
}