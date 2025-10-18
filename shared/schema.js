const { pgTable, serial, text, varchar, timestamp } = require('drizzle-orm/pg-core');

const rates = pgTable('rates', {
  id: serial('id').primaryKey(),
  vedhani: text('vedhani').notNull(),
  ornaments22k: text('ornaments22k').notNull(),
  ornaments18k: text('ornaments18k').notNull(),
  silver: text('silver').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const images = pgTable('images', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  category: varchar('category', { length: 100 }),
  fileName: text('file_name'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
});

module.exports = { rates, images };
