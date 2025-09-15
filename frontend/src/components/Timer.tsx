"use client";

import React from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useTimer } from "@/contexts/TimerContext";

const Timer: React.FC = () => {
	const { elapsedTime, formatTime } = useTimer();

	return (
		<div className="flex items-center gap-2 text-gray-600">
			<ClockCircleOutlined />
			<span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
		</div>
	);
};

export default Timer;
