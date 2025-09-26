"use client";

import { useState, useCallback } from "react";
import { analysisApi } from "@/services/api";

export const useSummary = (documentContent: string) => {
	const [summary, setSummary] = useState<string>("");
	const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
	const [summaryProgress, setSummaryProgress] = useState<number>(0);
	const [summaryError, setSummaryError] = useState<string | null>(null);
	const [homeSummaryLoading, setHomeSummaryLoading] = useState<boolean>(false);
	const [homeSummaryReady, setHomeSummaryReady] = useState<boolean>(false);

	// Common function for generating summary
	const generateSummary = async (
		setLoading: (loading: boolean) => void,
		setReady: (ready: boolean) => void = () => {}
	) => {
		if (!documentContent) {
			setSummaryError("Please read the document first");
			return;
		}

		setLoading(true);
		setSummaryError(null);
		setSummaryProgress(0);

		try {
			// Start a progress simulation
			let simulatedProgress = 0;
			const progressInterval = setInterval(() => {
				if (simulatedProgress < 90) {
					// Only simulate up to 90%
					simulatedProgress += Math.random() * 10; // Random increment between 0-10
					setSummaryProgress(Math.min(Math.round(simulatedProgress), 90));
				}
			}, 500); // Update every 500ms

			const result = await analysisApi.performAnalysis(
				"shortSummary",
				documentContent,
				"document"
			);

			// Clear the interval and set to 100% when complete
			clearInterval(progressInterval);
			setSummaryProgress(100);

			if (result) {
				setSummary(result);
				setReady(true);
			} else {
				throw new Error("No result received from analysis");
			}
		} catch (error: any) {
			setSummaryError(error.message || "Analysis failed");
		} finally {
			setLoading(false);
			// Don't reset progress to 0 immediately - let it show 100% briefly
			setTimeout(() => setSummaryProgress(0), 500);
		}
	};

	const handleGenerateSummary = useCallback(() => {
		generateSummary(setSummaryLoading);
	}, [documentContent]);

	const handleHomeSummaryClick = useCallback(() => {
		if (homeSummaryReady || summary) return; // Avoid redundant API calls

		generateSummary(setHomeSummaryLoading, () => setHomeSummaryReady(true));
	}, [documentContent, homeSummaryReady, summary]);

	return {
		summary,
		summaryLoading,
		summaryProgress,
		summaryError,
		homeSummaryLoading,
		homeSummaryReady,
		handleGenerateSummary,
		handleHomeSummaryClick,
	};
};
