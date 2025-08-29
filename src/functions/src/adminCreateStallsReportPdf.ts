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
      
      // Define color palette for consistent styling
      const colors = {
        primary: '#1e40af',      // Dark blue
        primaryLight: '#e0f2fe', // Light blue
        secondary: '#1f2937',   // Dark gray
        accentBlue: '#3b82f6',  // Blue
        accentGreen: '#10b981', // Green
        accentRed: '#ef4444',   // Red
        background: '#f9fafb',  // Light gray
        border: '#e5e7eb',      // Light border gray
        text: '#1f2937',        // Dark text
        textLight: '#6b7280',   // Light text
        success: '#166534',     // Dark green
        warning: '#b91c1c',     // Dark red
        info: '#34d399',        // Light green
        danger: '#f87171'       // Light red
      };
      
      // Add decorative header
      doc.fillColor(colors.primary)
         .rect(0, 0, 600, 90)
         .fill();
      
      // Add title with better styling
      doc.fillColor('white')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('STALLS REPORT', 50, 30, { align: 'left' });
      
      // Add subtitle
      doc.fillColor(colors.primaryLight)
         .fontSize(12)
         .font('Helvetica')
         .text('Detailed Sales and Transaction Report', 50, 60, { align: 'left' });
      
      // Add date on the right side
      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString()}`, 0, 30, { align: 'right', width: 550 });
      
      // Reset Y position after header
      doc.y = 100;
      
      // Calculate overall statistics
      let totalSales = 0;
      let totalRefunds = 0;
      
      stalls.forEach(stall => {
        if (stall.type === 'commerce' && stall.transactions) {
          stall.transactions.forEach(transaction => {
            if (transaction.type === 'sale') {
              totalSales += transaction.amountCents / 100;
            } else if (transaction.type === 'refund') {
              totalRefunds += transaction.amountCents / 100;
            }
          });
        }
      });
      
      const netSales = totalSales - totalRefunds;
      
      // Add overview section with improved design
      doc.moveDown();
      doc.fillColor(colors.primary)
         .rect(45, doc.y, 510, 30)
         .fill();
      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Report Overview', 50, doc.y + 8);
      doc.y += 40;
      
      // Create overview cards with improved design
      const overviewCardWidth = 160;
      const overviewCardHeight = 70;
      const overviewCardSpacing = 15;
      const overviewStartX = 50;
      const overviewY = doc.y;
      
      // Total Sales Card
      doc.lineWidth(1);
      doc.strokeColor(colors.border);
      doc.fillColor('#dbeafe');
      doc.roundedRect(overviewStartX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#93c5fd');
      doc.roundedRect(overviewStartX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.primary);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Total Sales', overviewStartX + 10, overviewY + 15);
      doc.fillColor(colors.primary);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`R${totalSales.toFixed(2)}`, overviewStartX + 10, overviewY + 35);
      
      // Total Refunds Card
      const refundsCardX = overviewStartX + overviewCardWidth + overviewCardSpacing;
      doc.fillColor('#fee2e2');
      doc.roundedRect(refundsCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#fca5a5');
      doc.roundedRect(refundsCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.warning);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Total Refunds', refundsCardX + 10, overviewY + 15);
      doc.fillColor(colors.warning);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`R${totalRefunds.toFixed(2)}`, refundsCardX + 10, overviewY + 35);
      
      // Net Sales Card
      const netSalesCardX = refundsCardX + overviewCardWidth + overviewCardSpacing;
      doc.fillColor('#dcfce7');
      doc.roundedRect(netSalesCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#86efac');
      doc.roundedRect(netSalesCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.success);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Net Sales', netSalesCardX + 10, overviewY + 15);
      doc.fillColor(colors.success);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`R${netSales.toFixed(2)}`, netSalesCardX + 10, overviewY + 35);
      
      doc.y = overviewY + overviewCardHeight + 25;
      
      // Process each stall
      
      // Initialize page counter
      let pageNumber = 1;
      
      // Process each stall
      stalls.forEach((stall, index) => {
        // Add page break if not the first stall and we're near the bottom
        if (index > 0 && doc.y > 700) {
          doc.addPage();
          pageNumber++;
          // Add header to new page
          doc.fillColor(colors.primary)
             .rect(0, 0, 600, 40)
             .fill();
          doc.fillColor('white')
             .fontSize(14)
             .font('Helvetica-Bold')
             .text('STALLS REPORT', 50, 15, { align: 'left' });
          doc.fillColor('white')
             .fontSize(10)
             .font('Helvetica')
             .text(`Page ${pageNumber}`, 0, 15, { align: 'right', width: 550 });
          doc.y = 50;
        }
        
        // Create card for stall info with improved design
        const cardX = 50;
        let cardY = doc.y;
        const cardWidth = 500;
        const cardHeight = 130;
        
        // Draw card with rounded corners and shadow effect
        doc.fillColor(colors.background);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8).fill();
        doc.strokeColor(colors.border);
        doc.lineWidth(1);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8).stroke();
        
        // Add card header
        doc.fontSize(16).font('Helvetica-Bold');
        doc.fillColor(colors.text);
        doc.text(stall.name, cardX + 15, cardY + 15, { width: cardWidth - 30 });
        
        // Add horizontal divider
        doc.strokeColor(colors.border);
        doc.moveTo(cardX + 15, cardY + 40)
           .lineTo(cardX + cardWidth - 15, cardY + 40)
           .stroke();
        
        // Add stall type badge with improved design
        doc.fontSize(10);
        let typeColor = '#818cf8'; // indigo for commerce
        if (stall.type === 'registration') typeColor = colors.accentBlue; // blue
        if (stall.type === 'checkout') typeColor = colors.accentGreen; // green
        
        const typeText = stall.type.charAt(0).toUpperCase() + stall.type.slice(1);
        const typeWidth = doc.widthOfString(typeText) + 16;
        doc.fillColor(typeColor);
        doc.roundedRect(cardX + 15, cardY + 50, typeWidth, 24, 4).fill();
        doc.fillColor('white');
        doc.text(typeText, cardX + 23, cardY + 56, { width: typeWidth });
        
        // Update Y position for next content (adjusted for removed total text)
        doc.y = cardY + cardHeight + 25;
        
        // Add appropriate data table based on stall type
        if (stall.type === 'registration' && stall.registrations) {
          // Add registrations table title with improved styling
          doc.fillColor('#f3f4f6')
             .rect(45, doc.y, 510, 25)
             .fill();
          doc.fillColor('#1f2937')
             .fontSize(13)
             .font('Helvetica-Bold')
             .text('Registrations', 50, doc.y + 7);
          doc.y += 35;
          
          // Add registrations table with improved design
          if (stall.registrations.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 20;
            const col1X = 50;  // Customer
            const col2X = 220; // Operator
            const col3X = 390; // Date
            
            // Header background
            doc.fillColor(colors.border)
               .rect(45, tableTop - 5, 510, rowHeight)
               .fill();
            
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica-Bold');
            doc.text('Customer', col1X, tableTop + 5);
            doc.text('Operator', col2X, tableTop + 5);
            doc.text('Date', col3X, tableTop + 5);
            
            // Add registration data
            doc.fontSize(10).font('Helvetica');
            let yPosition = tableTop + rowHeight + 5;
            
            stall.registrations.forEach((registration, regIndex) => {
              // Alternate row colors
              if (regIndex % 2 === 0) {
                doc.fillColor(colors.background)
                   .rect(45, yPosition - 8, 510, rowHeight)
                   .fill();
              }
              
              // Add border to row
              doc.strokeColor(colors.border)
                 .lineWidth(0.5)
                 .rect(45, yPosition - 8, 510, rowHeight)
                 .stroke();
              
              // Format date
              const date = registration.createdAt.toDate();
              const dateString = date.toLocaleDateString();
              
              doc.fillColor(colors.text);
              doc.text(registration.customerName || 'N/A', col1X, yPosition + 3);
              doc.text(registration.operatorName, col2X, yPosition + 3);
              doc.text(dateString, col3X, yPosition + 3);
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                pageNumber++;
                // Add header to new page
                doc.fillColor(colors.primary)
                   .rect(0, 0, 600, 40)
                   .fill();
                doc.fillColor('white')
                   .fontSize(14)
                   .font('Helvetica-Bold')
                   .text('STALLS REPORT', 50, 15, { align: 'left' });
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica')
                   .text(`Page ${pageNumber}`, 0, 15, { align: 'right', width: 550 });
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica');
            doc.text('No registrations found', 50, doc.y);
            doc.moveDown();
          }
        } else if (stall.type === 'commerce' && stall.transactions) {
          // Add transactions table title with improved styling
          doc.fillColor('#f3f4f6')
             .rect(45, doc.y, 510, 25)
             .fill();
          doc.fillColor('#1f2937')
             .fontSize(13)
             .font('Helvetica-Bold')
             .text('Transactions', 50, doc.y + 7);
          doc.y += 35;
          
          // Add transactions table with improved design
          if (stall.transactions.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 20;
            const col1X = 50;  // Customer
            const col2X = 220; // Operator
            const col3X = 390; // Amount
            const col4X = 460; // Type
            
            // Header background
            doc.fillColor(colors.border)
               .rect(45, tableTop - 5, 510, rowHeight)
               .fill();
            
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica-Bold');
            doc.text('Customer', col1X, tableTop + 5);
            doc.text('Operator', col2X, tableTop + 5);
            doc.text('Amount', col3X, tableTop + 5);
            doc.text('Type', col4X, tableTop + 5);
            
            // Add transaction data
            doc.fontSize(10).font('Helvetica');
            let yPosition = tableTop + rowHeight + 5;
            
            stall.transactions.forEach((transaction, txnIndex) => {
              // Alternate row colors
              if (txnIndex % 2 === 0) {
                doc.fillColor(colors.background)
                   .rect(45, yPosition - 8, 510, rowHeight)
                   .fill();
              }
              
              // Add border to row
              doc.strokeColor(colors.border)
                 .lineWidth(0.5)
                 .rect(45, yPosition - 8, 510, rowHeight)
                 .stroke();
              
              // Format amount
              const amount = (transaction.amountCents / 100).toFixed(2);
              
              doc.fillColor(colors.text);
              doc.text(transaction.customerName || 'N/A', col1X, yPosition + 3);
              doc.text(transaction.operatorName, col2X, yPosition + 3);
              doc.text(`R${amount}`, col3X, yPosition + 3);
              
              // Add colored pill for transaction type
              const typeText = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
              let pillColor = colors.info; // green for sales
              if (transaction.type === 'refund') pillColor = colors.danger; // red for refunds
              
              const pillWidth = doc.widthOfString(typeText) + 12;
              const pillHeight = 16;
              const pillX = col4X;
              const pillY = yPosition - 3;
              
              doc.fillColor(pillColor);
              doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 4).fill();
              doc.fillColor('white');
              doc.fontSize(9).font('Helvetica-Bold');
              doc.text(typeText, pillX + 6, yPosition + 2, { width: pillWidth });
              
              doc.fillColor(colors.text);
              doc.fontSize(10).font('Helvetica');
              
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                pageNumber++;
                // Add header to new page
                doc.fillColor(colors.primary)
                   .rect(0, 0, 600, 40)
                   .fill();
                doc.fillColor('white')
                   .fontSize(14)
                   .font('Helvetica-Bold')
                   .text('STALLS REPORT', 50, 15, { align: 'left' });
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica')
                   .text(`Page ${pageNumber}`, 0, 15, { align: 'right', width: 550 });
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica');
            doc.text('No transactions found', 50, doc.y);
            doc.moveDown();
          }
        } else if (stall.type === 'checkout' && stall.payments) {
          // Add payments table title with improved styling
          doc.fillColor('#f3f4f6')
             .rect(45, doc.y, 510, 25)
             .fill();
          doc.fillColor('#1f2937')
             .fontSize(13)
             .font('Helvetica-Bold')
             .text('Payments', 50, doc.y + 7);
          doc.y += 35;
          
          // Add payments table with improved design
          if (stall.payments.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const rowHeight = 20;
            const col1X = 50;  // Customer
            const col2X = 220; // Operator
            const col3X = 390; // Amount
            const col4X = 460; // Method
            
            // Header background
            doc.fillColor(colors.border)
               .rect(45, tableTop - 5, 510, rowHeight)
               .fill();
            
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica-Bold');
            doc.text('Customer', col1X, tableTop + 5);
            doc.text('Operator', col2X, tableTop + 5);
            doc.text('Amount', col3X, tableTop + 5);
            doc.text('Method', col4X, tableTop + 5);
            
            // Add payment data
            doc.fontSize(10).font('Helvetica');
            let yPosition = tableTop + rowHeight + 5;
            
            stall.payments.forEach((payment, payIndex) => {
              // Alternate row colors
              if (payIndex % 2 === 0) {
                doc.fillColor(colors.background)
                   .rect(45, yPosition - 8, 510, rowHeight)
                   .fill();
              }
              
              // Add border to row
              doc.strokeColor(colors.border)
                 .lineWidth(0.5)
                 .rect(45, yPosition - 8, 510, rowHeight)
                 .stroke();
              
              // Format amount
              const amount = (payment.amountCents / 100).toFixed(2);
              
              doc.fillColor(colors.text);
              doc.text(payment.customerName || 'N/A', col1X, yPosition + 3);
              doc.text(payment.operatorName || 'N/A', col2X, yPosition + 3);
              doc.text(`R${amount}`, col3X, yPosition + 3);
              
              // Add method badge
              const methodText = payment.method.toUpperCase();
              let methodColor = '#94a3b8'; // gray for default
              if (payment.method === 'card') methodColor = colors.accentBlue; // blue
              if (payment.method === 'cash') methodColor = colors.accentGreen; // green
              if (payment.method === 'eft') methodColor = '#fbbf24'; // yellow
              
              const methodWidth = doc.widthOfString(methodText) + 12;
              const methodHeight = 16;
              const methodX = col4X;
              const methodY = yPosition - 3;
              
              doc.fillColor(methodColor);
              doc.roundedRect(methodX, methodY, methodWidth, methodHeight, 4).fill();
              doc.fillColor('white');
              doc.fontSize(9).font('Helvetica-Bold');
              doc.text(methodText, methodX + 6, yPosition + 2, { width: methodWidth });
              
              doc.fillColor(colors.text);
              doc.fontSize(10).font('Helvetica');
              
              yPosition += rowHeight;
              
              // Add a new page if needed
              if (yPosition > 750) {
                doc.addPage();
                pageNumber++;
                // Add header to new page
                doc.fillColor(colors.primary)
                   .rect(0, 0, 600, 40)
                   .fill();
                doc.fillColor('white')
                   .fontSize(14)
                   .font('Helvetica-Bold')
                   .text('STALLS REPORT', 50, 15, { align: 'left' });
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica')
                   .text(`Page ${pageNumber}`, 0, 15, { align: 'right', width: 550 });
                yPosition = 50;
              }
            });
            
            doc.y = yPosition + 10;
          } else {
            doc.fillColor(colors.text)
               .fontSize(11)
               .font('Helvetica');
            doc.text('No payments found', 50, doc.y);
            doc.moveDown();
          }
        }
        
        // Add some space before next stall
        doc.moveDown(2);
      });
      
      // Add footer with additional information
      const footerY = 800;
      doc.fillColor(colors.background)
         .rect(0, footerY, 600, 42)
         .fill();
      doc.fillColor(colors.textLight)
         .fontSize(9)
         .font('Helvetica')
         .text('Generated by PayPoint System', 50, footerY + 8);
      doc.text('Confidential - For Internal Use Only', 50, footerY + 22);
      
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