"use client";

import React from "react";
import { Comment } from "@/types";
import CommentListView from "../views/CommentListView";

interface DocumentCommentSectionProps {
	comments: Comment[];
	setComments: (comments: Comment[]) => void;
	initialResolvedComments: Comment[];
	onCommentUpdate: (comment: Comment) => void;
}

const DocumentCommentSection: React.FC<DocumentCommentSectionProps> = ({
	comments,
	setComments,
	initialResolvedComments,
	onCommentUpdate,
}) => {
	return (
		<div className="flex-1 px-4 min-h-0">
			<div className="bg-gray-50 rounded-xl p-4 h-full border border-gray-100">
				<h3 className="text-md font-semibold text-gray-800 mb-2">
					Document Comments
				</h3>
				<div className="comments-scroll-container">
					<CommentListView
						comments={comments}
						setComments={setComments}
						initialResolvedComments={initialResolvedComments}
						onCommentUpdate={onCommentUpdate}
					/>
				</div>
			</div>
		</div>
	);
};

export default DocumentCommentSection;
