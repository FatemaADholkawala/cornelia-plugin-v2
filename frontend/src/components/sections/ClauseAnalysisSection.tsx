"use client";

import React, { useState, useEffect } from "react";
import { Button, Spin, Select, Tag, message, Input, Collapse } from "antd";
import {
	FileSearchOutlined,
	CheckCircleOutlined,
	WarningOutlined,
	ExclamationCircleOutlined,
	CaretRightOutlined,
} from "@ant-design/icons";
import {
	ClauseAnalysis,
	Party,
	AnalysisCounts,
	AnalysisFormData,
} from "@/types";
import { analysisApi } from "@/services/api";
import { parseAPIResponse } from "@/utils/apiUtils";

const { TextArea } = Input;
const { Panel } = Collapse;

interface ClauseAnalysisSectionProps {
	clauseAnalysis: ClauseAnalysis | null;
	isLoadingParties: boolean;
	clauseAnalysisLoading: boolean;
	parties: Party[];
	getTagColor: (role: string) => string;
	selectedParty: Party | null;
	setSelectedParty: (party: Party | null) => void;
	setClauseAnalysisLoading: (loading: boolean) => void;
	setClauseAnalysis: (analysis: ClauseAnalysis | null) => void;
	setClauseAnalysisCounts: (counts: AnalysisCounts) => void;
	clauseAnalysisCounts: AnalysisCounts;
	setActiveView: (view: any) => void;
	documentContent: string;
}

