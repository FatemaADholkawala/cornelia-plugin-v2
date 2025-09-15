// import { jwtDecode, JwtPayload } from "jwt-decode";

// const TOKEN_KEY = "cornelia_tokens";

// export interface Tokens {
// 	accessToken: string;
// 	refreshToken: string;
// 	[key: string]: any; // in case extra fields come from backend
// }

// /**
//  * Get tokens from localStorage
//  */
// export const getTokens = (): Tokens | null => {
// 	try {
// 		const tokens = localStorage.getItem(TOKEN_KEY);
// 		return tokens ? (JSON.parse(tokens) as Tokens) : null;
// 	} catch (error) {
// 		console.error("Error parsing tokens:", error);
// 		return null;
// 	}
// };

// /**
//  * Store tokens in localStorage
//  */
// export const storeTokens = (tokens: Tokens): void => {
// 	localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
// };

// /**
//  * Clear tokens from localStorage
//  */
// export const clearTokens = (): void => {
// 	localStorage.removeItem(TOKEN_KEY);
// };

// /**
//  * Check if a JWT token is expired
//  */
// export const isTokenExpired = (token: string): boolean => {
// 	try {
// 		const decoded = jwtDecode<JwtPayload>(token);
// 		if (!decoded?.exp) return true;
// 		return decoded.exp * 1000 < Date.now();
// 	} catch (error) {
// 		console.error("Invalid token:", error);
// 		return true;
// 	}
// };
