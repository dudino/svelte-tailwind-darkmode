// Simple test to verify translation files are valid JSON

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'lib', 'i18n', 'locales');
const locales = ['en.json', 'cs.json', 'ru.json'];

console.log('🌍 Testing translation files...\n');

for (const locale of locales) {
  const filePath = path.join(localesDir, locale);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    console.log(`✅ ${locale} - Valid JSON`);
    console.log(`   - Keys: ${Object.keys(parsed).length}`);
    console.log(`   - Navigation items: ${Object.keys(parsed.nav || {}).length}`);
    console.log(`   - Common items: ${Object.keys(parsed.common || {}).length}`);
    console.log(`   - Masseuse items: ${Object.keys(parsed.masseuse || {}).length}`);
    console.log(`   - Bookings items: ${Object.keys(parsed.bookings || {}).length}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ ${locale} - Error: ${error.message}`);
  }
}

console.log('🎉 Translation test complete!');
