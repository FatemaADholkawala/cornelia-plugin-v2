"use client";

import React from "react";
import { Card, Typography, List, Tag, Button, Empty, Spin } from "antd";
import {
	CheckCircleOutlined,
	WarningOutlined,
	ExclamationCircleOutlined,
	ArrowLeftOutlined,
	FileTextOutlined,
} from "@ant-design/icons";
import { ClauseAnalysis, Clause } from "@/types";

const { Title, Text, Paragraph } = Typography;

interface AnalysisViewProps {
	clauseAnalysis: ClauseAnalysis | null;
	selectedParty: any;
	setActiveView: (view: any) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
	clauseAnalysis,
	selectedParty,
	setActiveView,
}) => {
	const renderClause = (clause: Clause, index: number) => (
		<Card key={clause.id || index} className="mb-4" size="small">
			<div className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<Text className="text-gray-700">{clause.text}</Text>
					</div>
					<Tag
						color={
							clause.risk_level === "high"
								? "red"
								: clause.risk_level === "medium"
								? "orange"
								: "green"
						}
						className="ml-2"
					>
						{clause.risk_level?.toUpperCase()}
					</Tag>
				</div>

				{clause.description && (
					<div>
						<Text strong className="text-sm text-gray-600">
							Analysis:
						</Text>
						<Paragraph className="text-sm text-gray-600 mt-1">
							{clause.description}
						</Paragraph>
					</div>
				)}

				{clause.suggestions && clause.suggestions.length > 0 && (
					<div>
						<Text strong className="text-sm text-gray-600">
							Suggestions:
						</Text>
						<ul className="mt-1 text-sm text-gray-600">
							{clause.suggestions.map((suggestion, idx) => (
								<li key={idx}>• {suggestion}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</Card>
	);

	if (!clauseAnalysis) {
		return (
			<div className="p-6">
				<div className="text-center">
					<Spin size="large" />
					<div className="mt-4">
						<Text type="secondary">Loading analysis...</Text>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-4">
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => setActiveView("home")}
						type="text"
					/>
					<FileTextOutlined className="text-2xl text-blue-600" />
					<Title level={2} className="!mb-0">
						Document Analysis
					</Title>
				</div>

				{selectedParty && (
					<div className="p-4 bg-blue-50 rounded-lg">
						<Text strong className="text-blue-800">
							Analysis from perspective of: {selectedParty.name} (
							{selectedParty.role})
						</Text>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Acceptable Clauses */}
				<div>
					<Card
						title={
							<div className="flex items-center gap-2">
								<CheckCircleOutlined className="text-green-600" />
								<span>Acceptable Clauses</span>
								<Tag color="green">{clauseAnalysis.acceptable.length}</Tag>
							</div>
						}
						className="h-full"
					>
						{clauseAnalysis.acceptable.length === 0 ? (
							<Empty
								description="No acceptable clauses found"
								image={
									<CheckCircleOutlined className="text-4xl text-gray-300" />
								}
							/>
						) : (
							<div className="space-y-3">
								{clauseAnalysis.acceptable.map((clause, index) =>
									renderClause(clause, index)
								)}
							</div>
						)}
					</Card>
				</div>

				{/* Risky Clauses */}
				<div>
					<Card
						title={
							<div className="flex items-center gap-2">
								<WarningOutlined className="text-orange-600" />
								<span>Risky Clauses</span>
								<Tag color="orange">{clauseAnalysis.risky.length}</Tag>
							</div>
						}
						className="h-full"
					>
						{clauseAnalysis.risky.length === 0 ? (
							<Empty
								description="No risky clauses found"
								image={<WarningOutlined className="text-4xl text-gray-300" />}
							/>
						) : (
							<div className="space-y-3">
								{clauseAnalysis.risky.map((clause, index) =>
									renderClause(clause, index)
								)}
							</div>
						)}
					</Card>
				</div>

				{/* Missing Clauses */}
				<div>
					<Card
						title={
							<div className="flex items-center gap-2">
								<ExclamationCircleOutlined className="text-red-600" />
								<span>Missing Clauses</span>
								<Tag color="red">{clauseAnalysis.missing.length}</Tag>
							</div>
						}
						className="h-full"
					>
						{clauseAnalysis.missing.length === 0 ? (
							<Empty
								description="No missing clauses found"
								image={
									<ExclamationCircleOutlined className="text-4xl text-gray-300" />
								}
							/>
						) : (
							<div className="space-y-3">
								{clauseAnalysis.missing.map((clause, index) =>
									renderClause(clause, index)
								)}
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
};

export default AnalysisView;
