"use client";

import { useEffect, useState } from "react";

export default function OfficeLoader({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOfficeReady, setIsOfficeReady] = useState(false);

	useEffect(() => {
		// Only load office.js if it's not already injected by Office
		if (!window.Office) {
			const script = document.createElement("script");
			script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
			script.async = true;
			script.onload = () => {
				console.log("✅ office.js loaded");
				window.Office?.onReady(() => setIsOfficeReady(true));
			};
			document.body.appendChild(script);
		} else {
			window.Office.onReady(() => setIsOfficeReady(true));
		}
	}, []);

	if (!isOfficeReady) {
		return <div className="p-4">Loading Office Add-in…</div>;
	}

	return <>{children}</>;
}
