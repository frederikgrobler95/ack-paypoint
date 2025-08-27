import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import QRCodeGenerator from "qrcode";

// Local interfaces to replace shared contracts
type QRCodeStatus = 'unassigned' | 'assigned' | 'void' | 'lost';

interface QRCode {
  id: string;
  label: string;
  status: QRCodeStatus;
  assignedCustomerId: string | null;
  batchId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AdminCreateQrCodesPdfRequest {
  batchId?: string;
  qrId?: string;
  qrCodesPerPage?: number;
  pageSize?: "A4" | "A5" | "A6" | "Letter";
}

interface AdminCreateQrCodesPdfResponse {
  data: string; // base64 encoded PDF
  success: boolean;
  message: string;
}

// Function to fetch QR codes by batch ID
const fetchQRCodesByBatch = async (batchId: string): Promise<QRCode[]> => {
  try {
    const qrCodesQuery = await db
      .collection("qrCodes")
      .where("batchId", "==", batchId)
      .get();
    
    return qrCodesQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        label: data.label,
        status: data.status,
        assignedCustomerId: data.assignedCustomerId,
        batchId: data.batchId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt)),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.fromDate(new Date(data.updatedAt)),
      } as QRCode;
    });
  } catch (error) {
    console.error("Error fetching QR codes by batch:", error);
    throw new Error("Failed to fetch QR codes for batch");
  }
};

// Function to fetch a single QR code by ID
const fetchQRCodeById = async (qrId: string): Promise<QRCode> => {
  try {
    const qrDoc = await db.collection("qrCodes").doc(qrId).get();
    
    if (!qrDoc.exists) {
      throw new Error(`QR code with ID ${qrId} not found`);
    }
    
    const data = qrDoc.data()!;
    return {
      id: qrDoc.id,
      label: data.label,
      status: data.status,
      assignedCustomerId: data.assignedCustomerId,
      batchId: data.batchId,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt)),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.fromDate(new Date(data.updatedAt)),
    } as QRCode;
  } catch (error) {
    console.error("Error fetching QR code:", error);
    throw new Error("Failed to fetch QR code");
  }
};

// Function to generate QR code image as data URL
const generateQRCodeImage = async (text: string): Promise<string> => {
  try {
    return await QRCodeGenerator.toDataURL(text, { width: 200 });
  } catch (error) {
    console.error("Error generating QR code image:", error);
    throw new Error("Failed to generate QR code image");
  }
};

// Function to create PDF with QR codes
const createQRPdf = async (
  qrCodes: QRCode[],
  qrCodesPerPage: number = 9,
  pageSize: "A4" | "A5" | "A6" | "Letter" = "A4"
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Page dimensions in points (1 point = 1/72 inch)
      const pageDimensions = {
        "A4": { width: 595, height: 842 },
        "A5": { width: 420, height: 595 },
        "A6": { width: 297, height: 420 },
        "Letter": { width: 612, height: 792 }
      };
      
      const dimensions = pageDimensions[pageSize];
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: [dimensions.width, dimensions.height],
        margin: 30
      });
      
      // Create a buffer to store the PDF
      const stream = new PassThrough();
      const chunks: Buffer[] = [];
      
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      
      doc.pipe(stream);
      
      // Calculate grid layout
      const margin = 30;
      const availableWidth = dimensions.width - 2 * margin;
      const availableHeight = dimensions.height - 2 * margin;
      
      // Determine grid size (assuming square QR codes)
      const columns = Math.ceil(Math.sqrt(qrCodesPerPage));
      const rows = Math.ceil(qrCodesPerPage / columns);
      
      const cellWidth = availableWidth / columns;
      const cellHeight = availableHeight / rows;
      
      const qrSize = Math.min(cellWidth * 0.8, cellHeight * 0.8, 100); // Cap at 100pt
      
      let currentColumn = 0;
      let currentRow = 0;
      
      // Add QR codes to the PDF
      for (let i = 0; i < qrCodes.length; i++) {
        const qrCode = qrCodes[i];
        
        // Calculate position
        const x = margin + currentColumn * cellWidth + (cellWidth - qrSize) / 2;
        const y = margin + currentRow * cellHeight + (cellHeight - qrSize) / 2;
        
        // Generate QR code image
        const qrImage = await generateQRCodeImage(qrCode.id);
        
        // Add QR code image to PDF
        doc.image(qrImage, x, y, { width: qrSize, height: qrSize });
        
        // Add label below QR code
        const labelY = y + qrSize + 15;
        doc.fontSize(8);
        doc.text(qrCode.label, x, labelY, {
          width: qrSize,
          align: 'center'
        });
        
        // Move to next position
        currentColumn++;
        if (currentColumn >= columns) {
          currentColumn = 0;
          currentRow++;
        }
        
        // Check if we need a new page
        if (currentRow >= rows) {
          doc.addPage();
          currentRow = 0;
        }
      }
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const adminCreateQrCodesPdf = onCall({
  region: "africa-south1",
  memory: "1GiB",
  timeoutSeconds: 300,
  maxInstances: 3
}, async (request): Promise<AdminCreateQrCodesPdfResponse> => {
    try {
      // Get the request data
      const { batchId, qrId, qrCodesPerPage, pageSize } = request.data as AdminCreateQrCodesPdfRequest;
      
      // Validate input
      if (!batchId && !qrId) {
        throw new Error("Either batchId or qrId must be provided");
      }
      
      if (batchId && qrId) {
        throw new Error("Only one of batchId or qrId should be provided");
      }
      
      // Fetch QR codes based on input
      let qrCodes: QRCode[] = [];
      
      if (batchId) {
        // Fetch all QR codes in the batch
        qrCodes = await fetchQRCodesByBatch(batchId);
        
        if (qrCodes.length === 0) {
          throw new Error(`No QR codes found for batch ${batchId}`);
        }
      } else if (qrId) {
        // Fetch single QR code
        const qrCode = await fetchQRCodeById(qrId);
        qrCodes = [qrCode];
      }
      
      // Generate PDF
      const pdfBuffer = await createQRPdf(
        qrCodes,
        qrCodesPerPage,
        pageSize
      );
      
      // Convert PDF buffer to base64 string
      const base64Pdf = pdfBuffer.toString('base64');
      
      return {
        data: base64Pdf,
        success: true,
        message: "PDF generated successfully"
      };
    } catch (error: any) {
      console.error("Error generating QR codes PDF:", error);
      throw new Error(error.message || "Failed to generate QR codes PDF");
    }
  }
);