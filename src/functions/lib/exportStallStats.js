"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportStallStats = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("./firebase");
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
// Function to generate a PDF buffer for stall statistics
async function generateStallStatsPdfBuffer(stallId, stallName, transactions) {
    logger.info("Generating PDF for stall stats", { stallId, stallName, transactionCount: transactions.length });
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
                layout: 'portrait',
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            // Add header with colored background
            const pageWidth = doc.page.width;
            doc.rect(0, 0, pageWidth, 100).fill('#007AFF'); // Blue header matching app color
            doc.fillColor('white')
                .fontSize(28)
                .text('Basaar Stall Report', 50, 30, { align: 'left' });
            doc.fontSize(18).text(stallName, 50, 65, { align: 'left' });
            doc.fontSize(12).text(`Generated: ${(0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm')}`, 50, 85, { align: 'left' });
            // Reset colors and move down
            doc.fillColor('black')
                .moveDown(3);
            // Calculate statistics
            let totalTransactions = 0;
            let totalSales = 0;
            let totalRefundTransactions = 0;
            let totalRefundAmount = 0;
            let netSales = 0;
            transactions.forEach((t) => {
                if (t.type === 'debit') {
                    totalTransactions++;
                    totalSales += t.amountCents;
                }
                else if (t.type === 'refund') {
                    totalRefundTransactions++;
                    totalRefundAmount += t.amountCents;
                }
            });
            netSales = totalSales - totalRefundAmount; // Net sales is total sales minus refunds
            // Add summary statistics with improved styling
            doc.fontSize(18).fillColor('#007AFF').text('Summary Statistics');
            doc.fillColor('black').moveDown(0.5);
            // Draw a line under the title
            doc.moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke('#007AFF')
                .moveDown(0.5);
            const stats = [
                ['Total Transactions:', totalTransactions.toString()],
                ['Total Sales:', `R${(totalSales / 100).toFixed(2)}`],
                ['Total Refunds:', totalRefundTransactions.toString()],
                ['Refund Amount:', `R${(totalRefundAmount / 100).toFixed(2)}`],
                ['Net Sales:', `R${(netSales / 100).toFixed(2)}`],
            ];
            // Use a table-like layout for better alignment
            const labelX = 50;
            const valueX = 400;
            const rowHeight = 20;
            stats.forEach(([label, value], index) => {
                const yPos = doc.y;
                doc.fontSize(12).text(label, labelX, yPos);
                doc.fontSize(12).text(value, valueX, yPos, { align: 'right' });
                doc.moveDown(rowHeight / 12); // Move down based on font size
            });
            doc.moveDown(1);
            doc.moveDown(2);
            // Add transaction details table header
            if (transactions.length > 0) {
                doc.fontSize(18).fillColor('#007AFF').text('Transaction Details');
                doc.fillColor('black').moveDown(0.5);
                // Draw a line under the title
                doc.moveTo(50, doc.y)
                    .lineTo(550, doc.y)
                    .stroke('#007AFF')
                    .moveDown(0.5);
                // Table headers with better alignment
                const col1X = 50; // Date column
                const col2X = 170; // Type column
                const col3X = 320; // Amount column
                const col4X = 420; // Operator column
                const colWidth = 100;
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Date', col1X, doc.y, { width: colWidth });
                doc.text('Type', col2X, doc.y, { width: colWidth });
                doc.text('Amount', col3X, doc.y, { width: colWidth });
                doc.text('Operator', col4X, doc.y, { width: colWidth });
                doc.font('Helvetica'); // Reset to regular font
                doc.moveDown(0.3);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.3);
                // Add transaction details (limit to first 100 transactions to keep PDF manageable)
                const displayTransactions = transactions.slice(0, 100);
                displayTransactions.forEach((t) => {
                    const date = t.createdAt ? (0, date_fns_1.format)(t.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'Unknown';
                    const type = t.type === 'debit' ? 'Sale' : 'Refund';
                    const amount = `R${(t.amountCents / 100).toFixed(2)}`;
                    // Color code based on transaction type
                    const amountColor = t.type === 'debit' ? 'black' : 'red';
                    doc.fontSize(10);
                    doc.text(date, col1X, doc.y, { width: colWidth });
                    doc.text(type, col2X, doc.y, { width: colWidth });
                    doc.fillColor(amountColor).text(amount, col3X, doc.y, { width: colWidth });
                    doc.fillColor('black').text(t.operatorId || 'Unknown', col4X, doc.y, { width: colWidth });
                    doc.moveDown(0.2);
                });
                if (transactions.length > 100) {
                    doc.moveDown(0.5);
                    doc.fontSize(10).text(`Note: Only the first 100 of ${transactions.length} transactions are shown.`);
                }
            }
            else {
                doc.fontSize(12).text('No transactions found for this stall.');
            }
            // Add footer with page number
            const pageWidth2 = doc.page.width;
            const pageHeight = doc.page.height;
            // For simplicity, we'll just show "Page 1" since our PDF is only one page
            // In a more complex PDF with multiple pages, you would implement proper page numbering
            doc.fontSize(8)
                .text('Basaar Stall Report', 0, pageHeight - 30, { width: pageWidth2, align: 'center' });
            doc.end();
        }
        catch (error) {
            logger.error('Error in PDF generation:', error);
            reject(error);
        }
    });
}
// Callable function for exporting stall statistics as PDF
exports.exportStallStats = https.onCall({ region: "africa-south1" }, async (request) => {
    logger.info("Export stall stats callable function started", { structuredData: true });
    try {
        // Get stall ID from request data
        const { stallId } = request.data;
        logger.info("Received stall ID", { stallId });
        // Validate input
        if (!stallId || typeof stallId !== 'string') {
            throw new https.HttpsError("invalid-argument", "Invalid request: stallId is required and must be a string");
        }
        // Fetch stall details
        const stallDoc = await firebase_1.db.collection("stalls").doc(stallId).get();
        if (!stallDoc.exists) {
            throw new https.HttpsError("not-found", `Stall with ID ${stallId} not found`);
        }
        const stallData = stallDoc.data();
        const stallName = (stallData === null || stallData === void 0 ? void 0 : stallData.name) || 'Unknown Stall';
        const stallType = (stallData === null || stallData === void 0 ? void 0 : stallData.type) || 'Unknown Type';
        logger.info("Fetched stall details", { stallId, stallName, stallType });
        // Fetch transactions for this stall
        const transactionsQuery = firebase_1.db.collection("transactions")
            .where("stallId", "==", stallId)
            .orderBy("createdAt", "desc");
        const transactionsSnapshot = await transactionsQuery.get();
        const transactions = [];
        transactionsSnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push(Object.assign({ id: doc.id }, data));
        });
        logger.info("Fetched transactions", { count: transactions.length });
        // Generate PDF
        logger.info("Generating PDF");
        const pdfBuffer = await generateStallStatsPdfBuffer(stallId, stallName, transactions);
        logger.info("PDF generated successfully", { size: pdfBuffer.length });
        // Convert buffer to base64 for transport
        const base64Data = pdfBuffer.toString('base64');
        // Return the base64 data
        return {
            success: true,
            data: base64Data,
            message: "PDF generated successfully"
        };
    }
    catch (error) {
        logger.error("Error exporting stall stats", { error: error.message, stack: error.stack });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", `Failed to export stall stats: ${error.message}`);
    }
});
//# sourceMappingURL=exportStallStats.js.map