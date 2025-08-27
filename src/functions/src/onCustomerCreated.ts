import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

// Local interfaces to replace shared contracts
type AccountStatus = 'clean' | 'unpaid' | 'paid';

interface Account {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Date;
}

interface Customer {
  id: string;
  name: string;
  phoneE164: string;
  phoneRaw: string;
  qrCodeId: string;
  Account: Account;
  IdempotencyKey?: string;
}

interface Registration {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: string; // ISO string
  idempotencyKey: string;
}

type StallType = 'registration' | 'checkout' | 'commerce';

interface Stall {
  id: string;
  name: string;
  type: StallType;
  totalAmount: number; // Optional fixed amount for registration stalls
}

export const onCustomerCreated = onDocumentCreated(
  { document: "customers/{customerId}", region: "africa-south1" },
  async (event) => {
    const customer = event.data?.data() as Customer;
    if (!customer) {
      console.error("No customer data found in event");
      return;
    }

    try {
      const registrationQuery = await db
        .collection("registrations")
        .where("idempotencyKey", "==", customer.IdempotencyKey)
        .limit(1)
        .get();

      if (registrationQuery.empty) {
        console.error(
          "No registration found for customer with idempotency key:",
          customer.IdempotencyKey
        );
        return;
      }

      const registration = registrationQuery.docs[0].data() as Registration;
      const stallRef = db.collection("stalls").doc(registration.stallId);
      const stallDoc = await stallRef.get();

      if (!stallDoc.exists) {
        console.error("Stall not found with ID:", registration.stallId);
        return;
      }

      const stall = stallDoc.data() as Stall;

      await db.runTransaction(async (transaction) => {
        const updatedTotalAmount = (stall.totalAmount || 0) + 1;
        transaction.update(stallRef, { totalAmount: updatedTotalAmount });

        const statsRef = db.collection("stats").doc("live");
        transaction.set(
          statsRef,
          {
            totalCustomersRegistered: FieldValue.increment(1),
          },
          { merge: true }
        );
      });

      console.log(
        "Successfully updated stall and stats for customer registration"
      );
    } catch (error) {
      console.error("Error processing customer creation:", error);
    }
  }
);