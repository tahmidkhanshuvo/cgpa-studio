/* Fictional fixtures only. Run with: node --test tests/engine.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = name => fs.readFileSync(path.join(__dirname, '../assets/js', name), 'utf8');
const stateSource = source('state.js');
const engineSource = source('engine.js');
const plannerSource = source('planner.js').split('function renderPlan(')[0];
const fixture = {
  semesters: ['1-1', '1-2', '2-1'],
  courses: [
    {code:'T101', name:'Theory A', credits:3, type:'Theory', semester:1},
    {code:'T102', name:'Theory B', credits:3, type:'Theory', semester:1},
    {code:'L101', name:'Lab A', credits:1.5, type:'Lab / Sessional', semester:1},
    {code:'T201', name:'Theory C', credits:2, type:'Theory', semester:2},
    {code:'P301', name:'Thesis', credits:3, type:'Thesis', semester:3}
  ]
};
function createEngine(saved = null) {
  const context = vm.createContext({localStorage: {getItem: () => saved && JSON.stringify(saved)}});
  vm.runInContext(stateSource + '\n' + engineSource + '\n' + plannerSource, context);
  return expr => vm.runInContext(expr, context);
}
test('default curriculum and grade scale remain compatible', () => {
  const run = createEngine();
  assert.equal(run('all.length'), 73);
  assert.equal(run('total'), 156);
  assert.equal(run('labels.length'), 8);
  assert.equal(run('gp(8)'), 3.5);
  assert.equal(run('gp(10)'), 4);
});
test('credit-weighted passing average and including-F average differ', () => {
  const run = createEngine();
  run(`applyCurriculum(${JSON.stringify(fixture)}); values = {T101:1,T102:6,L101:10};`);
  assert.equal(run('model().terms[0].cum.credits'), 4.5);
  assert.equal(run('model().terms[0].raw.credits'), 7.5);
  assert.equal(run('model().terms[0].cum.avg'), 15/4.5);
  assert.equal(run('model().terms[0].raw.avg'), 2);
});
test('repeat results replace grades in cumulative results but count in the exam semester', () => {
  const run = createEngine();
  run(`applyCurriculum(${JSON.stringify(fixture)}); values={T101:1,T102:4,L101:10,T201:6}; exams=[{code:'T101',type:'carry',sem:1,grade:6},{code:'T102',type:'improvement',sem:1,grade:8}];`);
  assert.equal(run('model().invalid.length'), 0);
  assert.equal(run('model().terms[0].cum.credits'), 4.5);
  assert.equal(run('model().terms[1].gpa.credits'), 8);
  assert.equal(run('model().terms[1].cum.credits'), 9.5);
  assert.equal(run('model().terms[1].cum.points'), 31.5);
  assert.equal(run('model().terms[1].orig.points'), 19.5);
});
test('theory-only repeat exams, exact 3-credit improvements, cap and one attempt', () => {
  const run = createEngine();
  run(`applyCurriculum(${JSON.stringify(fixture)}); values={T101:4,T102:1,L101:1,T201:4,P301:1}; exams=[{code:'L101',type:'clearance',sem:0,grade:6},{code:'T102',type:'clearance',sem:0,grade:8},{code:'T101',type:'improvement',sem:1,grade:8},{code:'T101',type:'improvement',sem:2,grade:8},{code:'T201',type:'improvement',sem:2,grade:8},{code:'P301',type:'clearance',sem:2,grade:6}];`);
  assert.equal(run('model().history.length'), 1);
  assert.equal(run('model().invalid.length'), 5);
  assert.equal(run('model().state.T101'), 8);
  assert.equal(run('model().state.T102'), 1);
});
test('planner only suggests eligible improvements and leaves entered grades unchanged', () => {
  const run = createEngine();
  run(`applyCurriculum(${JSON.stringify(fixture)}); values={T101:4,T102:6,L101:4,T201:4};`);
  assert.equal(run('planModel(model(),3.5,1,true).options.length'), 2);
  assert.equal(run('planModel(model(),3.5,1,true).options.every(r=>r.c.type==="Theory" && r.c.credit===3)'), true);
  assert.equal(run('values.T101'), 4);
  assert.equal(run('planModel(model(),3.5,1,false).options.length'), 0);
});
test('legacy thesis code migrates to the corrected code', () => {
  const run = createEngine({values:{'CSE 4200':9}});
  assert.equal(run('idx("CSE 4250")'), 9);
});
