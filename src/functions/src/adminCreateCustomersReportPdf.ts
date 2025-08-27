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
  phoneE164: string;
  phoneRaw: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
}

interface AdminCreateCustomersReportPdfRequest {
  customerIds?: string[];
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
        phoneE164: data.phoneE164,
        phoneRaw: data.phoneRaw,
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
        phoneE164: data.phoneE164,
        phoneRaw: data.phoneRaw,
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
      
      // Add title
      doc.fontSize(18).text('Customers Report', { align: 'center' });
      doc.moveDown();
      
      // Add table headers
      const tableTop = 100;
      const rowHeight = 20;
      const nameX = 50;
      const idX = 150;
      const accountTotalX = 250;
      const accountStatusX = 350;
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Name', nameX, tableTop);
      doc.text('ID', idX, tableTop);
      doc.text('Account Total', accountTotalX, tableTop);
      doc.text('Account Status', accountStatusX, tableTop);
      
      // Add horizontal line under headers
      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();
      
      // Add customer data
      doc.fontSize(10).font('Helvetica');
      let yPosition = tableTop + rowHeight;
      
      customers.forEach((customer, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.fillColor('#f0f0f0')
             .rect(45, yPosition - 5, 510, rowHeight)
             .fill()
             .fillColor('black');
        }
        
        // Format account total (convert cents to currency)
        const accountTotal = (customer.Account.balanceCents / 100).toFixed(2);
        
        doc.text(customer.name, nameX, yPosition);
        doc.text(customer.id, idX, yPosition);
        doc.text(`R${accountTotal}`, accountTotalX, yPosition);
        doc.text(customer.Account.status, accountStatusX, yPosition);
        
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

export const adminCreateCustomersReportPdf = onCall({
  region: "africa-south1",
  memory: "1GiB",
  timeoutSeconds: 300,
  maxInstances: 3
}, async (request): Promise<AdminCreateCustomersReportPdfResponse> => {
    try {
      // Get the request data
      const { customerIds } = request.data as AdminCreateCustomersReportPdfRequest;
      
      // Fetch customers based on input
      let customers: Customer[] = [];
      
      if (customerIds && customerIds.length > 0) {
        // Fetch specific customers
        customers = await fetchCustomersByIds(customerIds);
      } else {
        // Fetch all customers
        customers = await fetchAllCustomers();
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