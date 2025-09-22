"use client";

import React from "react";
import {
	ClockCircleOutlined,
	PlayCircleOutlined,
	PauseCircleOutlined,
	RedoOutlined,
} from "@ant-design/icons";
import { useTimer } from "@/contexts/TimerContext";

const Timer: React.FC = () => {
	const {
		elapsedTime,
		isRunning,
		startTimer,
		stopTimer,
		resetTimer,
		formatTime,
	} = useTimer();

	return (
		<div className="flex items-center gap-3 text-gray-600">
			<div className="flex items-center gap-2">
				<ClockCircleOutlined />
				<span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
			</div>
			<div className="flex items-center gap-2">
				{isRunning ? (
					<button
						type="button"
						aria-label="Stop timer"
						className="text-red-600 hover:text-red-700"
						onClick={stopTimer}
					>
						<PauseCircleOutlined className="text-lg" />
					</button>
				) : (
					<button
						type="button"
						aria-label="Start timer"
						className="text-green-600 hover:text-green-700"
						onClick={startTimer}
					>
						<PlayCircleOutlined className="text-lg" />
					</button>
				)}
				<button
					type="button"
					aria-label="Reset timer"
					className="text-gray-600 hover:text-gray-800"
					onClick={resetTimer}
				>
					<RedoOutlined className="text-lg" />
				</button>
			</div>
		</div>
	);
};

export default Timer;
