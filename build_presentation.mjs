import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const artifactTool = await import('file:///C:/Program%20Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs');
const { Presentation, PresentationFile } = artifactTool;

const root = path.dirname(new URL(import.meta.url).pathname).replace(/^\//, '').replaceAll('%20', ' ');
const out = path.join(root, 'results');
const build = path.join(root, '.build');
const skillDir = 'C:/Users/solan/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10930/skills/presentations';
await fs.mkdir(out, { recursive: true });
await fs.mkdir(build, { recursive: true });

const ppt = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { navy: '#102A43', blue: '#2F80ED', teal: '#20A39E', ink: '#17324D', muted: '#627D98', paper: '#F4F7FA', white: '#FFFFFF', pale: '#E7F1FA', line: '#D6E2EE', red: '#D1495B' };
const F = 'Arial';

function shape(slide, geometry, x, y, w, h, fill, lineFill='none', lineWidth=0) {
  return slide.shapes.add({ geometry, position: { left:x, top:y, width:w, height:h }, fill, line: { style:'solid', fill:lineFill, width:lineWidth } });
}
function txt(slide, text, x, y, w, h, size, color=C.ink, bold=false, opts={}) {
  const s=shape(slide, 'textbox', x,y,w,h,'none');
  s.text=text;
  s.text.style={ fontFamily:F, fontSize:size, color, bold, verticalAlignment:'middle', wrap:true, ...opts };
  return s;
}
function base(title, number, subtitle='') {
  const s=ppt.slides.add(); s.background.fill=C.paper;
  shape(s,'rect',0,0,14,720,C.blue);
  txt(s,title,66,42,1140,60,34,C.navy,true);
  if(subtitle) txt(s,subtitle,68,102,1110,34,17,C.muted,false);
  shape(s,'rect',68,656,1144,1,C.line);
  txt(s,'WEEK 4 CAPSTONE  /  HEART DISEASE PREDICTION',68,668,900,22,12,C.muted,true);
  txt(s,String(number).padStart(2,'0'),1150,666,50,24,13,C.muted,true);
  return s;
}
function notes(slide, text) { slide.speakerNotes.text=text; }

// 1 — cover
{
 const s=ppt.slides.add(); s.background.fill=C.navy;
 shape(s,'rect',870,0,410,720,'#163A5A');
 shape(s,'ellipse',940,104,230,230,C.blue);
 shape(s,'ellipse',1006,170,98,98,C.navy);
 shape(s,'rect',1040,128,28,180,C.teal);
 shape(s,'rect',972,203,164,28,C.teal);
 txt(s,'MACHINE LEARNING & AI  /  WEEK 4',76,68,760,30,15,'#8CC8FF',true);
 txt(s,'Heart Disease\nPrediction',76,168,790,170,56,C.white,true);
 txt(s,'A full machine learning pipeline, from data cleaning to model evaluation',80,382,690,66,22,'#D6E2EE');
 shape(s,'rect',80,498,8,74,C.teal);
 txt(s,'Binary classification  •  UCI Heart Disease dataset',105,510,730,42,18,C.white,false);
 txt(s,'Capstone project',80,654,400,26,14,'#9FB3C8',true);
 notes(s,'This capstone predicts whether a record indicates heart disease. It is an educational model, not a clinical diagnostic tool.');
}
// 2 — dataset and outcome
{
 const s=base('The data has 920 records and substantial missingness',2,'Four source cohorts; the label combines all positive severity values into one class.');
 const stats=[['920','records'],['4','source cohorts'],['13','predictor fields'],['509','positive labels']];
 stats.forEach((a,i)=>{ const x=68+i*284; txt(s,a[0],x,172,240,70,42,i===0?C.blue:C.navy,true); txt(s,a[1],x,238,250,32,17,C.muted); });
 shape(s,'rect',68,304,550,1,C.line);
 txt(s,'Target definition',68,332,450,34,22,C.navy,true);
 txt(s,'num = 0  →  No disease\nnum = 1–4  →  Disease present',68,380,505,100,23,C.ink,false);
 txt(s,'Excluded from predictors: record ID and cohort name',68,516,520,48,16,C.muted,false);
 txt(s,'Missing values by field',684,326,450,35,22,C.navy,true);
 const miss=[['ca',611],['thal',486],['slope',309],['fbs',90],['oldpeak',62],['trestbps',59],['thalch',55],['chol',30]];
 miss.forEach((a,i)=>{const y=374+i*31; txt(s,a[0],684,y,85,24,15,C.ink,true); shape(s,'rect',774,y+4,Math.max(3,a[1]/611*300),15,i[0]===0?C.teal:C.blue); txt(s,String(a[1]),1090,y,60,24,14,C.muted);});
 notes(s,'There are 920 rows and a binary target has_disease = (num > 0). The source contains 411 negative and 509 positive records. Missing counts are taken directly from the raw CSV. The highest missingness is in ca (611), thal (486), and slope (309), so imputation is necessary.');
}
// 3 — workflow
{
 const s=base('Preprocessing stays inside the training pipeline',3,'The 80/20 split is stratified; the test set remains held out through model selection.');
 const steps=[
  ['01','Split','80% train\n20% test\nstratified'],
  ['02','Numeric fields','Median imputation\nmissing flags\nstandard scaling'],
  ['03','Categories','Most frequent\nimputation\none-hot encoding'],
  ['04','Compare','Logistic regression\nDecision tree\nclass balanced'],
 ];
 steps.forEach((a,i)=>{
  const x=68+i*286;
  shape(s,'rect',x,220,250,266,C.white,C.line,1);
  txt(s,a[0],x+20,242,60,30,15,C.teal,true);
  txt(s,a[1],x+20,286,216,44,22,C.navy,true);
  txt(s,a[2],x+20,346,210,102,17,C.ink,false);
  if(i<3){shape(s,'rect',x+251,350,34,3,C.teal);}
 });
 txt(s,'Comparison metrics',68,536,180,28,16,C.muted,true);
 txt(s,'Accuracy  •  Precision  •  Recall  •  F1  •  ROC AUC',260,528,790,42,20,C.navy,true);
 notes(s,'Random state is 42. Continuous numeric columns are median-imputed with missingness indicators and standardized. Categories use mode imputation and one-hot encoding. Both steps are fitted only on training data by the pipeline. Logistic regression and a depth-limited decision tree use balanced class weights. The model with higher validation ROC AUC is selected, then refit on all development data before the final test evaluation.');
}
// 4 — comparison
{
 const s=base('Logistic regression leads on ROC AUC and recall',4,'Held-out test metrics; model selection used validation ROC AUC.');
 const metrics=[
  ['Accuracy',0.832,0.810],['Precision',0.838,0.853],['Recall',0.863,0.794],['F1',0.850,0.822],['ROC AUC',0.908,0.882]
 ];
 txt(s,'Logistic regression',260,182,280,28,15,C.blue,true);
 txt(s,'Decision tree',688,182,230,28,15,C.teal,true);
 metrics.forEach((m,i)=>{
  const y=230+i*70; txt(s,m[0],68,y,170,30,18,C.ink,true);
  shape(s,'rect',260,y+3,370,26,'#E5EDF5'); shape(s,'rect',260,y+3,370*m[1],26,C.blue);
  txt(s,m[1].toFixed(3),640,y,84,32,16,C.navy,true);
  shape(s,'rect',760,y+3,300,26,'#E5EDF5'); shape(s,'rect',760,y+3,300*m[2],26,C.teal);
  txt(s,m[2].toFixed(3),1070,y,84,32,16,C.navy,true);
 });
 shape(s,'rect',68,604,1144,1,C.line);
 txt(s,'Accuracy 0.832  |  Precision 0.838  |  Recall 0.863  |  F1 0.850  |  ROC AUC 0.908',68,616,1100,28,15,C.navy,true);
 notes(s,'Validation ROC AUC was 0.870 for logistic regression and 0.815 for the decision tree. After selecting logistic regression by validation ROC AUC, both candidates were refit on the full 80% development split. On the untouched 20% test set, logistic regression scores 0.832 accuracy, 0.838 precision, 0.863 recall, 0.850 F1, and 0.908 ROC AUC. The decision tree scores 0.810, 0.853, 0.794, 0.822, and 0.882 respectively. Each metric uses the positive class as disease present, and the threshold is the default 0.5.');
}
// 5 — diagnostics
{
 const s=base('The error profile shows 14 missed positive cases',5,'Confusion matrix and ROC curves on the same held-out test split.');
 const cm=await fs.readFile(path.join(out,'figures','confusion_matrix.png'));
 const roc=await fs.readFile(path.join(out,'figures','roc_curves.png'));
 s.images.add({blob:cm,contentType:'image/png',alt:'Confusion matrix for logistic regression: 65 true negatives, 17 false positives, 14 false negatives, and 88 true positives.',fit:'contain',position:{left:76,top:174,width:500,height:420}});
 s.images.add({blob:roc,contentType:'image/png',alt:'ROC curves: logistic regression AUC 0.908 and decision tree AUC 0.882.',fit:'contain',position:{left:628,top:174,width:550,height:420}});
 txt(s,'At the default 0.5 threshold: 88 / 102 positive test records were detected.',76,602,1100,28,17,C.navy,true);
 notes(s,'Confusion matrix row and column ordering is [No disease, Disease], giving TN=65, FP=17, FN=14, TP=88. Recall is 88/(88+14)=0.863. ROC curves compare ranking performance across thresholds. Raising or lowering the threshold changes the error tradeoff.');
}
// 6 — takeaways and limits
{
 const s=base('Useful baseline; not a clinical decision system',6,'A single held-out split is a starting point for evaluation, not external validation.');
 txt(s,'What the experiment shows',68,184,530,38,23,C.navy,true);
 txt(s,'• Logistic regression performed best on ROC AUC.\n• Recall was 0.863 at the default threshold.\n• Missing data was handled within the training pipeline.',68,244,520,180,20,C.ink,false);
 shape(s,'rect',640,176,1,386,C.line);
 txt(s,'What to validate next',694,184,480,38,23,C.navy,true);
 txt(s,'• Test across cohorts with group-aware validation.\n• Check calibration, confidence intervals, and fairness.\n• Select a threshold with clinical input.\n• Evaluate on a current external dataset.',694,244,500,220,20,C.ink,false);
 shape(s,'rect',68,520,1140,62,C.navy);
 txt(s,'Educational prototype only  |  Not intended for diagnosis or treatment decisions',90,531,1090,38,19,C.white,true);
 notes(s,'The current result comes from one random split of a multi-cohort historical dataset. Generalization to current clinical settings is unknown. Future work should use cohort-aware validation and external data, assess calibration and subgroup performance, and establish an appropriate threshold with qualified clinical experts.');
}

async function writeBlob(file, blob) { await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer())); }
for (const [i, slide] of ppt.slides.items.entries()) {
  const png=await ppt.export({slide,format:'png',scale:1});
  await writeBlob(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),png);
}
const montage=await ppt.export({format:'webp',montage:true});
await writeBlob(path.join(build,'montage.webp'),montage);
const draft=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(ppt)).save(draft);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
const finalPath=path.join(out,'heart_disease_capstone_final.pptx');
await fs.mkdir(path.dirname(finalPath),{recursive:true});
let result;
try {
 result=await finalizePresentation({
  workspaceDir:root, candidatePath:draft, finalPath,
  pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  requiredNativeTableOwnerSlides:[], requiredNativeChartOwnerSlides:[],
  fontPolicy:{basis:'design',families:[F]}, verifyArtifactToolImport:true,
  receiptPath:path.join(build,'validation.json'),
 });
} catch (error) {
 if (error?.code !== 'EPERM' || !String(error.message).includes('link')) throw error;
 // The finalizer completed package, layout, font, and import validation, then hit Windows hard-link restrictions.
 await fs.copyFile(draft, finalPath, constants.COPYFILE_EXCL);
 result={finalPath, publication:'copied validated candidate because hard links are unavailable'};
}
console.log(JSON.stringify({finalPath,result},null,2));
