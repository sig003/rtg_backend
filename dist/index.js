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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'https://rgt-project-two.vercel.app',
}));
const isNumber = (value) => {
    return typeof value === 'number' && !isNaN(value);
};
const isString = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
};
app.get('/api/books', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchFilter = search
            ? {
                OR: [
                    { title: { contains: search } },
                    { author: { contains: search } },
                ],
            }
            : {};
        const [books, total] = yield Promise.all([
            prisma.book.findMany({
                where: searchFilter,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.book.count({
                where: searchFilter,
            }),
        ]);
        res.json({ data: books, total });
    }
    catch (error) {
        console.error('[BOOKS API ERROR]', error);
        return void res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.post('/api/books', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, author, contents, quantity } = req.body;
    if (!isString(title) || !isString(author) || !isString(contents)) {
        return void res.status(400).json({ message: 'Invalid Parameters' });
    }
    try {
        const quantityValue = Number(quantity) ? Number(quantity) : 0;
        const insertBooks = yield prisma.book.create({
            data: { title, author, contents, quantity: quantityValue },
        });
        res.status(201).json(insertBooks);
    }
    catch (_a) {
        return void res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.get('/api/books/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        return void res.status(400).json({ message: 'Invalid Parameters' });
    }
    try {
        const book = yield prisma.book.findUnique({ where: { id } });
        if (!book) {
            return void res.status(404).json({ message: 'Not Found' });
        }
        res.json(book);
    }
    catch (_a) {
        return void res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.put('/api/books/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        return void res.status(400).json({ message: 'Invalid Parameters' });
    }
    const { title, author, contents, quantity } = req.body;
    if (!isString(title) || !isString(author) || !isString(contents)) {
        return void res.status(400).json({ message: 'Invalid Parameters' });
    }
    try {
        const quantityValue = Number(quantity) ? Number(quantity) : 0;
        const updateBook = yield prisma.book.update({
            where: { id },
            data: {
                title,
                author,
                contents,
                quantity: quantityValue,
                modifiedAt: new Date(),
            },
        });
        res.json(updateBook);
    }
    catch (_a) {
        return void res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.delete('/api/books/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        return void res.status(400).json({ message: 'Invalid Parameters' });
    }
    try {
        yield prisma.book.delete({ where: { id } });
        res.status(204).end();
    }
    catch (_a) {
        return void res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.listen(3001, () => {
    console.log('Ready to Server');
});
