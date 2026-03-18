const fs = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node bump-versions.js <version>');
  process.exit(1);
}

// Update .claude-plugin/plugin.json → version
const pluginPath = '.claude-plugin/plugin.json';
const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
plugin.version = version;
fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + '\n');
console.log(`Updated ${pluginPath} to ${version}`);

