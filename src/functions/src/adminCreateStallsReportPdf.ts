import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

// Local interfaces to replace shared contracts
type StallType = 'registration' | 'checkout' | 'commerce';

interface Stall {
  id: string;
  name: string;
  type: StallType;
  totalAmount: number; // Optional fixed amount for registration stalls
}

type TransactionType = 'sale' | 'refund';

interface Transaction {
  id: string;
  stallId: string;
  stallName?: string;
  operatorId: string;
  operatorName: string;
  customerId: string;
  customerName?: string;
  amountCents: number;
  type: TransactionType;
  refundOfTxnId?: string;
  idempotencyKey: string;
  createdAt: Timestamp;
}

interface AdminCreateStallsReportPdfRequest {
  stallIds?: string[];
}

interface AdminCreateStallsReportPdfResponse {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to fetch all stalls
const fetchAllStalls = async (): Promise<Stall[]> => {
  try {
    const stallsQuery = await db.collection("stalls").get();
    
    return stallsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        totalAmount: data.totalAmount || 0
      } as Stall;
    });
  } catch (error) {
    console.error("Error fetching all stalls:", error);
    throw new Error("Failed to fetch stalls");
  }
};

// Function to fetch specific stalls by IDs
const fetchStallsByIds = async (stallIds: string[]): Promise<Stall[]> => {
  try {
    const stallsQuery = await db
      .collection("stalls")
      .where("__name__", "in", stallIds)
      .get();
    
    return stallsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        totalAmount: data.totalAmount || 0
      } as Stall;
    });
  } catch (error) {
    console.error("Error fetching stalls by IDs:", error);
    throw new Error("Failed to fetch stalls");
  }
};

// Function to calculate registration count for a registration stall
const calculateRegistrationCount = async (stallId: string): Promise<number> => {
  try {
    // Get all registrations for this stall
    const registrationsQuery = await db
      .collection("registrations")
      .where("stallId", "==", stallId)
      .get();
    
    // Return the count of registrations
    return registrationsQuery.size;
  } catch (error) {
    console.error(`Error calculating registration count for stall ${stallId}:`, error);
    throw new Error("Failed to calculate registration count");
  }
};

// Function to calculate revenue for a checkout stall
const calculateCheckoutRevenue = async (stallId: string): Promise<number> => {
  try {
    // Get all sales transactions for this stall
    const transactionsQuery = await db
      .collection("payments")
      .where("stallId", "==", stallId)
      .get();
    
    // Sum up the sales amounts (convert from cents to rands)
    const totalSalesCents = transactionsQuery.docs.reduce((total, doc) => {
      const transaction = doc.data() as Transaction;
      return total + transaction.amountCents;
    }, 0);
    
    // Convert cents to rands
    return totalSalesCents / 100;
  } catch (error) {
    console.error(`Error calculating checkout revenue for stall ${stallId}:`, error);
    throw new Error("Failed to calculate checkout revenue");
  }
};

// Function to enhance stalls with calculated totals
const enhanceStallsWithTotals = async (stalls: Stall[]): Promise<(Stall & { calculatedTotal: number })[]> => {
  const enhancedStalls = [];
  
  for (const stall of stalls) {
    let calculatedTotal = 0;
    
    if (stall.type === 'registration') {
      // For registration stalls, calculate the count of registrations
      calculatedTotal = await calculateRegistrationCount(stall.id);
    } else if (stall.type === 'checkout') {
      // For checkout/commerce stalls, calculate the revenue
      calculatedTotal = await calculateCheckoutRevenue(stall.id);
    } else {
      // For other stall types, use the existing totalAmount
      calculatedTotal = stall.totalAmount || 0;
    }
    
    enhancedStalls.push({
      ...stall,
      calculatedTotal
    });
  }
  
  return enhancedStalls;
};

// Function to create PDF with stall data
const createStallsReportPdf = async (stalls: (Stall & { calculatedTotal: number })[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      
      // Create a buffer to store the PDF
      const stream = new PassThrough();
      const chunks: Buffer[] = [];
      
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      
      doc.pipe(stream);
      
      // Add title
      doc.fontSize(18).text('Stalls Report', { align: 'center' });
      doc.moveDown();
      
      // Add table headers
      const tableTop = 100;
      const rowHeight = 20;
      const nameX = 50;
      const idX = 150;
      const typeX = 250;
      const totalX = 350;
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Name', nameX, tableTop);
      doc.text('ID', idX, tableTop);
      doc.text('Type', typeX, tableTop);
      doc.text('Total', totalX, tableTop);
      
      // Add horizontal line under headers
      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();
      
      // Add stall data
      doc.fontSize(10).font('Helvetica');
      let yPosition = tableTop + rowHeight;
      
      stalls.forEach((stall, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.fillColor('#f0f0f0')
             .rect(45, yPosition - 5, 510, rowHeight)
             .fill()
             .fillColor('black');
        }
        
        // Format total based on stall type
        let totalText = '';
        if (stall.type === 'registration') {
          totalText = `${stall.calculatedTotal} registrations`;
        } else {
          totalText = `R${stall.calculatedTotal.toFixed(2)}`;
        }
        
        doc.text(stall.name, nameX, yPosition);
        doc.text(stall.id, idX, yPosition);
        doc.text(stall.type, typeX, yPosition);
        doc.text(totalText, totalX, yPosition);
        
        yPosition += rowHeight;
        
        // Add a new page if needed
        if (yPosition > 750) {
          doc.addPage();
          yPosition = 50;
        }
      });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const adminCreateStallsReportPdf = onCall({
  region: "africa-south1",
  memory: "1GiB",
  timeoutSeconds: 300,
  maxInstances: 3
}, async (request): Promise<AdminCreateStallsReportPdfResponse> => {
    try {
      // Get the request data
      const { stallIds } = request.data as AdminCreateStallsReportPdfRequest;
      
      // Fetch stalls based on input
      let stalls: Stall[] = [];
      
      if (stallIds && stallIds.length > 0) {
        // Fetch specific stalls
        stalls = await fetchStallsByIds(stallIds);
      } else {
        // Fetch all stalls
        stalls = await fetchAllStalls();
      }
      
      // Enhance stalls with calculated totals
      const enhancedStalls = await enhanceStallsWithTotals(stalls);
      
      // Generate PDF
      const pdfBuffer = await createStallsReportPdf(enhancedStalls);
      
      // Convert PDF buffer to base64 string
      const base64Pdf = pdfBuffer.toString('base64');
      
      return {
        data: base64Pdf,
        success: true,
        message: "PDF generated successfully"
      };
    } catch (error: any) {
      console.error("Error generating stalls report PDF:", error);
      throw new Error(error.message || "Failed to generate stalls report PDF");
    }
  }
);