import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { getAuth, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, provider } from "./components/authentication/initAuth";

function LoginPage() {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const handleLogin = async () => {
		setLoading(true);
		setError("");
		try {
			await signInWithPopup(auth, provider);
		} catch (err: any) {
			setError(err.message);
		}
		setLoading(false);
	};
	return (
		<div className="flex items-center justify-center h-screen bg-gray-50">
			<div className="bg-white p-8 rounded shadow w-80 flex flex-col items-center">
				<h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
				{error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
				<button
					onClick={handleLogin}
					className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
					disabled={loading}
				>
					{loading ? "Logging in..." : "Sign in with Google"}
				</button>
			</div>
		</div>
	);
}

function Root() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if(firebaseUser) {
                const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS || "").split(",");
                if (!allowedEmails.includes(firebaseUser.email || "")) {
                    // Show access denied and sign out
                    auth.signOut();
                    alert("Access Denied");
                    setLoading(false);
                    return;
                }
            }
			setUser(firebaseUser);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);
	if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
	return user ? <App /> : <LoginPage />;
}

createRoot(document.getElementById("root")!).render(<Root />);
