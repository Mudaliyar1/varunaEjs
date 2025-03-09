const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const inquirer = require('inquirer').default; // Fix for inquirer
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = 'test'; // Directly using 'test' as the database

// Function to get collections from the 'test' database
async function getCollections() {
    console.log(`🔍 Fetching collections from database: ${DATABASE_NAME}`);
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const collections = await client.db(DATABASE_NAME).listCollections().toArray();
        return collections.map(col => col.name);
    } catch (error) {
        console.error('❌ Error fetching collections:', error.message);
        return [];
    } finally {
        await client.close();
    }
}

// Function to get schema from a selected collection
async function getSchema(collectionName) {
    await mongoose.connect(MONGO_URI, { dbName: DATABASE_NAME, useNewUrlParser: true, useUnifiedTopology: true });

    const model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
    const sampleDoc = await model.findOne();

    let schema = {};
    if (sampleDoc) {
        schema = sampleDoc.toObject();
    }

    await mongoose.disconnect();
    return schema;
}

// Function to export schema to Excel
async function exportSchemaToExcel(collectionName) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${collectionName}_Schema`);

    // Table Headers
    sheet.addRow(['Field Name', 'Type', 'Required', 'Default', 'SQL Equivalent']);

    const schema = await getSchema(collectionName);

    for (const key in schema) {
        const value = schema[key];
        let type = typeof value;
        let required = 'No';
        let defaultValue = 'None';
        let sqlType = 'TEXT';

        // Convert MongoDB types to SQL types
        if (Array.isArray(value)) {
            type = 'Array';
            sqlType = 'TEXT';
        } else if (type === 'number') {
            sqlType = 'INT';
        } else if (type === 'boolean') {
            sqlType = 'BOOLEAN';
        } else if (type === 'object') {
            sqlType = 'JSON';
        }

        sheet.addRow([key, type, required, defaultValue, sqlType]);
    }

    const filePath = `./sqlstructure/${collectionName}_schema.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Schema exported to: ${filePath}`);
}

// Main function
async function main() {
    const collections = await getCollections();
    if (collections.length === 0) {
        console.log('❌ No collections found in the database.');
        return;
    }

    // Select Collection
    const { selectedCollection } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedCollection',
            message: 'Select a collection to export:',
            choices: collections
        }
    ]);

    await exportSchemaToExcel(selectedCollection);
}

// Run the script
main().catch(console.error);
