import { db } from "./firebase";
import { QuerySnapshot, DocumentData } from "firebase-admin/firestore";

export async function calculateSalesStats(
  transactionsSnapshot: QuerySnapshot<DocumentData>
) {
  const salesByStall: { [key: string]: number } = {};
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
    const topStallId = Object.entries(salesByStall).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const stallDoc = await db.collection("stalls").doc(topStallId).get();
    if (stallDoc.exists) {
      topStallInfo = {
        name: stallDoc.data()?.name || "Unknown Stall",
        sales: salesByStall[topStallId],
      };
    }
  }

  return { totalSales, topStallInfo };
}