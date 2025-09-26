"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { User, LoginCredentials, AuthContextType } from "@/types";
import { authApi } from "@/services/api";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [user, setUser] = useState<User | null>(null);
	const [authError, setAuthError] = useState<string | null>(null);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async (): Promise<void> => {
		try {
			// Check tokens directly like the original project
			const tokens = authApi.getTokens();
			if (tokens && !authApi.isTokenExpired(tokens.access)) {
				setIsAuthenticated(true);
				try {
					const userProfile = await authApi.getProfile();
					setUser(userProfile);
				} catch (error) {
					console.error("Failed to fetch user profile:", error);
				}
			} else {
				setIsAuthenticated(false);
				setUser(null);
			}
		} catch (error) {
			console.error("Failed to check auth status:", error);
			setIsAuthenticated(false);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (
		credentials: LoginCredentials
	): Promise<{ success: boolean; error?: string }> => {
		setAuthError(null);
		try {
			const result = await authApi.login(
				credentials.username,
				credentials.password
			);

			if (result.success) {
				setIsAuthenticated(true);
				const userProfile = await authApi.getProfile();
				setUser(userProfile);
				return { success: true };
			} else {
				setAuthError(result.error || "Login failed");
				return { success: false, error: result.error };
			}
		} catch (error: any) {
			const errorMessage = error.message || "Login failed";
			setAuthError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const logout = (): void => {
		authApi.logout();
		setIsAuthenticated(false);
		setUser(null);
		setAuthError(null);
	};

	const clearError = (): void => {
		setAuthError(null);
	};

	const value: AuthContextType = {
		isAuthenticated,
		isLoading,
		user,
		login,
		logout,
		checkAuthStatus,
		authError,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
