#!/usr/bin/env node
'use strict';

// Layer 1: code-based checks. Deterministic, free, runs on every output.
// Catches structural failures. Cannot catch a fluent, valid, WRONG summary.

const fs = require('node:fs');
const path = require('node:path');

const SENTIMENTS = ['positive', 'neutral', 'negative', 'mixed'];
const CATEGORIES = ['billing', 'bug', 'feature_request', 'question', 'other'];
const SUMMARY_MIN = 20;
const SUMMARY_MAX = 200;

const outputsDir = path.join(__dirname, 'outputs');
const ticketsDir = path.join(__dirname, 'tickets');

function checkFile(file) {
  const problems = [];
  const raw = fs.readFileSync(path.join(outputsDir, file), 'utf8');

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return [`invalid JSON: ${err.message}`];
  }

  for (const field of ['ticket', 'sentiment', 'category', 'summary']) {
    if (typeof data[field] !== 'string') problems.push(`missing or non-string field: ${field}`);
  }
  if (problems.length) return problems;

  if (!fs.existsSync(path.join(ticketsDir, data.ticket)))
    problems.push(`references unknown ticket: ${data.ticket}`);
  if (!SENTIMENTS.includes(data.sentiment))
    problems.push(`sentiment "${data.sentiment}" not in [${SENTIMENTS.join(', ')}]`);
  if (!CATEGORIES.includes(data.category))
    problems.push(`category "${data.category}" not in [${CATEGORIES.join(', ')}]`);
  if (data.summary.length < SUMMARY_MIN || data.summary.length > SUMMARY_MAX)
    problems.push(`summary length ${data.summary.length} outside ${SUMMARY_MIN}-${SUMMARY_MAX}`);

  return problems;
}

const files = fs.readdirSync(outputsDir).filter((f) => f.endsWith('.json')).sort();
let failures = 0;

for (const file of files) {
  const problems = checkFile(file);
  if (problems.length === 0) {
    console.log(`  PASS  ${file}`);
  } else {
    failures++;
    console.log(`  FAIL  ${file}`);
    for (const p of problems) console.log(`        - ${p}`);
  }
}

console.log(`\n${files.length - failures}/${files.length} outputs pass code checks`);
console.log('Remember: passing here only means structurally valid — not truthful.');
process.exit(failures > 0 ? 1 : 0);
