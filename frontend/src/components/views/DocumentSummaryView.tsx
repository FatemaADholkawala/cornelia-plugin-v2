"use client";

import React from "react";
import {
	Typography,
	Alert,
	Spin,
	Card,
	Space,
	Button,
	Tooltip,
	message,
	Progress,
} from "antd";
import {
	FileSearchOutlined,
	CopyOutlined,
	LikeOutlined,
	DislikeOutlined,
	ArrowLeftOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { ActiveView } from "@/types";

const { Paragraph, Title } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface DocumentSummaryProps {
	documentContent: string;
	summary: string;
	isLoading: boolean;
	progress: number;
	error: string | null;
	onGenerateSummary: () => void;
	setActiveView: (view: ActiveView | null) => void;
}

const DocumentSummaryView: React.FC<DocumentSummaryProps> = ({
	documentContent,
	summary,
	isLoading,
	progress,
	error,
	onGenerateSummary,
	setActiveView,
}) => {
	const handleCopy = () => {
		const selection = window.getSelection();
		const range = document.createRange();

		// Create a temporary container with clean styling
		const tempContainer = document.createElement("div");
		tempContainer.style.cssText = `
      position: fixed;
      left: -9999px;
      color: black !important;
      background: white !important;
      font-family: Arial, sans-serif;
      font-size: 14px;
      white-space: pre-wrap;
    `;

		// Clean and format the content with explicit black text
		tempContainer.innerHTML = summary
			.split("\n")
			.map((line) => {
				const parts = line.split(/(\*\*.*?\*\*)/g);
				return parts
					.map((part) => {
						if (part.startsWith("**") && part.endsWith("**")) {
							// Force black color for bold text
							return `<strong style="font-weight: bold; color: black !important; background: none;">${part.slice(
								2,
								-2
							)}</strong>`;
						}
						// Force black color for regular text
						return `<span style="color: black !important;">${part}</span>`;
					})
					.join("");
			})
			.join("<br>");

		document.body.appendChild(tempContainer);

		try {
			range.selectNodeContents(tempContainer);
			selection?.removeAllRanges();
			selection?.addRange(range);
			document.execCommand("copy");
			message.success("Summary copied to clipboard!");
		} catch (err) {
			message.error("Failed to copy summary");
		} finally {
			document.body.removeChild(tempContainer);
		}
	};

	const handleBack = () => {
		setActiveView("home");
	};

	const renderContent = (text: string) => {
		if (!text) return null;

		return text.split("**").map((part, i) =>
			i % 2 === 0 ? (
				<span key={i}>{part}</span>
			) : (
				<span key={i} className="font-bold text-blue-600">
					{part}
				</span>
			)
		);
	};

	const renderLoadingState = () => (
		<div className="flex flex-col items-center justify-center py-12">
			<Space direction="vertical" align="center" size="large">
				<Spin indicator={antIcon} />
				<div className="text-center">
					<Title level={4} className="text-gray-500 mb-2">
						Analyzing Document
					</Title>
					<Paragraph className="text-gray-400 mb-4">
						This may take a few moments...
					</Paragraph>
					{progress > 0 ? (
						<div className="w-64">
							<Progress
								percent={progress}
								status="active"
								strokeColor={{
									"0%": "#108ee9",
									"100%": "#87d068",
								}}
							/>
						</div>
					) : (
						<div className="w-64">
							<Progress
								percent={0}
								status="active"
								strokeColor="#108ee9"
								className="opacity-50"
							/>
						</div>
					)}
				</div>
			</Space>
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			{/* Header with back button */}
			<div className="p-4 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<Button
						type="text"
						icon={<ArrowLeftOutlined />}
						onClick={handleBack}
						className="!text-gray-500 hover:!text-gray-700"
					/>
					<Title level={4} className="m-0">
						Document Summary
					</Title>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-auto p-4">
				{error && (
					<Alert
						message="Summary Generation Failed"
						description={error}
						type="error"
						showIcon
						className="mb-4"
					/>
				)}

				{isLoading || (!summary && !error) ? (
					renderLoadingState()
				) : summary ? (
					<Card
						className="summary-card"
						variant="outlined"
						styles={{ body: { padding: "24px" } }}
					>
						<Paragraph className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
							{renderContent(summary)}
						</Paragraph>

						<div className="flex justify-end mt-4 space-x-2 border-t pt-4">
							<Tooltip title="Copy Summary">
								<Button
									icon={<CopyOutlined />}
									onClick={handleCopy}
									type="text"
								/>
							</Tooltip>
							<Tooltip title="Helpful">
								<Button icon={<LikeOutlined />} type="text" />
							</Tooltip>
							<Tooltip title="Not Helpful">
								<Button icon={<DislikeOutlined />} type="text" />
							</Tooltip>
						</div>
					</Card>
				) : (
					<div className="text-center py-12">
						<Space direction="vertical" align="center">
							<FileSearchOutlined className="text-4xl text-gray-300" />
							<Title level={4} className="text-gray-500">
								No Summary Available
							</Title>
							<Paragraph className="text-gray-400">
								Please generate a summary first
							</Paragraph>
						</Space>
					</div>
				)}
			</div>
		</div>
	);
};

export default DocumentSummaryView;
