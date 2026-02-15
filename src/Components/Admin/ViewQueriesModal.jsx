import { useEffect, useState } from "react";
import { FaTimes, FaCheckCircle, FaQuestionCircle, FaUser, FaHome, FaReply, FaPaperPlane } from "react-icons/fa";
import { ref, onValue, update, push, set } from "firebase/database";
import { db } from "../../firebase";
import { useToast } from "../Toast/useToast";

const ViewQueriesModal = ({ open, onClose }) => {
    const { push: pushToast } = useToast();
    const [queries, setQueries] = useState([]);
    const [filter, setFilter] = useState("all"); // 'all', 'open', 'resolved'
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    // Load queries from Firebase
    useEffect(() => {
        if (!open) return;
        
        const queriesRef = ref(db, "queries");
        const unsubscribe = onValue(queriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const queriesList = Object.entries(data)
                    .map(([id, query]) => ({ id, ...query }))
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                setQueries(queriesList);
            } else {
                setQueries([]);
            }
        });

        return () => unsubscribe();
    }, [open]);

    const handleStatusChange = async (queryId, newStatus) => {
        try {
            const queryRef = ref(db, `queries/${queryId}`);
            await update(queryRef, { 
                status: newStatus,
                resolvedAt: newStatus === "resolved" ? Date.now() : null
            });
            pushToast({ 
                type: "success", 
                title: "Query Updated", 
                description: `Query marked as ${newStatus}` 
            });
        } catch (error) {
            console.error("Error updating query:", error);
            pushToast({ 
                type: "error", 
                title: "Error", 
                description: "Failed to update query status" 
            });
        }
    };

    const handleSendReply = async (queryId, memberId) => {
        if (!replyText.trim()) {
            pushToast({ 
                type: "warning", 
                title: "Empty Reply", 
                description: "Please enter a reply message" 
            });
            return;
        }

        try {
            const now = Date.now();
            
            // Add reply to the query
            const replyRef = push(ref(db, `queries/${queryId}/replies`));
            await set(replyRef, {
                message: replyText.trim(),
                timestamp: now,
                from: "admin"
            });

            // Create notification for the member
            if (memberId) {
                const notificationRef = push(ref(db, `userNotifications/${memberId}`));
                await set(notificationRef, {
                    type: "query_reply",
                    title: "Admin Reply to Your Query",
                    message: replyText.trim(),
                    queryId: queryId,
                    timestamp: now,
                    read: false,
                    from: "admin"
                });
            }

            pushToast({ 
                type: "success", 
                title: "Reply Sent", 
                description: "Your reply has been sent to the member" 
            });
            
            setReplyText("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error sending reply:", error);
            pushToast({ 
                type: "error", 
                title: "Error", 
                description: "Failed to send reply" 
            });
        }
    };

    const filteredQueries = queries.filter(q => {
        if (filter === "open") return q.status === "open";
        if (filter === "resolved") return q.status === "resolved";
        return true;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleString("en-IN", { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <FaQuestionCircle className="text-yellow-600 text-2xl" />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Member Queries</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            All ({queries.length})
                        </button>
                        <button
                            onClick={() => setFilter("open")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === "open"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            Open ({queries.filter(q => q.status === "open").length})
                        </button>
                        <button
                            onClick={() => setFilter("resolved")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === "resolved"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            Resolved ({queries.filter(q => q.status === "resolved").length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {filteredQueries.length === 0 ? (
                        <div className="text-center py-12">
                            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                {filter === "open" ? "No Open Queries" : filter === "resolved" ? "No Resolved Queries" : "No Queries Yet"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {filter === "open" ? "All queries have been resolved!" : "Members haven't submitted any queries yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredQueries.map((query) => (
                                <div
                                    key={query.id}
                                    className={`p-4 rounded-lg border-2 transition ${
                                        query.status === "resolved"
                                            ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                                            : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaUser className="text-gray-500 dark:text-gray-400 text-sm" />
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {query.memberName || "Unknown Member"}
                                                </span>
                                                {query.flat && (
                                                    <>
                                                        <FaHome className="text-gray-500 dark:text-gray-400 text-sm ml-2" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Flat {query.flat}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                {query.email}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                query.status === "resolved"
                                                    ? "bg-green-600 text-white"
                                                    : "bg-yellow-600 text-white"
                                            }`}
                                        >
                                            {query.status === "resolved" ? "Resolved" : "Open"}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-gray-800 dark:text-white font-medium mb-1">
                                            {query.subject || "No Subject"}
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                            {query.message}
                                        </p>
                                    </div>

                                    {/* Display Replies */}
                                    {query.replies && Object.keys(query.replies).length > 0 && (
                                        <div className="mb-3 pl-4 border-l-2 border-blue-500">
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Admin Replies:</p>
                                            {Object.entries(query.replies).map(([replyId, reply]) => (
                                                <div key={replyId} className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{reply.message}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {formatDate(reply.timestamp)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input Area */}
                                    {replyingTo === query.id ? (
                                        <div className="mb-3">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply to the member..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                maxLength={500}
                                            />
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {replyText.length}/500 characters
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText("");
                                                        }}
                                                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendReply(query.id, query.uid)}
                                                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center gap-2"
                                                    >
                                                        <FaPaperPlane className="text-xs" />
                                                        Send Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Submitted: {formatDate(query.timestamp)}
                                        </span>
                                        <div className="flex gap-2">
                                            {replyingTo !== query.id && (
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(query.id);
                                                        setReplyText("");
                                                    }}
                                                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center gap-2"
                                                >
                                                    <FaReply className="text-xs" />
                                                    Reply
                                                </button>
                                            )}
                                            {query.status === "open" ? (
                                                <button
                                                    onClick={() => handleStatusChange(query.id, "resolved")}
                                                    className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(query.id, "open")}
                                                    className="px-3 py-1.5 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition"
                                                >
                                                    Reopen
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Queries: {filteredQueries.length}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewQueriesModal;
