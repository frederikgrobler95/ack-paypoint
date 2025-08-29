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

interface Registration {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: Timestamp;
  idempotencyKey: string;
}

type PaymentMethod = 'card' | 'cash' | 'eft';

interface Payment {
  id: string;
  method: PaymentMethod;
  amountCents: number;
  operatorId: string;
  operatorName?: string;
  customerId: string;
  customerName?: string;
  stallId: string;
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

// Function to fetch registrations for a registration stall
const fetchRegistrationsForStall = async (stallId: string): Promise<Registration[]> => {
  try {
    // Get all registrations for this stall
    const registrationsQuery = await db
      .collection("registrations")
      .where("stallId", "==", stallId)
      .get();
    
    return registrationsQuery.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as Registration;
    });
  } catch (error) {
    console.error(`Error fetching registrations for stall ${stallId}:`, error);
    throw new Error("Failed to fetch registrations");
  }
};

// Function to fetch transactions for a commerce stall
const fetchTransactionsForStall = async (stallId: string): Promise<Transaction[]> => {
  try {
    // Get all transactions for this stall
    const transactionsQuery = await db
      .collection("transactions")
      .where("stallId", "==", stallId)
      .get();
    
    return transactionsQuery.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as Transaction;
    });
  } catch (error) {
    console.error(`Error fetching transactions for stall ${stallId}:`, error);
    throw new Error("Failed to fetch transactions");
  }
};

// Function to fetch payments for a checkout stall
const fetchPaymentsForStall = async (stallId: string): Promise<Payment[]> => {
  try {
    // Get all payments for this stall
    const paymentsQuery = await db
      .collection("payments")
      .where("stallId", "==", stallId)
      .get();
    
    return paymentsQuery.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as Payment;
    });
  } catch (error) {
    console.error(`Error fetching payments for stall ${stallId}:`, error);
    throw new Error("Failed to fetch payments");
  }
};
// Function to enhance stalls with calculated totals and detailed data
const enhanceStallsWithDetails = async (stalls: Stall[]): Promise<(Stall & {
  calculatedTotal: number;
  registrations?: Registration[];
  transactions?: Transaction[];
  payments?: Payment[];
})[]> => {
  const enhancedStalls = [];
  
  for (const stall of stalls) {
    let calculatedTotal = 0;
    let registrations: Registration[] | undefined;
    let transactions: Transaction[] | undefined;
    let payments: Payment[] | undefined;
    
    if (stall.type === 'registration') {
      // For registration stalls, fetch registrations
      registrations = await fetchRegistrationsForStall(stall.id);
      calculatedTotal = registrations.length;
    } else if (stall.type === 'checkout') {
      // For checkout stalls, fetch payments
      payments = await fetchPaymentsForStall(stall.id);
      // Sum up the payment amounts (convert from cents to rands)
      const totalPaymentsCents = payments.reduce((total, payment) => {
        return total + payment.amountCents;
      }, 0);
      calculatedTotal = totalPaymentsCents / 100;
    } else if (stall.type === 'commerce') {
      // For commerce stalls, fetch transactions
      transactions = await fetchTransactionsForStall(stall.id);
      // Sum up the transaction amounts (convert from cents to rands)
      const totalTransactionsCents = transactions.reduce((total, transaction) => {
        return total + transaction.amountCents;
      }, 0);
      calculatedTotal = totalTransactionsCents / 100;
    } else {
      // For other stall types, use the existing totalAmount
      calculatedTotal = stall.totalAmount || 0;
    }
    
    enhancedStalls.push({
      ...stall,
      calculatedTotal,
      registrations,
      transactions,
      payments
    });
  }
  
  return enhancedStalls;
};


