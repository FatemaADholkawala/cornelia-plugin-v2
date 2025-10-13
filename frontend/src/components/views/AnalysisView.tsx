"use client";

import React from "react";
import { Spin, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ClauseAnalysis from "../previews/ClauseAnalysis";

const { Text } = Typography;

interface AnalysisViewProps {
	// Loading and party state
	clauseAnalysisLoading: boolean;
	selectedParty: any;
	setSelectedParty: (party: any) => void;
	clauseAnalysis: any;
	setClauseAnalysis: (analysis: any) => void;
	setActiveView: (view: any) => void;
	getTagColor: (role: string) => string;
	onChangeParty: () => void;

	// Redraft modal props
	isRedraftModalVisible: boolean;
	redraftContent: string;
	selectedClause: any;
	generatedRedraft: any;
	generatingRedrafts: Map<string, boolean>;

	// Redraft state props
	redraftedClauses: Set<string>;
	redraftedTexts: Map<string, string>;
	redraftReviewStates: Map<string, any>;

	// Redraft handlers
	onRedraftModalVisibility: (visible: boolean) => void;
	onRedraftContentChange: (content: string) => void;
	onSelectedClauseChange: (clause: any) => void;
	onGeneratingRedraftsChange: (drafts: Map<string, boolean>) => void;
	onRedraftedClausesChange: (clauses: Set<string>) => void;
	onRedraftedTextsChange: (texts: Map<string, string>) => void;
	onRedraftReviewStatesChange: (states: Map<string, any>) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
	clauseAnalysisLoading,
	selectedParty,
	setSelectedParty,
	clauseAnalysis,
	setClauseAnalysis,
	setActiveView,
	getTagColor,
	onChangeParty,
	isRedraftModalVisible,
	redraftContent,
	selectedClause,
	generatedRedraft,
	generatingRedrafts,
	redraftedClauses,
	redraftedTexts,
	redraftReviewStates,
	onRedraftModalVisibility,
	onRedraftContentChange,
	onSelectedClauseChange,
	onGeneratingRedraftsChange,
	onRedraftedClausesChange,
	onRedraftedTextsChange,
	onRedraftReviewStatesChange,
}) => {
	// Debug logging to understand state issues
	console.log("AnalysisView Debug:", {
		clauseAnalysisLoading,
		selectedParty: selectedParty?.name,
		hasClauseAnalysis: !!clauseAnalysis,
		clauseAnalysisKeys: clauseAnalysis ? Object.keys(clauseAnalysis) : null,
	});

	return (
		<div className="p-4">
			{clauseAnalysisLoading ? (
				<div className="flex flex-col items-center justify-center">
					<Spin size="large" />
					<Text className="mt-4">Analyzing document...</Text>
				</div>
			) : !selectedParty || !clauseAnalysis ? (
				<div className="flex flex-col items-center justify-center p-8">
					<Text className="mb-4 text-center">
						{!selectedParty && !clauseAnalysis
							? "Please select a party and run analysis from the home screen to view detailed results"
							: !selectedParty
							? "Please select a party from the home screen to view analysis"
							: "No analysis data available. Please run analysis from the home screen."}
					</Text>
					<Button
						type="primary"
						icon={<ArrowLeftOutlined />}
						onClick={() => setActiveView(null)}
					>
						Return to Home
					</Button>
				</div>
			) : (
				<ClauseAnalysis
					results={clauseAnalysis}
					loading={clauseAnalysisLoading}
					selectedParty={selectedParty}
					getTagColor={getTagColor}
					onChangeParty={onChangeParty}
					isRedraftModalVisible={isRedraftModalVisible}
					redraftContent={redraftContent}
					selectedClause={selectedClause}
					generatedRedraft={generatedRedraft}
					generatingRedrafts={generatingRedrafts}
					redraftedClauses={redraftedClauses}
					redraftedTexts={redraftedTexts}
					redraftReviewStates={redraftReviewStates}
					onRedraftModalVisibility={onRedraftModalVisibility}
					onRedraftContentChange={onRedraftContentChange}
					onSelectedClauseChange={onSelectedClauseChange}
					onGeneratingRedraftsChange={onGeneratingRedraftsChange}
					onRedraftedClausesChange={onRedraftedClausesChange}
					onRedraftedTextsChange={onRedraftedTextsChange}
					onRedraftReviewStatesChange={onRedraftReviewStatesChange}
				/>
			)}
		</div>
	);
};

export default AnalysisView;
