/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { processSale } from "./processSale";
import { processRefund } from "./processRefund";
import { processCheckout } from "./processCheckout";
import { generateQrCodesPdf } from "./generateQrPdf";
import { generateBatchQrCodesPdf } from "./generateBatchQrPdf";
import { generateQrBatch } from "./generateQrBatch";
import { onTransactionCreated } from "./onTransactionCreated";
import { onPaymentCreated } from "./onPaymentCreated";
import { onCustomerCreated } from "./onCustomerCreated";
import { rebuildLiveStats } from "./rebuildLiveStats";
import { updateTopStall } from "./updateTopStall";
import { createAdminCustomers } from "./createAdminCustomers";
import { createAdminUsers } from "./createAdminUsers";
import { exportStallStats } from "./exportStallStats";
// import { updateUserDisplayNames } from "./updateUserDisplayNames";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

setGlobalOptions({ maxInstances: 10 });

export {
  processSale,
  processRefund,
  processCheckout,
  generateQrCodesPdf,
  generateBatchQrCodesPdf,
  generateQrBatch,
  onTransactionCreated,
  onPaymentCreated,
  onCustomerCreated,
  rebuildLiveStats,
  updateTopStall,
  createAdminCustomers,
  createAdminUsers,
  exportStallStats,
  // updateUserDisplayNames,
};