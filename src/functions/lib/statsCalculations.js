"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSalesStats = calculateSalesStats;
const firebase_1 = require("./firebase");
async function calculateSalesStats(transactionsSnapshot) {
    var _a;
    const salesByStall = {};
    let totalSales = 0;
    transactionsSnapshot.forEach((doc) => {
        const t = doc.data();
        const amount = t.type === "refund" ? -t.amountCents : t.amountCents;
        totalSales += amount;
        if (t.stallId) {
            salesByStall[t.stallId] = (salesByStall[t.stallId] || 0) + amount;
        }
    });
    let topStallInfo = { name: "N/A", sales: 0 };
    if (Object.keys(salesByStall).length > 0) {
        const topStallId = Object.entries(salesByStall).sort((a, b) => b[1] - a[1])[0][0];
        const stallDoc = await firebase_1.db.collection("stalls").doc(topStallId).get();
        if (stallDoc.exists) {
            topStallInfo = {
                name: ((_a = stallDoc.data()) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Stall",
                sales: salesByStall[topStallId],
            };
        }
    }
    return { totalSales, topStallInfo };
}
//# sourceMappingURL=statsCalculations.js.map