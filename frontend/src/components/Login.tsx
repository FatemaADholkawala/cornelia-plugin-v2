"use client";

import React, { useState } from "react";
import { Button, Form, Input, Card, Typography, Alert, Space } from "antd";
import {
	UserOutlined,
	LockOutlined,
	FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types";

const { Title, Text } = Typography;

const Login: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { login, authError, clearError } = useAuth();

	const handleSubmit = async (values: LoginCredentials): Promise<void> => {
		setLoading(true);
		clearError();

		try {
			const result = await login(values);
			if (!result.success) {
				console.error("Login failed:", result.error);
			}
		} catch (error) {
			console.error("Login error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-md shadow-xl">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
							<FileTextOutlined className="text-2xl text-white" />
						</div>
					</div>
					<Title level={2} className="!mb-2">
						Cornelia
					</Title>
					<Text type="secondary" className="text-lg">
						AI-Powered Legal Document Analysis
					</Text>
				</div>

				{authError && (
					<Alert
						message="Login Failed"
						description={authError}
						type="error"
						showIcon
						className="mb-6"
					/>
				)}

				<Form
					name="login"
					onFinish={handleSubmit}
					layout="vertical"
					size="large"
				>
					<Form.Item
						name="username"
						rules={[{ required: true, message: "Please enter your username" }]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder="Username"
							disabled={loading}
						/>
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: "Please enter your password" }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder="Password"
							disabled={loading}
						/>
					</Form.Item>

					<Form.Item className="!mb-0">
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							className="w-full h-12 text-lg font-medium"
						>
							Sign In
						</Button>
					</Form.Item>
				</Form>

				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
					<Text type="secondary" className="text-sm">
						<strong>Demo Credentials:</strong>
					</Text>
					<div className="mt-2 space-y-1">
						<Text code className="text-sm">
							Username: demo
						</Text>
						<br />
						<Text code className="text-sm">
							Password: demo
						</Text>
					</div>
				</div>

				<div className="mt-6 text-center">
					<Text type="secondary" className="text-xs">
						Powered by Next.js 15 & TypeScript
					</Text>
				</div>
			</Card>
		</div>
	);
};

export default Login;
