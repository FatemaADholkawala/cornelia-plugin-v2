"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import TaskpanePage from "./taskpane/page";
import Test from "./test/page";

export default function Home() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	useEffect(() => {
		// Redirect to taskpane as the default path for Office Add-in
		if (isAuthenticated && !isLoading) {
			router.push("/taskpane");
		}
	}, [isAuthenticated, isLoading, router]);
	if (isLoading) {
		return <LoadingSpinner />;
	}
	//Show loading while redirecting
	return <LoadingSpinner />;
}