// Function to create PDF with stall data using card layout
const createStallsReportPdf = async (stalls: (Stall & {
  calculatedTotal: number;
  registrations?: Registration[];
  transactions?: Transaction[];
  payments?: Payment[];
})[]): Promise<Buffer> => {
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
      doc.fontSize(20).text('Stalls Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);
      
      // Process each stall
      stalls.forEach((stall, index) => {
        // Add page break if not the first stall and we're near the bottom
        if (index > 0 && doc.y > 700) {
          doc.addPage();
        }
        
        // Create card for stall info
        const cardX = 50;
        let cardY = doc.y;
        const cardWidth = 500;
        const cardHeight = 120;
        
        // Draw card border
        doc.lineWidth(1);
        doc.strokeColor('#cccccc');
        doc.rect(cardX, cardY, cardWidth, cardHeight).stroke();
        
        // Add card header
        doc.fontSize(14).font('Helvetica-Bold');
        doc.fillColor('black');
        doc.text(stall.name, cardX + 10, cardY + 10, { width: cardWidth - 20 });
        
        // Add stall type badge
        doc.fontSize(10);
        let typeColor = '#6366f1'; // indigo for commerce
        if (stall.type === 'registration') typeColor = '#3b82f6'; // blue
        if (stall.type === 'checkout') typeColor = '#10b981'; // green
        
        const typeText = stall.type.charAt(0).toUpperCase() + stall.type.slice(1);
        const typeWidth = doc.widthOfString(typeText) + 10;
        doc.fillColor(typeColor);
        doc.rect(cardX + 10, cardY + 30, typeWidth, 20).fill();
        doc.fillColor('white');
        doc.text(typeText, cardX + 15, cardY + 35, { width: typeWidth });
        
        // Add stall ID
        doc.fillColor('black');
        doc.fontSize(10).font('Helvetica');
        doc.text(`ID: ${stall.id}`, cardX + 10, cardY + 60);
        
        // Add total with appropriate label
        let totalText = '';
        if (stall.type === 'registration') {
          totalText = `${stall.calculatedTotal} registrations`;
        } else {
          totalText = `R${stall.calculatedTotal.toFixed(2)}`;
        }
        doc.text(`Total: ${totalText}`, cardX + 10, cardY + 80);
        
        // Update Y position for next content
        doc.y = cardY + cardHeight + 20;
        
        // Add appropriate data table based on stall type
        if (stall.type === 'registration' && stall.registrations) {
          // Add registrations table title
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Registrations', 50, doc.y);
          doc.moveDown();
          
          // Add registrations table
          if (stall.registrations.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 15;
            const col1X = 50;  // ID
            const col2X = 150; // Customer
            const col3X = 300; // Operator
            const col4X = 400; // Date
            
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('ID', col1X, tableTop);
            doc.text('Customer', col2X, tableTop);
            doc.text('Operator', col3X, tableTop);
            doc.text('Date', col4X, tableTop);
            
            // Add horizontal line under headers
            doc.moveTo(50, tableTop + 12)
               .lineTo(550, tableTop + 12)
               .stroke();
            
            // Add registration data
            doc.fontSize(9).font('Helvetica');
            let yPosition = tableTop + rowHeight;
            
            stall.registrations.forEach((registration, regIndex) => {
              // Alternate row colors
              if (regIndex % 2 === 0) {
                doc.fillColor('#f8f9fa')
                   .rect(45, yPosition - 5, 510, rowHeight)
                   .fill()
                   .fillColor('black');
              }
              
              // Format date
              const date = registration.createdAt.toDate();
              const dateString = date.toLocaleDateString();
              
              doc.text(registration.id.substring(0, 8), col1X, yPosition);
              doc.text(registration.customerName || 'N/A', col2X, yPosition);
              doc.text(registration.operatorName, col3X, yPosition);
              doc.text(dateString, col4X, yPosition);
              
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fontSize(10).font('Helvetica');
            doc.text('No registrations found', 50, doc.y);
            doc.moveDown();
          }
        } else if (stall.type === 'commerce' && stall.transactions) {
          // Add transactions table title
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Transactions', 50, doc.y);
          doc.moveDown();
          
          // Add transactions table
          if (stall.transactions.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 15;
            const col1X = 50;  // ID
            const col2X = 150; // Customer
            const col3X = 300; // Operator
            const col4X = 400; // Amount
            const col5X = 470; // Type
            
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('ID', col1X, tableTop);
            doc.text('Customer', col2X, tableTop);
            doc.text('Operator', col3X, tableTop);
            doc.text('Amount', col4X, tableTop);
            doc.text('Type', col5X, tableTop);
            
            // Add horizontal line under headers
            doc.moveTo(50, tableTop + 12)
               .lineTo(550, tableTop + 12)
               .stroke();
            
            // Add transaction data
            doc.fontSize(9).font('Helvetica');
            let yPosition = tableTop + rowHeight;
            
            stall.transactions.forEach((transaction, txnIndex) => {
              // Alternate row colors
              if (txnIndex % 2 === 0) {
                doc.fillColor('#f8f9fa')
                   .rect(45, yPosition - 5, 510, rowHeight)
                   .fill()
                   .fillColor('black');
              }
              
              // Format amount
              const amount = (transaction.amountCents / 100).toFixed(2);
              
              doc.text(transaction.id.substring(0, 8), col1X, yPosition);
              doc.text(transaction.customerName || 'N/A', col2X, yPosition);
              doc.text(transaction.operatorName, col3X, yPosition);
              doc.text(`R${amount}`, col4X, yPosition);
              doc.text(transaction.type, col5X, yPosition);
              
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fontSize(10).font('Helvetica');
            doc.text('No transactions found', 50, doc.y);
            doc.moveDown();
          }
        } else if (stall.type === 'checkout' && stall.payments) {
          // Add payments table title
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Payments', 50, doc.y);
          doc.moveDown();
          
          // Add payments table
          if (stall.payments.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 15;
            const col1X = 50;  // ID
            const col2X = 150; // Customer
            const col3X = 300; // Operator
            const col4X = 400; // Amount
            const col5X = 470; // Method
            
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('ID', col1X, tableTop);
            doc.text('Customer', col2X, tableTop);
            doc.text('Operator', col3X, tableTop);
            doc.text('Amount', col4X, tableTop);
            doc.text('Method', col5X, tableTop);
            
            // Add horizontal line under headers
            doc.moveTo(50, tableTop + 12)
               .lineTo(550, tableTop + 12)
               .stroke();
            
            // Add payment data
            doc.fontSize(9).font('Helvetica');
            let yPosition = tableTop + rowHeight;
            
            stall.payments.forEach((payment, payIndex) => {
              // Alternate row colors
              if (payIndex % 2 === 0) {
                doc.fillColor('#f8f9fa')
                   .rect(45, yPosition - 5, 510, rowHeight)
                   .fill()
                   .fillColor('black');
              }
              
              // Format amount
              const amount = (payment.amountCents / 100).toFixed(2);
              
              doc.text(payment.id.substring(0, 8), col1X, yPosition);
              doc.text(payment.customerName || 'N/A', col2X, yPosition);
              doc.text(payment.operatorName || 'N/A', col3X, yPosition);
              doc.text(`R${amount}`, col4X, yPosition);
              doc.text(payment.method, col5X, yPosition);
              
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fontSize(10).font('Helvetica');
            doc.text('No payments found', 50, doc.y);
            doc.moveDown();
          }
        }
        
        // Add some space before next stall
        doc.moveDown(2);
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
      
      // Enhance stalls with calculated totals and detailed data
      const enhancedStalls = await enhanceStallsWithDetails(stalls);
      
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