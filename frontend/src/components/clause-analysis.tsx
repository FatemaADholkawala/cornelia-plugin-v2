import { useState } from "react";
import Loader from "./loader";
// import {
// 	FileSearchOutlined,
// 	CheckCircleOutlined,
// 	WarningOutlined,
// 	ExclamationCircleOutlined,
// } from "@ant-design/icons";
// import { Button, Select, Tag } from "antd";
const ClauseAnalysis = () => {
	// const [clauseAnalysisLoading, setClauseAnalysisLoading] = useState(false);
	// const [isLoadingParties, setIsLoadingParties] = useState(false);
	// const [parties, setParties] = useState<string[]>([]);
	// const [clauseAnalysis, setClauseAnalysis] = useState(null);
	// const [selectedParty, setSelectedParty] = useState<string | null>(null);
	// const [activeView, setActiveView] = useState<"overview" | "analysis">(
	// 	"overview"
	// );
	// const clauseAnalysisCounts = {
	// 	acceptable: 5,
	// 	risky: 2,
	// 	missing: 1,
	// };

	// const renderPartyOption = (party) => ({
	// 	value: party?.name,
	// 	label: (
	// 		<div
	// 			style={{
	// 				display: "flex",
	// 				flexDirection: "column",
	// 				gap: "4px",
	// 				width: "100%",
	// 				maxWidth: "280px",
	// 			}}
	// 		>
	// 			<span
	// 				style={{
	// 					fontWeight: 500,
	// 					wordWrap: "break-word",
	// 					whiteSpace: "normal",
	// 					lineHeight: "1.4",
	// 				}}
	// 			>
	// 				{party.name}
	// 			</span>
	// 			<Tag
	// 				color={"blue"}
	// 				style={{
	// 					maxWidth: "100%",
	// 					whiteSpace: "normal",
	// 					height: "auto",
	// 					padding: "2px 8px",
	// 					lineHeight: "1.4",
	// 				}}
	// 			>
	// 				{party.role || "Unknown Role"}
	// 			</Tag>
	// 		</div>
	// 	),
	// });

	return (
		<div className="px-4">
			<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200">
				<div className="flex flex-col custom-flex-row items-center justify-between gap-4">
					<div className="w-full">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-gray-800 m-0">
								Document Analysis
							</h3>

							{/* {!clauseAnalysis &&
								(isLoadingParties ? (
									<Button className="w-[200px]">Analyzing Parties...</Button>
								) : clauseAnalysisLoading ? (
									<div className="flex items-center gap-2">
										<Loader />
										<span className="text-gray-600">Analyzing document...</span>
									</div>
								) : parties && parties.length > 0 ? (
									<Select
										placeholder="Select Party"
										style={{ width: 300 }}
										//options={parties.map(renderPartyOption)}
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
										onChange={() => {}}
									/>
								) : (
									<div className="text-gray-500">No parties found</div>
								))}

							{selectedParty && clauseAnalysis && !clauseAnalysisLoading && (
								<Button
									className="!bg-green-600 !hover:bg-green-700 !border-green-600 !text-white !px-6 !h-9 !text-sm !font-medium"
									icon={<FileSearchOutlined className="text-lg" />}
									onClick={() => setActiveView("analysis")}
								>
									View Analysis
								</Button>
							)} */}
						</div>

						{/* {selectedParty && clauseAnalysis && !clauseAnalysisLoading && (
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
										className={`flex flex-col items-center p-4 rounded-lgbg-${color}-50 border border-${color}-200 hover:shadow-md transition-all duration-200 cursor-help`}
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
						)} */}
					</div>
				</div>
			</div>
		</div>
	);
};
export default ClauseAnalysis;
