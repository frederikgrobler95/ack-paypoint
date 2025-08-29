import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

// Local interfaces to replace shared contracts
type AccountStatus = 'clean' | 'unpaid' | 'paid';

interface Account {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Timestamp;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
}

interface AdminCreateCustomersReportPdfRequest {
  customerIds?: string[];
  filter?: 'all' | 'paid' | 'unpaid';
}

interface AdminCreateCustomersReportPdfResponse {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to fetch all customers
const fetchAllCustomers = async (): Promise<Customer[]> => {
  try {
    const customersQuery = await db.collection("customers").get();
    
    return customersQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        qrCodeId: data.qrCodeId,
        Account: {
          balanceCents: data.Account?.balanceCents || 0,
          status: data.Account?.status || 'clean',
          lastPaidAt: data.Account?.lastPaidAt instanceof Timestamp
            ? data.Account.lastPaidAt
            : data.Account?.lastPaidAt
            ? Timestamp.fromDate(new Date(data.Account.lastPaidAt))
            : Timestamp.now()
        },
        idempotencyKey: data.idempotencyKey
      } as Customer;
    });
  } catch (error) {
    console.error("Error fetching all customers:", error);
    throw new Error("Failed to fetch customers");
  }
};

// Function to fetch specific customers by IDs
const fetchCustomersByIds = async (customerIds: string[]): Promise<Customer[]> => {
  try {
    const customersQuery = await db
      .collection("customers")
      .where("__name__", "in", customerIds)
      .get();
    
    return customersQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        qrCodeId: data.qrCodeId,
        Account: {
          balanceCents: data.Account?.balanceCents || 0,
          status: data.Account?.status || 'clean',
          lastPaidAt: data.Account?.lastPaidAt instanceof Timestamp
            ? data.Account.lastPaidAt
            : data.Account?.lastPaidAt
            ? Timestamp.fromDate(new Date(data.Account.lastPaidAt))
            : Timestamp.now()
        },
        idempotencyKey: data.idempotencyKey
      } as Customer;
    });
  } catch (error) {
    console.error("Error fetching customers by IDs:", error);
    throw new Error("Failed to fetch customers");
  }
};

