"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Modal,
	Button,
	Input,
	Spin,
	message as antMessage,
	Tooltip,
	Typography,
} from "antd";
import {
	ThunderboltOutlined,
	SendOutlined,
	CheckOutlined,
	InfoCircleOutlined,
	BulbOutlined,
	EditOutlined,
} from "@ant-design/icons";
import { ChatMessage } from "@/types";
import { findAndReplaceClause, findClauseInDocument } from "@/utils/wordUtils";

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
	setSelectedText?: (text: string) => void; // To update parent's selected text
	// Redraft state management props
	onRedraftedClausesChange?: (clauses: Set<string>) => void;
	onRedraftedTextsChange?: (texts: Map<string, string>) => void;
	redraftedClauses?: Set<string>;
	redraftedTexts?: Map<string, string>;
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
	setSelectedText,
	onRedraftedClausesChange,
	onRedraftedTextsChange,
	redraftedClauses = new Set(),
	redraftedTexts = new Map(),
}) => {
	const [input, setInput] = useState("");
	const [acceptedRedrafts, setAcceptedRedrafts] = useState<Set<string>>(
		new Set()
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	/**
	 * extractClauseText
	 *
	 * Extracts the actual clause text from the redraft API response.
	 * The API returns formatted text with headers like "**Redrafted Version:**"
	 * and "**Key Improvements:**". We need only the clause text itself.
	 *
	 * ROBUST EXTRACTION: Handles multiple response formats and edge cases
	 *
	 * @param redraftResponse - Full response from redraft API
	 * @returns Cleaned clause text without headers or metadata
	 */
	const extractClauseText = (redraftResponse: string): string => {
		if (!redraftResponse) return "";

		let clauseText = redraftResponse;

		console.log("🔍 Extracting clause from response:", {
			fullResponsePreview: clauseText.substring(0, 200),
			fullLength: clauseText.length,
		});

		// Strategy 1: Look for section markers and extract content between them
		const redraftSectionMarkers = [
			/\*\*Redrafted Version:\*\*\s*/i,
			/\*\*Redraft:\*\*\s*/i,
			/\*\*Revised Clause:\*\*\s*/i,
			/\*\*Proposed (Redraft|Clause|Version):\*\*\s*/i,
			/\*\*New Version:\*\*\s*/i,
			/\*\*Suggested Text:\*\*\s*/i,
		];

		let extractedText = clauseText;
		let headerFound = false;

		// Try to find and remove the header
		for (const pattern of redraftSectionMarkers) {
			const match = extractedText.match(pattern);
			if (match) {
				extractedText = extractedText.substring(match.index! + match[0].length);
				headerFound = true;
				console.log("✅ Found header:", match[0]);
				break;
			}
		}

		// Find the end: before metadata sections (improvements, explanations, etc.)
		const metadataSectionMarkers = [
			/\n\s*\*\*Key Improvements/i,
			/\n\s*\*\*Improvements/i,
			/\n\s*\*\*Notes/i,
			/\n\s*\*\*Explanation/i,
			/\n\s*\*\*Analysis/i,
			/\n\s*\*\*Rationale/i,
			/\n\s*\*\*Changes/i,
			/\n\s*\*\*Why/i,
			/\n\s*\*\*Summary/i,
		];

		let metadataFound = false;
		for (const pattern of metadataSectionMarkers) {
			const match = extractedText.match(pattern);
			if (match) {
				extractedText = extractedText.substring(0, match.index);
				metadataFound = true;
				console.log("✅ Found metadata marker, trimming after it");
				break;
			}
		}

		// Clean up the extracted text
		clauseText = extractedText.trim();

		// Remove ALL markdown formatting
		clauseText = clauseText.replace(/\*\*\*/g, ""); // Remove bold+italic
		clauseText = clauseText.replace(/\*\*/g, ""); // Remove bold
		clauseText = clauseText.replace(/\*/g, ""); // Remove italic
		clauseText = clauseText.replace(/_{2,}/g, ""); // Remove underscores
		clauseText = clauseText.replace(/`{1,3}/g, ""); // Remove code blocks

		// Normalize whitespace - be more aggressive
		clauseText = clauseText.replace(/\r\n/g, "\n"); // Normalize line endings
		clauseText = clauseText.replace(/\r/g, "\n"); // Mac line endings
		clauseText = clauseText.replace(/[ \t]+/g, " "); // Multiple spaces/tabs to single space
		clauseText = clauseText.replace(/\n[ \t]+/g, "\n"); // Remove leading spaces on new lines
		clauseText = clauseText.replace(/[ \t]+\n/g, "\n"); // Remove trailing spaces before newlines
		clauseText = clauseText.replace(/\n{3,}/g, "\n\n"); // Max 2 consecutive newlines
		clauseText = clauseText.trim();

		console.log("✅ Extracted clause text:", {
			headerFound,
			metadataFound,
			extractedLength: clauseText.length,
			preview: clauseText.substring(0, 150),
		});

		return clauseText;
	};

	// Initialize with welcome message
	useEffect(() => {
		if (isVisible && negotiateMessages.length === 0) {
			setNegotiateMessages([
				{
					id: Date.now().toString(),
					role: "assistant",
					content:
						"Hi! I'll help you negotiate this clause. Tell me what improvements you'd like to make.",
					isInitialTip: true,
					timestamp: new Date().toLocaleTimeString(),
				},
			]);
		}
	}, [isVisible, negotiateMessages.length, setNegotiateMessages]);

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
	 * PRESERVED REDRAFT FUNCTIONALITY + NEW SELECTION BEHAVIOR:
	 * Uses the same Word utilities as the original Redraft feature
	 * - findAndReplaceClause for Word document integration
	 * - Same error handling and success messages
	 * - NEW: Selects and highlights the newly replaced text
	 * - NEW: Updates parent's selectedText state with new text
	 */
	const handleAcceptChanges = async (
		redraftText: string,
		originalClause: string,
		messageId: string
	) => {
		try {
			// ===== STEP 1: Extract clean clause text from API response =====
			const cleanRedraftedClause = extractClauseText(redraftText);

			console.log("🔍 Accept Changes - Text extraction:", {
				originalLength: redraftText.length,
				cleanedLength: cleanRedraftedClause.length,
				originalPreview: redraftText.substring(0, 100),
				cleanedPreview: cleanRedraftedClause.substring(0, 100),
			});

			if (!cleanRedraftedClause) {
				throw new Error(
					"Could not extract clean clause text from redraft response"
				);
			}

			// Check if we're in Office environment
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					// ===== CRITICAL FIX: Get CURRENT selection from Word =====
					// Don't rely on stored selectedText - it might be stale!
					// Get what's actually selected in the document RIGHT NOW
					const currentSelection = context.document.getSelection();
					currentSelection.load("text");
					await context.sync();

					const actualSelectedText = currentSelection.text;

					console.log("🔍 Text comparison:", {
						storedOriginal: originalClause.substring(0, 100),
						currentSelection: actualSelectedText.substring(0, 100),
						match: originalClause.trim() === actualSelectedText.trim(),
					});

					// ===== STRATEGY 1: Try direct replacement using current selection =====
					// This is the most reliable - replace exactly what's selected
					if (actualSelectedText && actualSelectedText.trim().length > 0) {
						console.log("📝 Strategy 1: Replacing current selection directly");

						// CRITICAL: insertText with 'replace' returns the NEW range
						// We MUST use this returned range to select the new text
						const insertedRange = currentSelection.insertText(
							cleanRedraftedClause,
							Word.InsertLocation.replace
						);

						// Load the text property so we can verify
						insertedRange.load("text");
						await context.sync();

						console.log("✅ Replaced using current selection:", {
							insertedTextLength: insertedRange.text.length,
							insertedTextPreview: insertedRange.text.substring(0, 100),
						});

						// SELECT the newly inserted range
						insertedRange.select();
						insertedRange.scrollIntoView();
						await context.sync();

						console.log("✅ New text selected in Word");

						// Update state with new text so it persists
						setAcceptedRedrafts((prev) => new Set([...prev, messageId]));
						if (setSelectedText) {
							setSelectedText(cleanRedraftedClause);
						}

						// CRITICAL: Update parent component's redraft state
						if (onRedraftedClausesChange && onRedraftedTextsChange) {
							// Find the original clause text - check if this is a re-negotiation
							// by looking for the original clause in redraftedClauses set
							let originalClauseText = originalClause;
							let isReNegotiation = false;

							// Check if the current text is already redrafted
							for (const [
								originalText,
								redraftedText,
							] of redraftedTexts.entries()) {
								if (redraftedText === originalClause) {
									originalClauseText = originalText;
									isReNegotiation = true;
									break;
								}
							}

							// Also check if the original clause is directly in the set
							if (!isReNegotiation && redraftedClauses.has(originalClause)) {
								isReNegotiation = true;
								originalClauseText = originalClause;
							}

							if (isReNegotiation) {
								// Update existing redrafted text without adding to count
								console.log(
									"🔄 Re-negotiation detected - updating existing redrafted text"
								);
								onRedraftedTextsChange(
									new Map(redraftedTexts).set(
										originalClauseText,
										cleanRedraftedClause
									)
								);
							} else {
								// Add new redrafted clause
								console.log("➕ New redrafted clause - adding to count");
								onRedraftedClausesChange(
									new Set([...redraftedClauses, originalClauseText])
								);
								onRedraftedTextsChange(
									new Map(redraftedTexts).set(
										originalClauseText,
										cleanRedraftedClause
									)
								);
							}
						}

						console.log("✅ State updated with new text and redraft tracking");

						antMessage.success("✅ Changes applied successfully");

						// Close the modal after successful acceptance
						onClose();
						return; // Success!
					}

					// ===== STRATEGY 2: If no current selection, search for original clause =====
					console.log("📝 Strategy 2: Searching for original clause text");
					console.warn(
						"⚠️ No current selection - this is less reliable. Please select the clause in Word for best results."
					);

					const success = await findAndReplaceClause(
						context,
						originalClause,
						cleanRedraftedClause
					);

					if (success) {
						console.log("✅ Clause found and replaced via search");

						// Find and select the newly replaced text
						const foundRange = await findClauseInDocument(
							context,
							cleanRedraftedClause
						);

						if (foundRange) {
							// Load the range to ensure we have the full text
							foundRange.load("text");
							await context.sync();

							console.log("✅ Found the replaced text:", {
								foundTextLength: foundRange.text.length,
								foundTextPreview: foundRange.text.substring(0, 100),
							});

							// Select the entire found range
							foundRange.select();
							foundRange.scrollIntoView();
							await context.sync();

							console.log("✅ New text selected in Word");
						} else {
							console.warn(
								"⚠️ Text was replaced but couldn't be selected. Please manually select it."
							);
						}

						// Update state
						setAcceptedRedrafts((prev) => new Set([...prev, messageId]));
						if (setSelectedText) {
							setSelectedText(cleanRedraftedClause);
						}

						// CRITICAL: Update parent component's redraft state
						if (onRedraftedClausesChange && onRedraftedTextsChange) {
							// Find the original clause text - check if this is a re-negotiation
							// by looking for the original clause in redraftedClauses set
							let originalClauseText = originalClause;
							let isReNegotiation = false;

							// Check if the current text is already redrafted
							for (const [
								originalText,
								redraftedText,
							] of redraftedTexts.entries()) {
								if (redraftedText === originalClause) {
									originalClauseText = originalText;
									isReNegotiation = true;
									break;
								}
							}

							// Also check if the original clause is directly in the set
							if (!isReNegotiation && redraftedClauses.has(originalClause)) {
								isReNegotiation = true;
								originalClauseText = originalClause;
							}

							if (isReNegotiation) {
								// Update existing redrafted text without adding to count
								console.log(
									"🔄 Re-negotiation detected - updating existing redrafted text"
								);
								onRedraftedTextsChange(
									new Map(redraftedTexts).set(
										originalClauseText,
										cleanRedraftedClause
									)
								);
							} else {
								// Add new redrafted clause
								console.log("➕ New redrafted clause - adding to count");
								onRedraftedClausesChange(
									new Set([...redraftedClauses, originalClauseText])
								);
								onRedraftedTextsChange(
									new Map(redraftedTexts).set(
										originalClauseText,
										cleanRedraftedClause
									)
								);
							}
						}

						console.log("✅ State updated with new text and redraft tracking");

						antMessage.success("✅ Changes applied successfully");

						// Close the modal after successful acceptance
						onClose();
					} else {
						throw new Error(
							"Could not find the clause in the document. Please select the text you want to replace and try again."
						);
					}
				});
			} else {
				// Browser environment - just update UI and state
				setAcceptedRedrafts((prev) => new Set([...prev, messageId]));
				if (setSelectedText) {
					setSelectedText(cleanRedraftedClause);
				}

				// CRITICAL: Update parent component's redraft state
				if (onRedraftedClausesChange && onRedraftedTextsChange) {
					// Check if this is a re-negotiation of an already redrafted clause
					const isReNegotiation = redraftedClauses.has(originalClause);

					if (isReNegotiation) {
						// Update existing redrafted text without adding to count
						onRedraftedTextsChange(
							new Map(redraftedTexts).set(originalClause, cleanRedraftedClause)
						);
					} else {
						// Add new redrafted clause
						onRedraftedClausesChange(
							new Set([...redraftedClauses, originalClause])
						);
						onRedraftedTextsChange(
							new Map(redraftedTexts).set(originalClause, cleanRedraftedClause)
						);
					}
				}

				antMessage.success("✅ Changes applied (UI only - not in Office)");

				// Close the modal after successful acceptance
				onClose();
			}
		} catch (error: any) {
			console.error("❌ Error accepting changes:", error);
			antMessage.error("Failed to apply changes: " + error.message);
		}
	};

	/**
	 * renderNegotiateMessage
	 *
	 * Enhanced renderer for combined Brainstorm + Redraft responses
	 * - Improved spacing and typography
	 * - Better visual hierarchy
	 * - Enhanced Accept Changes button with tooltip
	 */

	const searchInDocument = async (searchText: string): Promise<void> => {
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
					const body = context.document.body;
					body.load("text");
					await context.sync();

					const searchResults = body.search(searchText, { matchCase: false });
					context.load(searchResults, "text");
					await context.sync();

					if (searchResults.items.length > 0) {
						searchResults.items[0].select();
						searchResults.items[0].scrollIntoView();

						setTimeout(async () => {
							await Word.run(async (context) => {
								searchResults.items[0].font.highlightColor = "None";
								await context.sync();
							});
						}, 2000);
					}
				});
			} else {
				console.log("Not in Office environment - search not available");
			}
		} catch (error) {
			console.error("Error searching document:", error);
		}
	};
	const renderInlineFormatting = (text: string): React.ReactNode => {
		if (!text) return null;

		const parts = text.split(/(\*\*\*\*.*?\*\*\*\*|\*\*.*?\*\*|\[\[.*?\]\])/g);

		return parts.map((part, index) => {
			// Handle bold text with 4 asterisks
			if (part?.match(/^\*\*\*\*.*\*\*\*\*$/)) {
				return (
					<strong
						key={`bold4-${index}`}
						className="text-blue-700 font-semibold"
					>
						{part.slice(4, -4)}
					</strong>
				);
			}

			// Handle bold text with 2 asterisks
			if (part?.match(/^\*\*.*\*\*$/)) {
				return (
					<strong
						key={`bold2-${index}`}
						className="text-blue-700 font-semibold"
					>
						{part.slice(2, -2)}
					</strong>
				);
			}

			// Handle [[citations]]
			if (part?.match(/\[\[(.*?)\]\]/)) {
				const citationText = part.match(/\[\[(.*?)\]\]/)?.[1];
				return (
					<a
						key={`citation-${index}`}
						href="#"
						className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
						onClick={(e) => {
							e.preventDefault();
							if (citationText) {
								searchInDocument(citationText);
							}
						}}
					>
						{citationText}
					</a>
				);
			}

			return part;
		});
	};

	const renderMessageContent = (
		content: string,
		isUserMessage: boolean
	): React.ReactNode => {
		if (!content) return null;

		// Replace citations like [[text]]{{None}} with just [[text]]
		content = content.replace(/\{\{None\}\}/g, "");

		// Split content into sections (paragraphs, headings, bullet points)
		const sections = content.split(/\n\n/).filter(Boolean);

		return sections.map((section, sIndex) => {
			if (section.startsWith("**")) {
				// Format headings (bold)
				return (
					<h2
						key={sIndex}
						className={`font-bold text-lg mb-2 ${
							isUserMessage ? "text-white" : "text-blue-700"
						}`}
					>
						{section.replace(/\*\*/g, "")}
					</h2>
				);
			}

			if (section.startsWith("*")) {
				// Format bullet points
				const listItems = section.split("\n").map((item, iIndex) => (
					<li
						key={iIndex}
						className={`ml-4 list-disc ${isUserMessage ? "text-white" : ""}`}
					>
						{renderInlineFormatting(item.replace(/^\*\s*/, ""))}
					</li>
				));

				return (
					<ul key={sIndex} className="mb-4">
						{listItems}
					</ul>
				);
			}

			// Default: Normal paragraph
			return (
				<p
					key={sIndex}
					className={`mb-4 leading-relaxed ${
						isUserMessage ? "text-white" : "text-gray-800"
					}`}
				>
					{renderInlineFormatting(section)}
				</p>
			);
		});
	};

	const renderNegotiateMessage = (message: ChatMessage): React.ReactNode => {
		try {
			const data = JSON.parse(message.content);
			const isUserMessage = message.role === "user";

			return (
				<div className="space-y-6">
					{/* Brainstorm Section */}
					{!data.hasBrainstormError && data.brainstorm && (
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg py-4 px-2 border border-blue-200">
							<div className="flex flex-col items-start gap-2 mb-3">
								<div className="flex items-center gap-2">
									<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<BulbOutlined className="text-blue-600 text-sm" />
									</div>
									<h4 className="text-sm font-semibold text-blue-800 mb-2">
										Negotiation Strategy
									</h4>
								</div>
								<div className="flex-1">
									<div className="text-sm text-gray-700 leading-relaxed">
										{renderMessageContent(data.brainstorm, isUserMessage)}
									</div>
								</div>
							</div>
						</div>
					)}

					{data.hasBrainstormError && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg py-4 px-2">
							<div className="flex items-center gap-2">
								<InfoCircleOutlined className="text-orange-600" />
								<p className="text-sm text-orange-700 font-medium">
									Negotiation strategies couldn&apos;t be loaded
								</p>
							</div>
						</div>
					)}

					{/* Redraft Section */}
					{!data.hasRedraftError && data.redraft && (
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg py-4 px-2 border border-green-200">
							<div className="flex  flex-col items-start gap-3 mb-4">
								<div className="flex gap-2 items-center justify-center">
									<div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
										<EditOutlined className="text-green-600 text-sm" />
									</div>
									<h4 className="text-sm font-semibold text-green-800 mb-3">
										Proposed Redraft
									</h4>
								</div>
								<div className="flex-1">
									<div className="bg-white border border-green-300 rounded-lg py-4 px-2 mb-4">
										<div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-mono">
											{extractClauseText(data.redraft)}
										</div>
									</div>

									{/* Enhanced Accept Changes Button */}
									{!acceptedRedrafts.has(message.id || "") ? (
										<div className="flex items-center justify-between">
											<Tooltip
												title="This will replace the selected clause in your Word document"
												placement="top"
											>
												<Button
													type="primary"
													size="middle"
													icon={<CheckOutlined />}
													onClick={() =>
														handleAcceptChanges(
															data.redraft,
															data.originalClause,
															message.id || ""
														)
													}
													className=" w-full bg-green-600 hover:bg-green-700 border-green-600 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 px-6 py-2 h-auto"
												>
													Accept Changes
												</Button>
											</Tooltip>
										</div>
									) : (
										<div className="flex flex-col items-center gap-3 p-3 bg-green-100 rounded-lg border border-green-300">
											<div className="flex items-center gap-2">
												<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
													<CheckOutlined className="text-white text-xs" />
												</div>
												<p className="text-sm font-semibold text-green-800">
													Changes Applied Successfully
												</p>
											</div>
											<div>
												<p className="text-xs text-green-600">
													The clause has been updated in your document
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{data.hasRedraftError && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg py-4 px-2">
							<div className="flex items-center gap-2">
								<InfoCircleOutlined className="text-orange-600" />
								<p className="text-sm text-orange-700 font-medium">
									Redraft suggestions couldn&apos;t be loaded
								</p>
							</div>
						</div>
					)}
				</div>
			);
		} catch (error) {
			console.error("Error parsing negotiate response:", error);
			return (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<InfoCircleOutlined className="text-red-600" />
						<p className="text-sm text-red-700 font-medium">
							Error displaying response
						</p>
					</div>
				</div>
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
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<ThunderboltOutlined className="text-blue-600 text-sm" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-gray-800 m-0">
							Help Me Negotiate
						</h2>
						<p className="text-xs text-gray-500 m-0">
							AI-powered clause improvement
						</p>
					</div>
				</div>
			}
			open={isVisible}
			onCancel={onClose}
			footer={null}
			width="90vw"
			className="sm:max-w-[900px] lg:max-w-[1000px]"
			centered={true}
			styles={{
				body: { padding: "0" },
			}}
		>
			<div className="flex flex-col h-[80vh] bg-white">
				{/* Selected Text Display - Enhanced */}
				<div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mt-0.5">
							<span className="text-blue-700 text-xs font-bold">📄</span>
						</div>
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-blue-800 mb-2">
								Selected Clause
							</h3>
							<div className="bg-white border border-blue-200 rounded-lg p-3 max-h-[80px] overflow-y-auto">
								<p className="text-sm text-gray-700 leading-relaxed m-0">
									{selectedText || "No text selected"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Chat Messages - Enhanced */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
									<div className="px-4 py-2 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">
										<div className="flex items-center gap-2">
											<InfoCircleOutlined className="text-blue-500" />
											<span>{message.content}</span>
										</div>
									</div>
								) : (
									<div className="space-y-2 max-w-[90%] group">
										<div
											className={`py-4  px-2 rounded-2xl shadow-sm transition-all duration-200 ${
												message.role === "user"
													? "bg-blue-600 text-white ml-auto"
													: "bg-white text-gray-800 border border-gray-200 hover:shadow-md"
											}`}
										>
											<div className="text-sm leading-relaxed">
												{message.isNegotiateResponse
													? renderNegotiateMessage(message)
													: message.content}
											</div>
										</div>
										<div
											className={`text-xs opacity-70 group-hover:opacity-100 transition-opacity ${
												message.role === "user"
													? "text-right text-blue-600"
													: "text-left text-gray-500"
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
						<div className="flex justify-center items-center p-6">
							<div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
								<Spin size="small" />
								<span className="text-sm text-gray-600">
									Analyzing your request...
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Input Form - Enhanced */}
				<div className="p-4 bg-white border-t border-gray-200">
					<form onSubmit={handleSubmit} className="flex items-center gap-3">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								negotiateLoading
									? "Processing your request..."
									: "How should we improve this clause?"
							}
							className="flex-grow rounded-xl border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm h-12 text-sm"
							disabled={negotiateLoading}
							autoComplete="off"
						/>
						<Button
							type="primary"
							htmlType="submit"
							icon={<SendOutlined />}
							disabled={negotiateLoading || !input.trim()}
							className={`h-12 px-6 rounded-xl transition-all duration-200 ${
								negotiateLoading || !input.trim()
									? "opacity-50 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
							}`}
						>
							Send
						</Button>
					</form>
				</div>
			</div>
		</Modal>
	);
};

export default NegotiateModal;
