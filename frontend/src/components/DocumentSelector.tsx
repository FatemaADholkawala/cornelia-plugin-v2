"use client";

import React, { useState } from "react";
import {
	Card,
	Button,
	Typography,
	Space,
	Tabs,
	List,
	Tag,
	Divider,
	message,
} from "antd";
import {
	FileTextOutlined,
	PlayCircleOutlined,
	EyeOutlined,
} from "@ant-design/icons";
import { DemoDocument, DemoScenario } from "@/types";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface DocumentSelectorProps {
	documents: DemoDocument[];
	scenarios: DemoScenario[];
	onDocumentSelect: (document: DemoDocument) => void;
	onTextSelect: (text: string) => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
	documents,
	scenarios,
	onDocumentSelect,
	onTextSelect,
}) => {
	const [selectedDocument, setSelectedDocument] = useState<DemoDocument | null>(
		null
	);
	const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(
		null
	);

	const handleDocumentSelect = (document: DemoDocument): void => {
		setSelectedDocument(document);
		setSelectedScenario(null);
	};

	const handleScenarioSelect = (scenario: DemoScenario): void => {
		setSelectedScenario(scenario);
		setSelectedDocument(scenario.document);
	};

	const handleLoadDocument = (): void => {
		if (selectedDocument) {
			onDocumentSelect(selectedDocument);
		}
	};

	const handleLoadScenario = (): void => {
		if (selectedScenario) {
			onDocumentSelect(selectedScenario.document);
			onTextSelect(selectedScenario.selectedText);
			message.success(`Loaded scenario: ${selectedScenario.title}`);
		}
	};

	const getDocumentTypeColor = (type: string): string => {
		const colors: Record<string, string> = {
			contract: "blue",
			agreement: "green",
			policy: "purple",
		};
		return colors[type] || "default";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
							<FileTextOutlined className="text-3xl text-white" />
						</div>
					</div>
					<Title level={1} className="!mb-2">
						Welcome to Cornelia
					</Title>
					<Text type="secondary" className="text-xl">
						AI-Powered Legal Document Analysis
					</Text>
					<Paragraph className="text-lg mt-4 max-w-2xl mx-auto">
						Select a demo document or scenario to explore Cornelia's
						capabilities in legal document analysis, clause review, and contract
						intelligence.
					</Paragraph>
				</div>

				<Tabs
					defaultActiveKey="documents"
					className="bg-white rounded-xl shadow-lg p-6"
				>
					<TabPane tab="Demo Documents" key="documents">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{documents.map((document) => (
								<Card
									key={document.id}
									hoverable
									className={`cursor-pointer transition-all duration-200 ${
										selectedDocument?.id === document.id
											? "ring-2 ring-blue-500 shadow-lg"
											: "hover:shadow-md"
									}`}
									onClick={() => handleDocumentSelect(document)}
								>
									<div className="flex items-start justify-between mb-3">
										<FileTextOutlined className="text-2xl text-blue-600" />
										<Tag color={getDocumentTypeColor(document.type)}>
											{document.type.toUpperCase()}
										</Tag>
									</div>
									<Title level={4} className="!mb-2">
										{document.title}
									</Title>
									<Text type="secondary" className="text-sm">
										{document.parties.length} parties identified
									</Text>
									<div className="mt-3">
										<Text className="text-xs text-gray-500">
											{document.content.length} characters
										</Text>
									</div>
								</Card>
							))}
						</div>

						{selectedDocument && (
							<div className="mt-8 p-6 bg-gray-50 rounded-lg">
								<div className="flex items-center justify-between mb-4">
									<Title level={3} className="!mb-0">
										{selectedDocument.title}
									</Title>
									<Button
										type="primary"
										size="large"
										icon={<PlayCircleOutlined />}
										onClick={handleLoadDocument}
									>
										Load Document
									</Button>
								</div>
								<div className="mb-4">
									<Text strong>Parties:</Text>
									<div className="mt-2">
										{selectedDocument.parties.map((party, index) => (
											<Tag key={index} color="blue" className="mr-2 mb-2">
												{party.name} ({party.role})
											</Tag>
										))}
									</div>
								</div>
								<div>
									<Text strong>Sample Clauses:</Text>
									<List
										size="small"
										dataSource={selectedDocument.sampleClauses}
										renderItem={(clause, index) => (
											<List.Item>
												<Text className="text-sm text-gray-600">
													{index + 1}. {clause}
												</Text>
											</List.Item>
										)}
									/>
								</div>
							</div>
						)}
					</TabPane>

					<TabPane tab="Demo Scenarios" key="scenarios">
						<div className="space-y-6">
							{scenarios.map((scenario) => (
								<Card
									key={scenario.id}
									hoverable
									className={`cursor-pointer transition-all duration-200 ${
										selectedScenario?.id === scenario.id
											? "ring-2 ring-green-500 shadow-lg"
											: "hover:shadow-md"
									}`}
									onClick={() => handleScenarioSelect(scenario)}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<Title level={4} className="!mb-2">
												{scenario.title}
											</Title>
											<Paragraph className="!mb-3">
												{scenario.description}
											</Paragraph>
											<div className="flex items-center gap-4 text-sm text-gray-500">
												<span>Document: {scenario.document.title}</span>
												<span>•</span>
												<span>{scenario.document.parties.length} parties</span>
											</div>
										</div>
										<div className="ml-4">
											<Button
												type="primary"
												icon={<PlayCircleOutlined />}
												onClick={(e) => {
													e.stopPropagation();
													handleScenarioSelect(scenario);
												}}
											>
												Run Scenario
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>

						{selectedScenario && (
							<div className="mt-8 p-6 bg-gray-50 rounded-lg">
								<div className="flex items-center justify-between mb-4">
									<Title level={3} className="!mb-0">
										{selectedScenario.title}
									</Title>
									<Button
										type="primary"
										size="large"
										icon={<PlayCircleOutlined />}
										onClick={handleLoadScenario}
									>
										Load & Run Scenario
									</Button>
								</div>
								<div className="mb-4">
									<Text strong>Selected Text for Analysis:</Text>
									<div className="mt-2 p-3 bg-white rounded border-l-4 border-blue-500">
										<Text className="italic text-gray-700">
											"{selectedScenario.selectedText}"
										</Text>
									</div>
								</div>
								<div>
									<Text strong>Expected Analysis:</Text>
									<div className="mt-2">
										{selectedScenario.expectedAnalysis.risky && (
											<div className="mb-2">
												<Tag color="orange">
													Risky Clauses:{" "}
													{selectedScenario.expectedAnalysis.risky.length}
												</Tag>
											</div>
										)}
										{selectedScenario.expectedAnalysis.acceptable && (
											<div className="mb-2">
												<Tag color="green">
													Acceptable Clauses:{" "}
													{selectedScenario.expectedAnalysis.acceptable.length}
												</Tag>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</TabPane>
				</Tabs>

				<div className="mt-8 text-center">
					<Text type="secondary">
						This is a demo environment. All data is simulated for demonstration
						purposes.
					</Text>
				</div>
			</div>
		</div>
	);
};

export default DocumentSelector;
