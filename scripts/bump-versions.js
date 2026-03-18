const fs = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node bump-versions.js <version>');
  process.exit(1);
}

// Update .claude-plugin/marketplace.json → plugins[0].version
const marketplacePath = '.claude-plugin/marketplace.json';
const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
marketplace.plugins[0].version = version;
fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
console.log(`Updated ${marketplacePath} to ${version}`);

// Update wbs-decomposer/SKILL.md → frontmatter metadata.version
const skillPath = 'wbs-decomposer/SKILL.md';
const skill = fs.readFileSync(skillPath, 'utf8');
const [, frontmatter, ...rest] = skill.split('---');
const updated = frontmatter.replace(
  /(metadata:\s*\n(?:[ \t]+\S[^\n]*\n)*?[ \t]+version:\s*)"[^"]*"/,
  `$1"${version}"`
);
fs.writeFileSync(skillPath, ['', updated, ...rest].join('---'));
console.log(`Updated ${skillPath} to ${version}`);
