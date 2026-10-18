/* RxRapid learning path — written for EMT-B students starting from zero.
   Each level has short lessons (read → quiz). Pass every lesson, then pass the
   level test to unlock the next level.

   CATS: plain-English "what kind of med is it" categories.
     cl = cluster — categories in the same cluster are never used as wrong answers for each other.
   Lesson drugs: { g: generic name exactly as in data.js, say, what, remember?, tip?, cats? (defaults to lesson cat), nd? (extra clusters to never use as wrong answers) }
   Lesson qs: hand-written questions { q, a, d: [wrong answers], e: explanation }
*/
window.PATH = {
  CATS: {
    bt: { n: "Blood thinner", cl: "blood" },
    bp: { n: "Blood pressure med", cl: "heart" },
    chol: { n: "Cholesterol med", cl: "chol" },
    ed: { n: "Erectile dysfunction (ED) med", cl: "ed" },
    cp: { n: "Chest pain (angina) med", cl: "heart" },
    ad: { n: "Antidepressant", cl: "mood" },
    anx: { n: "Anxiety med (benzodiazepine)", cl: "mood" },
    ap: { n: "Antipsychotic", cl: "mood" },
    bip: { n: "Bipolar (mood stabilizer) med", cl: "mood" },
    sleep: { n: "Sleep med", cl: "mood" },
    dm: { n: "Diabetes med", cl: "dm" },
    br: { n: "Breathing med (asthma/COPD)", cl: "lung" },
    al: { n: "Allergy med", cl: "allergy" },
    ana: { n: "Severe allergy (anaphylaxis) rescue", cl: "allergy" },
    st: { n: "Steroid (anti-inflammatory)", cl: "steroid" },
    wp: { n: "Water pill (diuretic)", cl: "heart" },
    hf: { n: "Heart failure med", cl: "heart" },
    rh: { n: "Heart rhythm (A-fib) med", cl: "heart" },
    acid: { n: "Stomach acid / heartburn med", cl: "acid" },
    naus: { n: "Nausea med", cl: "naus" },
    th: { n: "Thyroid med", cl: "thyroid" },
    bone: { n: "Osteoporosis (bone) med", cl: "bone" },
    sz: { n: "Seizure med", cl: "seizure" },
    np: { n: "Nerve pain med", cl: "npain" },
    pd: { n: "Parkinson's med", cl: "pd" },
    dem: { n: "Dementia (Alzheimer's) med", cl: "dem" },
    adhd: { n: "ADHD med (stimulant)", cl: "adhd" },
    op: { n: "Opioid pain med", cl: "opioid" },
    mat: { n: "Addiction treatment / overdose reversal", cl: "opioid" },
    nsaid: { n: "Non-opioid pain reliever", cl: "pain" },
    mr: { n: "Muscle relaxant", cl: "mr" },
    uro: { n: "Prostate / bladder med", cl: "uro" },
    kid: { n: "Kidney failure (dialysis) med", cl: "kid" },
    lyte: { n: "Potassium supplement", cl: "lyte" },
    gout: { n: "Gout med", cl: "gout" },
    horm: { n: "Hormone / birth control", cl: "horm" },
    abx: { n: "Antibiotic", cl: "abx" },
    av: { n: "Antiviral", cl: "viral" },
    imm: { n: "Immune-suppressing med", cl: "imm" },
  },

  LEVELS: [
    // =====================================================================
    {
      n: 1, title: "The Must-Knows", emoji: "⭐",
      desc: "The meds on almost every older patient's list — and the ones that change what you do on a call.",
      lessons: [
        {
          id: "1-1", title: "Blood thinners", emoji: "🩸", cat: "bt",
          concepts: [
            { h: "What's a blood thinner?", p: [
              "Your blood clots to stop bleeding. But clots can also form where they shouldn't — in the heart, legs, or lungs — and cause strokes, heart attacks, and pulmonary embolisms (PE).",
              "Blood thinners make it harder for blood to clot. They don't actually make blood \"thinner\" — they just slow clotting down.",
            ] },
            { h: "Two kinds (just get the gist)", list: [
              "<b>Anticoagulants</b> — the strong ones: warfarin (Coumadin), Eliquis, Xarelto. Usually for <b>A-fib</b> (an irregular heartbeat) or <b>past blood clots</b> (DVT/PE).",
              "<b>Antiplatelets</b> — make platelets less sticky: aspirin and Plavix. Usually after a <b>heart attack, cardiac stent, or stroke</b>.",
            ] },
          ],
          why: "A patient on a blood thinner who falls or hits their head can be bleeding inside the skull even if they look and feel fine. Bleeding from wounds is also harder to stop. Ask every patient: \"Do you take any blood thinners?\"",
          sfx: [{ x: "-xaban", cat: "bt" }],
          drugs: [
            { g: "warfarin", say: "WAR-fuh-rin", what: "The old-school anticoagulant. Needs regular blood tests (called INR) to keep the dose right.", tip: "Lots of foods and other meds change how strong it is. Ask when they last had their INR checked." },
            { g: "apixaban", say: "uh-PIX-uh-ban", what: "Newer anticoagulant and one of the most prescribed drugs in the US. Usually for A-fib or past clots.", remember: "\"-xaban\" = blood thinner." },
            { g: "rivaroxaban", say: "riv-uh-ROX-uh-ban", what: "Eliquis's cousin — same job, same \"-xaban\" ending. You've seen the TV ads.", tip: "Head strike on Xarelto or Eliquis → push for transport/evaluation even if they feel fine." },
            { g: "clopidogrel", say: "kloh-PID-oh-grel", what: "Antiplatelet. Keeps cardiac stents (tiny tubes propping open heart arteries) from clotting.", tip: "Aspirin + Plavix together usually means a recent heart attack or stent — big cardiac history." },
            { g: "aspirin", say: "AS-prin", nd: ["pain"], what: "Daily low-dose (81 mg) aspirin keeps platelets from sticking — taken after heart attacks and strokes.", tip: "Aspirin is also something EMTs may give for suspected heart-attack chest pain (per protocol). Ask about allergies and whether they already took some today." },
          ],
          takeaways: [
            "Blood thinner = higher bleeding risk, especially with head injuries.",
            "Eliquis, Xarelto (-xaban) and warfarin usually mean A-fib or past blood clots.",
            "Aspirin + Plavix usually means a heart attack or stent.",
            "Always ask: \"Do you take any blood thinners?\"",
          ],
          qs: [
            { q: "An 80-year-old on Eliquis tripped and bumped their head. They feel fine and want to stay home. What's the concern?", a: "They could have a slow bleed in the brain", d: ["Eliquis makes them dizzy, that's all", "Eliquis prevents all bleeding", "No concern if they feel fine"], e: "Blood thinners make brain bleeds more likely, and symptoms can show up hours later. Encourage transport/evaluation and follow your protocol." },
            { q: "A patient takes aspirin AND Plavix every day. What history does this most likely point to?", a: "A heart attack or cardiac stent", d: ["Asthma", "Seizures", "Depression"], e: "Two antiplatelets together (\"dual antiplatelet therapy\") is the classic after-stent combo." },
            { q: "Which question should you ask every trauma patient — especially older ones?", a: "\"Do you take any blood thinners?\"", d: ["\"Do you take any vitamins?\"", "\"Do you have any tattoos?\"", "\"What's your favorite food?\""], e: "Blood thinners change how worried you should be about internal bleeding and head injuries." },
          ],
        },
        {
          id: "1-2", title: "Blood pressure meds", emoji: "💓", cat: "bp",
          concepts: [
            { h: "Blood pressure in 20 seconds", p: [
              "Blood pressure is how hard blood pushes against the walls of your arteries. <b>High blood pressure (hypertension)</b> silently damages the heart, kidneys, and brain over years — a big cause of heart attacks and strokes.",
              "It's the most common chronic condition you'll see. Lots of patients take 2–3 different blood pressure meds.",
            ] },
            { h: "Name endings are your cheat code", list: [
              "<b>-pril</b> → lisinopril",
              "<b>-sartan</b> → losartan",
              "<b>-olol</b> → metoprolol (also slows the heart rate)",
              "<b>-dipine</b> → amlodipine",
              "<b>-thiazide</b> → hydrochlorothiazide (a water pill)",
            ], after: "You don't need to know how each one works yet. See one of these endings → think <b>blood pressure</b>." },
          ],
          why: "BP meds can make patients dizzy or faint when they stand up — especially older patients. Beta blockers (-olol) can hide a fast heart rate, so a patient bleeding internally might NOT be tachycardic.",
          sfx: [{ x: "-pril", cat: "bp" }, { x: "-sartan", cat: "bp" }, { x: "-olol", cat: "bp" }, { x: "-dipine", cat: "bp" }],
          drugs: [
            { g: "lisinopril", say: "ly-SIN-oh-pril", what: "ACE inhibitor — one of the most prescribed blood pressure meds. Relaxes blood vessels.", remember: "\"-pril\"", tip: "Can cause a dry cough and, rarely, sudden swelling of the lips/tongue (angioedema) — an airway emergency." },
            { g: "losartan", say: "loh-SAR-tan", what: "ARB — works a lot like lisinopril, without the cough.", remember: "\"-sartan\"" },
            { g: "metoprolol", say: "meh-TOE-proh-lol", what: "Beta blocker — slows the heart and lowers BP. Also used for A-fib, angina, and heart failure.", remember: "\"-olol\"", tip: "Can keep the heart rate low even in shock. Don't be falsely reassured by a \"normal\" pulse." },
            { g: "amlodipine", say: "am-LOH-dih-peen", what: "Calcium channel blocker — relaxes arteries. A common cause of ankle swelling.", remember: "\"-dipine\"" },
            { g: "hydrochlorothiazide (HCTZ)", say: "hy-droh-klor-oh-THY-uh-zide", what: "Water pill (diuretic) — makes you pee out extra salt and water to lower BP. Usually just called \"HCTZ.\"", tip: "Can cause dehydration and low potassium/sodium — think of it in a weak, confused older patient.", nd: ["heart"] },
          ],
          takeaways: [
            "Hypertension = high blood pressure. Super common.",
            "-pril, -sartan, -olol, -dipine, -thiazide → blood pressure meds.",
            "-olol (beta blockers) can hide tachycardia in shock.",
            "Lisinopril can cause lip/tongue swelling — airway!",
          ],
          qs: [
            { q: "A med list has metoprolol, lisinopril, and amlodipine. What condition do these all treat?", a: "Hypertension (high blood pressure)", d: ["Diabetes", "Asthma", "Seizures"], e: "-olol, -pril, -dipine — all blood pressure meds. Many patients need several to control their BP." },
            { q: "A trauma patient who takes metoprolol is pale, cool, and clammy with a heart rate of 76. Why might they NOT be tachycardic?", a: "Metoprolol (a beta blocker) keeps the heart from speeding up", d: ["They definitely aren't in shock", "Metoprolol raises blood pressure", "A heart rate of 76 rules out bleeding"], e: "Beta blockers blunt the body's normal \"speed up\" response. Trust the other signs of shock." },
            { q: "A patient on lisinopril suddenly has a swollen tongue and lips. What's your biggest priority?", a: "The airway", d: ["Checking their blood sugar", "Giving their next dose", "Taking a temperature"], e: "ACE inhibitor angioedema can close off the airway. Manage the airway and transport fast." },
          ],
        },
        {
          id: "1-3", title: "Cholesterol meds", emoji: "🧈", cat: "chol",
          concepts: [
            { h: "Cholesterol & statins", p: [
              "Cholesterol is a fat that can build up inside arteries as <b>plaque</b>. Plaque narrows arteries and can trigger heart attacks and strokes.",
              "<b>Statins</b> lower cholesterol. They're on a huge number of med lists — and almost all of them end in <b>-statin</b>.",
            ] },
          ],
          why: "Statins rarely cause emergencies, but a statin tells you this patient has cardiovascular risk: high cholesterol, often with diabetes, high BP, or a past heart attack or stroke. Rarely, statins cause severe muscle breakdown (rhabdomyolysis).",
          sfx: [{ x: "-statin", cat: "chol" }],
          drugs: [
            { g: "atorvastatin", say: "uh-TOR-vuh-stat-in", what: "The most prescribed statin in the US.", remember: "\"-statin\"" },
            { g: "simvastatin", say: "SIM-vuh-stat-in", what: "Older statin, still very common." },
            { g: "rosuvastatin", say: "roh-SOO-vuh-stat-in", what: "A strong statin." },
            { g: "pravastatin", say: "PRAV-uh-stat-in", what: "A milder statin with fewer drug interactions." },
          ],
          takeaways: [
            "-statin = cholesterol med.",
            "A statin means cardiovascular risk — think heart attack and stroke risk.",
            "Statin + severe muscle pain + dark urine → think rhabdomyolysis (rare).",
          ],
          qs: [
            { q: "A patient takes atorvastatin, metformin, and lisinopril. What does this combo tell you?", a: "Diabetes, high cholesterol, and high BP — high risk for heart attack and stroke", d: ["They definitely had a heart attack", "They have a seizure disorder", "They have asthma"], e: "This is the classic \"metabolic\" combo. It's not a heart diagnosis by itself, but these patients get heart attacks and strokes — and diabetics can have heart attacks with only vague symptoms. (Metformin is a diabetes med — you'll learn it in Level 2.)" },
            { q: "Which complaint in a statin user could point to a rare but serious side effect?", a: "Severe muscle pain and dark, tea-colored urine", d: ["A runny nose", "Itchy eyes", "Hiccups"], e: "Statins can rarely cause rhabdomyolysis — muscle breakdown that can damage the kidneys." },
          ],
        },
        {
          id: "1-4", title: "ED meds & nitroglycerin", emoji: "⚠️", cat: "ed",
          concepts: [
            { h: "Nitroglycerin", p: [
              "Nitroglycerin (\"nitro\") opens up blood vessels, which eases the heart's workload and relieves <b>angina</b> — chest pain from the heart not getting enough blood. Patients carry it as tiny tablets under the tongue or as a spray.",
              "EMTs can often <b>assist patients with their own prescribed nitro</b> for chest pain — per local protocol/medical direction. Main side effects: headache and a drop in blood pressure.",
            ] },
            { h: "Why ED meds matter to EMTs", p: [
              "Erectile dysfunction (ED) meds like Viagra and Cialis also open blood vessels. <b>Combine them with nitro and blood pressure can crash dangerously.</b>",
            ], list: [
              "Viagra (sildenafil): <b>no nitro within 24 hours</b>",
              "Cialis (tadalafil): <b>no nitro within 48 hours</b>",
              "Names ending in <b>-afil</b> = ED med",
            ] },
          ],
          why: "Before any nitro, ask every patient — men AND women (some take sildenafil for lung blood pressure): \"Have you taken Viagra, Cialis, Levitra, or anything like that in the last 2 days?\" Ask privately and matter-of-factly.",
          sfx: [{ x: "-afil", cat: "ed" }],
          drugs: [
            { g: "sildenafil", say: "sil-DEN-uh-fil", nd: ["heart"], what: "ED med (Viagra). As Revatio, it treats high blood pressure in the lungs (pulmonary hypertension).", remember: "\"-afil\"", tip: "No nitro within 24 hours." },
            { g: "tadalafil", say: "tuh-DAL-uh-fil", what: "Long-lasting ED med — also taken daily for an enlarged prostate.", tip: "No nitro within 48 hours — it lasts longer.", nd: ["uro"] },
            { g: "nitroglycerin", say: "ny-troh-GLIS-er-in", what: "Relieves angina (heart-related chest pain) by opening blood vessels.", cats: ["cp"], tip: "A patient carrying nitro has heart disease (angina/coronary artery disease). Check BP before and after — it can drop." },
          ],
          takeaways: [
            "Nitro = chest pain/angina med → the patient has heart disease.",
            "Viagra/Cialis/Levitra (-afil) + nitro = dangerous BP crash.",
            "Viagra: 24 hours. Cialis: 48 hours.",
            "Always ask about ED meds before nitro.",
          ],
          qs: [
            { q: "A 60-year-old with chest pain took Cialis last night. Should you help him take his nitroglycerin?", a: "No — Cialis + nitro can crash his blood pressure", d: ["Yes, it's always safe", "Yes, but give two tablets", "Only if he also takes aspirin"], e: "Tadalafil lasts about 48 hours. Nitro on top of it can cause severe hypotension. Follow protocol / contact medical direction." },
            { q: "Which drug name ending tells you a med is an ED drug like Viagra?", a: "-afil", d: ["-olol", "-statin", "-pril"], e: "Sildenafil, tadalafil, vardenafil — all end in -afil." },
            { q: "A patient has nitroglycerin tablets in their pocket. What does that suggest about their history?", a: "Heart disease with angina (chest pain)", d: ["Asthma", "Migraines", "Diabetes"], e: "People carry nitro for angina from coronary artery disease." },
          ],
        },
        {
          id: "1-5", title: "Antidepressants", emoji: "🧠", cat: "ad",
          concepts: [
            { h: "Antidepressants", p: [
              "Depression and anxiety are extremely common. The most prescribed antidepressants are <b>SSRIs</b> — they raise serotonin, a brain chemical that affects mood.",
              "SSRIs treat depression AND anxiety, PTSD, and OCD. So an SSRI on a med list tells you there's a mental-health history — not exactly which one.",
            ] },
            { h: "Names to know", list: [
              "Zoloft (sertraline)", "Prozac (fluoxetine)", "Lexapro (escitalopram)", "Celexa (citalopram)",
              "Trazodone — an antidepressant mostly used to help people <b>sleep</b>",
            ], after: "Patients usually say the brand name, so learn both." },
          ],
          why: "When it fits the call, ask about thoughts of self-harm directly and respectfully, and look for empty pill bottles. Mixing SSRIs with certain drugs (like tramadol) can cause serotonin syndrome: agitation, fever, sweating, twitching muscles.",
          drugs: [
            { g: "sertraline", say: "SER-truh-leen", what: "One of the most common SSRIs — depression and anxiety." },
            { g: "fluoxetine", say: "floo-OX-uh-teen", what: "The famous original SSRI (Prozac)." },
            { g: "escitalopram", say: "es-sy-TAL-oh-pram", what: "Common SSRI for depression and anxiety." },
            { g: "citalopram", say: "sy-TAL-oh-pram", what: "Lexapro's older cousin.", tip: "Big overdoses can cause dangerous heart rhythms." },
            { g: "trazodone", say: "TRAZ-oh-done", what: "An antidepressant usually prescribed in low doses to help people sleep.", cats: ["ad", "sleep"] },
          ],
          takeaways: [
            "SSRIs (Zoloft, Prozac, Lexapro, Celexa) = depression and/or anxiety.",
            "Trazodone is often for sleep.",
            "Agitation + fever + sweating + twitching in someone on an SSRI → think serotonin syndrome.",
            "Ask about overdose/self-harm when it fits the call.",
          ],
          qs: [
            { q: "A patient's only med is sertraline (Zoloft). What history is most likely?", a: "Depression or anxiety", d: ["High blood pressure", "Diabetes", "A-fib"], e: "Zoloft is an SSRI — used for depression, anxiety, PTSD, and OCD." },
            { q: "A patient on Zoloft just started tramadol for pain. Now they're agitated, sweaty, and feverish with twitching muscles. What should you suspect?", a: "Serotonin syndrome", d: ["An allergy to Zoloft", "Normal side effects — no concern", "Low blood pressure from Zoloft"], e: "Too much serotonin from mixing drugs. It can be life-threatening — transport." },
          ],
        },
        {
          id: "1-6", title: "Anxiety meds & antipsychotics", emoji: "😰", cat: "anx",
          concepts: [
            { h: "Benzodiazepines (\"benzos\")", p: [
              "Benzos calm the brain fast. They're used for anxiety, panic attacks, seizures, and alcohol withdrawal. Most end in <b>-azepam</b> or <b>-azolam</b>.",
              "They're sedating and habit-forming.",
            ], list: ["Xanax (alprazolam)", "Ativan (lorazepam)", "Klonopin (clonazepam)", "Valium (diazepam)"] },
            { h: "Antipsychotics", p: [
              "Antipsychotics treat <b>schizophrenia and bipolar disorder</b> (and sometimes depression, sleep, or agitation in dementia). Seroquel (quetiapine) and Abilify are very common; Haldol is an older one.",
            ] },
          ],
          why: "Benzos + alcohol or opioids → breathing can slow or stop. Someone dependent on benzos who suddenly stops can have seizures. Antipsychotics can rarely cause a dangerous reaction: high fever + stiff muscles + confusion.",
          sfx: [{ x: "-azepam", cat: "anx" }, { x: "-azolam", cat: "anx" }],
          drugs: [
            { g: "alprazolam", say: "al-PRAZ-oh-lam", what: "Fast-acting benzo for anxiety and panic attacks.", remember: "\"-azolam\"", nd: ["seizure", "mr"] },
            { g: "lorazepam", say: "lor-AZ-eh-pam", what: "Benzo for anxiety — hospitals and medics also use it to stop seizures.", remember: "\"-azepam\"", nd: ["seizure", "mr"] },
            { g: "clonazepam", say: "kloh-NAZ-eh-pam", what: "Longer-acting benzo for panic disorder and seizures.", nd: ["seizure", "mr"] },
            { g: "quetiapine", say: "kweh-TY-uh-peen", what: "Antipsychotic for bipolar disorder and schizophrenia — very sedating, sometimes used for sleep.", cats: ["ap", "bip", "sleep"] },
            { g: "haloperidol", say: "hal-oh-PAIR-ih-dol", what: "Older antipsychotic for schizophrenia and severe agitation.", cats: ["ap"], tip: "Can cause sudden muscle spasms of the neck, face, or eyes (dystonia)." },
          ],
          takeaways: [
            "-azepam / -azolam = benzo (anxiety, panic, seizures).",
            "Benzo + alcohol or opioids → watch the breathing.",
            "Seroquel, Abilify, Haldol = antipsychotics (schizophrenia, bipolar).",
            "Suddenly stopping benzos can cause seizures.",
          ],
          qs: [
            { q: "A patient took several Xanax with a few beers and is very drowsy with slow, shallow breathing. Why?", a: "Benzos + alcohol together slow breathing", d: ["Xanax is a stimulant", "Alcohol cancels out Xanax", "Xanax raises blood sugar"], e: "Both depress the brain and breathing. Support the airway and breathing (BVM if needed)." },
            { q: "A drug name ending in \"-azepam\" is most likely a:", a: "Benzodiazepine (anxiety/seizure med)", d: ["Blood thinner", "Cholesterol med", "Blood pressure med"], e: "Lorazepam, clonazepam, diazepam — all benzos." },
            { q: "Seroquel (quetiapine) on a med list most likely means:", a: "Bipolar disorder or schizophrenia (sometimes trouble sleeping)", d: ["High cholesterol", "COPD", "Erectile dysfunction"], e: "Quetiapine is an antipsychotic; low doses are sometimes used for sleep." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 2, title: "Sugar & Breathing", emoji: "🍬",
      desc: "Diabetes meds, insulin, inhalers, allergies, and steroids — calls you'll run all the time.",
      lessons: [
        {
          id: "2-1", title: "Diabetes pills & shots", emoji: "🍬", cat: "dm",
          concepts: [
            { h: "Diabetes basics", p: [
              "Diabetes means the body can't control blood sugar. <b>Type 1</b>: the pancreas makes no insulin → needs insulin. <b>Type 2</b>: the body doesn't respond to insulin well → usually pills first, sometimes insulin later.",
              "Insulin moves sugar from the blood into cells. Too little → <b>high</b> sugar. Too much → <b>LOW</b> sugar (hypoglycemia) — the diabetic emergency you'll see most.",
            ] },
            { h: "Pills & weekly shots", list: [
              "<b>Metformin</b> — the #1 first pill; rarely causes low sugar by itself",
              "<b>Glipizide / glyburide</b> — squeeze out more insulin → can cause <b>long-lasting</b> low sugar",
              "<b>-gliflozin</b> (Jardiance, Farxiga) — make you pee out sugar",
              "<b>-glutide</b> (Ozempic, Trulicity) — weekly shots, also for weight loss",
            ] },
          ],
          why: "Any diabetes med + altered mental status → check a blood sugar (if your protocol allows). EMTs can give oral glucose to a patient who is awake enough to swallow and protect their airway.",
          sfx: [{ x: "-gliflozin", cat: "dm" }, { x: "-glutide", cat: "dm" }],
          drugs: [
            { g: "metformin", say: "met-FOR-min", what: "The #1 type 2 diabetes pill. Lowers the sugar the liver makes.", tip: "Usually doesn't cause low sugar on its own." },
            { g: "glipizide", say: "GLIP-ih-zide", what: "Makes the pancreas release more insulin.", tip: "Low sugar from glipizide can come back hours later — even after oral glucose. Strongly encourage transport." },
            { g: "empagliflozin", say: "em-puh-glih-FLOH-zin", what: "Makes the kidneys dump sugar into the urine. Also helps heart failure.", remember: "\"-gliflozin\"", tip: "Can cause DKA even when the sugar isn't very high.", nd: ["heart"] },
            { g: "semaglutide", say: "sem-uh-GLOO-tide", what: "Weekly injection for type 2 diabetes and weight loss.", remember: "\"-glutide\"", tip: "Common side effects: nausea, vomiting, dehydration." },
          ],
          takeaways: [
            "Diabetes meds + confusion → think LOW blood sugar first.",
            "Metformin = type 2 diabetes.",
            "Glipizide/glyburide → low sugar can come back hours later.",
            "Ozempic/Wegovy = weekly shot for diabetes or weight loss.",
          ],
          qs: [
            { q: "A patient on glipizide had low sugar, perked up after oral glucose, and now wants to refuse. Main concern?", a: "Their sugar can drop again hours later", d: ["Glipizide causes high blood pressure", "Oral glucose cures diabetes", "There's no concern once they're awake"], e: "Glipizide keeps pushing insulin out for hours. Strongly encourage transport and a real meal; follow your refusal protocol." },
            { q: "Your diabetic patient is confused, pale, and sweaty. What should you check first (if your protocol allows)?", a: "Blood sugar", d: ["Temperature", "Pupils only", "Nothing — wait and see"], e: "Low blood sugar can look like a stroke, intoxication, or a psych problem. Always check." },
            { q: "Which diabetes med is a weekly injection also used for weight loss?", a: "Ozempic (semaglutide)", d: ["Metformin", "Glipizide", "Lisinopril"], e: "Ozempic, Wegovy, Mounjaro, Trulicity — weekly shots." },
          ],
        },
        {
          id: "2-2", title: "Insulin & glucagon", emoji: "💉", cat: "dm",
          concepts: [
            { h: "Two kinds of insulin", list: [
              "<b>Long-acting (basal)</b> — works all day: Lantus, Basaglar, Toujeo, Tresiba",
              "<b>Rapid-acting (mealtime)</b> — works in ~15 minutes: Humalog, Novolog. Insulin pumps use this kind.",
            ], after: "Insulin + skipped meal, vomiting, or extra exercise → <b>hypoglycemia</b>." },
            { h: "Glucagon = the rescue", p: [
              "Glucagon raises blood sugar fast. It comes as a nasal spray (Baqsimi) or a shot that family members can give for severe lows.",
              "If you see glucagon, this patient has had — or is at risk for — <b>bad lows</b>.",
            ] },
          ],
          why: "Low sugar can look like a stroke, intoxication, or a seizure. Check the sugar on every altered patient, and ask insulin users when they last took insulin and last ate.",
          drugs: [
            { g: "insulin glargine", say: "GLAR-jeen", what: "Long-acting background insulin, usually once a day." },
            { g: "insulin lispro", say: "LYE-sproh", what: "Fast mealtime insulin — also used in insulin pumps." },
            { g: "glucagon", say: "GLOO-kuh-gon", what: "Emergency rescue for severe low blood sugar.", tip: "Means the patient uses insulin and has had (or risks) severe lows." },
          ],
          takeaways: [
            "Lantus/Tresiba = long-acting. Humalog/Novolog = rapid-acting.",
            "Insulin + not eating = low blood sugar.",
            "Glucagon kit (Baqsimi) = history of severe lows.",
          ],
          qs: [
            { q: "A type 1 diabetic took her Humalog but skipped lunch. Now she's confused and sweaty. Most likely?", a: "Hypoglycemia (low blood sugar)", d: ["High blood sugar", "An asthma attack", "Normal — no concern"], e: "Rapid-acting insulin without food drops the sugar fast." },
            { q: "You find a Baqsimi (nasal glucagon) in your patient's bag. That tells you:", a: "They use insulin and have had or risk severe lows", d: ["They have asthma", "They have high blood pressure", "They're allergic to bees"], e: "Glucagon is a rescue med for severe hypoglycemia." },
            { q: "Lantus is:", a: "Long-acting insulin", d: ["Rapid-acting insulin", "A blood thinner", "An inhaler"], e: "Lantus (insulin glargine) is a once-daily background insulin." },
          ],
        },
        {
          id: "2-3", title: "Inhalers", emoji: "🫁", cat: "br",
          concepts: [
            { h: "Rescue vs. controller", p: [
              "Asthma and COPD narrow the airways. <b>RESCUE</b> inhalers (albuterol) open them up within minutes. <b>CONTROLLER</b> (maintenance) inhalers like Advair, Symbicort, and Spiriva are taken every day to <b>prevent</b> attacks — they don't work fast.",
              "<b>COPD</b> = long-term lung damage, usually from smoking (emphysema, chronic bronchitis). <b>Asthma</b> = airways that overreact, often since childhood.",
            ] },
            { h: "Names to know", list: [
              "Albuterol (ProAir, Ventolin) — <b>rescue</b>",
              "Advair, Symbicort, Breo — steroid + long-acting opener (daily)",
              "Spiriva — long-acting opener, classic <b>COPD</b> clue",
              "Singulair (montelukast) — daily pill for asthma/allergies",
            ] },
          ],
          why: "EMTs can often assist with a patient's own prescribed albuterol inhaler (per protocol). Ask: \"How many times have you used your rescue inhaler today?\" Needing it a lot = getting worse.",
          drugs: [
            { g: "albuterol", say: "al-BYOO-ter-ol", what: "Rescue inhaler — opens airways within minutes.", tip: "Side effects: fast heart rate, shakiness." },
            { g: "fluticasone/salmeterol", say: "floo-TIK-uh-sone / sal-MEE-ter-ol", what: "Advair — daily controller: a steroid + a long-acting airway opener. NOT for rescue.", nd: ["steroid"] },
            { g: "budesonide/formoterol", say: "byoo-DES-oh-nide / for-MOE-ter-ol", what: "Symbicort — daily controller similar to Advair.", nd: ["steroid"] },
            { g: "tiotropium", say: "tee-oh-TRO-pee-um", what: "Spiriva — once-daily long-acting inhaler. Big COPD clue." },
            { g: "montelukast", say: "mon-teh-LOO-kast", what: "Singulair — a daily pill for asthma and allergies.", nd: ["allergy"] },
          ],
          takeaways: [
            "Albuterol = rescue. Advair/Symbicort/Spiriva = daily controllers.",
            "Spiriva + home oxygen = think COPD.",
            "Using the rescue inhaler a lot = a worsening attack.",
          ],
          qs: [
            { q: "Which of these inhalers is the RESCUE (fast-acting) inhaler?", a: "Albuterol (ProAir/Ventolin)", d: ["Advair", "Spiriva", "Singulair"], e: "Albuterol works in minutes. The others are daily maintenance meds." },
            { q: "An asthmatic says she's used her albuterol 10 times today. This means:", a: "Her asthma is getting worse — high-risk patient", d: ["Normal daily use", "She's allergic to albuterol", "The inhaler is expired, nothing more"], e: "Escalating rescue-inhaler use is a red flag for a severe attack." },
            { q: "A 70-year-old former smoker uses Spiriva and home oxygen. Most likely history?", a: "COPD", d: ["Seizure disorder", "Diabetes", "Hypothyroidism"], e: "Spiriva (tiotropium) is a classic COPD maintenance inhaler." },
          ],
        },
        {
          id: "2-4", title: "Allergies & steroids", emoji: "🐝", cat: "al",
          concepts: [
            { h: "Allergy meds", p: [
              "<b>Antihistamines</b> (Benadryl, Zyrtec, Claritin) block histamine — the chemical behind itching, hives, and sneezing. Benadryl is very sedating.",
              "<b>Epinephrine auto-injectors</b> (EpiPen) treat <b>anaphylaxis</b> — a severe, whole-body allergic reaction with trouble breathing, hives, swelling, and/or low BP. EMTs can assist with or give epinephrine auto-injectors per protocol.",
            ] },
            { h: "Steroids", p: [
              "<b>Prednisone</b> is a powerful anti-inflammatory pill for asthma/COPD flares, allergic reactions, and autoimmune diseases.",
              "Long-term use weakens the immune system and can make a sick or injured patient crash into shock that doesn't respond well to fluids (adrenal crisis).",
            ] },
          ],
          why: "An EpiPen on the med list = history of a severe allergy. Ask what they're allergic to and whether they've used it today.",
          drugs: [
            { g: "epinephrine auto-injector", say: "ep-ih-NEF-rin", what: "Rescue shot for anaphylaxis.", cats: ["ana"], tip: "Carrying an EpiPen = history of severe allergy. Ask what they're allergic to." },
            { g: "diphenhydramine", say: "dy-fen-HY-druh-meen", what: "Benadryl — an antihistamine for allergies that also makes people sleepy.", tip: "Big overdoses: hot, dry, flushed skin, big pupils, confusion.", nd: ["mood"] },
            { g: "cetirizine", say: "seh-TEER-ih-zeen", what: "Zyrtec — a daily allergy pill." },
            { g: "prednisone", say: "PRED-nih-sone", what: "Steroid that calms inflammation — asthma/COPD flares, allergies, autoimmune disease.", cats: ["st"], nd: ["lung", "allergy", "imm"], tip: "Long-term users can hide infections and crash into shock (adrenal crisis)." },
          ],
          takeaways: [
            "EpiPen = history of anaphylaxis.",
            "Benadryl/Zyrtec/Claritin = allergy meds (Benadryl = sleepy).",
            "Prednisone = steroid; long-term use → infections and adrenal crisis risk.",
          ],
          qs: [
            { q: "A patient's med list includes an EpiPen. What does this tell you?", a: "History of a severe allergic reaction (anaphylaxis)", d: ["They have diabetes", "They have heart failure", "They take blood thinners"], e: "Ask what they're allergic to and about past reactions." },
            { q: "A patient on daily prednisone for years is in shock and isn't improving with treatment. What should you consider?", a: "Adrenal crisis from long-term steroid use", d: ["Prednisone overdose", "An allergy to prednisone", "Low thyroid"], e: "Long-term steroids shut down the body's own stress hormone. Report the steroid use — they may need stress-dose steroids at the hospital or from ALS." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 3, title: "Heart, Rhythm & Gut", emoji: "🫀",
      desc: "Heart failure, A-fib, stomach meds, and thyroid — fills in the rest of the common list.",
      lessons: [
        {
          id: "3-1", title: "Heart failure meds", emoji: "🫀", cat: "hf",
          concepts: [
            { h: "Heart failure (CHF)", p: [
              "Heart failure means the heart pumps weakly, so fluid backs up — into the <b>lungs</b> (shortness of breath, crackles, can't lie flat) and the <b>legs</b> (swelling).",
              "Treatment: <b>water pills</b> to pull off fluid + meds that help the heart work less hard.",
            ], list: [
              "<b>Lasix (furosemide)</b> — strong water pill. THE heart failure clue.",
              "<b>Spironolactone</b> — water pill that keeps potassium in",
              "<b>Coreg (carvedilol)</b> — a beta blocker (-olol) used a lot in heart failure",
              "<b>Entresto</b> — a heart-failure-specific pill",
            ] },
          ],
          why: "CHF patients often call when fluid builds up: short of breath, worse lying flat, swollen legs, weight gain. Ask if they've missed their water pill or eaten a lot of salt.",
          drugs: [
            { g: "furosemide", say: "fyoo-ROH-seh-mide", what: "Lasix — a powerful water pill (loop diuretic) that makes you pee off extra fluid.", cats: ["wp", "hf"], tip: "Can cause dehydration and low potassium → abnormal heart rhythms." },
            { g: "spironolactone", say: "spy-roh-noh-LAK-tone", what: "A water pill that holds on to potassium. Also used for liver cirrhosis.", cats: ["wp", "hf"], tip: "Can push potassium too HIGH → dangerous heart rhythms." },
            { g: "carvedilol", say: "KAR-veh-dih-lol", what: "Coreg — a beta blocker used a lot for heart failure.", cats: ["hf", "bp"] },
            { g: "sacubitril/valsartan", say: "sak-YOO-bih-tril / val-SAR-tan", what: "Entresto — a combo pill made for heart failure.", tip: "Entresto on a med list = almost certainly heart failure." },
          ],
          takeaways: [
            "Lasix = water pill → think heart failure.",
            "CHF = fluid in the lungs and legs.",
            "Entresto = heart failure.",
          ],
          qs: [
            { q: "A patient takes Lasix, Coreg, and Entresto. Most likely history?", a: "Heart failure (CHF)", d: ["COPD", "Seizure disorder", "Hypothyroidism"], e: "Water pill + beta blocker + Entresto = textbook heart failure." },
            { q: "Which is a classic sign of heart failure getting worse?", a: "Shortness of breath that's worse lying flat, with swollen legs", d: ["Itchy hives", "Pinpoint pupils", "A fruity breath odor"], e: "Fluid backs up into the lungs and legs." },
          ],
        },
        {
          id: "3-2", title: "Heart rhythm (A-fib) meds", emoji: "💗", cat: "rh",
          concepts: [
            { h: "A-fib", p: [
              "<b>Atrial fibrillation (A-fib)</b> is an irregular, often fast heartbeat — the upper chambers quiver instead of squeezing. Blood can pool and form clots → strokes.",
              "So A-fib patients usually take <b>two kinds</b> of meds: a rate/rhythm med AND a <b>blood thinner</b>.",
            ], list: [
              "Rate control: metoprolol, diltiazem (Cardizem), digoxin",
              "Rhythm control: amiodarone",
              "Blood thinner: Eliquis, Xarelto, warfarin (from Level 1!)",
            ] },
          ],
          why: "Irregular pulse + a blood thinner + a rate med = A-fib. Too much of these meds → slow heart rate, dizziness, fainting.",
          drugs: [
            { g: "diltiazem", say: "dil-TY-uh-zem", what: "Cardizem — a calcium channel blocker that slows the heart rate. Common for A-fib.", nd: ["heart"] },
            { g: "digoxin", say: "dih-JOX-in", what: "Lanoxin — an old heart med for A-fib and heart failure.", tip: "Toxicity: nausea, confusion, seeing yellow-green halos, slow or weird heart rhythms." },
            { g: "amiodarone", say: "am-ee-OH-duh-rone", what: "A strong rhythm-control drug for A-fib and dangerous rhythms." },
          ],
          takeaways: [
            "A-fib = irregular heartbeat → stroke risk → blood thinner.",
            "Cardizem, digoxin, amiodarone, metoprolol = rate/rhythm meds.",
            "Digoxin toxicity: nausea, confusion, yellow-green halos.",
          ],
          qs: [
            { q: "A patient takes Eliquis and diltiazem. Most likely history?", a: "Atrial fibrillation (A-fib)", d: ["Asthma", "Depression", "GERD"], e: "Blood thinner + rate-control med = A-fib." },
            { q: "Why do most A-fib patients take a blood thinner?", a: "Blood pools in the quivering heart and can clot → stroke", d: ["To lower cholesterol", "To slow the heart rate", "To treat anxiety"], e: "Stroke prevention is the reason." },
            { q: "An older patient on digoxin has nausea, confusion, and sees yellow-green halos around lights. Suspect:", a: "Digoxin toxicity", d: ["Seasonal allergies", "Low thyroid", "A migraine only"], e: "Classic digoxin toxicity — watch for slow or irregular rhythms." },
          ],
        },
        {
          id: "3-3", title: "Stomach meds", emoji: "🫃", cat: "acid",
          concepts: [
            { h: "Acid reducers", p: [
              "Heartburn/GERD and stomach ulcers are treated with acid reducers. <b>PPIs</b> end in <b>-prazole</b> (omeprazole/Prilosec, pantoprazole/Protonix). Pepcid (famotidine) is another.",
            ] },
            { h: "Nausea meds", p: [
              "Zofran (ondansetron) and Phenergan (promethazine) treat nausea and vomiting. Phenergan is very sedating.",
            ] },
          ],
          why: "Ulcer history + vomiting blood or \"coffee grounds\" or black, tarry stools → GI bleed. And heartburn-like pain can actually be a heart attack — don't let a GERD history fool you.",
          sfx: [{ x: "-prazole", cat: "acid" }],
          drugs: [
            { g: "omeprazole", say: "oh-MEP-ruh-zole", what: "Prilosec — a PPI for heartburn/GERD and ulcers.", remember: "\"-prazole\"" },
            { g: "pantoprazole", say: "pan-TOE-pruh-zole", what: "Protonix — another very common PPI." },
            { g: "famotidine", say: "fuh-MOE-tih-deen", what: "Pepcid — reduces stomach acid." },
            { g: "ondansetron", say: "on-DAN-seh-tron", what: "Zofran — the most common nausea med.", cats: ["naus"] },
            { g: "promethazine", say: "proh-METH-uh-zeen", what: "Phenergan — a nausea med that also causes strong drowsiness.", cats: ["naus"], nd: ["allergy", "mood"] },
          ],
          takeaways: [
            "-prazole = stomach acid med (GERD, ulcers).",
            "Zofran / Phenergan = nausea meds.",
            "Ulcer history + coffee-ground vomit or black stools → GI bleed.",
          ],
          qs: [
            { q: "A patient with an ulcer history on Protonix is vomiting what looks like coffee grounds. Suspect:", a: "Bleeding in the stomach (GI bleed)", d: ["Food poisoning only", "An allergic reaction", "Low blood sugar"], e: "Coffee-ground emesis = partially digested blood." },
            { q: "A 55-year-old with GERD says his \"heartburn\" is worse than usual and he's sweaty. What should you keep in mind?", a: "It could be a heart attack — don't assume it's GERD", d: ["GERD always causes sweating", "It's definitely heartburn", "Give him his omeprazole and leave"], e: "Cardiac chest pain often feels like indigestion, especially in diabetics, women, and older adults." },
          ],
        },
        {
          id: "3-4", title: "Thyroid & bone meds", emoji: "🦋", cat: "th",
          concepts: [
            { h: "Thyroid", p: [
              "The thyroid sets your body's speed. <b>Too little</b> (hypothyroid) → tired, cold, slow, weight gain → treated with <b>levothyroxine (Synthroid)</b>, one of the most prescribed drugs in the US.",
              "<b>Too much</b> (hyperthyroid) → fast heart rate, anxiety, sweating, weight loss → treated with <b>methimazole</b>.",
            ] },
            { h: "Bones", p: [
              "<b>Osteoporosis</b> = weak, brittle bones. Fosamax (alendronate) treats it. These patients can break a hip falling from standing.",
            ] },
          ],
          why: "Too much thyroid medicine looks like hyperthyroidism: fast heart rate, A-fib, anxiety. Osteoporosis meds → handle falls as possible fractures.",
          drugs: [
            { g: "levothyroxine", say: "lee-voh-thy-ROX-een", what: "Synthroid — replaces thyroid hormone for an underactive thyroid." },
            { g: "methimazole", say: "meth-IM-uh-zole", what: "Tapazole — slows down an overactive thyroid." },
            { g: "alendronate", say: "uh-LEN-droh-nate", what: "Fosamax — strengthens bones (osteoporosis).", cats: ["bone"] },
          ],
          takeaways: [
            "Synthroid (levothyroxine) = underactive thyroid.",
            "Methimazole = overactive thyroid.",
            "Fosamax = osteoporosis → fractures with minor falls.",
          ],
          qs: [
            { q: "Levothyroxine (Synthroid) on a med list means:", a: "Hypothyroidism (underactive thyroid)", d: ["Hyperthyroidism", "High cholesterol", "Seizures"], e: "It replaces the thyroid hormone the body isn't making." },
            { q: "An elderly woman on Fosamax fell from standing and has hip pain. What should you suspect?", a: "A hip fracture — she has fragile bones", d: ["A simple bruise only", "An allergic reaction", "A blood clot"], e: "Osteoporosis + low-energy fall = high fracture risk." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 4, title: "Brain & Nerves", emoji: "⚡",
      desc: "Seizures, Parkinson's, dementia, more psych meds, sleep aids, and ADHD meds.",
      lessons: [
        {
          id: "4-1", title: "Seizure meds", emoji: "⚡", cat: "sz",
          concepts: [
            { h: "Anticonvulsants", p: [
              "Epilepsy = repeated seizures. Seizure meds (anticonvulsants) are taken daily to prevent them.",
              "The #1 reason a known epileptic has a seizure: <b>missed doses</b> or running out.",
            ], list: [
              "Keppra (levetiracetam) — very common",
              "Dilantin (phenytoin) — older",
              "Lamictal (lamotrigine) — also for bipolar",
              "Depakote (valproic acid) — also for bipolar & migraines",
              "Neurontin (gabapentin) — mostly for nerve pain",
            ] },
          ],
          why: "Ask: \"Have you missed any doses?\" and \"Is this your usual seizure?\" Some seizure meds (Lamictal, Depakote) are also mood stabilizers — so don't automatically assume epilepsy.",
          drugs: [
            { g: "levetiracetam", say: "lee-vuh-tye-RA-suh-tam", what: "Keppra — one of the most common seizure meds." },
            { g: "phenytoin", say: "FEN-ih-toyn", what: "Dilantin — an older seizure med.", tip: "Too much → wobbly walk, slurred speech, jerky eye movements — looks drunk." },
            { g: "lamotrigine", say: "luh-MOE-trih-jeen", what: "Lamictal — for seizures and bipolar disorder.", cats: ["sz", "bip"], tip: "A new rash with mouth sores can be a life-threatening reaction." },
            { g: "valproic acid (divalproex)", say: "val-PRO-ik", what: "Depakote — for seizures, bipolar disorder, and migraines.", cats: ["sz", "bip"] },
            { g: "gabapentin", say: "GAB-uh-pen-tin", what: "Neurontin — mostly for nerve pain (like diabetic neuropathy); also seizures.", cats: ["np", "sz"], tip: "Sedating — risky with opioids." },
          ],
          takeaways: [
            "Keppra, Dilantin, Lamictal, Depakote = seizure meds.",
            "Missed doses = #1 cause of breakthrough seizures.",
            "Lamictal/Depakote can also mean bipolar. Gabapentin usually means nerve pain.",
          ],
          qs: [
            { q: "A known epileptic on Keppra has a seizure. What's the most common cause?", a: "Missed doses / ran out of medication", d: ["An allergy to Keppra", "Too much Keppra", "Eating too much sugar"], e: "Non-adherence is #1. Also ask about sleep loss, alcohol, and illness." },
            { q: "A patient on Dilantin is stumbling with slurred speech but hasn't been drinking. Consider:", a: "Too much Dilantin (phenytoin toxicity)", d: ["Dilantin withdrawal", "Seasonal allergies", "Low thyroid"], e: "Phenytoin toxicity looks like intoxication. Still check sugar and do a stroke assessment." },
          ],
        },
        {
          id: "4-2", title: "Parkinson's & dementia", emoji: "👴", cat: "pd",
          concepts: [
            { h: "Parkinson's", p: [
              "In Parkinson's the brain runs low on dopamine → tremor, stiffness, a slow shuffling walk, and falls. Treated with <b>carbidopa/levodopa (Sinemet)</b> and drugs like <b>Requip</b> or <b>Mirapex</b> (also for restless legs).",
            ] },
            { h: "Dementia", p: [
              "Alzheimer's/dementia → memory loss and confusion. <b>Aricept (donepezil)</b> and <b>Namenda (memantine)</b> slow it down a little.",
            ] },
          ],
          why: "Get the patient's baseline mental status from family or caregivers. Parkinson's patients fall and choke (aspirate) a lot. Aricept can cause a slow heart rate and fainting.",
          drugs: [
            { g: "carbidopa/levodopa", say: "kar-bih-DOE-puh / lee-voh-DOE-puh", what: "Sinemet — the main Parkinson's med (replaces dopamine).", tip: "Missed doses → severe stiffness." },
            { g: "ropinirole", say: "roh-PIN-ih-role", what: "Requip — for Parkinson's and restless legs syndrome." },
            { g: "donepezil", say: "doh-NEP-eh-zil", what: "Aricept — for Alzheimer's/dementia.", cats: ["dem"], tip: "Can cause a slow heart rate and fainting." },
            { g: "memantine", say: "MEM-an-teen", what: "Namenda — for moderate to severe Alzheimer's.", cats: ["dem"] },
          ],
          takeaways: [
            "Sinemet/Requip = Parkinson's (Requip also = restless legs).",
            "Aricept/Namenda = dementia → ask caregivers about baseline.",
            "Aricept can cause a slow pulse and syncope.",
          ],
          qs: [
            { q: "A patient takes Aricept and Namenda. Most likely history?", a: "Alzheimer's / dementia", d: ["Parkinson's disease", "Seizure disorder", "Schizophrenia"], e: "Both are dementia meds. Find out their normal mental status." },
            { q: "Sinemet (carbidopa/levodopa) on a med list means:", a: "Parkinson's disease", d: ["Epilepsy", "Asthma", "Heart failure"], e: "Sinemet replaces dopamine in Parkinson's." },
          ],
        },
        {
          id: "4-3", title: "More psych meds", emoji: "🧩", cat: "bip",
          concepts: [
            { h: "Bipolar & beyond", p: [
              "<b>Bipolar disorder</b> = swings between depression and mania. <b>Lithium</b> is the classic mood stabilizer — the dose has to be just right; too much is toxic (shaking, vomiting, confusion).",
              "<b>Wellbutrin (bupropion)</b> is an antidepressant also used to quit smoking — overdoses cause seizures. <b>Abilify</b> is an antipsychotic for bipolar/schizophrenia and an add-on for depression.",
              "<b>Elavil (amitriptyline)</b> is an older \"tricyclic\" antidepressant, now mostly used for nerve pain, sleep, and migraines. Its overdoses are very dangerous.",
            ] },
          ],
          why: "Vomiting/diarrhea or dehydration can push lithium levels into the toxic range. Any antidepressant overdose → transport; tricyclic overdoses can go downhill fast.",
          drugs: [
            { g: "lithium", say: "LITH-ee-um", what: "The classic bipolar mood stabilizer.", tip: "Toxicity: shaking, vomiting, diarrhea, confusion, unsteady walk." },
            { g: "bupropion", say: "byoo-PRO-pee-on", what: "Wellbutrin — an antidepressant; as Zyban, helps people quit smoking.", cats: ["ad"], tip: "Overdose → seizures." },
            { g: "aripiprazole", say: "air-ih-PIP-ruh-zole", what: "Abilify — an antipsychotic for schizophrenia/bipolar, also added for depression.", cats: ["ap", "bip", "ad"] },
            { g: "mirtazapine", say: "mur-TAZ-uh-peen", what: "Remeron — an antidepressant that helps sleep and appetite.", cats: ["ad", "sleep"] },
            { g: "amitriptyline", say: "am-ee-TRIP-tih-leen", what: "Elavil — older antidepressant now used mostly for nerve pain, sleep, and migraines.", cats: ["ad", "np"], tip: "Overdose is very dangerous: seizures, low BP, deadly heart rhythms." },
          ],
          takeaways: [
            "Lithium = bipolar. Dehydration → lithium toxicity.",
            "Wellbutrin overdose → seizures.",
            "Elavil (tricyclic) overdose = very dangerous.",
          ],
          qs: [
            { q: "A patient on lithium has had vomiting and diarrhea for 3 days and now has a coarse tremor and confusion. Suspect:", a: "Lithium toxicity", d: ["A normal flu", "Low thyroid", "An allergic reaction"], e: "Dehydration raises lithium levels. Transport." },
            { q: "Lithium on a med list most likely means:", a: "Bipolar disorder", d: ["High blood pressure", "Asthma", "Diabetes"], e: "Lithium is the classic bipolar mood stabilizer." },
          ],
        },
        {
          id: "4-4", title: "Sleep & ADHD meds", emoji: "😴", cat: "adhd",
          concepts: [
            { h: "Sleep meds", p: [
              "<b>Ambien (zolpidem)</b> helps people fall asleep. It can cause sleepwalking or even sleep-driving, and falls in older adults. Dangerous with alcohol.",
            ] },
            { h: "ADHD meds (stimulants)", p: [
              "Adderall, Ritalin, Concerta, and Vyvanse speed up the brain to improve focus. Too much → racing heart, high BP, high temperature, big pupils, sweating, agitation.",
            ] },
          ],
          why: "Stimulant overdose (or misuse) can cause chest pain, seizures, and dangerous overheating. Sleep meds + alcohol or opioids → breathing problems.",
          drugs: [
            { g: "zolpidem", say: "ZOLE-pih-dem", what: "Ambien — a sleep med.", cats: ["sleep"] },
            { g: "amphetamine/dextroamphetamine", say: "am-FET-uh-meen", what: "Adderall — a stimulant for ADHD." },
            { g: "methylphenidate", say: "meth-il-FEN-ih-date", what: "Ritalin/Concerta — a stimulant for ADHD." },
            { g: "lisdexamfetamine", say: "lis-dex-am-FET-uh-meen", what: "Vyvanse — a long-acting ADHD stimulant." },
          ],
          takeaways: [
            "Ambien = sleep (falls, sleep-driving, bad with alcohol).",
            "Adderall/Ritalin/Concerta/Vyvanse = ADHD stimulants.",
            "Stimulant overdose: fast heart, high BP, hot, big pupils, agitated.",
          ],
          qs: [
            { q: "A college student took extra Adderall to study. What findings do you expect?", a: "Fast heart rate, high BP, sweating, big pupils, agitation", d: ["Slow breathing and pinpoint pupils", "Low blood pressure and sleepiness", "Hives and wheezing"], e: "That's the stimulant (sympathomimetic) picture. Watch for chest pain, seizures, overheating." },
            { q: "Ambien is used for:", a: "Insomnia (trouble sleeping)", d: ["ADHD", "High blood pressure", "Seizures"], e: "Zolpidem is a sleep med." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 5, title: "Pain & Addiction", emoji: "💊",
      desc: "Opioids, Narcan, addiction treatment, over-the-counter pain meds, and muscle relaxants.",
      lessons: [
        {
          id: "5-1", title: "Opioid pain meds", emoji: "💊", cat: "op",
          concepts: [
            { h: "Opioids", p: [
              "Opioids are strong pain relievers. An overdose causes the <b>opioid triad</b>: pinpoint pupils, slow or stopped breathing, and decreased responsiveness.",
            ], list: [
              "Oxycodone (OxyContin; <b>Percocet</b> = oxycodone + Tylenol)",
              "Hydrocodone (<b>Norco, Vicodin</b> = hydrocodone + Tylenol)",
              "Morphine, hydromorphone (Dilaudid)",
              "Fentanyl patch (Duragesic)",
              "Tramadol (Ultram) — weaker, but can cause seizures",
            ] },
          ],
          why: "Breathing comes first — BVM ventilation saves opioid overdoses. EMTs can give naloxone (Narcan) per protocol. Look for patches on the skin (back, arms, chest).",
          drugs: [
            { g: "oxycodone", say: "ox-ee-KOE-done", what: "OxyContin/Roxicodone — a strong opioid pain med." },
            { g: "hydrocodone/acetaminophen", say: "hy-droh-KOE-done", what: "Norco/Vicodin — opioid + Tylenol combo.", tip: "Overdose = breathing problems AND possible liver damage from the Tylenol part." },
            { g: "fentanyl (transdermal)", say: "FEN-tuh-nil", what: "Duragesic — a fentanyl skin patch for severe chronic pain.", tip: "Remove the patch in an overdose (gloves!). Heat makes it absorb faster." },
            { g: "tramadol", say: "TRAM-uh-dol", what: "Ultram — a weaker opioid.", tip: "Can cause seizures and serotonin syndrome (especially with SSRIs)." },
            { g: "morphine (extended-release)", say: "MOR-feen", what: "MS Contin — long-acting morphine for chronic pain." },
          ],
          takeaways: [
            "Opioid overdose: pinpoint pupils + slow breathing + hard to wake.",
            "Ventilate first; naloxone per protocol.",
            "Percocet/Norco also contain Tylenol. Check skin for fentanyl patches.",
          ],
          qs: [
            { q: "Which three findings make up the classic opioid overdose triad?", a: "Pinpoint pupils, slow breathing, decreased responsiveness", d: ["Big pupils, fast heart rate, sweating", "Hives, wheezing, swelling", "Fever, stiff neck, rash"], e: "Support breathing first, then naloxone per protocol." },
            { q: "An unresponsive patient with pinpoint pupils has a skin patch on their back. Along with airway care, you should:", a: "Remove the patch (likely fentanyl)", d: ["Leave it alone", "Put a heat pack on it", "Cut it in half"], e: "The patch keeps delivering drug. Wear gloves." },
          ],
        },
        {
          id: "5-2", title: "Narcan & addiction treatment", emoji: "🆘", cat: "mat",
          concepts: [
            { h: "Naloxone (Narcan)", p: [
              "Narcan reverses opioid overdoses by knocking opioids off their receptors. It wears off in <b>30–90 minutes</b> — sometimes before the opioid does, so the patient can stop breathing again.",
            ] },
            { h: "Treating addiction", p: [
              "<b>Suboxone</b> (buprenorphine + naloxone) and <b>methadone</b> treat opioid use disorder — they prevent withdrawal and cravings.",
              "<b>Vivitrol</b> (naltrexone) is a monthly shot that blocks opioids; it also treats alcohol use disorder.",
            ] },
          ],
          why: "A patient who wakes up after Narcan and refuses care can re-sedate when it wears off — especially with long-acting opioids like methadone. Someone on Vivitrol may not get relief from opioid pain meds.",
          drugs: [
            { g: "naloxone", say: "nal-OX-own", what: "Narcan — reverses opioid overdoses.", tip: "A Narcan kit on a med list = the person is at risk of overdose." },
            { g: "buprenorphine/naloxone", say: "byoo-preh-NOR-feen", what: "Suboxone — treats opioid use disorder.", tip: "Means the patient is in treatment for opioid addiction." },
            { g: "methadone", say: "METH-uh-done", what: "A long-acting opioid used for addiction treatment (and pain).", cats: ["mat", "op"], tip: "Lasts much longer than Narcan → re-sedation is likely." },
            { g: "naltrexone", say: "nal-TREX-own", what: "Vivitrol — blocks opioids for about a month; also for alcohol use disorder." },
          ],
          takeaways: [
            "Narcan lasts 30–90 min — the overdose can come back.",
            "Suboxone/methadone = opioid addiction treatment.",
            "Vivitrol blocks opioid pain meds for ~a month.",
          ],
          qs: [
            { q: "You give Narcan for a methadone overdose. The patient wakes up and wants to refuse. Main concern?", a: "Methadone lasts much longer than Narcan — they can stop breathing again", d: ["Narcan causes seizures later", "Methadone isn't an opioid", "There's no concern once they're awake"], e: "Strongly encourage transport and follow your refusal protocol." },
            { q: "Suboxone on a med list means:", a: "Treatment for opioid use disorder", d: ["Chronic back pain only", "High blood pressure", "Asthma"], e: "Suboxone = buprenorphine + naloxone for opioid addiction." },
          ],
        },
        {
          id: "5-3", title: "Over-the-counter pain meds", emoji: "🤕", cat: "nsaid",
          concepts: [
            { h: "NSAIDs vs. Tylenol", p: [
              "<b>NSAIDs</b> — ibuprofen (Motrin/Advil), naproxen (Aleve), meloxicam (Mobic) — reduce pain, fever, and inflammation. Downsides: stomach bleeding and kidney damage.",
              "<b>Acetaminophen (Tylenol)</b> reduces pain and fever but is <b>not</b> an NSAID. An overdose can seem harmless at first, then destroy the liver over 1–3 days.",
            ] },
          ],
          why: "A \"harmless\" Tylenol overdose still needs the hospital — the antidote works best early. Heavy NSAID users with black, tarry stools → think GI bleed.",
          drugs: [
            { g: "ibuprofen", say: "eye-byoo-PRO-fen", what: "Motrin/Advil — an NSAID for pain, fever, and inflammation." },
            { g: "naproxen", say: "nuh-PROX-en", what: "Aleve — a longer-lasting NSAID." },
            { g: "meloxicam", say: "meh-LOX-ih-kam", what: "Mobic — a prescription NSAID for arthritis." },
            { g: "acetaminophen", say: "uh-seet-uh-MIN-oh-fen", what: "Tylenol — pain and fever. NOT an NSAID.", tip: "Overdose looks fine early, then causes liver failure. Transport even if they feel okay." },
          ],
          takeaways: [
            "Ibuprofen/naproxen/meloxicam = NSAIDs (stomach bleeding, kidneys).",
            "Tylenol is not an NSAID; overdoses are silent at first.",
          ],
          qs: [
            { q: "A teen took 30 Tylenol 2 hours ago and feels fine. What's true?", a: "The liver damage shows up over 1–3 days — they need the hospital", d: ["Feeling fine means it's not dangerous", "Tylenol overdose causes immediate seizures", "Narcan is the antidote"], e: "Early treatment with the antidote prevents liver failure." },
            { q: "Which of these is NOT an NSAID?", a: "Acetaminophen (Tylenol)", d: ["Ibuprofen (Advil)", "Naproxen (Aleve)", "Meloxicam (Mobic)"], e: "Tylenol relieves pain and fever but isn't anti-inflammatory." },
          ],
        },
        {
          id: "5-4", title: "Muscle relaxants", emoji: "💪", cat: "mr",
          concepts: [
            { h: "Muscle relaxants", p: [
              "Flexeril (cyclobenzaprine) and Robaxin (methocarbamol) treat muscle spasms and back pain. They're sedating — extra dangerous with opioids or alcohol.",
              "<b>Baclofen</b> treats spasticity from MS, spinal cord injuries, or cerebral palsy — sometimes through an implanted pump.",
            ] },
          ],
          why: "If a baclofen pump fails or someone suddenly stops baclofen → high fever, confusion, severe muscle stiffness, seizures. It's life-threatening.",
          drugs: [
            { g: "cyclobenzaprine", say: "sy-kloh-BEN-zuh-preen", what: "Flexeril — for muscle spasms and back pain." },
            { g: "methocarbamol", say: "meth-oh-KAR-buh-mol", what: "Robaxin — for muscle spasms." },
            { g: "baclofen", say: "BAK-loh-fen", what: "For spasticity from MS or spinal cord injury; sometimes via an implanted pump.", tip: "Sudden withdrawal is life-threatening." },
          ],
          takeaways: [
            "Flexeril/Robaxin = muscle spasms (sedating).",
            "Baclofen = spasticity; sudden stop → fever, stiffness, seizures.",
          ],
          qs: [
            { q: "A patient with an implanted baclofen pump has a fever, severe stiffness, and confusion, and the pump is alarming. Suspect:", a: "Baclofen withdrawal", d: ["Baclofen allergy", "A simple cold", "Low blood sugar only"], e: "Baclofen withdrawal is an emergency — transport." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 6, title: "Kidneys, Bladder & Hormones", emoji: "🫘",
      desc: "Prostate and bladder meds, dialysis patients, gout, potassium, and hormones.",
      lessons: [
        {
          id: "6-1", title: "Prostate & bladder meds", emoji: "🚽", cat: "uro",
          concepts: [
            { h: "Prostate & bladder", p: [
              "An enlarged prostate (BPH) makes it hard for older men to pee. <b>Flomax (tamsulosin)</b> relaxes the prostate; <b>Proscar (finasteride)</b> shrinks it.",
              "<b>Ditropan (oxybutynin)</b> calms an overactive bladder (urgency, leaking).",
            ] },
          ],
          why: "Flomax can drop blood pressure when standing → fainting, especially getting up at night to pee. Bladder meds like oxybutynin can cause confusion in older adults.",
          drugs: [
            { g: "tamsulosin", say: "tam-SOO-loh-sin", what: "Flomax — makes it easier to pee with an enlarged prostate.", tip: "Can cause fainting when standing up." },
            { g: "finasteride", say: "fin-AS-ter-ide", what: "Proscar — shrinks an enlarged prostate." },
            { g: "oxybutynin", say: "ox-ee-BYOO-tih-nin", what: "Ditropan — for overactive bladder/leaking.", tip: "Can cause confusion in the elderly." },
          ],
          takeaways: ["Flomax/Proscar = enlarged prostate (BPH).", "Flomax → fainting when standing.", "Oxybutynin = overactive bladder."],
          qs: [
            { q: "An 80-year-old man fainted after getting up to pee at night. He recently started Flomax. Likely factor?", a: "Blood pressure drop when standing from Flomax", d: ["Flomax causes low sugar", "Flomax causes seizures", "Flomax is a blood thinner"], e: "Still assess for cardiac causes, but alpha blockers like Flomax are a classic cause of orthostatic syncope." },
          ],
        },
        {
          id: "6-2", title: "Kidney failure, potassium & gout", emoji: "🫘", cat: "kid",
          concepts: [
            { h: "Dialysis patients", p: [
              "When kidneys fail, patients go to <b>dialysis</b> (usually 3×/week) to clean their blood. They take <b>phosphate binders</b> like Renvela (sevelamer) with meals.",
              "Missed dialysis → potassium builds up → dangerous heart rhythms. <b>Never take a BP or start an IV in the fistula arm</b> (the arm used for dialysis).",
            ] },
            { h: "Potassium & gout", p: [
              "Potassium pills (Klor-Con) are often taken alongside water pills, which wash potassium out.",
              "<b>Gout</b> = painful uric acid crystals in a joint (often the big toe). Allopurinol prevents it; colchicine treats flares.",
            ] },
          ],
          why: "Dialysis patient + missed sessions + weakness or a slow heart rate → think high potassium. Protect the fistula arm.",
          drugs: [
            { g: "sevelamer", say: "seh-VEL-uh-mer", what: "Renvela — a phosphate binder for kidney failure/dialysis patients.", tip: "Means dialysis — protect the fistula arm." },
            { g: "potassium chloride", say: "poh-TASS-ee-um", what: "Klor-Con — a potassium supplement, often with water pills.", cats: ["lyte"] },
            { g: "allopurinol", say: "al-oh-PURE-ih-nol", what: "Zyloprim — prevents gout attacks.", cats: ["gout"] },
            { g: "colchicine", say: "KOL-chih-seen", what: "Colcrys — treats gout flares.", cats: ["gout"] },
          ],
          takeaways: ["Renvela = dialysis patient.", "No BP or IV in the fistula arm.", "Missed dialysis → high potassium.", "Allopurinol/colchicine = gout."],
          qs: [
            { q: "A dialysis patient has a fistula in the left arm. Where do you take the blood pressure?", a: "The right arm — never the fistula arm", d: ["The left arm", "Either arm", "Over the fistula itself"], e: "Compressing the fistula can damage it — it's their lifeline." },
            { q: "A dialysis patient missed two sessions and feels weak with a slow heart rate. Suspect:", a: "High potassium", d: ["Low potassium", "High cholesterol", "An asthma attack"], e: "Potassium builds up without dialysis and can cause deadly rhythms." },
          ],
        },
        {
          id: "6-3", title: "Hormones & birth control", emoji: "🌸", cat: "horm",
          concepts: [
            { h: "Estrogen & clots", p: [
              "Birth control pills with estrogen (like Yaz) and estrogen hormone therapy (Estrace) raise the risk of <b>blood clots</b> — DVT, PE, and stroke — especially in smokers over 35.",
            ] },
          ],
          why: "A young woman on birth control with sudden shortness of breath, chest pain when breathing, and a fast heart rate → think pulmonary embolism.",
          drugs: [
            { g: "drospirenone/ethinyl estradiol", say: "droh-SPY-reh-nown / ETH-ih-nil es-truh-DY-ol", what: "Yaz/Yasmin — an estrogen-containing birth control pill.", tip: "Raises clot risk (PE)." },
            { g: "estradiol", say: "es-truh-DY-ol", what: "Estrace — estrogen for menopause symptoms." },
          ],
          takeaways: ["Estrogen (birth control, hormone therapy) → blood clot risk.", "Sudden SOB + pleuritic chest pain + estrogen → think PE."],
          qs: [
            { q: "A 36-year-old smoker on birth control pills has sudden sharp chest pain when breathing, a fast heart rate, and low SpO₂. Top concern?", a: "Pulmonary embolism (a clot in the lungs)", d: ["A panic attack", "Heartburn", "A pulled muscle"], e: "Estrogen + smoking raises clot risk. Treat as a serious emergency." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 7, title: "Infections & Immunity", emoji: "🦠",
      desc: "Antibiotics, antivirals, and the meds that suppress the immune system.",
      lessons: [
        {
          id: "7-1", title: "Antibiotics", emoji: "🦠", cat: "abx",
          concepts: [
            { h: "Antibiotics", p: [
              "Antibiotics kill bacteria. One on the med list means a <b>current infection</b> — and infections can turn into <b>sepsis</b> (fever or low temp, fast heart rate, fast breathing, confusion, low BP).",
              "Penicillin-type drugs (amoxicillin) are the most common drug allergy.",
            ], list: [
              "Amoxicillin, Augmentin — penicillins (-cillin)",
              "Z-Pak (azithromycin), Keflex (cephalexin)",
              "Cipro (ciprofloxacin), Bactrim, Macrobid — common for UTIs",
            ] },
          ],
          why: "Patient on antibiotics who is getting worse → think sepsis. New rash, hives, or trouble breathing after starting an antibiotic → allergic reaction.",
          sfx: [{ x: "-cillin", cat: "abx" }, { x: "-floxacin", cat: "abx" }],
          drugs: [
            { g: "amoxicillin", say: "uh-mox-ih-SIL-in", what: "Amoxil — a very common penicillin antibiotic.", remember: "\"-cillin\"" },
            { g: "amoxicillin/clavulanate", say: "klav-yoo-LAN-ate", what: "Augmentin — a stronger version of amoxicillin." },
            { g: "azithromycin", say: "uh-zith-roh-MY-sin", what: "Zithromax (Z-Pak) — a 5-day antibiotic for respiratory infections." },
            { g: "cephalexin", say: "sef-uh-LEX-in", what: "Keflex — common for skin infections and UTIs." },
            { g: "ciprofloxacin", say: "sip-roh-FLOX-uh-sin", what: "Cipro — often for UTIs.", remember: "\"-floxacin\"" },
            { g: "sulfamethoxazole/trimethoprim", say: "sul-fuh-meth-OX-uh-zole", what: "Bactrim — for UTIs and skin infections (MRSA)." },
            { g: "nitrofurantoin", say: "ny-troh-fyoo-RAN-toyn", what: "Macrobid — used almost only for UTIs." },
          ],
          takeaways: ["Antibiotic = current infection → watch for sepsis.", "-cillin = penicillin (common allergy).", "Macrobid/Cipro/Bactrim → often a UTI."],
          qs: [
            { q: "An elderly patient on Macrobid for a UTI is now confused, feverish, with a fast heart rate and low BP. Suspect:", a: "Sepsis from the infection", d: ["A side effect of Macrobid only", "Low thyroid", "Seasonal allergies"], e: "UTIs are a common cause of sepsis and confusion in the elderly." },
          ],
        },
        {
          id: "7-2", title: "Antivirals", emoji: "🧬", cat: "av",
          concepts: [
            { h: "Antivirals", p: [
              "Antivirals fight viruses: <b>Valtrex</b> for herpes/shingles, <b>Tamiflu</b> for the flu, and <b>Biktarvy</b> for HIV. Truvada/Descovy are also taken by HIV-negative people to <b>prevent</b> HIV (PrEP).",
            ] },
          ],
          why: "Use standard precautions with everyone. Well-controlled HIV patients are not necessarily immunocompromised — don't assume.",
          drugs: [
            { g: "valacyclovir", say: "val-uh-SY-kloh-veer", what: "Valtrex — for herpes and shingles." },
            { g: "oseltamivir", say: "oh-sel-TAM-ih-veer", what: "Tamiflu — for influenza." },
            { g: "bictegravir/emtricitabine/tenofovir", say: "bik-TEG-ruh-veer", what: "Biktarvy — a once-daily complete HIV treatment." },
          ],
          takeaways: ["Valtrex = herpes/shingles.", "Tamiflu = flu.", "Biktarvy = HIV."],
          qs: [
            { q: "Tamiflu on a med list means:", a: "The patient currently has (or was exposed to) the flu", d: ["They have HIV", "They have herpes", "They have high blood pressure"], e: "Oseltamivir (Tamiflu) treats influenza." },
          ],
        },
        {
          id: "7-3", title: "Immune-suppressing meds", emoji: "🛡️", cat: "imm",
          concepts: [
            { h: "Turning the immune system down", p: [
              "<b>Transplant</b> patients take anti-rejection meds like <b>Prograf (tacrolimus)</b> and <b>CellCept (mycophenolate)</b> for life.",
              "<b>Autoimmune</b> diseases (rheumatoid arthritis, lupus, Crohn's) are treated with <b>methotrexate</b> and biologic shots like <b>Humira</b>.",
            ] },
          ],
          why: "These patients get infections easily and may not run a big fever. Treat a low-grade fever or \"just feeling off\" as a possible serious infection.",
          drugs: [
            { g: "tacrolimus", say: "tuh-KROH-lih-mus", what: "Prograf — an anti-rejection med for organ transplants." },
            { g: "mycophenolate", say: "my-koh-FEN-oh-late", what: "CellCept — another transplant anti-rejection med." },
            { g: "methotrexate", say: "meth-oh-TREX-ate", what: "For rheumatoid arthritis (taken weekly) and some cancers.", tip: "Taking it daily by mistake can be fatal." },
            { g: "adalimumab", say: "ay-duh-LIM-yoo-mab", what: "Humira — an injection for RA, Crohn's, and psoriasis." },
          ],
          takeaways: ["Prograf/CellCept = transplant patient.", "Methotrexate/Humira = autoimmune disease.", "Immunosuppressed → infections can be serious and sneaky."],
          qs: [
            { q: "A kidney-transplant patient on Prograf has a temp of 100.2°F and \"just feels off.\" How should you treat this?", a: "As a possible serious infection — they're immunosuppressed", d: ["As a minor cold — no concern", "As a Prograf overdose", "As seasonal allergies"], e: "Immunosuppression hides infection. Early sepsis can look mild." },
          ],
        },
      ],
    },
    // =====================================================================
    {
      n: 8, title: "Putting It Together", emoji: "🚑",
      desc: "Read whole med lists like a pro and spot the dangerous situations.",
      lessons: [
        {
          id: "8-1", title: "Reading a med list", emoji: "📋", pool: "combos",
          concepts: [
            { h: "How to read a med list", list: [
              "<b>1. Group the meds</b> by what they treat (blood pressure, diabetes, breathing…).",
              "<b>2. Look for giveaway meds:</b> Lasix/Entresto → CHF · Spiriva + home O₂ → COPD · Keppra → seizures · insulin → diabetes · Eliquis + Cardizem → A-fib · Suboxone → opioid use disorder · Renvela → dialysis",
              "<b>3. Ask the patient</b> — lists are often outdated. \"What do you take this for?\"",
              "<b>4. Bring the list or bottles</b> to the hospital.",
            ] },
            { h: "You already know most of these", p: [
              "Everything in this level uses meds from Levels 1–7. If one stumps you, open the 📖 library from the top bar.",
            ] },
          ],
          why: "A good med list is a shortcut to the patient's history — especially when they can't talk to you.",
          takeaways: ["Group meds → find the giveaways → confirm with the patient.", "Always bring the med list/bottles."],
        },
        {
          id: "8-2", title: "Dangerous situations", emoji: "🚨", pool: "pearls",
          concepts: [
            { h: "Red flags to remember", list: [
              "Blood thinner + head injury → possible brain bleed",
              "ED meds (-afil) → no nitro",
              "Beta blocker (-olol) → may hide tachycardia",
              "Sulfonylurea (glipizide) → low sugar comes back",
              "Opioids + benzos/alcohol → breathing stops",
              "Narcan wears off before long-acting opioids",
              "Long-term prednisone → adrenal crisis",
              "Dialysis → high potassium, protect the fistula arm",
              "Transplant/immunosuppressed → hidden infection",
            ] },
          ],
          why: "These are the situations where knowing the med changes what you do.",
          takeaways: ["Know the red flags — they're the whole point of learning meds as an EMT."],
        },
      ],
    },
  ],

  // Field scenarios from data.js used in Level 8 (skips paramedic-only treatment questions and untaught drugs)
  PEARL_IDS: ["pde5nitro", "bbshock", "headbleed", "su", "angio", "lith", "ss", "nms", "bup", "methadone", "patch", "keppra", "baclofen", "adrenal", "transplant", "fistula", "hyperk", "loopk", "apap", "rescue", "albuse", "anticholin", "ocp", "sglt2", "stim", "donepezil", "vivitrol", "phenytoin", "lamictal", "thyroid", "epipen", "glucagonkit", "opiobenzo", "dapt", "alpha", "bbhypo", "bbod", "dig", "bupropion", "tramadol"],
  // Med-list scenarios from data.js that lean on drugs the path doesn't teach
  COMBO_SKIP: ["pah1", "gastro1", "liver1", "aud1", "schizo1", "adhd1", "thy1", "pd1", "mig1"],
};
