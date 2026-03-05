// Utility to generate and download a FlatMate receipt as HTML
// Usage: generateAndDownloadReceipt(payment, profile)

export function generateAndDownloadReceipt(payment, profile) {
    if (!payment) return;
    // Use fullName as primary, fallback to other fields
    const name = payment.name || profile?.fullName || profile?.name || profile?.displayName || "N/A";
    const flat = profile?.flatNumber || profile?.flat || payment.flat || "N/A";
    const receipt = payment.receipt || `RCPT-${payment.createdAt || Date.now()}`;
    // Robustly fetch amount paid and payment method from payment object
    let paid = payment.amount;
    if (paid === undefined || paid === null || isNaN(Number(paid))) paid = 0;
    paid = Number(paid).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let method = payment.method || payment.paymentMethod || (payment.methodDetails && payment.methodDetails.gateway) || (payment.methodDetails && payment.methodDetails.note) || "N/A";
    if (typeof method === "string") method = method.toUpperCase();
    else if (typeof method === "object") method = JSON.stringify(method);
    const remaining = Number(payment.remainingDue ?? profile?.dues ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const date = payment.date || new Date().toLocaleDateString("en-IN");

    const html = `<!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>${name} Receipt - ${receipt}</title>
        <style>
            body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:24px;background:#f8fafc}
            .container{max-width:700px;margin:40px auto;border:1px solid #e6edf3;padding:32px 24px 24px 24px;border-radius:10px;background:#fff;box-shadow:0 2px 16px #0001}
            .header{display:flex;align-items:center;gap:16px;margin-bottom:18px}
            .logo-icon{display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#1e293b;border-radius:12px;box-shadow:0 1px 6px #0002}
            .logo-icon svg{width:32px;height:32px;display:block;}
            .logo-text{font-size:2rem;font-weight:700;color:#222;letter-spacing:0.5px;}
            h1{margin:0;font-size:24px;letter-spacing:0.5px}
            .meta{color:#555;font-size:14px;margin-top:2px}
            table{width:100%;margin-top:18px;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden}
            td{padding:12px 10px;border-bottom:1px solid #e5e7eb}
            td.label{width:42%;font-weight:600;color:#333;background:#f1f5f9}
            tr:last-child td{border-bottom:none}
            .note{margin-top:22px;color:#555;font-size:13px;text-align:right}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="32" height="32" fill="#3b82f6">
                        <path d="M128 64a64 64 0 1 1 128 0V96h48c26.5 0 48 21.5 48 48V464c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16V144c0-26.5 21.5-48 48-48h48V64zm32 32V96h96V96 64a32 32 0 1 0-64 0V96H160zm-16 96v48a16 16 0 1 0 32 0V192a16 16 0 1 0-32 0zm80 0v48a16 16 0 1 0 32 0V192a16 16 0 1 0-32 0zM144 304v48a16 16 0 1 0 32 0V304a16 16 0 1 0-32 0zm80 0v48a16 16 0 1 0 32 0V304a16 16 0 1 0-32 0z"/>
                    </svg>
                </div>
                <span class="logo-text">FlatMate</span>
                <div>
                    <h1>Payment Receipt</h1>
                    <div class="meta">FlatMate — Society Maintenance</div>
                </div>
            </div>

            <table>
                <tr><td class="label">Receipt No:</td><td>${receipt}</td></tr>
                <tr><td class="label">Name:</td><td>${name}</td></tr>
                <tr><td class="label">Flat:</td><td>${flat}</td></tr>
                <tr><td class="label">Date:</td><td>${date}</td></tr>
                <tr><td class="label">Amount Paid:</td><td>₹${paid}</td></tr>
                <tr><td class="label">Payment Method:</td><td>${method}</td></tr>
                <tr><td class="label">Remaining Due:</td><td>₹${remaining}</td></tr>
            </table>

            <p class="note">This is a system generated receipt from FlatMate.</p>
        </div>
    </body>
    </html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    // Use user's name for filename, fallback to receipt if not available
    const safeName = name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName ? safeName : receipt}_Receipt.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
