/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { createCustomer } from "./createCustomer";
import { onCustomerCreated } from "./onCustomerCreated";
import { onTransactionCreated } from "./onTransactionCreated";
import { adminCreateQrCodes } from "./adminCreateQrCodes";
import { adminCreateQrCodesPdf } from "./adminCreateQrCodesPdf";
import { cancelPayment } from "./cancelPayment";
import { cancelRegistration } from "./cancelRegistration";
import { cancelTransaction } from "./cancelTransaction";
import { createPayment } from "./createPayment";
import { createTransaction } from "./createTransaction";
import { onPaymentCreated } from "./onPaymentCreated";
import { adminCreateCustomersReportPdf } from "./adminCreateCustomersReportPdf";
import {adminCreateStallsReportPdf} from "./adminCreateStallsReportPdf";
import { adminSignOutAllUsers } from "./adminSignOutAllUsers";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript


export {
  createCustomer,
  onCustomerCreated,
  onTransactionCreated,
  adminCreateQrCodes,
  adminCreateQrCodesPdf,
  cancelPayment,
  cancelRegistration,
  cancelTransaction,
  createPayment,
  createTransaction,
  onPaymentCreated,
  adminCreateCustomersReportPdf,
  adminCreateStallsReportPdf,
  adminSignOutAllUsers
};