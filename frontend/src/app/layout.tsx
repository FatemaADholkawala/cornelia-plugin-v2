import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { TimerProvider } from "@/contexts/TimerContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Cornelia - AI Legal Document Analysis",
	description: "AI-powered legal document analysis and contract review tool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<AuthProvider>
					<AnalysisProvider>
						<TimerProvider>{children}</TimerProvider>
					</AnalysisProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
