"use client";

import { useState, useCallback } from "react";
import { ChatMessage } from "@/types";
import { analysisApi } from "@/services/api";

/**
 * useNegotiate Hook
 *
 * This hook merges Brainstorm and Redraft functionality into a single unified negotiation experience.
 *
 * MERGE POINT: Both /brainstorm and /redraft APIs are called together
 * - Brainstorm provides negotiation strategies
 * - Redraft provides improved clause text
 * - Results are combined into a single chat message
 */
export const useNegotiate = () => {
	const [isNegotiateModalVisible, setIsNegotiateModalVisible] =
		useState<boolean>(false);
	const [negotiateMessages, setNegotiateMessages] = useState<ChatMessage[]>([]);
	const [negotiateLoading, setNegotiateLoading] = useState<boolean>(false);

	/**
	 * handleNegotiateSubmit
	 *
	 * Core merge logic: Calls both Brainstorm and Redraft APIs, then combines responses
	 *
	 * @param message - User's negotiation request
	 * @param selectedText - The clause text to analyze/redraft
	 * @param documentContent - Full document for context
	 */
	const handleNegotiateSubmit = useCallback(
		async (
			message: string,
			selectedText: string,
			documentContent: string
		): Promise<void> => {
			if (!message.trim()) return;

			const timestamp = new Date().toLocaleTimeString();

			// Add user message to chat
			const userMessage: ChatMessage = {
				id: Date.now().toString(),
				content: message,
				role: "user",
				timestamp: timestamp,
			};

			setNegotiateMessages((prev) => [...prev, userMessage]);
			setNegotiateLoading(true);

			try {
				// ===== MERGE POINT: Call both APIs in parallel =====
				const [brainstormResult, redraftResult] = await Promise.allSettled([
					// API 1: Brainstorm - Get negotiation strategies
					analysisApi.brainstormChat(
						message,
						selectedText,
						"", // analysis not needed here
						documentContent
					),
					// API 2: Redraft - Get improved clause text
					analysisApi.redraftText(selectedText, documentContent, message),
				]);

				// Process Brainstorm result
				let brainstormContent = "";
				let brainstormError = false;
				if (brainstormResult.status === "fulfilled") {
					brainstormContent = brainstormResult.value || "";
				} else {
					console.error("Brainstorm API failed:", brainstormResult.reason);
					brainstormContent = "";
					brainstormError = true;
				}

				// Process Redraft result
				let redraftContent = "";
				let redraftError = false;
				if (redraftResult.status === "fulfilled") {
					redraftContent = redraftResult.value || "";
				} else {
					console.error("Redraft API failed:", redraftResult.reason);
					redraftContent = "";
					redraftError = true;
				}

				// ===== COMBINE RESPONSES =====
				// Structure: brainstorm text + redraft text with metadata
				const combinedResponse = {
					brainstorm: brainstormContent,
					redraft: redraftContent,
					originalClause: selectedText,
					hasBrainstormError: brainstormError,
					hasRedraftError: redraftError,
				};

				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content: JSON.stringify(combinedResponse),
					role: "assistant",
					timestamp: new Date().toLocaleTimeString(),
					isNegotiateResponse: true, // Flag to identify merged responses
				};

				setNegotiateMessages((prev) => [...prev, assistantMessage]);

				// Show error banner if both failed
				if (brainstormError && redraftError) {
					const errorMessage: ChatMessage = {
						id: (Date.now() + 2).toString(),
						content:
							"Both negotiation strategies and redraft suggestions failed. Please try again.",
						role: "assistant",
						timestamp: new Date().toLocaleTimeString(),
						isError: true,
					};
					setNegotiateMessages((prev) => [...prev, errorMessage]);
				}
			} catch (error) {
				console.error("Error in negotiate chat:", error);

				const errorMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content:
						"Sorry, I encountered an error while processing your negotiation request.",
					role: "assistant",
					timestamp: new Date().toLocaleTimeString(),
					isError: true,
				};

				setNegotiateMessages((prev) => [...prev, errorMessage]);
			} finally {
				setNegotiateLoading(false);
			}
		},
		[]
	);

	const openNegotiateModal = useCallback((): void => {
		setIsNegotiateModalVisible(true);
		setNegotiateMessages([]);
	}, []);

	const closeNegotiateModal = useCallback((): void => {
		setIsNegotiateModalVisible(false);
		setNegotiateMessages([]);
	}, []);

	return {
		isNegotiateModalVisible,
		setIsNegotiateModalVisible,
		negotiateMessages,
		setNegotiateMessages,
		negotiateLoading,
		handleNegotiateSubmit,
		openNegotiateModal,
		closeNegotiateModal,
	};
};
