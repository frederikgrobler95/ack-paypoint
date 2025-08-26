"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrBatchSchema = exports.qrCodeSchema = exports.qrCodeStatusSchema = void 0;
const zod_1 = require("zod");
exports.qrCodeStatusSchema = zod_1.z.enum(['unassigned', 'assigned', 'void', 'lost']);
exports.qrCodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    status: exports.qrCodeStatusSchema,
    assignedCustomerId: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.qrBatchSchema = zod_1.z.object({
    id: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    generatedBy: zod_1.z.string(), // userId
    count: zod_1.z.number(),
});
//# sourceMappingURL=qrCode.js.map