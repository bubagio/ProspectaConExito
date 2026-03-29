// Script per eliminare articoli duplicati (mantiene solo il più vecchio per ogni titolo)
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

console.log('📋 Articoli prima della pulizia:');
const before = db.prepare('SELECT id, title FROM articles ORDER BY id').all();
before.forEach(a => console.log(`  #${a.id} - ${a.title}`));

// Elimina duplicati mantenendo solo il record con ID più basso per ogni titolo
const result = db.prepare(`
  DELETE FROM articles
  WHERE id NOT IN (
    SELECT MIN(id) FROM articles GROUP BY title
  )
`).run();

console.log(`\n🗑️  Eliminati ${result.changes} duplicati`);

console.log('\n✅ Articoli dopo la pulizia:');
const after = db.prepare('SELECT id, title FROM articles ORDER BY id').all();
after.forEach(a => console.log(`  #${a.id} - ${a.title}`));

db.close();
