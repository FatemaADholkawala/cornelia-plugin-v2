"use client";

import { useState, useCallback } from "react";
import { DocumentSummary } from "@/types";
import { analysisApi } from "@/services/api";

export const useSummary = (
	documentContent: string,
	setActiveView: (view: any) => void
) => {
	const [summary, setSummary] = useState<DocumentSummary | null>(null);
	const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
	const [summaryProgress, setSummaryProgress] = useState<number>(0);
	const [summaryError, setSummaryError] = useState<string | null>(null);
	const [homeSummaryLoading, setHomeSummaryLoading] = useState<boolean>(false);
	const [homeSummaryReady, setHomeSummaryReady] = useState<boolean>(false);

	const handleGenerateSummary = useCallback(async (): Promise<void> => {
		if (!documentContent) return;

		setSummaryLoading(true);
		setSummaryError(null);
		setSummaryProgress(0);

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setSummaryProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return prev;
					}
					return prev + Math.random() * 20;
				});
			}, 200);

			const result = await analysisApi.performAnalysis(
				"summary",
				documentContent,
				"document.docx",
				(fileName, progress) => {
					setSummaryProgress(progress);
				}
			);

			clearInterval(progressInterval);
			setSummaryProgress(100);

			if (result) {
				setSummary({
					content: result,
					keyPoints: [
						"Key contractual terms and conditions",
						"Payment and delivery schedules",
						"Intellectual property rights",
						"Termination and dispute resolution",
						"Confidentiality and compliance requirements",
					],
					timestamp: new Date().toISOString(),
				});
			} else {
				throw new Error("Failed to generate summary");
			}
		} catch (error: any) {
			console.error("Error generating summary:", error);
			setSummaryError(error.message || "Failed to generate summary");
		} finally {
			setSummaryLoading(false);
		}
	}, [documentContent]);

	const handleHomeSummaryClick = useCallback(async (): Promise<void> => {
		setHomeSummaryLoading(true);
		setHomeSummaryReady(false);

		try {
			// Simulate a quick summary for home view
			await new Promise((resolve) => setTimeout(resolve, 2000));

			setSummary({
				content:
					"This document contains a comprehensive service agreement with standard terms including payment schedules, deliverables, intellectual property rights, and dispute resolution mechanisms. The agreement appears to be well-structured with clear obligations for both parties.",
				keyPoints: [
					"2-year service agreement",
					"Monthly payment terms",
					"Standard IP ownership clauses",
					"30-day termination notice",
					"Confidentiality requirements",
				],
				timestamp: new Date().toISOString(),
			});

			setHomeSummaryReady(true);
			setActiveView("summary");
		} catch (error) {
			console.error("Error generating home summary:", error);
		} finally {
			setHomeSummaryLoading(false);
		}
	}, [setActiveView]);

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
