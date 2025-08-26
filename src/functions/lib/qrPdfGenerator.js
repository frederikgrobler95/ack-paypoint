"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrPdfBuffer = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
// Create a QR code PDF
const generateQrPdfBuffer = async (qrCodes) => {
    console.log('Generating PDF for QR codes:', qrCodes.length);
    console.log('QR codes data:', JSON.stringify(qrCodes, null, 2));
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 40,
                layout: 'portrait',
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const addHeader = () => {
                doc.fontSize(20).text('Basaar QR Codes', { align: 'center' });
                doc.moveDown(1);
            };
            addHeader();
            const pageMargin = 40;
            const pageContentWidth = doc.page.width - pageMargin * 2;
            const pageContentHeight = doc.page.height - pageMargin * 2 - 60; // Adjust for header
            const cols = 3;
            const rows = 6;
            const codesPerPage = cols * rows;
            const cellWidth = pageContentWidth / cols;
            const cellHeight = pageContentHeight / rows;
            const qrCodeSize = Math.min(cellWidth, cellHeight) * 0.6; // 60% of the smallest dimension
            const labelFontSize = 8;
            for (let i = 0; i < qrCodes.length; i++) {
                const code = qrCodes[i];
                console.log('Processing QR code:', code.label, code.id);
                const pageIndex = i % codesPerPage;
                if (i > 0 && pageIndex === 0) {
                    doc.addPage();
                    addHeader();
                }
                const col = pageIndex % cols;
                const row = Math.floor(pageIndex / cols);
                const x = pageMargin + col * cellWidth;
                const y = pageMargin + 60 + row * cellHeight; // Start below header
                const qrDataUrl = await qrcode_1.default.toDataURL(code.label, {
                    errorCorrectionLevel: 'H',
                    margin: 2,
                    width: qrCodeSize,
                }).catch(error => {
                    console.error('Error generating QR code for:', code.label, error);
                    throw error;
                });
                // Center QR code and text within the cell
                const qrX = x + (cellWidth - qrCodeSize) / 2;
                const qrY = y + (cellHeight - qrCodeSize - labelFontSize) / 2;
                doc.image(qrDataUrl, qrX, qrY, { width: qrCodeSize });
                doc.fontSize(labelFontSize).text(code.label, x, qrY + qrCodeSize + 5, // Position text below the QR code
                {
                    align: 'center',
                    width: cellWidth,
                });
            }
            doc.end();
        }
        catch (error) {
            console.error('Error in PDF generation:', error);
            reject(error);
        }
    });
};
exports.generateQrPdfBuffer = generateQrPdfBuffer;
//# sourceMappingURL=qrPdfGenerator.js.map