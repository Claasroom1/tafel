// Tafel-App – Gebete & Impulse für den Morgenkreis: Sammlung, Gebet des Tages, Vollbild-Ansicht, Text auf die Tafel
// Nur gemeinfreie Texte (Lutherbibel 1912, traditionelle Gebete, Liederdichter vor 1900, Bonhoeffer † 1945) oder selbst formuliert.
'use strict';
(function () {
const h = T.h;
const merke = (k, v) => { try { localStorage.setItem('tafelapp.' + k, JSON.stringify(v)); } catch (e) {} };
const lies = (k, d) => { try { const v = JSON.parse(localStorage.getItem('tafelapp.' + k)); return v == null ? d : v; } catch (e) { return d; } };

const KATS = [['morgen', '🌅 Morgen'], ['bibel', '📜 Psalmen & Bibel'], ['segen', '✨ Segen'], ['dank', '🙌 Dank & Bitte'],
  ['frieden', '🕊️ Frieden & Miteinander'], ['mut', '✏️ Prüfung & Mut'], ['jahr', '🕯️ Kirchenjahr'], ['impuls', '💡 Impulse']];
const EIGEN = 'selbst formuliert', LB = 'Lutherbibel 1912';
// k = Kategorie, t = Titel, x = Text (\n = Zeilenumbruch, sonst wird automatisch umbrochen), f = Frage zum Nachdenken, q = Quelle, z = Zeit (für „Gebet des Tages“; 'anlass' = nie automatisch, nur von Hand)
// Leitlinie: Zuversicht schenken, zum Nachdenken anregen, passend für Jg. 5–10 – keine Texte über Tod und Verlust.
const G = [
  // ---------- Morgen ----------
  { k: 'morgen', t: 'Ein neuer Tag', q: EIGEN, x: 'Guter Gott, ein neuer Tag beginnt.\nWir sind hier zusammen – ausgeschlafen oder noch müde, gut gelaunt oder mit Gedanken im Kopf.\nDu kennst jeden von uns, so wie wir sind.\nSei bei uns heute beim Lernen, in den Pausen und auf dem Heimweg.\nAmen.', f: 'Worauf freue ich mich heute?' },
  { k: 'morgen', t: 'Vaterunser', q: 'Matthäus 6,9–13, traditionelle Fassung', x: 'Vater unser im Himmel,\ngeheiligt werde dein Name.\nDein Reich komme.\nDein Wille geschehe, wie im Himmel, so auf Erden.\nUnser tägliches Brot gib uns heute.\nUnd vergib uns unsere Schuld,\nwie auch wir vergeben unsern Schuldigern.\nUnd führe uns nicht in Versuchung,\nsondern erlöse uns von dem Bösen.\nDenn dein ist das Reich und die Kraft\nund die Herrlichkeit in Ewigkeit.\nAmen.' },
  { k: 'morgen', t: 'Heute fange ich neu an', q: EIGEN, x: 'Gott, gestern ist vorbei.\nWas gut war, nehme ich mit. Was nicht geklappt hat, darf ich hinter mir lassen.\nHeute ist ein neuer Tag – eine neue Chance.\nGib mir Mut, sie zu nutzen.\nAmen.', f: 'Was möchte ich heute besser machen als gestern?' },
  { k: 'morgen', t: 'Alle Morgen neu', q: 'Klagelieder 3,22–23 (' + LB + ')', x: 'Seine Barmherzigkeit hat noch kein Ende,\nsondern sie ist alle Morgen neu,\nund deine Treue ist groß.', f: 'Was ist für mich heute Morgen neu und gut?' },
  { k: 'morgen', t: 'Eine neue Woche', q: EIGEN, z: 'montag', x: 'Gott, eine neue Woche liegt vor uns.\nWir wissen noch nicht, was sie bringt: Neues zum Lernen, schöne Momente, vielleicht auch Anstrengendes.\nGib uns einen guten Start und Geduld miteinander.\nHilf uns, dass wir am Freitag sagen können: Das war eine gute Woche.\nAmen.', f: 'Was nehme ich mir für diese Woche vor?' },
  { k: 'morgen', t: 'Gleich ist Wochenende', q: EIGEN, z: 'freitag', x: 'Danke, Gott, für diese Woche.\nFür alles, was gelungen ist, und für alles, was wir gelernt haben.\nWas schiefgegangen ist, legen wir in deine Hand.\nSchenke uns ein schönes Wochenende und lass uns am Montag gut erholt wiederkommen.\nAmen.', f: 'Was war mein schönster Moment in dieser Woche?' },
  { k: 'morgen', t: 'Mit offenen Augen', q: EIGEN, x: 'Gott, öffne unsere Augen für das Schöne an diesem Tag.\nÖffne unsere Ohren, damit wir einander zuhören.\nÖffne unsere Hände, damit wir helfen, wo jemand Hilfe braucht.\nUnd öffne unsere Herzen für dich.\nAmen.', f: 'Was Schönes habe ich heute schon gesehen?' },
  { k: 'morgen', t: 'Du bist nicht allein', q: EIGEN, x: 'Gott, manchmal fühlen wir uns allein – auch mitten in einer vollen Klasse.\nDu sagst uns: Ich bin bei dir.\nUnd du schenkst uns Menschen, die zu uns halten.\nHilf uns, das heute zu spüren.\nAmen.', f: 'Wer ist für mich da? Für wen kann ich heute da sein?' },

  // ---------- Psalmen & Bibel ----------
  { k: 'bibel', t: 'Der gute Hirte', q: 'Psalm 23,1–3 (' + LB + ')', x: 'Der HERR ist mein Hirte; mir wird nichts mangeln.\nEr weidet mich auf einer grünen Aue und führet mich zum frischen Wasser.\nEr erquicket meine Seele.', f: 'Was gibt mir neue Kraft, wenn ich müde bin?' },
  { k: 'bibel', t: 'Meine Hilfe', q: 'Psalm 121,1–2.8 (' + LB + ')', x: 'Ich hebe meine Augen auf zu den Bergen, von welchen mir Hilfe kommt.\nMeine Hilfe kommt vom HERRN, der Himmel und Erde gemacht hat.\nDer HERR behüte deinen Ausgang und Eingang von nun an bis in Ewigkeit.' },
  { k: 'bibel', t: 'Dies ist der Tag', q: 'Psalm 118,24 (' + LB + ')', x: 'Dies ist der Tag, den der HERR macht;\nlasset uns freuen und fröhlich darin sein.', f: 'Was könnte heute ein Grund zur Freude sein?' },
  { k: 'bibel', t: 'Ein Licht auf meinem Weg', q: 'Psalm 119,105 (' + LB + ')', x: 'Dein Wort ist meines Fußes Leuchte\nund ein Licht auf meinem Wege.', f: 'Was hilft mir, gute Entscheidungen zu treffen?' },
  { k: 'bibel', t: 'Von allen Seiten', q: 'Psalm 139,5 (' + LB + ')', x: 'Von allen Seiten umgibst du mich\nund hältst deine Hand über mir.', f: 'Wann habe ich mich zuletzt richtig sicher und geborgen gefühlt?' },
  { k: 'bibel', t: 'Mein Licht', q: 'Psalm 27,1 (' + LB + ')', x: 'Der HERR ist mein Licht und mein Heil;\nvor wem sollte ich mich fürchten?\nDer HERR ist meines Lebens Kraft.' },
  { k: 'bibel', t: 'Weiter Raum', q: 'Psalm 31,9 (' + LB + ')', x: 'Du stellest meine Füße auf weiten Raum.', f: 'Wo möchte ich mich heute mehr trauen?' },
  { k: 'bibel', t: 'Glaube, Hoffnung, Liebe', q: '1. Korinther 13,13 (' + LB + ')', x: 'Nun aber bleibt Glaube, Hoffnung, Liebe, diese drei;\naber die Liebe ist die größte unter ihnen.', f: 'Woran merkt man, dass jemand einen anderen gern hat?' },
  { k: 'bibel', t: 'Fröhlich in Hoffnung', q: 'Römer 12,12 (' + LB + ')', x: 'Seid fröhlich in Hoffnung,\ngeduldig in Trübsal,\nhaltet an am Gebet.', f: 'Worauf hoffe ich gerade?' },
  { k: 'bibel', t: 'Alles hat seine Zeit', q: 'Prediger 3,1 (' + LB + ')', z: 'ferien', x: 'Ein jegliches hat seine Zeit,\nund alles Vornehmen unter dem Himmel hat seine Stunde.', f: 'Wofür möchte ich mir mehr Zeit nehmen?' },

  // ---------- Segen ----------
  { k: 'segen', t: 'Der Segen Aarons', q: '4. Mose 6,24–26 (' + LB + ')', x: 'Der HERR segne dich und behüte dich;\nder HERR lasse sein Angesicht leuchten über dir und sei dir gnädig;\nder HERR hebe sein Angesicht über dich und gebe dir Frieden.' },
  { k: 'segen', t: 'Behütet auf allen Wegen', q: 'Psalm 91,11 (' + LB + ')', x: 'Denn er hat seinen Engeln befohlen über dir,\ndaß sie dich behüten auf allen deinen Wegen.', f: 'Wer hat schon einmal gut auf mich aufgepasst?' },
  { k: 'segen', t: 'Segen für den Tag', q: EIGEN, x: 'Gott segne deine Augen, dass du das Gute siehst.\nGott segne deine Ohren, dass du gut zuhörst.\nGott segne deinen Mund, dass du freundliche Worte findest.\nGott segne deine Hände, dass sie helfen können.\nSo segne uns Gott heute und an allen Tagen.\nAmen.' },
  { k: 'segen', t: 'Segen für die Ferien', q: EIGEN, z: 'ferien', x: 'Gott, die Ferien beginnen.\nSegne alle, die verreisen, und alle, die zu Hause bleiben.\nSchenke uns Erholung, Zeit für Familie und Freunde und viel Freude.\nBehüte uns und lass uns gut erholt wieder zusammenkommen.\nAmen.', f: 'Worauf freue ich mich in den Ferien am meisten?' },
  { k: 'segen', t: 'Segen zum Geburtstag', q: EIGEN, z: 'anlass', x: 'Guter Gott, heute hat jemand aus unserer Klasse Geburtstag.\nDanke, dass es diesen Menschen gibt – und dass er zu uns gehört.\nBegleite ihn im neuen Lebensjahr, schenke ihm gute Freunde, viel Freude und Mut für alles, was kommt.\nAmen.', f: 'Was schätze ich an dem Geburtstagskind?' },

  // ---------- Dank & Bitte ----------
  { k: 'dank', t: 'Alle guten Gaben', q: 'traditionelles Gebet', x: 'Alle guten Gaben,\nalles, was wir haben,\nkommt, o Gott, von dir.\nWir danken dir dafür.\nAmen.' },
  { k: 'dank', t: 'Danket dem Herrn', q: 'Psalm 136,1 (' + LB + ')', x: 'Danket dem HERRN; denn er ist freundlich,\nund seine Güte währet ewiglich.' },
  { k: 'dank', t: 'Vergiss nicht', q: 'Psalm 103,2 (' + LB + ')', x: 'Lobe den HERRN, meine Seele,\nund vergiß nicht, was er dir Gutes getan hat!', f: 'Was Gutes ist mir in letzter Zeit passiert?' },
  { k: 'dank', t: 'Danke für die kleinen Dinge', q: EIGEN, x: 'Danke, Gott, für die kleinen Dinge:\nfür ein warmes Frühstück und ein Dach über dem Kopf,\nfür Freunde, mit denen wir lachen können,\nfür Menschen, die uns etwas beibringen.\nOft merken wir gar nicht, wie viel wir haben.\nAmen.', f: 'Welche kleine Sache hat mich zuletzt froh gemacht?' },
  { k: 'dank', t: 'Gute Besserung', q: EIGEN, z: 'anlass', x: 'Gott, heute fehlen einige aus unserer Klasse, weil sie krank sind.\nWir wünschen ihnen gute Besserung.\nSchenke ihnen Ruhe und Kraft,\nund lass sie bald wieder bei uns sein.\nAmen.', f: 'Wie können wir zeigen, dass wir an sie denken?' },
  { k: 'dank', t: 'Wenn jemand Kummer hat', q: EIGEN, z: 'anlass', x: 'Gott, nicht jeder ist heute gut drauf.\nManche haben Sorgen, über die sie nicht sprechen möchten.\nDu siehst, wie es uns geht.\nSchenke uns Zuversicht und hilf uns, freundlich und füreinander da zu sein.\nAmen.', f: 'Wie merke ich, dass es jemandem nicht gut geht – und was hilft dann?' },
  { k: 'dank', t: 'Alle eure Sorge', q: '1. Petrus 5,7 (' + LB + ')', x: 'Alle eure Sorge werfet auf ihn;\ndenn er sorgt für euch.', f: 'Was möchte ich heute einmal loslassen?' },

  // ---------- Frieden & Miteinander ----------
  { k: 'frieden', t: 'Gebet für den Frieden', q: EIGEN, x: 'Gott, wir wünschen uns Frieden – überall auf der Welt.\nGib den Mächtigen Weisheit und allen Menschen den Mut, aufeinander zuzugehen.\nUnd lass Frieden bei uns beginnen:\nin der Klasse, auf dem Schulhof und zu Hause.\nAmen.', f: 'Was kann ich heute für ein friedliches Miteinander tun?' },
  { k: 'frieden', t: 'Selig sind die Friedfertigen', q: 'Matthäus 5,9 (' + LB + ')', x: 'Selig sind die Friedfertigen;\ndenn sie werden Gottes Kinder heißen.', f: 'Wie kann ich helfen, wenn andere sich streiten?' },
  { k: 'frieden', t: 'Suche Frieden', q: 'Psalm 34,15 (' + LB + ')', x: 'Laß vom Bösen und tue Gutes;\nsuche Frieden und jage ihm nach!', f: 'Mit wem möchte ich mich wieder vertragen?' },
  { k: 'frieden', t: 'Die Goldene Regel', q: 'Matthäus 7,12 (' + LB + ')', x: 'Alles nun, was ihr wollt, daß euch die Leute tun sollen,\ndas tut ihr ihnen auch!', f: 'Wie möchte ich behandelt werden – und behandle ich andere auch so?' },
  { k: 'frieden', t: 'Das Böse mit Gutem überwinden', q: 'Römer 12,21 (' + LB + ')', x: 'Laß dich nicht das Böse überwinden,\nsondern überwinde das Böse mit Gutem.', f: 'Wie reagiere ich, wenn jemand gemein zu mir ist?' },
  { k: 'frieden', t: 'Für unsere Klasse', q: EIGEN, x: 'Gott, wir sind eine Klasse – ganz unterschiedlich, und jeder ist wichtig.\nHilf uns, dass niemand ausgelacht oder allein gelassen wird.\nLass uns einander helfen und auch mal Geduld haben.\nAmen.', f: 'Was macht unsere Klasse stark?' },
  { k: 'frieden', t: 'Nach einem Streit', q: EIGEN, z: 'anlass', x: 'Gott, es hat Streit gegeben.\nWorte wurden gesagt, die wehgetan haben.\nHilf uns, ehrlich zu sein, zuzuhören und uns zu entschuldigen.\nGib uns den Mut, neu anzufangen.\nAmen.', f: 'Was fällt mir schwer am Entschuldigen – und warum lohnt es sich trotzdem?' },
  { k: 'frieden', t: 'Für die Schöpfung', q: EIGEN, x: 'Gott, du hast die Welt wunderbar gemacht:\nMeere und Wälder, Tiere und Pflanzen, Sonne und Regen.\nHilf uns, gut mit ihr umzugehen,\nund zeige uns, was wir selbst dafür tun können.\nAmen.', f: 'Was kann ich diese Woche für die Umwelt tun?' },
  { k: 'frieden', t: 'Jeder ist anders', q: EIGEN, x: 'Gott, keiner von uns ist wie der andere:\nandere Familien, andere Sprachen, andere Stärken.\nDas macht uns reich.\nHilf uns, neugierig aufeinander zu sein statt einander schnell zu beurteilen.\nAmen.', f: 'Was weiß ich über meinen Sitznachbarn noch nicht?' },

  // ---------- Prüfung & Mut ----------
  { k: 'mut', t: 'Vor einer Klassenarbeit', q: EIGEN, z: 'anlass', x: 'Gott, heute schreiben wir eine Arbeit.\nManche sind ruhig, manche sind aufgeregt.\nHilf uns, dass wir einen klaren Kopf behalten und uns an das erinnern, was wir gelernt haben.\nUnd lass uns wissen: Wir sind mehr wert als jede Note.\nAmen.' },
  { k: 'mut', t: 'In der Prüfungszeit', q: EIGEN, z: 'anlass', x: 'Gott, die Prüfungen stehen bevor.\nSchenke uns Ruhe beim Lernen und guten Schlaf in der Nacht.\nNimm uns die Aufregung und gib uns Vertrauen in das, was wir können.\nSei bei allen, die heute geprüft werden.\nAmen.', f: 'Was habe ich schon alles geschafft, obwohl ich vorher unsicher war?' },
  { k: 'mut', t: 'Sei getrost', q: 'Josua 1,9 (' + LB + ')', x: 'Siehe, ich habe dir geboten, daß du getrost und freudig seiest.\nLaß dir nicht grauen und entsetze dich nicht;\ndenn der HERR, dein Gott, ist mit dir in allem, was du tun wirst.' },
  { k: 'mut', t: 'Fürchte dich nicht', q: 'Jesaja 41,10 (' + LB + ')', x: 'Fürchte dich nicht, ich bin mit dir;\nweiche nicht, denn ich bin dein Gott;\nich stärke dich, ich helfe dir auch.', f: 'Was macht mir Mut, wenn ich unsicher bin?' },
  { k: 'mut', t: 'Neue Kraft', q: 'Jesaja 40,31 (' + LB + ')', x: 'Aber die auf den HERRN harren, kriegen neue Kraft,\ndaß sie auffahren mit Flügeln wie Adler,\ndaß sie laufen und nicht matt werden,\ndaß sie wandeln und nicht müde werden.', f: 'Woher hole ich mir Kraft, wenn etwas lange dauert?' },
  { k: 'mut', t: 'Ich vermag alles', q: 'Philipper 4,13 (' + LB + ')', x: 'Ich vermag alles durch den,\nder mich mächtig macht.', f: 'Was traue ich mir eigentlich zu – mehr, als ich denke?' },
  { k: 'mut', t: 'Befiehl du deine Wege', q: 'Paul Gerhardt (1653)', x: 'Befiehl du deine Wege\nund was dein Herze kränkt\nder allertreusten Pflege\ndes, der den Himmel lenkt.\nDer Wolken, Luft und Winden\ngibt Wege, Lauf und Bahn,\nder wird auch Wege finden,\nda dein Fuß gehen kann.' },
  { k: 'mut', t: 'Mut ist …', q: EIGEN, x: 'Mutig sein heißt nicht, keine Angst zu haben.\nMutig sein heißt: Ich habe ein bisschen Angst – und mache es trotzdem.\nGott, schenke uns heute diesen Mut.\nAmen.', f: 'Wann war ich zuletzt mutig?' },

  // ---------- Kirchenjahr ----------
  { k: 'jahr', t: 'Neues Schuljahr', q: EIGEN, z: 'schulanfang', x: 'Gott, ein neues Schuljahr beginnt.\nNeue Fächer, vielleicht neue Lehrkräfte und neue Mitschüler.\nSchenke uns Neugier und Ausdauer, und hilf uns, eine gute Gemeinschaft zu werden.\nBegleite uns durch dieses Jahr.\nAmen.', f: 'Was möchte ich in diesem Schuljahr lernen oder schaffen?' },
  { k: 'jahr', t: 'Erntedank', q: 'Matthias Claudius (1783)', z: 'erntedank', x: 'Wir pflügen und wir streuen\nden Samen auf das Land,\ndoch Wachstum und Gedeihen\nsteht in des Himmels Hand.\nAlle gute Gabe kommt her von Gott, dem Herrn,\ndrum dankt ihm, dankt, drum dankt ihm, dankt\nund hofft auf ihn!', f: 'Wer hat dafür gesorgt, dass ich heute etwas zu essen hatte?' },
  { k: 'jahr', t: 'Reformation: Fragen stellen', q: EIGEN, z: 'reformation', x: 'Martin Luther hat sich getraut, Fragen zu stellen – auch wenn das unbequem war.\nGott, schenke uns Mut, ehrlich zu sagen, was wir denken,\nund Offenheit, anderen zuzuhören.\nAmen.', f: 'Welche Frage würde ich gern einmal stellen?' },
  { k: 'jahr', t: 'Sankt Martin', q: EIGEN, z: 'martin', x: 'Martin hat seinen Mantel mit einem frierenden Bettler geteilt.\nEr hat nicht weggeschaut.\nGott, hilf auch uns, hinzusehen, wenn jemand Hilfe braucht,\nund zu teilen, was wir haben.\nAmen.', f: 'Was könnte ich teilen – außer Dingen?' },
  { k: 'jahr', t: 'Advent: Ein großes Licht', q: 'Jesaja 9,1 (' + LB + ')', z: 'advent', x: 'Das Volk, so im Finstern wandelt, sieht ein großes Licht,\nund über die da wohnen im finstern Lande, scheint es hell.', f: 'Was bringt Licht in meine Tage?' },
  { k: 'jahr', t: 'Advent: Kerzen anzünden', q: EIGEN, z: 'advent', x: 'Gott, draußen ist es dunkel und kalt.\nWir zünden eine Kerze an und warten auf Weihnachten.\nLass es auch in uns hell werden:\nwenn wir freundlich sind, teilen und einander verzeihen.\nAmen.', f: 'Wem könnte ich in dieser Woche eine Freude machen?' },
  { k: 'jahr', t: 'Nikolaus', q: EIGEN, z: 'nikolaus', x: 'Nikolaus hat armen Menschen heimlich geholfen.\nEr wollte keinen Dank, sondern dass es anderen gut geht.\nGott, schenke uns ein offenes Herz wie ihm –\nund die Freude am Schenken.\nAmen.', f: 'Wie fühlt es sich an, jemandem heimlich etwas Gutes zu tun?' },
  { k: 'jahr', t: 'Weihnachten', q: 'Lukas 2,10–11 (' + LB + ')', z: 'weihnacht', x: 'Fürchtet euch nicht! siehe, ich verkündige euch große Freude, die allem Volk widerfahren wird;\ndenn euch ist heute der Heiland geboren, welcher ist Christus, der Herr, in der Stadt Davids.', f: 'Was ist für mich das Wichtigste an Weihnachten?' },
  { k: 'jahr', t: 'Jahreswechsel: Von guten Mächten', q: 'Dietrich Bonhoeffer (1944)', z: 'neujahr', x: 'Von guten Mächten wunderbar geborgen,\nerwarten wir getrost, was kommen mag.\nGott ist bei uns am Abend und am Morgen\nund ganz gewiss an jedem neuen Tag.', f: 'Was wünsche ich mir für das neue Jahr?' },
  { k: 'jahr', t: 'Fastenzeit', q: EIGEN, z: 'passion', x: 'Gott, in der Fastenzeit verzichten viele Menschen auf etwas – auf Süßes, aufs Handy oder auf eine schlechte Gewohnheit.\nHilf uns, auf das zu achten, was wirklich wichtig ist.\nAmen.', f: 'Worauf könnte ich eine Woche lang verzichten – und was würde ich dabei gewinnen?' },
  { k: 'jahr', t: 'Ostern', q: 'Matthäus 28,6 (' + LB + ')', z: 'ostern', x: 'Er ist nicht hier;\ner ist auferstanden, wie er gesagt hat.' },
  { k: 'jahr', t: 'Ostern: Hoffnung', q: EIGEN, z: 'ostern', x: 'Gott, an Ostern feiern wir: Jesus lebt.\nOstern sagt uns: Es gibt immer Hoffnung.\nAuch wenn etwas aussichtslos scheint, kann Neues beginnen.\nDanke für diese Hoffnung.\nAmen.', f: 'Wo habe ich schon erlebt, dass etwas doch noch gut wurde?' },
  { k: 'jahr', t: 'Pfingsten', q: EIGEN, z: 'pfingsten', x: 'Komm, Heiliger Geist.\nWie ein Wind, der frische Luft bringt,\nwie ein Feuer, das wärmt und leuchtet.\nGib uns Mut zu reden, Kraft zu helfen\nund ein Herz, das andere versteht.\nAmen.', f: 'Wofür brenne ich – was begeistert mich?' },

  // ---------- Impulse ----------
  { k: 'impuls', t: 'Ein gutes Wort', q: EIGEN, x: 'Ein freundliches Wort kostet nichts –\nund kann für jemanden den ganzen Tag verändern.', f: 'Wem könnte ich heute etwas Nettes sagen?' },
  { k: 'impuls', t: 'Einen Moment Stille', q: EIGEN, x: 'Wir werden einen Moment ganz still.\nAtme dreimal tief ein und aus.\nSpüre deine Füße auf dem Boden.', f: 'Was brauche ich heute, damit es ein guter Tag wird?' },
  { k: 'impuls', t: 'Wunderbar gemacht', q: 'Psalm 139,14 (' + LB + ')', x: 'Ich danke dir darüber, daß ich wunderbar gemacht bin;\nwunderbar sind deine Werke.', f: 'Was kann ich gut? Was mag ich an mir?' },
  { k: 'impuls', t: 'Licht sein', q: 'Matthäus 5,14 (' + LB + ')', x: 'Ihr seid das Licht der Welt.', f: 'Wie kann ich heute für jemanden ein kleines Licht sein?' },
  { k: 'impuls', t: 'Fehler machen', q: EIGEN, x: 'Fehler gehören zum Lernen dazu.\nWer nie etwas falsch macht, probiert auch nichts Neues aus.', f: 'Was traue ich mich heute?' },
  { k: 'impuls', t: 'Zuhören', q: 'Sprichwort', x: 'Wir haben zwei Ohren und nur einen Mund –\nvielleicht, damit wir mehr zuhören als reden.', f: 'Wem höre ich heute richtig zu?' },
  { k: 'impuls', t: 'Der erste Schritt', q: 'nach Laozi', x: 'Auch die längste Reise beginnt mit dem ersten Schritt.', f: 'Welcher kleine Schritt bringt mich heute weiter?' },
  { k: 'impuls', t: 'Dankbar sein', q: EIGEN, x: 'Denke an drei Dinge, für die du heute dankbar bist.\nEs dürfen ganz kleine Dinge sein.', f: 'Wer mag, erzählt eins davon.' },
  { k: 'impuls', t: 'Hinter den Wolken', q: EIGEN, x: 'Auch an grauen Tagen ist die Sonne da – nur hinter den Wolken.\nSchwierige Zeiten gehen vorbei.', f: 'Was hilft mir, wenn ein Tag nicht gut läuft?' },
  { k: 'impuls', t: 'Nicht vergleichen', q: EIGEN, x: 'Jeder hat sein eigenes Tempo.\nDer eine ist schnell im Rechnen, die andere gut im Zuhören, wieder ein anderer im Sport.\nWichtig ist nicht, besser zu sein als andere – sondern besser als gestern.', f: 'Worin bin ich in letzter Zeit besser geworden?' },
  { k: 'impuls', t: 'Hilfe annehmen', q: EIGEN, x: 'Um Hilfe zu bitten ist keine Schwäche.\nEs zeigt, dass man weiterkommen will.', f: 'Wen kann ich fragen, wenn ich nicht weiterweiß?' },
  { k: 'impuls', t: 'Freundschaft', q: EIGEN, x: 'Ein guter Freund ist jemand, der dich kennt – und dich trotzdem mag.', f: 'Was macht für mich einen guten Freund oder eine gute Freundin aus?' },
  { k: 'impuls', t: 'Bildschirm aus', q: EIGEN, x: 'Das Handy zeigt uns die ganze Welt.\nAber manchmal verpassen wir dabei, was direkt vor uns passiert.', f: 'Was habe ich zuletzt erlebt, ohne es zu fotografieren oder zu posten?' },
  { k: 'impuls', t: 'Ein Lächeln', q: EIGEN, x: 'Ein Lächeln ist ansteckend.\nProbiere es heute aus – beim Busfahrer, beim Hausmeister oder bei jemandem, mit dem du sonst wenig redest.', f: 'Wie reagieren andere, wenn ich sie anlächle?' }
];
T.GEBETE = G;

// ---------- Zeiten im Jahr (für „Gebet des Tages“) ----------
const tag = (j, m, t) => new Date(j, m - 1, t);
const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
function ostersonntag(j) { // Gaußsche Osterformel (Anonymer Gregorianischer Algorithmus)
  const a = j % 19, b = Math.floor(j / 100), c = j % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const hh = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7, m = Math.floor((a + 11 * hh + 22 * l) / 451);
  const monat = Math.floor((hh + l - 7 * m + 114) / 31), t = (hh + l - 7 * m + 114) % 31 + 1;
  return tag(j, monat, t);
}
const zwischen = (d, a, b) => d >= a && d <= b;
function zeitPasst(z, d) {
  const j = d.getFullYear(), os = ostersonntag(j), wt = d.getDay();
  const advent1 = plus(tag(j, 12, 24), -tag(j, 12, 24).getDay() - 21); // 4. Advent = letzter Sonntag vor dem 25.12.
  switch (z) {
    case 'montag': return wt === 1;
    case 'freitag': return wt === 5;
    case 'schulanfang': return zwischen(d, tag(j, 8, 1), tag(j, 9, 5));
    case 'ferien': return zwischen(d, tag(j, 6, 25), tag(j, 7, 20)) || zwischen(d, tag(j, 10, 8), tag(j, 10, 17)) || zwischen(d, tag(j, 12, 18), tag(j, 12, 23));
    case 'erntedank': return zwischen(d, tag(j, 9, 24), tag(j, 10, 10));
    case 'reformation': return zwischen(d, tag(j, 10, 27), tag(j, 11, 2));
    case 'martin': return zwischen(d, tag(j, 11, 10), tag(j, 11, 11));
    case 'advent': return zwischen(d, advent1, tag(j, 12, 23));
    case 'nikolaus': return d.getMonth() === 11 && d.getDate() === 6;
    case 'weihnacht': return zwischen(d, tag(j, 12, 19), tag(j, 12, 31)) || zwischen(d, tag(j, 1, 1), tag(j, 1, 6));
    case 'neujahr': return zwischen(d, tag(j, 1, 1), tag(j, 1, 20));
    case 'passion': return zwischen(d, plus(os, -46), plus(os, -3));
    case 'ostern': return zwischen(d, plus(os, -2), plus(os, 21));
    case 'pfingsten': return zwischen(d, plus(os, 42), plus(os, 52));
  }
  return false;
}
const FESTTAGE = ['martin', 'nikolaus']; // an diesen kurzen Zeiten immer das passende Gebet
// Gebet des Tages: am selben Tag immer dasselbe. In passenden Zeiten jeden dritten Tag ein Gebet zur Zeit, sonst reihum.
function gebetDesTages(d = new Date()) {
  const n = Math.floor(tag(d.getFullYear(), d.getMonth() + 1, d.getDate()).getTime() / 864e5 + 0.5);
  const heute = tag(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const zeit = G.filter(g => g.z && !['montag', 'freitag'].includes(g.z) && zeitPasst(g.z, heute));
  const fest = zeit.filter(g => FESTTAGE.includes(g.z));
  if (fest.length) return fest[n % fest.length];
  if (zeit.length && n % 3 === 0) return zeit[(n / 3) % zeit.length];
  const wochentag = G.find(g => (g.z === 'montag' || g.z === 'freitag') && zeitPasst(g.z, heute));
  if (wochentag) return wochentag;
  const reihum = G.filter(g => !g.z);
  return reihum[n % reihum.length];
}
T.gebetDesTages = gebetDesTages;

// ---------- Seitenleiste (Einfügen > 🙏 Gebet / Impuls) ----------
let kat = lies('gebetKat', 'alle'), aktuell = null;
const liste = () => kat === 'alle' ? G : G.filter(g => g.k === kat);
const katName = k => (KATS.find(x => x[0] === k) || ['', ''])[1];
const frageZeile = g => g.f ? '💭 ' + g.f : '';
// Text + Frage zum Nachdenken (abgesetzt, kursiv) in ein Element schreiben
const fuelle = (el, g) => { el.textContent = g.x; if (g.f) el.append(h('span', { class: 'geb-frage' }, '\n\n' + frageZeile(g))); };
function zufall(aus) { const l = aus || liste(); let g; do g = l[Math.floor(Math.random() * l.length)]; while (l.length > 1 && g === aktuell); return g; }
let panelZeige = null; // aktualisiert die Vorschau in der Seitenleiste, ohne sie neu aufzubauen (Liste behält ihre Position)
T.gebetPanel = () => {
  if (!aktuell) aktuell = gebetDesTages();
  const kats = h('div', { class: 'kats' }, ...[['alle', 'Alle']].concat(KATS).map(([id, l]) =>
    h('button', { class: 'kat' + (kat === id ? ' on' : ''), onclick: () => { kat = id; merke('gebetKat', id); T.zeigeDock('einfuegen'); } }, l)));
  const kt = h('div', { class: 'geb-kt' }), kx = h('div', { class: 'geb-kx' }), kq = h('div', { class: 'geb-kq' }), karte = h('div', { class: 'geb-karte' }, kt, kx, kq);
  const eintraege = liste().map(g => { const b = h('button', { class: 'geb-eintrag', onclick: () => waehle(g) }, h('b', {}, g.t), h('span', {}, g.q)); b._g = g; return b; });
  const waehle = g => {
    aktuell = g; kt.textContent = katName(g.k) + ' · ' + g.t; fuelle(kx, g); kq.textContent = g.q;
    for (const b of eintraege) b.classList.toggle('on', b._g === g);
  };
  panelZeige = g => { if (karte.isConnected) waehle(g); };
  waehle(aktuell);
  return [
    h('div', { class: 'row', style: { marginBottom: '10px' } },
      h('button', { class: 'big', onclick: () => waehle(gebetDesTages()) }, '📅 Gebet des Tages'),
      h('button', { class: 'big', onclick: () => waehle(zufall()) }, '🎲 Zufall')),
    karte,
    h('div', { class: 'row', style: { margin: '10px 0 16px' } },
      h('button', { class: 'big prim', onclick: () => vollbild(aktuell) }, '⛶ Groß zeigen'),
      h('button', { class: 'big', onclick: () => aufTafel(aktuell) }, '⤴ Auf die Tafel')),
    h('h3', {}, 'Auswahl'), kats, h('div', { class: 'geb-liste' }, ...eintraege),
    h('p', { class: 'hint' }, 'Zuversichtliche Texte für Jg. 5–10, viele mit einer Frage zum Nachdenken (💭). Nur gemeinfreie Texte (Lutherbibel 1912, traditionelle Gebete, alte Lieder) und selbst formulierte. „Gebet des Tages“ wechselt täglich und passt sich dem Kirchenjahr an.')];
};

// ---------- Vollbild ----------
let voll = null, vollListe = [], vollIdx = 0;
function vollbild(g) {
  vollListe = liste().includes(g) ? liste() : G; vollIdx = Math.max(0, vollListe.indexOf(g));
  if (voll) return zeige();
  const kopf = h('div', { class: 'geb-vkopf' }), text = h('div', { class: 'geb-vtext' }), quelle = h('div', { class: 'geb-vquelle' });
  const k = (sym, title, fn) => h('button', { title, onclick: e => { e.stopPropagation(); fn(); } }, sym);
  const groesse = f => { merke('gebetGroesse', T.clamp(lies('gebetGroesse', 1) * f, 0.5, 1 / 0.85)); passe(); };
  voll = h('div', { id: 'gebet' }, kopf, h('div', { class: 'geb-vmitte' }, text), quelle,
    h('div', { class: 'geb-vleiste' },
      k('◀', 'Vorheriges', () => blaettern(-1)), k('▶', 'Nächstes', () => blaettern(1)), k('🎲', 'Zufall', () => { vollIdx = vollListe.indexOf(zufall(vollListe)); zeige(); }),
      k('A−', 'Schrift kleiner', () => groesse(1 / 1.12)), k('A+', 'Schrift größer', () => groesse(1.12)),
      k('⤴', 'Auf die Tafel schreiben', () => { const g = vollListe[vollIdx]; schliessen(); aufTafel(g); }), k('×', 'Schließen (Esc)', schliessen)));
  voll.addEventListener('pointerdown', e => e.stopPropagation());
  voll.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  voll._teile = { kopf, text, quelle };
  document.body.append(voll); zeige();
}
T.gebetVollbild = vollbild;
function blaettern(d) { vollIdx = (vollIdx + d + vollListe.length) % vollListe.length; zeige(); }
function zeige() {
  const g = vollListe[vollIdx], t = voll._teile; aktuell = g;
  t.kopf.textContent = katName(g.k) + ' · ' + g.t; fuelle(t.text, g); t.quelle.textContent = g.q;
  passe(); if (panelZeige) panelZeige(g);
}
function passe() { // größte Schrift, bei der der Text ganz hineinpasst; normal 85 % davon, A+/A− ändern das (höchstens bis „passt genau“)
  if (!voll) return;
  const t = voll._teile.text, box = t.parentNode;
  let lo = 16, hi = Math.min(innerWidth / 12, innerHeight / 7, 150);
  for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; t.style.fontSize = m + 'px'; if (t.scrollHeight <= box.clientHeight && t.scrollWidth <= box.clientWidth) lo = m; else hi = m; }
  t.style.fontSize = Math.min(lo, lo * 0.85 * lies('gebetGroesse', 1)) + 'px';
}
function schliessen() { if (voll) voll.remove(); voll = null; }
addEventListener('resize', passe);
addEventListener('keydown', e => {
  if (!voll) return;
  if (e.key === 'Escape') schliessen(); else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') blaettern(1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') blaettern(-1); else return;
  e.preventDefault(); e.stopImmediatePropagation();
}, true);

// ---------- Auf die Tafel ----------
function umbrechen(text, n) { // lange Zeilen an Wortgrenzen umbrechen, vorhandene Zeilenumbrüche bleiben
  return text.split('\n').map(z => {
    const out = []; let zeile = '';
    for (const w of z.split(' ')) { if (zeile && (zeile + ' ' + w).length > n) { out.push(zeile); zeile = w; } else zeile = zeile ? zeile + ' ' + w : w; }
    out.push(zeile); return out.join('\n');
  }).join('\n');
}
function aufTafel(g) {
  const z = T.page().view.z, r = T.viewRect(), [cx, cy] = T.viewCenter(), farbe = T.S.farbe.stift;
  const titel = { text: g.t, size: 56, c: farbe, fett: true }, haupt = { text: umbrechen(g.x + (g.f ? '\n\n' + frageZeile(g) : ''), 50), size: 44, c: farbe, fett: false }, q = { text: g.q, size: 24, c: '#6b7280', fett: false };
  const mt = T.textMetrics(titel), mh = T.textMetrics(haupt), mq = T.textMetrics(q), abst = 18;
  const gesW = Math.max(mt.w, mh.w, mq.w), gesH = mt.h + mh.h + mq.h + 2 * abst;
  const f = Math.min(1 / z, (r.x1 - r.x0) * 0.8 / gesW, (r.y1 - r.y0) * 0.66 / gesH); // auf dem Bildschirm etwa so groß wie geplant, aber immer ganz sichtbar
  let y = cy - gesH * f / 2; const x = cx - gesW * f / 2;
  const it = (d, m) => { const o = { t: 'o', id: T.uid(), k: 'text', d, x, y, w: m.w * f, h: m.h * f, r: 0 }; y += m.h * f + abst * f; return o; };
  const neu = [it(titel, mt), it(haupt, mh), it(q, mq)];
  T.snap(); T.page().items.push(...neu); T.render(); T.nachEinfuegen(neu.map(o => o.id));
  T.toast('Auf der Tafel – zum Verschieben ziehen, „✏️ Bearbeiten“ ändert den Text.', 2600);
}
})();
