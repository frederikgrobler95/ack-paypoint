"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportStallStats = exports.createAdminUsers = exports.createAdminCustomers = exports.updateTopStall = exports.rebuildLiveStats = exports.onCustomerCreated = exports.onPaymentCreated = exports.onTransactionCreated = exports.generateQrBatch = exports.generateBatchQrCodesPdf = exports.generateQrCodesPdf = exports.processCheckout = exports.processRefund = exports.processSale = void 0;
const v2_1 = require("firebase-functions/v2");
const processSale_1 = require("./processSale");
Object.defineProperty(exports, "processSale", { enumerable: true, get: function () { return processSale_1.processSale; } });
const processRefund_1 = require("./processRefund");
Object.defineProperty(exports, "processRefund", { enumerable: true, get: function () { return processRefund_1.processRefund; } });
const processCheckout_1 = require("./processCheckout");
Object.defineProperty(exports, "processCheckout", { enumerable: true, get: function () { return processCheckout_1.processCheckout; } });
const generateQrPdf_1 = require("./generateQrPdf");
Object.defineProperty(exports, "generateQrCodesPdf", { enumerable: true, get: function () { return generateQrPdf_1.generateQrCodesPdf; } });
const generateBatchQrPdf_1 = require("./generateBatchQrPdf");
Object.defineProperty(exports, "generateBatchQrCodesPdf", { enumerable: true, get: function () { return generateBatchQrPdf_1.generateBatchQrCodesPdf; } });
const generateQrBatch_1 = require("./generateQrBatch");
Object.defineProperty(exports, "generateQrBatch", { enumerable: true, get: function () { return generateQrBatch_1.generateQrBatch; } });
const onTransactionCreated_1 = require("./onTransactionCreated");
Object.defineProperty(exports, "onTransactionCreated", { enumerable: true, get: function () { return onTransactionCreated_1.onTransactionCreated; } });
const onPaymentCreated_1 = require("./onPaymentCreated");
Object.defineProperty(exports, "onPaymentCreated", { enumerable: true, get: function () { return onPaymentCreated_1.onPaymentCreated; } });
const onCustomerCreated_1 = require("./onCustomerCreated");
Object.defineProperty(exports, "onCustomerCreated", { enumerable: true, get: function () { return onCustomerCreated_1.onCustomerCreated; } });
const rebuildLiveStats_1 = require("./rebuildLiveStats");
Object.defineProperty(exports, "rebuildLiveStats", { enumerable: true, get: function () { return rebuildLiveStats_1.rebuildLiveStats; } });
const updateTopStall_1 = require("./updateTopStall");
Object.defineProperty(exports, "updateTopStall", { enumerable: true, get: function () { return updateTopStall_1.updateTopStall; } });
const createAdminCustomers_1 = require("./createAdminCustomers");
Object.defineProperty(exports, "createAdminCustomers", { enumerable: true, get: function () { return createAdminCustomers_1.createAdminCustomers; } });
const createAdminUsers_1 = require("./createAdminUsers");
Object.defineProperty(exports, "createAdminUsers", { enumerable: true, get: function () { return createAdminUsers_1.createAdminUsers; } });
const exportStallStats_1 = require("./exportStallStats");
Object.defineProperty(exports, "exportStallStats", { enumerable: true, get: function () { return exportStallStats_1.exportStallStats; } });
// import { updateUserDisplayNames } from "./updateUserDisplayNames";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
//# sourceMappingURL=index.js.map