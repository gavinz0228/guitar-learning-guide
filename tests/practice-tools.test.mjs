import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const htmlPath = 'practice-tools.html';
assert.ok(existsSync(htmlPath), 'practice-tools.html should exist');

const html = readFileSync(htmlPath, 'utf8');
for (const id of [
  'metronomeCard',
  'rhythmPatternGrid',
  'startMetronomeBtn',
  'tapTempoBtn',
  'noteGameCard',
  'fretboardGame',
  'answerOptions',
  'nextQuestionBtn'
]) {
  assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
}

for (const text of ['节拍器 + 节奏型播放器', '前三品音名小游戏', '下 下上 上下上', '随机找音', '识别位置']) {
  assert.ok(html.includes(text), `missing UI copy: ${text}`);
}

assert.ok(html.includes('id="noteMapHint"'), 'game should include a first-three-frets memory hint panel');
assert.ok(html.includes('E-F-F#-G'), 'memory hint should show low/high E string first-three-frets map');
assert.ok(html.includes("btn.textContent = '?';"), 'fret buttons should hide note names before answering');
assert.ok(html.includes('revealPosition(currentQuestion);'), 'identify mode should reveal the target note after answering');
assert.ok(html.includes('revealMatchingNotes(currentQuestion.note);'), 'find mode should reveal all matching notes after a correct click');

const nav = readFileSync('js/nav.js', 'utf8');
assert.ok(nav.includes("practice-tools"), 'navigation should include practice-tools page');

console.log('practice tools static contract passed');
