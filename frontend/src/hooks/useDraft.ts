"use client";

import { useState, useCallback } from "react";
import { message } from "antd";
import { analysisApi } from "@/services/api";

export const useDraft = () => {
	const [isDraftModalVisible, setIsDraftModalVisible] =
		useState<boolean>(false);
	const [draftPrompt, setDraftPrompt] = useState<string>("");
	const [isDrafting, setIsDrafting] = useState<boolean>(false);

	const handleDraftSubmit = useCallback(
		async (draftLocation: string = "current"): Promise<void> => {
			if (!draftPrompt.trim()) {
				message.warning("Please enter a prompt for the draft");
				return;
			}

			setIsDrafting(true);
			setIsDraftModalVisible(false);

			try {
				const result = await analysisApi.draftText(draftPrompt);

				if (result) {
					if (draftLocation === "current") {
						// Insert into current document
						await insertDraftIntoWord(result);
						message.success("Draft generated and inserted into document!");
					} else {
						// Create new document and insert
						await createNewDocumentWithDraft(result);
						message.success("Draft generated in new document!");
					}
					setDraftPrompt("");
				} else {
					message.error("Failed to generate draft");
				}
			} catch (error: any) {
				console.error("Error generating draft:", error);
				message.error(
					"Failed to generate draft: " +
						(error.response?.data?.error || error.message)
				);
			} finally {
				setIsDrafting(false);
			}
		},
		[draftPrompt]
	);

	// Function to create a new document and insert the draft
	const createNewDocumentWithDraft = async (
		draftText: string
	): Promise<void> => {
		try {
			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					// Create a new document
					const newDoc = context.application.createDocument();
					await context.sync();

					// Get the new document's body
					const body = newDoc.body;

					// Convert markdown formatting to HTML
					const formattedHtml = convertToWordHtml(draftText);

					// Insert as HTML to preserve formatting
					body.insertHtml(formattedHtml, Word.InsertLocation.start);

					// Open the document in a new window
					newDoc.open();
					await context.sync();
				});
			} else {
				console.log(
					"Not in Office environment - new document creation not available"
				);
			}
		} catch (error) {
			console.error("Error creating new document:", error);
			throw error;
		}
	};

	// Function to insert draft into current document
	const insertDraftIntoWord = async (draftText: string): Promise<void> => {
		try {
			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					const selection = context.document.getSelection();

					// Convert markdown formatting to HTML
					const formattedHtml = convertToWordHtml(draftText);

					// Insert as HTML to preserve formatting
					selection.insertHtml(formattedHtml, Word.InsertLocation.end);
					await context.sync();
				});
			} else {
				console.log(
					"Not in Office environment - draft insertion not available"
				);
			}
		} catch (error) {
			console.error("Error inserting draft into Word:", error);
			throw error;
		}
	};

	// Function to convert markdown-style text to Word-compatible HTML
	const convertToWordHtml = (text: string): string => {
		if (!text) return "";

		let htmlText = text;

		// Convert **text** to bold
		htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

		// Convert *text* to italic (only single asterisks that aren't part of double asterisks)
		htmlText = htmlText.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");

		// Convert line breaks to proper paragraphs
		htmlText = htmlText.replace(/\n\n/g, "</p><p>");
		htmlText = htmlText.replace(/\n/g, "<br>");

		// Wrap in paragraph tags
		htmlText = `<p>${htmlText}</p>`;

		// Handle section headers (all caps text)
		htmlText = htmlText.replace(
			/<p>([A-Z\s]{3,}):?\s*<\/p>/g,
			"<p><strong>$1</strong></p>"
		);

		// Handle numbered lists and subsections
		htmlText = htmlText.replace(/(\d+\.\s+)/g, "<strong>$1</strong>");
		htmlText = htmlText.replace(/(\d+\.\d+\.\s+)/g, "<strong>$1</strong>");
		htmlText = htmlText.replace(/([a-z]\.\s+)/g, "<strong>$1</strong>");
		htmlText = htmlText.replace(/\(([a-z])\)/g, "<strong>($1)</strong>");

		// Handle legal terms
		htmlText = htmlText.replace(
			/(WHEREAS|NOW THEREFORE|RECITALS)/g,
			"<strong><u>$1</u></strong>"
		);

		return htmlText;
	};

	const handleCloseDraftModal = useCallback((): void => {
		setIsDraftModalVisible(false);
		setDraftPrompt("");
	}, []);

	return {
		isDraftModalVisible,
		setIsDraftModalVisible,
		draftPrompt,
		setDraftPrompt,
		isDrafting,
		handleDraftSubmit,
		handleCloseDraftModal,
	};
};