// Function to create PDF with customer data
const createCustomersReportPdf = async (customers: Customer[]): Promise<Buffer> => {
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
         .text('CUSTOMERS REPORT', 50, 30, { align: 'left' });
      
      // Add subtitle
      doc.fillColor(colors.primaryLight)
         .fontSize(12)
         .font('Helvetica')
         .text('Detailed Customer Account Report', 50, 60, { align: 'left' });
      
      // Add date on the right side
      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString()}`, 0, 30, { align: 'right', width: 550 });
      
      // Reset Y position after header
      doc.y = 100;
      
      // Calculate overview statistics
      const totalCustomers = customers.length;
      const paidCustomers = customers.filter(c => c.Account.status === 'paid').length;
      const unpaidCustomers = customers.filter(c => c.Account.status === 'unpaid').length;
      const totalAccountBalance = customers.reduce((sum, customer) => sum + (customer.Account.balanceCents / 100), 0);
      
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
      const overviewCardWidth = 120;
      const overviewCardHeight = 70;
      const overviewCardSpacing = 20;
      const overviewStartX = 65;
      const overviewY = doc.y;
      
      // Total Customers Card
      doc.lineWidth(1);
      doc.strokeColor(colors.border);
      doc.fillColor('#dbeafe');
      doc.roundedRect(overviewStartX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#93c5fd');
      doc.roundedRect(overviewStartX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.primary);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Total', overviewStartX + 10, overviewY + 15);
      doc.fillColor(colors.primary);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`${totalCustomers}`, overviewStartX + 10, overviewY + 35);
      doc.fontSize(10);
      doc.text('Customers', overviewStartX + 10, overviewY + 50);
      
      // Paid Customers Card
      const paidCardX = overviewStartX + overviewCardWidth + overviewCardSpacing;
      doc.fillColor('#dcfce7');
      doc.roundedRect(paidCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#86efac');
      doc.roundedRect(paidCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.success);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Paid', paidCardX + 10, overviewY + 15);
      doc.fillColor(colors.success);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`${paidCustomers}`, paidCardX + 10, overviewY + 35);
      doc.fontSize(10);
      doc.text('Customers', paidCardX + 10, overviewY + 50);
      
      // Unpaid Customers Card
      const unpaidCardX = paidCardX + overviewCardWidth + overviewCardSpacing;
      doc.fillColor('#fee2e2');
      doc.roundedRect(unpaidCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#fca5a5');
      doc.roundedRect(unpaidCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor(colors.warning);
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Unpaid', unpaidCardX + 10, overviewY + 15);
      doc.fillColor(colors.warning);
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`${unpaidCustomers}`, unpaidCardX + 10, overviewY + 35);
      doc.fontSize(10);
      doc.text('Customers', unpaidCardX + 10, overviewY + 50);
      
      // Total Balance Card
      const balanceCardX = unpaidCardX + overviewCardWidth + overviewCardSpacing;
      doc.fillColor('#f3e8ff');
      doc.roundedRect(balanceCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).fill();
      doc.strokeColor('#d8b4fe');
      doc.roundedRect(balanceCardX, overviewY, overviewCardWidth, overviewCardHeight, 5).stroke();
      doc.fillColor('#7e22ce');
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Total', balanceCardX + 10, overviewY + 15);
      doc.fillColor('#7e22ce');
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`R${totalAccountBalance.toFixed(2)}`, balanceCardX + 10, overviewY + 35);
      doc.fontSize(10);
      doc.text('Balance', balanceCardX + 10, overviewY + 50);
      
      doc.y = overviewY + overviewCardHeight + 25;
      
      // Add table title with improved styling
      doc.fillColor('#f3f4f6')
         .rect(45, doc.y, 510, 25)
         .fill();
      doc.fillColor('#1f2937')
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('Customer Accounts', 50, doc.y + 7);
      doc.y += 35;
      
      // Add table headers
      const tableTop = doc.y;
      const rowHeight = 20;
      const nameX = 50;
      // Removed ID column as requested
      const accountTotalX = 200; // Adjusted position
      const accountStatusX = 350;
      
      // Header background
      doc.fillColor(colors.border)
         .rect(45, tableTop - 5, 510, rowHeight)
         .fill();
      
      doc.fillColor(colors.text)
         .fontSize(11)
         .font('Helvetica-Bold');
      doc.text('Name', nameX, tableTop + 5);
      // Removed ID column header
      doc.text('Account Total', accountTotalX, tableTop + 5);
      doc.text('Account Status', accountStatusX, tableTop + 5);
      
      // Add horizontal line under headers
      doc.strokeColor(colors.border)
         .moveTo(50, tableTop + rowHeight - 5)
         .lineTo(550, tableTop + rowHeight - 5)
         .stroke();
      
      // Add customer data
      doc.fontSize(10).font('Helvetica');
      let yPosition = tableTop + rowHeight + 5;
      // Initialize page counter
      let pageNumber = 1;
      
      customers.forEach((customer, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.fillColor(colors.background)
             .rect(45, yPosition - 8, 510, rowHeight)
             .fill();
        }
        
        // Add border to row
        doc.strokeColor(colors.border)
           .lineWidth(0.5)
           .rect(45, yPosition - 8, 510, rowHeight)
           .stroke();
        
        // Format account total (convert cents to currency)
        const accountTotal = (customer.Account.balanceCents / 100).toFixed(2);
        
        doc.fillColor(colors.text);
        doc.text(customer.name, nameX, yPosition + 3);
        // Removed customer.id column
        doc.text(`R${accountTotal}`, accountTotalX, yPosition + 3);
        
        // Add colored badge for account status
        const statusText = customer.Account.status.charAt(0).toUpperCase() + customer.Account.status.slice(1);
        let statusColor = colors.accentBlue; // blue for clean
        if (customer.Account.status === 'paid') statusColor = colors.accentGreen; // green
        if (customer.Account.status === 'unpaid') statusColor = colors.accentRed; // red
        
        const statusWidth = doc.widthOfString(statusText) + 12;
        const statusHeight = 16;
        const statusX = accountStatusX;
        const statusY = yPosition - 3;
        
        doc.fillColor(statusColor);
        doc.roundedRect(statusX, statusY, statusWidth, statusHeight, 4).fill();
        doc.fillColor('white');
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text(statusText, statusX + 6, yPosition + 2, { width: statusWidth });
        
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
             .text('CUSTOMERS REPORT', 50, 15, { align: 'left' });
          doc.fillColor('white')
             .fontSize(10)
             .font('Helvetica')
             .text(`Page ${pageNumber}`, 0, 15, { align: 'right', width: 550 });
          yPosition = 50;
        }
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

export const adminCreateCustomersReportPdf = onCall({
  region: "africa-south1",
  memory: "1GiB",
  timeoutSeconds: 300,
  maxInstances: 3
}, async (request): Promise<AdminCreateCustomersReportPdfResponse> => {
    try {
      // Get the request data
      const { customerIds, filter } = request.data as AdminCreateCustomersReportPdfRequest;
      
      // Fetch customers based on input
      let customers: Customer[] = [];
      
      if (customerIds && customerIds.length > 0) {
        // Fetch specific customers
        customers = await fetchCustomersByIds(customerIds);
      } else {
        // Fetch all customers
        customers = await fetchAllCustomers();
      }
      
      // Apply filter if provided
      if (filter && filter !== 'all') {
        customers = customers.filter(customer => customer.Account.status === filter);
      }
      
      // Generate PDF
      const pdfBuffer = await createCustomersReportPdf(customers);
      
      // Convert PDF buffer to base64 string
      const base64Pdf = pdfBuffer.toString('base64');
      
      return {
        data: base64Pdf,
        success: true,
        message: "PDF generated successfully"
      };
    } catch (error: any) {
      console.error("Error generating customers report PDF:", error);
      throw new Error(error.message || "Failed to generate customers report PDF");
    }
  }
);