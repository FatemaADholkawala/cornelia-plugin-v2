"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface TimerContextType {
	elapsedTime: number;
	isRunning: boolean;
	startTimer: () => void;
	stopTimer: () => void;
	resetTimer: () => void;
	formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | null>(null);

export const useTimer = (): TimerContextType => {
	const context = useContext(TimerContext);
	if (!context) {
		throw new Error("useTimer must be used within a TimerProvider");
	}
	return context;
};

interface TimerProviderProps {
	children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
	const [elapsedTime, setElapsedTime] = useState<number>(0);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [startTime, setStartTime] = useState<number>(Date.now());

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;

		if (isRunning) {
			interval = setInterval(() => {
				setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
			}, 1000);
		}

		return () => {
			if (interval !== undefined) {
				clearInterval(interval);
			}
		};
	}, [isRunning, startTime]);

	const startTimer = (): void => {
		if (!isRunning) {
			setStartTime(Date.now() - elapsedTime * 1000);
			setIsRunning(true);
		}
	};

	const stopTimer = (): void => {
		setIsRunning(false);
	};

	const resetTimer = (): void => {
		setElapsedTime(0);
		setStartTime(Date.now());
		setIsRunning(true);
	};

	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}
		return `${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const value: TimerContextType = {
		elapsedTime,
		isRunning,
		startTimer,
		stopTimer,
		resetTimer,
		formatTime,
	};

	return (
		<TimerContext.Provider value={value}>{children}</TimerContext.Provider>
	);
};
