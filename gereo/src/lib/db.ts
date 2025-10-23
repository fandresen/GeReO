import path from 'node:path';
import Knex from 'knex';
import { app } from 'electron';

// On détermine le chemin de la base de données dans le dossier des données de l'application
const dbPath = path.join(app.getPath('userData'), 'gereo.db');

export const knex = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

/**
 * Initialise la base de données en créant les tables si elles n'existent pas.
 */
export async function initDatabase() {
  try {
    // On vérifie que la connexion est établie
    await knex.raw('SELECT 1');

    // On crée les tables
    await knex.schema.createTableIfNotExists('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.string('reference_code');
      table.decimal('purchase_price').defaultTo(0);
      table.decimal('wholesale_price').defaultTo(0);
      table.decimal('selling_price').defaultTo(0);
      table.integer('current_stock').defaultTo(0);
      table.integer('min_stock_alert').defaultTo(0);
    });

    await knex.schema.createTableIfNotExists('stock_movements', (table) => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.string('movement_type').notNullable(); // 'ENTRY', 'SALE', 'ADJUST'
        table.integer('quantity').notNullable();
        table.decimal('unit_price');
        table.datetime('movement_date').defaultTo(knex.fn.now());
        table.text('notes');
    });

    await knex.schema.createTableIfNotExists('customers', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('phone');
        table.string('address');
        table.decimal('total_debt').defaultTo(0);
    });

    await knex.schema.createTableIfNotExists('invoices', (table) => {
        table.increments('id').primary();
        table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('SET NULL');
        table.datetime('invoice_date').defaultTo(knex.fn.now());
        table.decimal('total_amount').defaultTo(0);
        table.decimal('discount').defaultTo(0);
        table.decimal('amount_paid').defaultTo(0);
        table.decimal('amount_due').defaultTo(0);
        table.string('status').defaultTo('PAID'); // 'PAID', 'UNPAID'
    });

    await knex.schema.createTableIfNotExists('invoice_items', (table) => {
        table.increments('id').primary();
        table.integer('invoice_id').unsigned().notNullable().references('id').inTable('invoices').onDelete('CASCADE');
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('RESTRICT');
        table.integer('quantity').notNullable();
        table.decimal('unit_price').notNullable();
        table.decimal('total_price').notNullable();
    });

    await knex.schema.createTableIfNotExists('expenses', (table) => {
        table.increments('id').primary();
        table.datetime('expense_date').defaultTo(knex.fn.now());
        table.text('description').notNullable();
        table.string('category');
        table.decimal('amount').notNullable();
    });

    await knex.schema.createTableIfNotExists('cash_movements', (table) => {
        table.increments('id').primary();
        table.datetime('movement_date').defaultTo(knex.fn.now());
        table.string('movement_type').notNullable(); // 'SALE', 'EXPENSE', 'DEBT_PAYMENT', 'ADJUST'
        table.decimal('amount').notNullable();
        table.integer('reference_id');
        table.decimal('current_balance').notNullable();
        table.text('notes');
    });

    await knex.schema.createTableIfNotExists('settings', (table) => {
        table.string('key').primary();
        table.text('value');
    });

    // Insertion des paramètres par défaut s'ils n'existent pas
    const settings = await knex('settings');
    if (settings.length === 0) {
      await knex('settings').insert([
        { key: 'company_name', value: 'fandresenaCompany' },
        { key: 'company_address', value: 'Antananarivo Ambohijanaka' },
        { key: 'company_phone', value: '0347818742' },
        { key: 'company_nif', value: '52542455' },
        { key: 'company_stat', value: '453148' },
        { key: 'company_logo_path', value: '' },
        { key: 'default_printer_type', value: 'A4' },
      ]);
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}