"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var salt, password, admin, manager, staff, viewer, catElectronics, catOffice, catHardware, catAccessories, whMain, whSec, locA01, locA02, locB01, locB02, prod1, prod2, prod3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Cleaning up database...');
                    return [4 /*yield*/, prisma.auditLog.deleteMany()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.stockMovement.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.stockLevel.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.stockLocation.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.warehouse.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 8:
                    _a.sent();
                    console.log('Seeding Users...');
                    return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                case 9:
                    salt = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash('password123', salt)];
                case 10:
                    password = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { email: 'admin@stocksense.local', password: password, name: 'Admin User', role: 'ADMIN' }
                        })];
                case 11:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { email: 'manager@stocksense.local', password: password, name: 'Manager User', role: 'MANAGER' }
                        })];
                case 12:
                    manager = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { email: 'staff@stocksense.local', password: password, name: 'Staff User', role: 'STAFF' }
                        })];
                case 13:
                    staff = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { email: 'viewer@stocksense.local', password: password, name: 'Viewer User', role: 'VIEWER' }
                        })];
                case 14:
                    viewer = _a.sent();
                    console.log('Seeding Categories...');
                    return [4 /*yield*/, prisma.category.create({ data: { name: 'Electronics', description: 'Electronic items' } })];
                case 15:
                    catElectronics = _a.sent();
                    return [4 /*yield*/, prisma.category.create({ data: { name: 'Office', description: 'Office supplies' } })];
                case 16:
                    catOffice = _a.sent();
                    return [4 /*yield*/, prisma.category.create({ data: { id: 'cat-hardware', name: 'Hardware', description: 'Hardware tools' } })];
                case 17:
                    catHardware = _a.sent();
                    return [4 /*yield*/, prisma.category.create({ data: { name: 'Accessories', description: 'Tech Accessories' } })];
                case 18:
                    catAccessories = _a.sent();
                    console.log('Seeding Warehouses and Locations...');
                    return [4 /*yield*/, prisma.warehouse.create({
                            data: { name: 'Main Warehouse', code: 'MAIN' }
                        })];
                case 19:
                    whMain = _a.sent();
                    return [4 /*yield*/, prisma.warehouse.create({
                            data: { name: 'Secondary Warehouse', code: 'SEC' }
                        })];
                case 20:
                    whSec = _a.sent();
                    return [4 /*yield*/, prisma.stockLocation.create({ data: { name: 'A-01', warehouseId: whMain.id } })];
                case 21:
                    locA01 = _a.sent();
                    return [4 /*yield*/, prisma.stockLocation.create({ data: { name: 'A-02', warehouseId: whMain.id } })];
                case 22:
                    locA02 = _a.sent();
                    return [4 /*yield*/, prisma.stockLocation.create({ data: { name: 'B-01', warehouseId: whSec.id } })];
                case 23:
                    locB01 = _a.sent();
                    return [4 /*yield*/, prisma.stockLocation.create({ data: { name: 'B-02', warehouseId: whSec.id } })];
                case 24:
                    locB02 = _a.sent();
                    console.log('Seeding Products...');
                    return [4 /*yield*/, prisma.product.create({
                            data: { name: 'Laptop Pro', sku: 'LP-PRO-01', barcode: '123456789012', categoryId: catElectronics.id, uom: 'pcs', minimumStock: 10, reorderLevel: 15, reorderQuantity: 20 }
                        })];
                case 25:
                    prod1 = _a.sent();
                    return [4 /*yield*/, prisma.product.create({
                            data: { name: 'Office Chair', sku: 'OF-CH-01', barcode: '234567890123', categoryId: catOffice.id, uom: 'pcs', minimumStock: 5, reorderLevel: 5, reorderQuantity: 10 }
                        })];
                case 26:
                    prod2 = _a.sent();
                    return [4 /*yield*/, prisma.product.create({
                            data: { name: 'Wireless Mouse', sku: 'WL-MS-01', barcode: '345678901234', categoryId: catAccessories.id, uom: 'pcs', minimumStock: 20, reorderLevel: 25, reorderQuantity: 50 }
                        })];
                case 27:
                    prod3 = _a.sent();
                    console.log('Seeding Stock Movements and Levels...');
                    // Since we cannot easily import StockService here without potential Next.js module issues, we'll manually seed levels.
                    return [4 /*yield*/, prisma.stockLevel.create({
                            data: { productId: prod1.id, locationId: locA01.id, quantity: 50 }
                        })];
                case 28:
                    // Since we cannot easily import StockService here without potential Next.js module issues, we'll manually seed levels.
                    _a.sent();
                    return [4 /*yield*/, prisma.stockMovement.create({
                            data: { productId: prod1.id, toLocationId: locA01.id, quantity: 50, type: 'RECEIPT', createdById: admin.id }
                        })];
                case 29:
                    _a.sent();
                    return [4 /*yield*/, prisma.stockLevel.create({
                            data: { productId: prod2.id, locationId: locB01.id, quantity: 4 } // Low stock
                        })];
                case 30:
                    _a.sent();
                    return [4 /*yield*/, prisma.stockMovement.create({
                            data: { productId: prod2.id, toLocationId: locB01.id, quantity: 4, type: 'RECEIPT', createdById: admin.id }
                        })];
                case 31:
                    _a.sent();
                    console.log('Database seeded successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
