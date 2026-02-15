import { useEffect, useState } from "react";
import { FaTimes, FaReceipt, FaSearch } from "react-icons/fa";
import { ref, onValue, push, set, update, get } from "firebase/database";
import { db } from "../../firebase";
import { useToast } from "../Toast/useToast";

const CreateReceiptModal = ({ open, onClose }) => {
    const { push: pushToast } = useToast();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    // Load all members
    useEffect(() => {
        if (!open) return;

        const usersRef = ref(db, "users");
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const users = snapshot.val() || {};
            const membersList = Object.entries(users)
                .filter(([id, user]) => user.role === "member")
                .map(([id, user]) => ({
                    id,
                    name: user.fullName || user.name || user.displayName || "Unknown",
                    flat: user.flatNumber || user.flat || "N/A",
                    email: user.email || "",
                    dues: user.dues || 0,
                }));
            setMembers(membersList);
        });

        return () => unsubscribe();
    }, [open]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setSearchTerm("");
            setSelectedMember(null);
            setAmount("");
            setPaymentMethod("cash");
            setNotes("");
        }
    }, [open]);

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.flat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateReceipt = async () => {
        if (!selectedMember) {
            pushToast({ type: "warning", title: "No Member Selected", description: "Please select a member." });
            return;
        }

        const amountNum = Number(amount);
        if (!amount || amountNum <= 0) {
            pushToast({ type: "warning", title: "Invalid Amount", description: "Please enter a valid amount." });
            return;
        }

        setLoading(true);

        try {
            const now = Date.now();
            const receiptId = `RCPT-${now}-${Math.floor(Math.random() * 9000 + 1000)}`;

            // Create payment record
            const payment = {
                uid: selectedMember.id,
                email: selectedMember.email,
                name: selectedMember.name,
                member: selectedMember.name,
                flat: selectedMember.flat,
                amount: amountNum,
                method: paymentMethod,
                methodDetails: 
                    paymentMethod === "cash" ? { note: notes || "Paid in cash" } :
                    paymentMethod === "upi" ? { note: notes || "Paid via UPI" } :
                    paymentMethod === "card" ? { note: notes || "Paid via Card" } :
                    paymentMethod === "bank_transfer" ? { note: notes || "Bank Transfer" } :
                    { note: notes || "Payment received" },
                receipt: receiptId,
                date: new Date().toLocaleDateString("en-IN"),
                createdAt: now,
                previousDue: Number(selectedMember.dues || 0),
                remainingDue: Math.max(0, Number(selectedMember.dues || 0) - amountNum),
                status: "completed",
                createdBy: "admin"
            };

            // Save to recentPayments
            const paymentsRef = ref(db, "recentPayments");
            const newPaymentRef = push(paymentsRef);
            await set(newPaymentRef, payment);

            // Update user's dues and paid amount
            const userRef = ref(db, `users/${selectedMember.id}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val() || {};
            
            const newDues = Math.max(0, Number(userData.dues || 0) - amountNum);
            const newPaid = Number(userData.paid || 0) + amountNum;

            await update(userRef, {
                dues: newDues,
                paid: newPaid,
                lastPayment: now
            });

            // Create notification for admin
            const adminNotificationRef = push(ref(db, "adminNotifications"));
            await set(adminNotificationRef, {
                type: "payment",
                title: "Manual Receipt Created",
                message: `Receipt ${receiptId} created for ${selectedMember.name} (${selectedMember.flat}) - ₹${amountNum.toLocaleString('en-IN')}`,
                timestamp: now,
                read: false,
                amount: amountNum,
                memberName: selectedMember.name,
                flat: selectedMember.flat
            });

            setLoading(false);
            pushToast({
                type: "success",
                title: "Receipt Created",
                description: `Receipt ${receiptId} created successfully for ${selectedMember.name}`,
            });
            onClose();
        } catch (error) {
            console.error("Error creating receipt:", error);
            setLoading(false);
            pushToast({
                type: "error",
                title: "Error",
                description: "Failed to create receipt. Please try again.",
            });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <FaReceipt className="text-green-600 text-2xl" />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Receipt</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Member Selection */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Member <span className="text-red-500">*</span>
                        </label>
                        
                        {!selectedMember ? (
                            <>
                                <div className="relative mb-3">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name, flat, or email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                                    {filteredMembers.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            No members found
                                        </div>
                                    ) : (
                                        filteredMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setAmount(member.dues > 0 ? member.dues.toString() : "");
                                                }}
                                                className="w-full p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-white">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Flat {member.flat} • {member.email}
                                                        </p>
                                                    </div>
                                                    {member.dues > 0 && (
                                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                            Due: ₹{member.dues.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            {selectedMember.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Flat {selectedMember.flat} • {selectedMember.email}
                                        </p>
                                        {selectedMember.dues > 0 && (
                                            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                                                Outstanding Dues: ₹{selectedMember.dues.toLocaleString('en-IN')}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedMember(null)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedMember && (
                        <>
                            {/* Amount */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "cash", label: "💵 Cash" },
                                        { value: "upi", label: "📱 UPI" },
                                        { value: "card", label: "💳 Card" },
                                        { value: "bank_transfer", label: "🏦 Bank Transfer" },
                                    ].map((method) => (
                                        <button
                                            key={method.value}
                                            onClick={() => setPaymentMethod(method.value)}
                                            className={`p-3 rounded-lg border-2 font-medium transition ${
                                                paymentMethod === method.value
                                                    ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400"
                                            }`}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notes.length}/200 characters
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    💡 This will create a receipt and update the member's payment records automatically.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateReceipt}
                        disabled={loading || !selectedMember}
                        className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FaReceipt />
                        {loading ? "Creating..." : "Create Receipt"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateReceiptModal;
