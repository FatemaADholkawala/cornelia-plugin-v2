"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Input, Spin, message as antMessage } from "antd";
import {
	ThunderboltOutlined,
	SendOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { ChatMessage } from "@/types";
import { findAndReplaceClause } from "@/utils/wordUtils";

/**
 * NegotiateModal Component
 *
 * Unified modal that combines Brainstorm and Redraft into one chat interface
 * - Displays both negotiation strategies and redraft suggestions in single messages
 * - Includes "Accept Changes" button for redraft results
 * - Preserves all existing Redraft Word integration functionality
 */
interface NegotiateModalProps {
	isVisible: boolean;
	onClose: () => void;
	selectedText: string;
	documentContent: string;
	negotiateMessages: ChatMessage[];
	setNegotiateMessages: (messages: ChatMessage[]) => void;
	negotiateLoading: boolean;
	onSubmit: (
		message: string,
		selectedText: string,
		documentContent: string
	) => void;
}

const NegotiateModal: React.FC<NegotiateModalProps> = ({
	isVisible,
	onClose,
	selectedText,
	documentContent,
	negotiateMessages,
	setNegotiateMessages,
	negotiateLoading,
	onSubmit,
}) => {
	const [input, setInput] = useState("");
	const [acceptedRedrafts, setAcceptedRedrafts] = useState<Set<string>>(
		new Set()
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Initialize with welcome message
	useEffect(() => {
		if (isVisible && negotiateMessages.length === 0) {
			setNegotiateMessages([
				{
					id: Date.now().toString(),
					role: "assistant",
					content:
						"Hi! I&apos;ll help you negotiate this clause. Tell me what improvements you&apos;d like to make.",
					isInitialTip: true,
					timestamp: new Date().toLocaleTimeString(),
				},
			]);
		}
	}, [isVisible]);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [negotiateMessages]);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!input.trim() || negotiateLoading) return;

		const messageText = input.trim();
		setInput("");
		await onSubmit(messageText, selectedText, documentContent);
	};

	/**
	 * handleAcceptChanges
	 *
	 * PRESERVED REDRAFT FUNCTIONALITY:
	 * Uses the same Word utilities as the original Redraft feature
	 * - findAndReplaceClause for Word document integration
	 * - Same error handling and success messages
	 */
	const handleAcceptChanges = async (
		redraftText: string,
		originalClause: string,
		messageId: string
	) => {
		try {
			// Check if we're in Office environment
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					// Use existing Word utility - preserves all original Redraft functionality
					const success = await findAndReplaceClause(
						context,
						originalClause,
						redraftText
					);

					if (success) {
						setAcceptedRedrafts((prev) => new Set([...prev, messageId]));
						antMessage.success("✅ Changes applied successfully");
					} else {
						throw new Error("Could not find the clause in the document");
					}
				});
			} else {
				// Browser environment - just update UI
				setAcceptedRedrafts((prev) => new Set([...prev, messageId]));
				antMessage.success("✅ Changes applied (UI only - not in Office)");
			}
		} catch (error: any) {
			console.error("Error accepting changes:", error);
			antMessage.error("Failed to apply changes: " + error.message);
		}
	};

	/**
	 * renderNegotiateMessage
	 *
	 * Special renderer for combined Brainstorm + Redraft responses
	 * - Parses JSON structure
	 * - Displays both sections clearly
	 * - Includes Accept Changes button for redraft
	 */
	const renderNegotiateMessage = (message: ChatMessage): React.ReactNode => {
		try {
			const data = JSON.parse(message.content);

			return (
				<div className="space-y-4">
					{/* Brainstorm Section */}
					{!data.hasBrainstormError && data.brainstorm && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<span className="text-base">💡</span>
								<h4 className="text-sm font-semibold text-blue-700">
									Negotiation Strategy:
								</h4>
							</div>
							<div className="pl-6 text-sm text-gray-800 leading-relaxed">
								{data.brainstorm}
							</div>
						</div>
					)}

					{data.hasBrainstormError && (
						<div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
							<p className="text-sm text-orange-700">
								⚠️ Negotiation strategies couldn&apos;t be loaded
							</p>
						</div>
					)}

					{/* Redraft Section */}
					{!data.hasRedraftError && data.redraft && (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span className="text-base">✍️</span>
								<h4 className="text-sm font-semibold text-green-700">
									Proposed Redraft:
								</h4>
							</div>
							<div className="pl-6 space-y-3">
								<div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm text-gray-800 leading-relaxed">
									{data.redraft}
								</div>

								{/* Accept Changes Button - preserves original Redraft behavior */}
								{!acceptedRedrafts.has(message.id || "") ? (
									<div className="flex items-center gap-2">
										<Button
											type="primary"
											size="small"
											icon={<CheckOutlined />}
											onClick={() =>
												handleAcceptChanges(
													data.redraft,
													data.originalClause,
													message.id || ""
												)
											}
											className="bg-green-500 hover:bg-green-600 border-green-500"
										>
											Accept Changes
										</Button>
										<span className="text-xs text-gray-500">
											This will replace the clause in your document
										</span>
									</div>
								) : (
									<div className="flex items-center gap-2 text-green-600">
										<CheckOutlined />
										<span className="text-sm font-medium">
											✅ Changes applied successfully
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{data.hasRedraftError && (
						<div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
							<p className="text-sm text-orange-700">
								⚠️ Redraft suggestions couldn&apos;t be loaded
							</p>
						</div>
					)}
				</div>
			);
		} catch (error) {
			console.error("Error parsing negotiate response:", error);
			return (
				<div className="text-sm text-red-600">Error displaying response</div>
			);
		}
	};

	const formatTimestamp = (timestamp: string): string => {
		if (typeof timestamp === "string") {
			const timeParts = timestamp.split(":");
			if (timeParts.length === 3) {
				const [hours, minutes, secondsWithAmPm] = timeParts;
				const amPm = secondsWithAmPm.split(" ")[1];
				return `${hours}:${minutes} ${amPm}`.toLowerCase();
			}
			return timestamp;
		}
		return new Date(timestamp)
			.toLocaleTimeString([], {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})
			.toLowerCase();
	};

	return (
		<Modal
			title={
				<div className="flex items-center gap-2">
					<ThunderboltOutlined className="text-blue-500" />
					<span>Help Me Negotiate</span>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={null}
			width="90vw"
			className="sm:max-w-[800px]"
			centered={true}
		>
			<div className="flex flex-col h-[500px]">
				{/* Selected Text Display */}
				<div className="mb-3 p-3 bg-gray-50 rounded text-sm border border-gray-200">
					<p className="font-semibold text-gray-700 mb-1">Selected Clause:</p>
					<div className="max-h-[60px] overflow-y-auto text-gray-600">
						{selectedText}
					</div>
				</div>

				{/* Chat Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded border border-gray-200">
					{negotiateMessages.map((message, index) => {
						const isSystemMessage = message.isInitialTip || message.isError;

						return (
							<div
								key={message.id || index}
								className={`animate-fadeIn ${
									isSystemMessage
										? "flex justify-center"
										: message.role === "user"
										? "flex flex-col items-end"
										: "flex flex-col items-start"
								}`}
								ref={
									index === negotiateMessages.length - 1 ? messagesEndRef : null
								}
							>
								{isSystemMessage ? (
									<div className="px-6 py-2.5 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">
										ℹ️ {message.content}
									</div>
								) : (
									<div className="space-y-1.5 max-w-[85%] group">
										<div
											className={`p-4 rounded-2xl ${
												message.role === "user"
													? "bg-blue-600 text-white shadow-sm"
													: "bg-white text-gray-800 shadow-md border border-gray-200"
											}`}
										>
											<div className="text-sm">
												{message.isNegotiateResponse
													? renderNegotiateMessage(message)
													: message.content}
											</div>
										</div>
										<div
											className={`text-xs opacity-70 group-hover:opacity-100 transition-opacity ${
												message.role === "user"
													? "text-right text-blue-700"
													: "text-left text-gray-600"
											}`}
										>
											{formatTimestamp(message.timestamp)}
										</div>
									</div>
								)}
							</div>
						);
					})}
					{negotiateLoading && (
						<div className="flex justify-center items-center p-4">
							<Spin size="small" />
						</div>
					)}
				</div>

				{/* Input Form */}
				<div className="mt-3 border-t pt-3">
					<form onSubmit={handleSubmit} className="flex items-center gap-3">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								negotiateLoading
									? "Processing your request..."
									: "How should we improve this clause?"
							}
							className="flex-grow rounded-full border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm"
							disabled={negotiateLoading}
						/>
						<Button
							type="text"
							htmlType="submit"
							icon={<SendOutlined />}
							disabled={negotiateLoading || !input.trim()}
							className={`flex items-center justify-center !p-2 transition-all duration-200 hover:scale-105 ${
								negotiateLoading || !input.trim()
									? "opacity-50 cursor-not-allowed"
									: "text-blue-600 hover:text-blue-700"
							}`}
						/>
					</form>
				</div>
			</div>
		</Modal>
	);
};

export default NegotiateModal;
