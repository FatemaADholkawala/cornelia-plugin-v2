"use client";

import { useState, useCallback } from "react";
import { ChatMessage } from "@/types";
import { analysisApi } from "@/services/api";

export const useBrainstorm = () => {
	const [isBrainstormModalVisible, setIsBrainstormModalVisible] =
		useState<boolean>(false);
	const [brainstormMessages, setBrainstormMessages] = useState<ChatMessage[]>(
		[]
	);
	const [brainstormLoading, setBrainstormLoading] = useState<boolean>(false);

	const handleBrainstormSubmit = useCallback(
		async (
			message: string,
			clauseText: string,
			analysis: string = "",
			documentContent: string
		): Promise<void> => {
			if (!message.trim()) return;

			const timestamp = new Date().toLocaleTimeString();

			const userMessage: ChatMessage = {
				id: Date.now().toString(),
				content: message,
				role: "user",
				timestamp: timestamp,
			};

			setBrainstormMessages((prev) => [...prev, userMessage]);
			setBrainstormLoading(true);

			try {
				const response = await analysisApi.brainstormChat(
					message,
					clauseText,
					analysis,
					documentContent
				);

				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content:
						response ||
						"I apologize, but I couldn't generate brainstorming ideas at this time.",
					role: "assistant",
					timestamp: new Date().toLocaleTimeString(),
				};

				setBrainstormMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				console.error("Error in brainstorm chat:", error);

				const errorMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					content:
						"Sorry, I encountered an error while processing your request.",
					role: "assistant",
					timestamp: new Date().toLocaleTimeString(),
					isError: true,
				};

				setBrainstormMessages((prev) => [...prev, errorMessage]);
			} finally {
				setBrainstormLoading(false);
			}
		},
		[]
	);

	const clearBrainstormMessages = useCallback((): void => {
		setBrainstormMessages([]);
	}, []);

	const openBrainstormModal = useCallback((): void => {
		setIsBrainstormModalVisible(true);
		setBrainstormMessages([]);
	}, []);

	const closeBrainstormModal = useCallback((): void => {
		setIsBrainstormModalVisible(false);
		setBrainstormMessages([]);
	}, []);

	return {
		isBrainstormModalVisible,
		setIsBrainstormModalVisible,
		brainstormMessages,
		setBrainstormMessages,
		brainstormLoading,
		handleBrainstormSubmit,
		clearBrainstormMessages,
		openBrainstormModal,
		closeBrainstormModal,
	};
};
