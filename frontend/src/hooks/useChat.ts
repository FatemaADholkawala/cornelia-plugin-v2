"use client";

import { useState, useCallback } from "react";
import { ChatMessage } from "@/types";
import { analysisApi } from "@/services/api";

export const useChat = (documentContent: string) => {
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatLoading, setChatLoading] = useState<boolean>(false);
	const [chatError, setChatError] = useState<string | null>(null);

	const handleChatSubmit = useCallback(
		async (message: string): Promise<void> => {
			if (!message.trim()) return;

			const userMessage: ChatMessage = {
				id: Date.now().toString(),
				content: message,
				role: "user",
				timestamp: new Date().toISOString(),
			};

			setChatMessages((prev) => [...prev, userMessage]);
			setChatLoading(true);
			setChatError(null);

			try {
				const response = await analysisApi.performAnalysis(
					"ask",
					message,
					"chat.docx"
				);

				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content:
						response ||
						"I apologize, but I couldn't process your request at this time.",
					role: "assistant",
					timestamp: new Date().toISOString(),
				};

				setChatMessages((prev) => [...prev, assistantMessage]);
			} catch (error: any) {
				console.error("Error in chat:", error);
				setChatError(error.message || "Failed to process your message");

				const errorMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content:
						"I apologize, but I encountered an error processing your request. Please try again.",
					role: "assistant",
					timestamp: new Date().toISOString(),
				};

				setChatMessages((prev) => [...prev, errorMessage]);
			} finally {
				setChatLoading(false);
			}
		},
		[]
	);

	const clearChat = useCallback((): void => {
		setChatMessages([]);
		setChatError(null);
	}, []);

	const addSystemMessage = useCallback((content: string): void => {
		const systemMessage: ChatMessage = {
			id: Date.now().toString(),
			content,
			role: "assistant",
			timestamp: new Date().toISOString(),
		};
		setChatMessages((prev) => [...prev, systemMessage]);
	}, []);

	return {
		chatMessages,
		setChatMessages,
		chatLoading,
		chatError,
		handleChatSubmit,
		clearChat,
		addSystemMessage,
	};
};
