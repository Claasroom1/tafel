// Tafel-App – PowerPoint-Import (.pptx): jede Folie wird eine eigene Tafelseite.
// Texte werden zu bearbeitbaren Textelementen (Position, Größe, fett/kursiv, Farbe wie auf der Folie – so gut es geht),
// Bilder zu Bildern. Tabellen, Diagramme, SmartArt, Animationen und Videos werden nicht übernommen.
// Für ein originalgetreues Bild: in PowerPoint als PDF speichern und „PDF-Seiten als Bilder“ verwenden.
'use strict';
(function () {
const S = T.S;
const BREITE = 1600; // Folienbreite auf der Tafel (px)
const X = s => new DOMParser().parseFromString(s, 'application/xml');
const kinder = (el, name) => el ? [...el.children].filter(c => c.localName === name) : [];
const kind = (el, name) => kinder(el, name)[0] || null;
const tief = (el, name) => el ? el.getElementsByTagNameNS('*', name)[0] || null : null;
const alle = (el, name) => el ? [...el.getElementsByTagNameNS('*', name)] : [];
const pfad = (basis, ziel) => { // relativer Pfad aus einer .rels-Datei → Pfad im ZIP
  if (ziel.startsWith('/')) return ziel.slice(1);
  const teile = basis.split('/'); teile.pop();
  for (const t of ziel.split('/')) { if (t === '..') teile.pop(); else if (t !== '.') teile.push(t); }
  return teile.join('/');
};
async function relsLesen(zip, datei) {
  const t = await zip.lies(datei.replace(/([^/]+)$/, '_rels/$1.rels')); const r = {};
  if (t) for (const e of alle(X(t), 'Relationship')) r[e.getAttribute('Id')] = { ziel: pfad(datei, e.getAttribute('Target')), typ: e.getAttribute('Type') || '', extern: e.getAttribute('TargetMode') === 'External' };
  return r;
}
const xfrmVon = sp => { const x = tief(kind(sp, 'spPr') || sp, 'xfrm') || tief(sp, 'xfrm'); if (!x) return null; const o = kind(x, 'off'), e = kind(x, 'ext'); return o && e ? { x: +o.getAttribute('x'), y: +o.getAttribute('y'), w: +e.getAttribute('cx'), h: +e.getAttribute('cy') } : null; };
const phVon = sp => { const p = tief(sp, 'ph'); return p ? { typ: p.getAttribute('type') || 'body', idx: p.getAttribute('idx') || '' } : null; };
// Platzhalter-Position aus Layout bzw. Master (wenn die Folie selbst keine angibt)
function phSuche(doc, ph) {
  if (!doc || !ph) return null;
  for (const sp of alle(doc, 'sp')) { const q = phVon(sp); if (!q) continue;
    if ((ph.idx && q.idx === ph.idx) || q.typ === ph.typ || (ph.typ === 'ctrTitle' && q.typ === 'title') || (ph.typ === 'subTitle' && q.typ === 'body')) { const f = xfrmVon(sp); if (f) return { f, sp }; } }
  return null;
}
const farbeVon = el => { const c = el && tief(el, 'srgbClr'); return c ? '#' + c.getAttribute('val') : null; };
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml', webp: 'image/webp' };
async function bildDaten(zip, name) {
  const end = (name.match(/\.(\w+)$/) || [])[1]; const mime = MIME[(end || '').toLowerCase()]; if (!mime) return null;
  const b = await zip.lies(name, true); if (!b) return null;
  let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return 'data:' + mime + ';base64,' + btoa(s);
}
const bildMasse = src => new Promise(r => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r([400, 300]); i.src = src; });
// Text umbrechen: Textelemente brechen selbst nicht um
function umbrechen(text, d, maxW) {
  const out = [];
  for (const zeile of String(text).split('\n')) { let akt = '';
    for (const wort of zeile.split(/ +/)) { const t = akt ? akt + ' ' + wort : wort; if (akt && T.textMetrics({ ...d, text: t }).w > maxW) { out.push(akt); akt = wort; } else akt = t; }
    out.push(akt); }
  return out.join('\n');
}
async function folieLesen(zip, datei, k, ptPx, B, H, warnung) {
  const doc = X(await zip.lies(datei)), rels = await relsLesen(zip, datei);
  const layoutRel = Object.values(rels).find(r => /slideLayout/.test(r.typ)); let layout = null, master = null;
  if (layoutRel) { layout = X(await zip.lies(layoutRel.ziel) || '<x/>'); const lr = await relsLesen(zip, layoutRel.ziel), mr = Object.values(lr).find(r => /slideMaster/.test(r.typ)); if (mr) master = X(await zip.lies(mr.ziel) || '<x/>'); }
  const pg = T.newPage('weiss'), items = []; let titel = '';
  const baum = tief(doc, 'spTree'); if (!baum) return { pg, titel };
  const lauf = async (el, dx = 0, dy = 0) => {
    for (const c of el.children) {
      const n = c.localName;
      if (n === 'grpSp') { await lauf(c, dx, dy); continue; }
      if (n === 'graphicFrame') { warnung.tabelle++; continue; }
      if (n === 'pic') {
        const blip = tief(c, 'blip'), id = blip && (blip.getAttribute('r:embed') || blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed'));
        const r = id && rels[id]; const f = xfrmVon(c);
        if (!r || r.extern) continue; const src = await bildDaten(zip, r.ziel); if (!src) { warnung.bild++; continue; }
        let w = f ? f.w * k : 400, hh = f ? f.h * k : 300, x = f ? f.x * k : (B - w) / 2, y = f ? f.y * k : (H - hh) / 2;
        if (!f) { const [iw, ih] = await bildMasse(src); hh = w * ih / iw; }
        items.push({ t: 'o', id: T.uid(), k: 'bild', d: { src }, x, y, w, h: hh, r: 0 }); continue;
      }
      if (n !== 'sp') continue;
      const ph = phVon(c), body = kind(c, 'txBody'); if (!body) continue;
      let f = xfrmVon(c), lph = null; if (!f && ph) { lph = phSuche(layout, ph) || phSuche(master, ph); f = lph && lph.f; }
      const istTitel = ph && /title|ctrTitle/i.test(ph.typ);
      const absaetze = kinder(body, 'p').map(p => {
        const runs = kinder(p, 'r').concat(kinder(p, 'fld')); const t = runs.map(r => (tief(r, 't') || {}).textContent || '').join('');
        const rPr = runs.map(r => kind(r, 'rPr')).find(Boolean) || tief(p, 'endParaRPr'); const pPr = kind(p, 'pPr');
        const ebene = +(pPr && pPr.getAttribute('lvl') || 0), aufz = !istTitel && ph && !/subTitle|ctrTitle/.test(ph.typ) && t.trim() && !(pPr && tief(pPr, 'buNone'));
        return { t: (aufz ? '  '.repeat(ebene) + '• ' : '') + t, sz: rPr && rPr.getAttribute('sz'), b: rPr && rPr.getAttribute('b') === '1', i: rPr && rPr.getAttribute('i') === '1', c: farbeVon(rPr) };
      }).filter(a => a.t.trim());
      if (!absaetze.length) continue;
      const a0 = absaetze[0], pt = a0.sz ? +a0.sz / 100 : istTitel ? 40 : 24;
      const box = f ? { x: f.x * k + dx, y: f.y * k + dy, w: f.w * k, h: f.h * k } : { x: 60, y: istTitel ? 40 : 160, w: B - 120, h: H / 2 };
      const d = { text: '', size: Math.max(14, Math.round(pt * ptPx)), c: a0.c || '#1a1a1a', fett: istTitel || a0.b, kursiv: a0.i };
      d.text = umbrechen(absaetze.map(a => a.t).join('\n'), d, Math.max(80, box.w - 12));
      const m = T.textMetrics(d); if (istTitel && !titel) titel = absaetze.map(a => a.t).join(' ').slice(0, 40);
      items.push({ t: 'o', id: T.uid(), k: 'text', d, x: box.x + 6, y: box.y + 4, w: m.w, h: m.h, r: 0 });
    }
  };
  await lauf(baum);
  pg.items.push(...items);
  if (titel) pg.titel = titel;
  return { pg, titel };
}
async function pptLesen(buf) {
  let zip; try { zip = T.zipLesen(buf); } catch (e) { throw new Error('keine PowerPoint-Datei'); }
  const pres = await zip.lies('ppt/presentation.xml'); if (!pres) throw new Error('keine PowerPoint-Datei (.pptx)');
  const pd = X(pres), sz = tief(pd, 'sldSz'), cx = sz ? +sz.getAttribute('cx') : 12192000, cy = sz ? +sz.getAttribute('cy') : 6858000;
  const k = BREITE / cx, B = BREITE, H = cy * k, ptPx = BREITE / (cx / 12700); // EMU → px; 1 pt = 12700 EMU
  const rels = await relsLesen(zip, 'ppt/presentation.xml');
  const ids = alle(pd, 'sldId').map(e => e.getAttribute('r:id') || e.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
  const folien = ids.map(id => rels[id] && rels[id].ziel).filter(Boolean).slice(0, 60);
  const warnung = { tabelle: 0, bild: 0 }, seiten = [];
  for (let i = 0; i < folien.length; i++) {
    T.toast(`PowerPoint: Folie ${i + 1} von ${folien.length} …`, 1500);
    try { const { pg } = await folieLesen(zip, folien[i], k, ptPx, B, H, warnung); pg.view = { x: 30, y: 70, z: Math.min(1, (T.W - T.ox - 80) / B, (T.H - 200) / H) }; seiten.push(pg); } catch (e) { /* Folie überspringen */ }
  }
  if (!seiten.length) throw new Error('keine Folien gefunden');
  T.snap(); const start = S.page + 1; S.board.pages.splice(start, 0, ...seiten); T.ui.gotoPage(start); T.nachEinfuegen();
  const extra = (warnung.tabelle ? ` ${warnung.tabelle} Tabelle(n)/Diagramm(e)` : '') + (warnung.bild ? ` ${warnung.bild} Bild(er) (Format)` : '');
  T.toast(`${seiten.length} Folie(n) als Tafelseiten eingefügt – Text bearbeitbar, ▶ Präsentieren zum Zeigen.` + (extra ? ' Nicht übernommen:' + extra + ' – dafür als PDF importieren.' : ''), 6500);
}
T.pptImport = async () => {
  const file = await T.pickFile('.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation'); if (!file) return;
  if (/\.ppt$/i.test(file.name)) { T.toast('Alte PowerPoint-Datei (.ppt): bitte in PowerPoint als .pptx oder als PDF speichern.', 6000); return; }
  try { T.toast('PowerPoint wird gelesen …', 3000); await pptLesen(await file.arrayBuffer()); }
  catch (e) { T.toast('Die PowerPoint-Datei konnte nicht gelesen werden: ' + (e.message || e), 6000); }
};
})();
