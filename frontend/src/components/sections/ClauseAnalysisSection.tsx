"use client";

import React from "react";
import { Button, Spin, Select, Tag, message } from "antd";
import {
	FileSearchOutlined,
	CheckCircleOutlined,
	WarningOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ClauseAnalysis, Party, AnalysisCounts } from "@/types";
import { analysisApi } from "@/services/api";
import { parseAPIResponse } from "@/utils/apiUtils";

interface ClauseAnalysisSectionProps {
	clauseAnalysis: any | null;
	isLoadingParties: boolean;
	clauseAnalysisLoading: boolean;
	parties: any[];
	getTagColor: (role: string) => string;
	selectedParty: any | null;
	setSelectedParty: (party: any | null) => void;
	setClauseAnalysisLoading: (loading: boolean) => void;
	setClauseAnalysis: (analysis: any | null) => void;
	setClauseAnalysisCounts: (counts: any) => void;
	clauseAnalysisCounts: any;
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
	const renderPartyOption = (party: any) => ({
		value: party.name,
		label: (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "4px",
					width: "100%",
					maxWidth: "280px",
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
		),
	});

	const handlePartySelect = async (value: string): Promise<void> => {
		const selectedParty = parties.find((p) => p.name === value);
		setSelectedParty(selectedParty);

		if (!selectedParty) {
			console.error("No party selected");
			return;
		}

		try {
			setClauseAnalysisLoading(true);
			const result = await analysisApi.analyzeDocumentClauses(documentContent, {
				name: selectedParty.name,
				role: selectedParty.role,
			});

			if (!result) {
				throw new Error("No analysis results received");
			}

			const parsedResult = parseAPIResponse(result);

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
		} catch (error: any) {
			console.error("Document analysis failed:", error);
			message.error(`Analysis failed: ${error?.message || "Unknown error"}`);
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
		<div className="px-4">
			<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200">
				<div className="flex flex-col custom-flex-row items-center justify-between gap-4">
					<div className="w-full">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-gray-800 m-0">
								Document Analysis
							</h3>

							{!clauseAnalysis &&
								(isLoadingParties ? (
									<Button loading className="w-[200px]">
										Analyzing Parties...
									</Button>
								) : clauseAnalysisLoading ? (
									<div className="flex items-center gap-2">
										<Spin />
										<span className="text-gray-600">Analyzing document...</span>
									</div>
								) : parties && parties.length > 0 ? (
									<Select
										placeholder="Select a party"
										style={{ width: 300 }}
										options={parties.map(renderPartyOption)}
										listItemHeight={80}
										listHeight={400}
										optionRender={(option) => (
											<div
												style={{
													padding: "8px",
													width: "100%",
													wordBreak: "break-word",
												}}
											>
												{option.data.label}
											</div>
										)}
										onChange={handlePartySelect}
									/>
								) : (
									<div className="text-gray-500">No parties found</div>
								))}

							{selectedParty && clauseAnalysis && !clauseAnalysisLoading && (
								<Button
									type="primary"
									className="!bg-green-600 !hover:bg-green-700 !border-green-600 !text-white !px-6 !h-9 !text-sm !font-medium"
									icon={<FileSearchOutlined className="text-lg" />}
									onClick={() => setActiveView("analysis")}
								>
									View Analysis
								</Button>
							)}
						</div>

						{selectedParty && clauseAnalysis && !clauseAnalysisLoading && (
							<div className="grid grid-cols-3 gap-4 mb-6">
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
										<div className={`text-${color}-600 mb-2`}>{icon}</div>
										<span
											className={`text-2xl font-bold text-${color}-600 mb-1`}
										>
											{count}
										</span>
										<span className={`text-sm text-${color}-700`}>{label}</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ClauseAnalysisSection;
