/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { checkoutCustomer } from "./checkoutCustomer";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

setGlobalOptions({ maxInstances: 10 });

export { checkoutCustomer };