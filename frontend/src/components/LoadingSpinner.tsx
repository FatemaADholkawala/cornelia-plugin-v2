"use client";

import React from "react";
import { Spin } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const LoadingSpinner: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
			<div className="text-center">
				<div className="mb-4">
					<FileTextOutlined className="text-6xl text-blue-600" />
				</div>
				<Spin size="large" />
				<div className="mt-4">
					<p className="text-lg text-gray-600">Loading Cornelia...</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
