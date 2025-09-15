"use client";

import React from "react";
import { Button, Spin, Progress, Typography } from "antd";
import { FileTextOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface SummarySectionProps {
	homeSummaryLoading: boolean;
	summaryProgress: number;
	homeSummaryReady: boolean;
	handleHomeSummaryClick: () => void;
	summary: any;
	setActiveView: (view: any) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
	homeSummaryLoading,
	summaryProgress,
	homeSummaryReady,
	handleHomeSummaryClick,
	summary,
	setActiveView,
}) => {
	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<FileTextOutlined className="text-xl text-blue-600" />
					<Text strong className="text-lg">
						Document Summary
					</Text>
				</div>
				{summary && (
					<Button
						type="link"
						icon={<ArrowRightOutlined />}
						onClick={() => setActiveView("summary")}
						className="text-blue-600 hover:text-blue-700"
					>
						View Full Summary
					</Button>
				)}
			</div>

			<div className="min-h-[120px] flex items-center justify-center">
				{homeSummaryLoading ? (
					<div className="text-center w-full">
						<Spin size="large" />
						<div className="mt-4">
							<Text type="secondary">Generating summary...</Text>
							<Progress
								percent={Math.round(summaryProgress)}
								size="small"
								className="mt-2"
								showInfo={false}
							/>
						</div>
					</div>
				) : summary ? (
					<div className="w-full">
						<div className="mb-3">
							<Text className="text-gray-700 line-clamp-3">
								{summary.content}
							</Text>
						</div>
						{summary.keyPoints && summary.keyPoints.length > 0 && (
							<div>
								<Text strong className="text-sm text-gray-600">
									Key Points:
								</Text>
								<ul className="mt-1 text-sm text-gray-600">
									{summary.keyPoints
										.slice(0, 3)
										.map((point: string, index: number) => (
											<li key={index} className="truncate">
												• {point}
											</li>
										))}
								</ul>
							</div>
						)}
					</div>
				) : (
					<div className="text-center">
						<FileTextOutlined className="text-4xl text-gray-300 mb-2" />
						<Text type="secondary">No summary available</Text>
						<div className="mt-3">
							<Button
								type="primary"
								onClick={handleHomeSummaryClick}
								loading={homeSummaryLoading}
								disabled={homeSummaryLoading}
							>
								Generate Summary
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SummarySection;
