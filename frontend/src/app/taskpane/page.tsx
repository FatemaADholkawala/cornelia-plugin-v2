"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import AppContent from "@/components/AppContent";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TaskpanePage() {
	const { isAuthenticated, isLoading } = useAuth();
	const [isOfficeReady, setIsOfficeReady] = useState(false);

	useEffect(() => {
		// Load Office.js for Office Add-in environment
		if (!window.Office) {
			const script = document.createElement("script");
			script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
			script.async = true;
			script.onload = () => {
				console.log("✅ Office.js loaded");
				window.Office?.onReady(() => setIsOfficeReady(true));
			};
			document.body.appendChild(script);
		} else {
			window.Office.onReady(() => setIsOfficeReady(true));
		}
	}, []);

	// Show loading while Office.js is loading or auth is loading
	if (isLoading || !isOfficeReady) {
		return <LoadingSpinner />;
	}

	// Show login if not authenticated
	if (!isAuthenticated) {
		return <Login />;
	}

	// Show main application content
	return <AppContent />;
}
