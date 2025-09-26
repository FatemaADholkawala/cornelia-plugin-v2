"use client";

import { useState, useCallback } from "react";
import { ChatMessage } from "@/types";
import { analysisApi } from "@/services/api";

export const useChat = (documentContent: string) => {
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatLoading, setChatLoading] = useState<boolean>(false);
	const [chatError, setChatError] = useState<string | null>(null);

	const handleChatSubmit = useCallback(
		async (
			message: string,
			selectedText?: string,
			documentContent?: string
		): Promise<void> => {
			const trimmedInput = message.trim();
			if (!trimmedInput || chatLoading) return;

			const timestamp = new Date().toLocaleTimeString();

			// Append user message immediately
			setChatMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: "user",
					content: trimmedInput,
					timestamp,
				},
			]);

			setChatLoading(true);
			setChatError(null);

			try {
				// Format the conversation history with last 20 messages
				const conversationHistory = chatMessages
					.slice(-20) // Take only the last 20 messages
					.map((msg) => `${msg.role}: ${msg.content}`)
					.join("\n");

				const result = await analysisApi.performAnalysis(
					"ask",
					`Document Content:\n${documentContent}\n\nConversation History:\n${conversationHistory}\n\nQuestion: ${trimmedInput}`,
					"document"
				);

				if (!result) {
					throw new Error("Empty response from performAnalysis");
				}

				// Append assistant response
				setChatMessages((prev) => [
					...prev,
					{
						id: (Date.now() + 1).toString(),
						role: "assistant",
						content: result,
						timestamp: new Date().toLocaleTimeString(),
					},
				]);
			} catch (error: any) {
				console.error("Chat error:", error);
				setChatError(error.message || "An unknown error occurred.");

				// Append error message
				setChatMessages((prev) => [
					...prev,
					{
						id: (Date.now() + 1).toString(),
						role: "assistant",
						content: "Sorry, I encountered an error. Please try again.",
						timestamp: new Date().toLocaleTimeString(),
						isError: true,
					},
				]);
			} finally {
				setChatLoading(false);
			}
		},
		[chatMessages, documentContent, chatLoading]
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
