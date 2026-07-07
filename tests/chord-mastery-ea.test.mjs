import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const htmlPath = 'chord-mastery.html';
assert.ok(existsSync(htmlPath), 'chord-mastery.html should exist');

const html = readFileSync(htmlPath, 'utf8');

for (const text of [
  '为什么先练 E 手型和 A 手型？',
  '6弦根音 → 用 E 手型',
  '5弦根音 → 用 A 手型',
  'E/A 手型训练器',
  '6弦根音',
  '5弦根音',
  'Major',
  'minor',
  'm7',
  '看到根音弦，先选手型'
]) {
  assert.ok(html.includes(text), `missing CAGED E/A lesson or trainer copy: ${text}`);
}

for (const id of [
  'eaTrainerCard',
  'eaRootStringSelector',
  'eaTypeSelector',
  'eaRootSelector',
  'eaShapeAnswer',
  'eaChordName',
  'eaFingering',
  'eaTrainerFeedback',
  'nextEaQuestionBtn'
]) {
  assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
}

for (const symbol of [
  'E: {',
  'A: {',
  'maj: {',
  'min: {',
  'dom7: {',
  'min7: {'
]) {
  assert.ok(html.includes(symbol), `missing E/A trainer data symbol: ${symbol}`);
}

assert.ok(html.includes('function updateEaTrainer()'), 'E/A trainer should update the displayed chord and fingering');
assert.ok(html.includes('function makeEaQuestion()'), 'E/A trainer should generate quiz questions');
assert.ok(html.includes('function checkEaAnswer'), 'E/A trainer should check E vs A shape answers');

console.log('chord mastery E/A contract passed');
