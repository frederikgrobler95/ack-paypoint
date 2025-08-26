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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrPdfBuffer = exports.createQrPdfDocument = void 0;
const pdfMake = __importStar(require("pdfmake"));
// Create a QR code PDF document
const createQrPdfDocument = (qrCodes) => {
    // Calculate how many pages we need (3x6 = 18 codes per page)
    const codesPerPage = 18;
    const pages = Math.ceil(qrCodes.length / codesPerPage);
    // Create content array
    const content = [];
    // Add header
    content.push({
        text: 'Basaar QR Codes',
        style: 'header'
    });
    // Generate pages
    for (let page = 0; page < pages; page++) {
        const pageContent = {
            table: {
                widths: ['33.33%', '33.33%', '33.33%'],
                heights: ['16.66%', '16.66%', '16.66%', '16.66%', '16.66%', '16.66%'],
                body: []
            },
            layout: 'noBorders'
        };
        // Create 6 rows for the grid
        const rows = [];
        for (let row = 0; row < 6; row++) {
            const columns = [];
            for (let col = 0; col < 3; col++) {
                const index = page * codesPerPage + row * 3 + col;
                if (index < qrCodes.length) {
                    const code = qrCodes[index];
                    columns.push({
                        stack: [
                            { text: 'QR', style: 'qrBox' },
                            { text: code.label, style: 'qrLabel' },
                            { text: code.status, style: 'qrStatus' }
                        ],
                        style: 'qrItem'
                    });
                }
                else {
                    // Empty cell
                    columns.push({
                        text: '',
                        style: 'qrItem'
                    });
                }
            }
            rows.push(columns);
        }
        pageContent.table.body = rows;
        content.push(pageContent);
        // Add page break except for the last page
        if (page < pages - 1) {
            content.push({ text: '', pageBreak: 'after' });
        }
    }
    return {
        content,
        styles: {
            header: {
                fontSize: 24,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            qrItem: {
                margin: [10, 10, 10, 10],
                alignment: 'center'
            },
            qrBox: {
                fontSize: 20,
                bold: true,
                margin: [0, 10, 0, 10],
                alignment: 'center'
            },
            qrLabel: {
                fontSize: 14,
                bold: true,
                margin: [0, 5, 0, 5]
            },
            qrStatus: {
                fontSize: 10,
                color: '#666'
            }
        },
        defaultStyle: {
            font: 'Helvetica'
        }
    };
};
exports.createQrPdfDocument = createQrPdfDocument;
// Generate PDF as buffer
const generateQrPdfBuffer = async (qrCodes) => {
    const document = (0, exports.createQrPdfDocument)(qrCodes);
    // Create a promise to handle the PDF generation
    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = pdfMake.createPdf(document);
            pdfDoc.getBuffer((buffer) => {
                resolve(buffer);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateQrPdfBuffer = generateQrPdfBuffer;
//# sourceMappingURL=qrPdfGenerator.js.map