const ClauseAnalysisSection: React.FC<ClauseAnalysisSectionProps> = ({
	clauseAnalysis,
	isLoadingParties,
	clauseAnalysisLoading,
	parties,
	getTagColor,
	selectedParty,
	setSelectedParty,
	setClauseAnalysisLoading,
	setClauseAnalysis,
	setClauseAnalysisCounts,
	clauseAnalysisCounts,
	setActiveView,
	documentContent,
}) => {
	// Contract type options (static for now, can be fetched from API later)
	const contractTypes = [
		"NDA",
		"Employment",
		"Service Agreement",
		"Vendor Contract",
		"Consulting Agreement",
		"Other",
	];

	// Form state - initialize from localStorage if available
	const [formData, setFormData] = useState<AnalysisFormData>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("analysisFormData");
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch (e) {
					console.error("Failed to parse saved form data:", e);
				}
			}
		}
		return {
			party: null,
			contractType: "",
			concerns: "",
			focusAreas: "",
		};
	});

	// Save form data to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("analysisFormData", JSON.stringify(formData));
		}
	}, [formData]);

	// Sync selectedParty with formData
	useEffect(() => {
		if (selectedParty && formData.party?.name !== selectedParty.name) {
			setFormData((prev) => ({ ...prev, party: selectedParty }));
		}
	}, [selectedParty, formData.party?.name]);

	const renderPartyOption = (party: Party) => ({
		value: party.name,
		label: party.name, // Simple string for closed state display
		// Complex JSX for dropdown options will be handled by optionRender
		party: party, // Store the full party object for access in optionRender
	});

	const handleFormChange = (field: keyof AnalysisFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePartySelect = (value: string) => {
		const selected = parties.find((p) => p.name === value);
		if (selected) {
			// Update both parent state and local form state
			setSelectedParty(selected);
			handleFormChange("party", selected);
			console.log("Party selected in ClauseAnalysisSection:", {
				selectedParty: selected.name,
				parentSelectedParty: selectedParty?.name,
			});
		}
	};

	const handleAnalysisSubmit = async (): Promise<void> => {
		if (!formData.party) {
			message.warning("Please select a party to represent");
			return;
		}

		try {
			setClauseAnalysisLoading(true);

			const analysisContainer = document.getElementById(
				"document-analysis-container"
			);

			analysisContainer?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});

			console.log("Starting document analysis...", {
				documentLength: documentContent?.length || 0,
				party: formData.party?.name,
				contractType: formData.contractType,
				concerns: formData.concerns,
				focusAreas: formData.focusAreas,
			});

			const result = await analysisApi.analyzeDocumentClauses(
				documentContent,
				{
					name: formData.party.name,
					role: formData.party.role,
				},
				{
					contractType: formData.contractType,
					concerns: formData.concerns,
					focusAreas: formData.focusAreas,
				}
			);

			if (!result) {
				throw new Error("No analysis results received from API");
			}

			const parsedResult = parseAPIResponse(result);
			console.log("Analysis completed successfully:", {
				acceptable: parsedResult?.acceptable?.length || 0,
				risky: parsedResult?.risky?.length || 0,
				missing: parsedResult?.missing?.length || 0,
			});

			if (
				!parsedResult?.acceptable ||
				!parsedResult?.risky ||
				!parsedResult?.missing
			) {
				throw new Error("Invalid analysis result structure");
			}

			setClauseAnalysis(parsedResult);
			setClauseAnalysisCounts({
				acceptable: parsedResult.acceptable.length || 0,
				risky: parsedResult.risky.length || 0,
				missing: parsedResult.missing.length || 0,
			});

			// Ensure the parent component's selectedParty is also updated
			if (formData.party && formData.party !== selectedParty) {
				setSelectedParty(formData.party);
				console.log("Updated parent selectedParty to:", formData.party.name);
			}

			console.log("Analysis completed, state updated:", {
				selectedParty: formData.party?.name,
				parentSelectedParty: selectedParty?.name,
				hasClauseAnalysis: !!parsedResult,
				acceptableCount: parsedResult.acceptable.length,
				riskyCount: parsedResult.risky.length,
				missingCount: parsedResult.missing.length,
			});

			// Scroll to the top of the document analysis section

			message.success("Document analysis completed successfully!");
		} catch (error) {
			console.error("Document analysis failed:", error);
			message.error(`Analysis failed: ${(error as Error).message}`);
			setClauseAnalysis(null);
		} finally {
			setClauseAnalysisLoading(false);
		}
	};

	const renderAnalysisCount = ({
		icon,
		count,
		label,
		color,
	}: {
		icon: React.ReactNode;
		count: number;
		label: string;
		color: string;
	}) => (
		<div className="flex items-center gap-2">
			{icon}
			<div>
				<span className={`text-lg font-semibold text-${color}-600`}>
					{count}
				</span>
				<div className={`text-sm text-${color}-600`}>{label}</div>
			</div>
		</div>
	);

	return (
		<div className="px-4" id="document-analysis-container">
			<Collapse
				defaultActiveKey={clauseAnalysis ? [] : ["analysis-form"]}
				expandIcon={({ isActive }) => (
					<div className="flex items-center gap-2">
						<CaretRightOutlined rotate={isActive ? 90 : 0} />
						<h3 className="flex text-xl font-semibold text-gray-800 m-0">
							Document Analysis
						</h3>
					</div>
				)}
				className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200"
			>
				<Panel
					header={
						<div className="flex items-center justify-between w-full gap-3">
							{clauseAnalysis && (
								<div className="flex items-center gap-2 mr-4">
									<Tag color="green">
										{clauseAnalysisCounts.acceptable} Acceptable
									</Tag>
									<Tag color="orange">{clauseAnalysisCounts.risky} Review</Tag>
									<Tag color="red">{clauseAnalysisCounts.missing} Missing</Tag>
								</div>
							)}
						</div>
					}
					key="analysis-form"
					className="document-analysis-panel"
				>
					{!clauseAnalysis ? (
						isLoadingParties ? (
							<div className="flex items-center justify-center p-8">
								<Button loading className="w-[200px]">
									Loading Parties...
								</Button>
							</div>
						) : clauseAnalysisLoading ? (
							<div className="flex items-center justify-center p-8">
								<Spin size="large" />
								<span className="ml-3 text-gray-600">
									Analyzing document...
								</span>
							</div>
						) : parties && parties.length > 0 ? (
							// 4-Question Form
							<div className="space-y-6">
								{/* Question 1: Party Selection */}
								<div className="space-y-3">
									<label className="block text-sm font-medium text-gray-700">
										1. Who are you representing in this deal?{" "}
										<span className="text-red-500">*</span>
									</label>
									<Select
										placeholder="Select a party"
										style={{ width: "100%" }}
										value={formData.party?.name}
										options={parties.map(renderPartyOption)}
										listItemHeight={80}
										listHeight={400}
										optionRender={(option) => {
											const party = option.data.party;
											return (
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "4px",
														width: "100%",
														maxWidth: "280px",
														padding: "8px",
													}}
												>
													<span
														style={{
															fontWeight: 500,
															wordWrap: "break-word",
															whiteSpace: "normal",
															lineHeight: "1.4",
														}}
													>
														{party.name}
													</span>
													<Tag
														color={getTagColor(party.role)}
														style={{
															maxWidth: "100%",
															whiteSpace: "normal",
															height: "auto",
															padding: "2px 8px",
															lineHeight: "1.4",
														}}
													>
														{party.role || "Unknown Role"}
													</Tag>
												</div>
											);
										}}
										onChange={handlePartySelect}
										showSearch
										filterOption={(input, option) =>
											String(option?.label ?? "")
												.toLowerCase()
												.includes(input.toLowerCase())
										}
									/>
									{/* {selectedParty && (
										<div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
											<span className="font-medium text-blue-700">
												Selected:
											</span>{" "}
											<span
												className="inline-block max-w-full truncate"
												title={selectedParty.name}
											>
												{selectedParty.name}
											</span>
										</div>
									)} */}
								</div>

								{/* Question 2: Contract Type */}
								<div className="space-y-3">
									<label className="block text-sm font-medium text-gray-700">
										2. What type of contract is this?
									</label>
									<Select
										placeholder="Select contract type"
										style={{ width: "100%" }}
										value={formData.contractType || undefined}
										options={contractTypes.map((type) => ({
											value: type,
											label: type,
										}))}
										onChange={(value) =>
											handleFormChange("contractType", value)
										}
										allowClear
									/>
								</div>

								{/* Question 3: Concerns */}
								<div className="space-y-3">
									<label className="block text-sm font-medium text-gray-700">
										3. Are there specific things you are worried about?
									</label>
									<TextArea
										placeholder="e.g., Liability caps, indemnification, payment terms..."
										value={formData.concerns}
										onChange={(e) =>
											handleFormChange("concerns", e.target.value)
										}
										rows={4}
										maxLength={500}
										showCount
										autoSize={{ minRows: 4 }}
									/>
								</div>

								{/* Question 4: Focus Areas */}
								<div className="space-y-3">
									<label className="block text-sm font-medium text-gray-700">
										4. Any special areas to focus on?
									</label>
									<TextArea
										placeholder="e.g., Intellectual property, confidentiality, termination clauses..."
										value={formData.focusAreas}
										onChange={(e) =>
											handleFormChange("focusAreas", e.target.value)
										}
										rows={4}
										maxLength={500}
										showCount
										autoSize={{ minRows: 4 }}
									/>
								</div>

								{/* Submit Button */}
								<div className="pt-4">
									<Button
										type="primary"
										size="large"
										block
										icon={<FileSearchOutlined />}
										onClick={handleAnalysisSubmit}
										disabled={!formData.party}
										className="!h-12 !text-base !font-medium"
									>
										Start Analysis
									</Button>
								</div>
							</div>
						) : (
							<div className="text-center text-gray-500 p-8">
								No parties found in the document
							</div>
						)
					) : (
						// Analysis Results View - ALWAYS VISIBLE AND FUNCTIONAL
						<div>
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3">
									<div className="text-sm text-gray-600">
										Analyzed from{" "}
										<span className="font-semibold text-gray-800">
											{formData.party?.name}
										</span>
										&apos;s perspective
									</div>
								</div>
								<Button
									type="primary"
									className="!bg-green-600 !hover:bg-green-700 !border-green-600 !text-white"
									icon={<FileSearchOutlined />}
									onClick={() => {
										console.log("View Full Analysis clicked:", {
											selectedParty: selectedParty?.name,
											hasClauseAnalysis: !!clauseAnalysis,
											clauseAnalysisCounts,
										});
										setActiveView("analysis");
									}}
								>
									View Full Analysis
								</Button>
							</div>

							{/* Analysis Summary Cards */}
							<div className="grid grid-cols-3 gap-4">
								{[
									{
										icon: <CheckCircleOutlined className="text-xl" />,
										count: clauseAnalysisCounts.acceptable,
										label: "Acceptable",
										color: "green",
										description: "Clauses that meet requirements",
									},
									{
										icon: <WarningOutlined className="text-xl" />,
										count: clauseAnalysisCounts.risky,
										label: "Review",
										color: "yellow",
										description: "Clauses that need review",
									},
									{
										icon: <ExclamationCircleOutlined className="text-xl" />,
										count: clauseAnalysisCounts.missing,
										label: "Missing",
										color: "red",
										description: "Required clauses not found",
									},
								].map(({ icon, count, label, color, description }) => (
									<div
										key={label}
										className={`
											flex flex-col items-center p-4 rounded-lg
											bg-${color}-50 border border-${color}-200
											hover:shadow-md transition-all duration-200
											cursor-help
										`}
										title={description}
									>
										<div className="flex items-center gap-2 mb-2">
											{icon}
											<span className={`text-2xl font-bold text-${color}-600`}>
												{count}
											</span>
										</div>
										<div className={`text-sm font-medium text-${color}-700`}>
											{label}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</Panel>
			</Collapse>
		</div>
	);
};

export default ClauseAnalysisSection;
