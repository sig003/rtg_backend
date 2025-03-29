import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(
  cors({
    origin: 'https://rgt-project-two.vercel.app',
  })
);

const isNumber = (value: unknown): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

const isString = (value: unknown): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

app.get('/api/books', async (req, res) => {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          OR: [
            { title: { contains: search } },
            { author: { contains: search } },
          ],
        }
      : {};

    const [books, total] = await Promise.all([
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
  } catch (error) {
    console.error('[BOOKS API ERROR]', error);
    return void res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, contents, quantity } = req.body;

  if (!isString(title) || !isString(author) || !isString(contents)) {
    return void res.status(400).json({ message: 'Invalid Parameters' });
  }

  try {
    const quantityValue = Number(quantity) ? Number(quantity) : 0;
    const insertBooks = await prisma.book.create({
      data: { title, author, contents, quantity: quantityValue },
    });
    res.status(201).json(insertBooks);
  } catch {
    return void res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!isNumber(id)) {
    return void res.status(400).json({ message: 'Invalid Parameters' });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return void res.status(404).json({ message: 'Not Found' });
    }
    res.json(book);
  } catch {
    return void res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/books/:id', async (req, res) => {
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
    const updateBook = await prisma.book.update({
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
  } catch {
    return void res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!isNumber(id)) {
    return void res.status(400).json({ message: 'Invalid Parameters' });
  }

  try {
    await prisma.book.delete({ where: { id } });
    res.status(204).end();
  } catch {
    return void res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(3001, () => {
  console.log('Ready to Server');
});
