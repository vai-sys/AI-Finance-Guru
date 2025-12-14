// test-csv-parse.js
const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');

const sample = `date,amount,description
2025-01-03,450,Swiggy Order #1234
2025-01-04,899,Amazon Purchase`;

const rows = csvParse(sample, { columns: true, skip_empty_lines: true });
console.log('Parsed rows:', rows);
