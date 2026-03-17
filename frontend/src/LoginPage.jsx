import { useActionState } from "react";
import { Link } from "react-router";
import "./LoginPage.css";

async function handleRegistration(prevState, formData) {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (response.status === 409) {
            return { error: "Username already taken. Please choose another." };
        }
        if (!response.ok) {
            return { error: "Account creation failed. Please try again." };
        }

        const data = await response.json();
        return { token: data.token };
    } catch (e) {
        return { error: "Network error. Please try again." };
    }
}

async function handleLogin(prevState, formData) {
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch("/api/auth/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 401) {
            return { error: "Incorrect username or password." };
        }
        if (!response.ok) {
            return { error: "Login failed. Please try again." };
        }

        const data = await response.json();
        return { token: data.token };
    } catch (e) {
        return { error: "Network error. Please try again." };
    }
}

export function LoginPage({ isRegistering, onAuthTokenReceived }) {
    const [result, dispatch, isPending] = useActionState(
        isRegistering ? handleRegistration : handleLogin,
        null
    );

    if (result?.token) {
        onAuthTokenReceived(result.token);
    }

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={dispatch}>
                <label>
                    Username
                    <input name="username" required disabled={isPending} />
                </label>
                {isRegistering && (
                    <label>
                        Email
                        <input name="email" type="email" required disabled={isPending} />
                    </label>
                )}
                <label>
                    Password
                    <input name="password" type="password" required disabled={isPending} />
                </label>
                <input type="submit" value="Submit" disabled={isPending} />
            </form>
            <div aria-live="polite">
                {result?.error && <p>{result.error}</p>}
            </div>
            {isRegistering ? (
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            ) : (
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            )}
        </>
    );
}