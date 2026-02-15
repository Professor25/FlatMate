import { useState } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { ref, push, set } from "firebase/database";
import { db } from "../../firebase";
import { useToast } from "../Toast/useToast";

const ContactAdminModal = ({ open, onClose, profile, uid }) => {
    const { push: pushToast } = useToast();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!subject.trim()) {
            pushToast({ type: "warning", title: "Subject Required", description: "Please enter a subject for your query." });
            return;
        }

        if (!message.trim()) {
            pushToast({ type: "warning", title: "Message Required", description: "Please enter your query message." });
            return;
        }

        setSending(true);

        try {
            const queriesRef = ref(db, "queries");
            const newQueryRef = push(queriesRef);
            
            await set(newQueryRef, {
                uid: uid || null,
                memberName: profile?.fullName || profile?.name || profile?.displayName || "Unknown Member",
                email: profile?.email || "",
                flat: profile?.flatNumber || profile?.flat || "N/A",
                subject: subject.trim(),
                message: message.trim(),
                status: "open",
                timestamp: Date.now(),
            });

            pushToast({
                type: "success",
                title: "Query Submitted",
                description: "Your query has been sent to the admin. They will respond soon.",
            });

            // Reset form
            setSubject("");
            setMessage("");
            onClose();
        } catch (error) {
            console.error("Error submitting query:", error);
            pushToast({
                type: "error",
                title: "Error",
                description: "Failed to submit query. Please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Admin</h2>
                    <button
                        onClick={onClose}
                        disabled={sending}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition disabled:opacity-50"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Details
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p><strong>Name:</strong> {profile?.fullName || profile?.name || "N/A"}</p>
                            <p><strong>Flat:</strong> {profile?.flatNumber || profile?.flat || "N/A"}</p>
                            <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief description of your query"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your query in detail..."
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={sending}
                            maxLength={1000}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {message.length}/1000 characters
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            💡 Your query will be sent to the admin team. They typically respond within 24-48 hours.
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={sending}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>Submitting...</>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    Submit Query
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactAdminModal;
