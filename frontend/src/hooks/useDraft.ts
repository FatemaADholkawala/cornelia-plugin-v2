"use client";

import { useState, useCallback } from "react";
import { analysisApi } from "@/services/api";

export const useDraft = () => {
	const [isDraftModalVisible, setIsDraftModalVisible] =
		useState<boolean>(false);
	const [draftPrompt, setDraftPrompt] = useState<string>("");
	const [isDrafting, setIsDrafting] = useState<boolean>(false);
	const [draftResult, setDraftResult] = useState<string | null>(null);

	const handleDraftSubmit = useCallback(
		async (location: string = "current"): Promise<void> => {
			if (!draftPrompt.trim()) return;

			setIsDrafting(true);
			setDraftResult(null);

			try {
				const result = await analysisApi.draftText(draftPrompt);
				setDraftResult(result);

				// Handle the location parameter
				if (location === "current") {
					// Insert at current cursor position in Word
					if (
						typeof window !== "undefined" &&
						typeof Office !== "undefined" &&
						Office.context &&
						Office.context.document &&
						typeof Word !== "undefined"
					) {
						await Word.run(async (context) => {
							const selection = context.document.getSelection();
							selection.insertText(result, Word.InsertLocation.start);
							await context.sync();
						});
					}
				} else if (location === "new") {
					// Create new document
					if (
						typeof window !== "undefined" &&
						typeof Office !== "undefined" &&
						Office.context &&
						Office.context.document &&
						typeof Word !== "undefined"
					) {
						await Word.run(async (context) => {
							const newDoc = context.application.createDocument();
							const body = newDoc.body;
							body.insertText(result, Word.InsertLocation.start);
							await context.sync();
						});
					}
				}
			} catch (error) {
				console.error("Error in draft generation:", error);
				setDraftResult(
					"I apologize, but I encountered an error generating the draft. Please try again."
				);
			} finally {
				setIsDrafting(false);
			}
		},
		[draftPrompt]
	);

	const handleCloseDraftModal = useCallback((): void => {
		setIsDraftModalVisible(false);
		setDraftPrompt("");
		setDraftResult(null);
	}, []);

	const openDraftModal = useCallback((): void => {
		setIsDraftModalVisible(true);
		setDraftPrompt("");
		setDraftResult(null);
	}, []);

	const clearDraft = useCallback((): void => {
		setDraftPrompt("");
		setDraftResult(null);
	}, []);

	return {
		isDraftModalVisible,
		setIsDraftModalVisible,
		draftPrompt,
		setDraftPrompt,
		isDrafting,
		draftResult,
		setDraftResult,
		handleDraftSubmit,
		handleCloseDraftModal,
		openDraftModal,
		clearDraft,
	};
};
