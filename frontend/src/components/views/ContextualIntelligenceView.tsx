"use client";

import React from "react";
import { Card, Typography, Button, Alert, Spin, Progress } from "antd";
import {
	ExperimentOutlined,
	ArrowLeftOutlined,
	CheckCircleOutlined,
	WarningOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import { useAnalysis } from "@/contexts/AnalysisContext";

const { Title, Text, Paragraph } = Typography;

interface ContextualIntelligenceViewProps {
	setActiveView: (view: any) => void;
}

const ContextualIntelligenceView: React.FC<ContextualIntelligenceViewProps> = ({
	setActiveView,
}) => {
	const { contextualIntelligence, nonCompeteDetection } = useAnalysis();

	return (
		<div className="p-6">
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-4">
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => setActiveView("home")}
						type="text"
					/>
					<ExperimentOutlined className="text-2xl text-purple-600" />
					<Title level={2} className="!mb-0">
						Contextual Intelligence
					</Title>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Pattern Detection */}
				<Card
					title={
						<div className="flex items-center gap-2">
							<ExperimentOutlined className="text-purple-600" />
							<span>Pattern Detection</span>
						</div>
					}
					className="h-fit"
				>
					<div className="space-y-4">
						{contextualIntelligence.isAnalyzing ? (
							<div className="text-center py-8">
								<Spin size="large" />
								<div className="mt-4">
									<Text type="secondary">Analyzing document patterns...</Text>
									<Progress
										percent={75}
										size="small"
										className="mt-2"
										showInfo={false}
									/>
								</div>
							</div>
						) : contextualIntelligence.isPatternDetected ? (
							<Alert
								message="Pattern Detected"
								description="AI has identified potential legal patterns and risks in your document that require attention."
								type="warning"
								showIcon
								icon={<WarningOutlined />}
								action={
									<Button size="small" type="primary">
										Review Details
									</Button>
								}
							/>
						) : (
							<div className="text-center py-8">
								<InfoCircleOutlined className="text-4xl text-gray-300 mb-2" />
								<Text type="secondary">No patterns detected yet</Text>
							</div>
						)}
					</div>
				</Card>

				{/* Non-Compete Detection */}
				<Card
					title={
						<div className="flex items-center gap-2">
							<CheckCircleOutlined className="text-orange-600" />
							<span>Non-Compete Detection</span>
						</div>
					}
					className="h-fit"
				>
					<div className="space-y-4">
						{nonCompeteDetection.detectionPhase === "scanning" && (
							<div className="text-center py-8">
								<Spin size="large" />
								<div className="mt-4">
									<Text type="secondary">
										Scanning for non-compete clauses...
									</Text>
									<Progress
										percent={40}
										size="small"
										className="mt-2"
										showInfo={false}
									/>
								</div>
							</div>
						)}

						{nonCompeteDetection.detectionPhase === "analyzing" && (
							<div className="text-center py-8">
								<Spin size="large" />
								<div className="mt-4">
									<Text type="secondary">
										Analyzing non-compete provisions...
									</Text>
									<Progress
										percent={80}
										size="small"
										className="mt-2"
										showInfo={false}
									/>
								</div>
							</div>
						)}

						{nonCompeteDetection.detectionPhase === "detected" && (
							<div className="space-y-3">
								<Alert
									message="Non-Compete Clauses Detected"
									description={`Found ${nonCompeteDetection.detectedConflicts.length} potential conflicts`}
									type="warning"
									showIcon
								/>

								{nonCompeteDetection.detectedConflicts.map(
									(conflict, index) => (
										<Card
											key={index}
											size="small"
											className="border-orange-200"
										>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Text strong className="text-gray-800">
														{conflict.company}
													</Text>
													<span
														className={`px-2 py-1 rounded text-xs font-medium ${
															conflict.riskLevel === "high"
																? "bg-red-100 text-red-800"
																: conflict.riskLevel === "medium"
																? "bg-yellow-100 text-yellow-800"
																: "bg-green-100 text-green-800"
														}`}
													>
														{conflict.riskLevel.toUpperCase()}
													</span>
												</div>
												<Text className="text-sm text-gray-600">
													{conflict.conflictType}
												</Text>
												<Text className="text-xs text-gray-500">
													{conflict.details}
												</Text>
											</div>
										</Card>
									)
								)}
							</div>
						)}

						{!nonCompeteDetection.hasStarted && (
							<div className="text-center py-8">
								<InfoCircleOutlined className="text-4xl text-gray-300 mb-2" />
								<Text type="secondary">Analysis not started</Text>
							</div>
						)}
					</div>
				</Card>
			</div>

			{/* Additional Intelligence Features */}
			<div className="mt-6">
				<Card
					title="AI Insights"
					className="bg-gradient-to-r from-purple-50 to-blue-50"
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
								<ExperimentOutlined className="text-blue-600 text-xl" />
							</div>
							<Text strong className="block text-gray-800">
								Smart Analysis
							</Text>
							<Text className="text-sm text-gray-600">
								AI-powered document analysis
							</Text>
						</div>

						<div className="text-center p-4">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
								<CheckCircleOutlined className="text-green-600 text-xl" />
							</div>
							<Text strong className="block text-gray-800">
								Risk Detection
							</Text>
							<Text className="text-sm text-gray-600">
								Automated risk identification
							</Text>
						</div>

						<div className="text-center p-4">
							<div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
								<WarningOutlined className="text-orange-600 text-xl" />
							</div>
							<Text strong className="block text-gray-800">
								Compliance Check
							</Text>
							<Text className="text-sm text-gray-600">
								Legal compliance verification
							</Text>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default ContextualIntelligenceView;
