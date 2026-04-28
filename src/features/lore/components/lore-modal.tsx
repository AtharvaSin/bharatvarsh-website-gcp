'use client';

import { FC, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EyebrowLabel, DocumentStamp } from '@/shared/ui';
import { cn } from '@/shared/utils';
import type { LoreItem } from '@/types';

// ========================================
// Types & Helpers
// ========================================

/**
 * Manual line-break overrides for the Section 1 hero headline. Names that
 * naturally carry a space (e.g. "Akakpen Tribe") wrap for free; names that
 * are one long word ("Bharatsena") overflow into the image column unless
 * we hand-split them. Extend this map as new edge cases appear.
 */
const DISPLAY_NAME_LINES: Record<string, string[]> = {
  Bharatsena: ['BHARAT', 'SENA'],
};

function getDisplayNameLines(name: string): string[] {
  return DISPLAY_NAME_LINES[name] ?? [name.toUpperCase()];
}

/**
 * Returns the large display headline for the Profile section.
 */
function getProfileHeadline(item: LoreItem): string {
  if (item.category === 'characters') {
    return item.tagline?.toUpperCase() ?? `THE ${item.subtype?.toUpperCase() ?? 'OPERATIVE'}.`;
  }
  return item.tagline?.toUpperCase() ?? 'FILE OVERVIEW.';
}

// ========================================
// Sub-Components
// ========================================

/**
 * Redacted Text Component — renders text with [REDACTED] segments as
 * obsidian-redacted bars that reveal their hidden content on hover.
 * Preserved from original lore-modal.
 */
const RedactedText: FC<{ text: string; redactionText?: string }> = ({
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redactionText = '████████',
}) => {
  return (
    <span className="transition-all duration-300">
      {text.split(/(\[REDACTED.*?\])/g).map((part, i) => {
        if (part.startsWith('[REDACTED')) {
          return (
            <span
              key={i}
              className="bg-[var(--obsidian-void)] text-[var(--obsidian-void)] hover:text-[var(--mustard-hot)] hover:bg-transparent px-1 rounded transition-colors duration-200 select-none hover:select-text cursor-crosshair"
            >
              {part.replace(/[\[\]]/g, '')}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

/**
 * Visual Hotspot Component — interactive anchor points positioned on the
 * banner image at exact x/y percentages. Preserved from original lore-modal.
 */
const ImageHotspot: FC<{ x: number; y: number; label: string; description?: string }> = ({
  x,
  y,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute z-20 group" style={{ left: `${x}%`, top: `${y}%` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 -ml-2 -mt-2 rounded-full border border-[var(--mustard-dossier)] bg-[var(--mustard-dossier)]/20 animate-pulse flex items-center justify-center hover:bg-[var(--mustard-dossier)] hover:scale-110 transition-all duration-300"
        aria-label={label}
      >
        <div className="w-1 h-1 bg-[var(--mustard-dossier)] rounded-full" />
      </button>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileHover={{ width: 40, opacity: 1 }}
        className="absolute top-1/2 left-4 h-px bg-[var(--mustard-dossier)] origin-left pointer-events-none group-hover:block hidden md:block"
      />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
        className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--obsidian-deep)]/90 border border-[var(--mustard-dossier)]/50 px-2 py-1 text-[10px] tracking-widest text-[var(--mustard-dossier)] uppercase whitespace-nowrap backdrop-blur-sm pointer-events-none"
      >
        {label}
      </motion.div>
    </div>
  );
};

// ========================================
// Section: Arc Timeline (characters only)
// ========================================

interface TimelineBeat {
  chapter: string;
  title: string;
  summary: string;
  spoiler?: boolean;
  seen?: boolean;
}

// Per-character "file record" cards — replace the empty trait-pill section
// with information-dense biographical extracts pulled from the canon
// (BHARATVARSH_CHARACTERS.md). Each card is small, non-clickable, text-only.
// Father per author canon: Dr. Arshad Qadir.
interface FileRecord {
  label: string;
  body: string;
}

const KAHAAN_FILE_RECORDS: FileRecord[] = [
  {
    label: 'BIRTH RECORD',
    body: '1991. New Delhi barracks hospital. Only child.',
  },
  {
    label: 'PARENTAGE',
    body: 'Father: Dr. Arshad Qadir, lead defence-biotech scientist. Mother: Aaliyah Khan, died of leukaemia in 1995.',
  },
  {
    label: 'EDUCATION',
    body: 'Elite cadet academy from age 14. Top of class. Senior officers tempered his rebellious streak into institutional loyalty.',
  },
  {
    label: 'FIRST CITATION',
    body: 'Congo, debut mission. Extracted twelve men from a rebel-held town. Earned a Purple Heart equivalent.',
  },
  {
    label: 'AFRICA, 2021',
    body: 'Body-shielded a comrade from a suicide bomber during a relief detail. Battlefield surgeons grafted the neural-diode lattice as a last resort.',
  },
  {
    label: 'PROMOTION TO MAJOR',
    body: 'Promoted in 2024 after a decisive border skirmish. Youngest officer of his rank. Flying guns in Bharatsena recruitment holograms.',
  },
  {
    label: 'AUGMENTATION',
    body: 'HUD monocle floats above the left eye. Twin remote pistols hover at shoulder height via the neural mag-holster lattice. Brace-Comm wrist projects mission data.',
  },
  {
    label: 'VULNERABILITY',
    body: 'EMP knocks out all control systems — his Achilles heel. PTSD triggered by loud energy blasts and the smell of burning circuitry.',
  },
];

// Rudra — deliberately origin-blind. No birth year, no childhood, no parentage.
// Another novel in the same timeline will explore his origins; until then all
// content here is anchored in his adult / public-myth history: Tribhuj
// leadership at the moment of the 1985 ban, twenty years of exile, and the
// creed he refused to trade. See BHARATVARSH_BIBLE.md §9.2 for the source.
const RUDRA_FILE_RECORDS: FileRecord[] = [
  {
    label: 'APPRENTICESHIP',
    body: 'Tutored by Tribhuj monks in archery, guerrilla tactics, and non-sectarian philosophy. Archery drills paired with multi-faith scripture.',
  },
  {
    label: 'THE CREED',
    body: 'Forged in an order whose first vow was that no civilian would ever be an acceptable cost. Core conviction: Bharatvarsh must survive together or not at all.',
  },
  {
    label: 'LEADER AT THE BAN',
    body: 'Commanded the Tribhuj on the day the Year-Turn Decree of 1985 outlawed every creed of choice. Refused to swear by caste, sect, or linguistic bloc. Refused to meet the decree with civilian blood.',
  },
  {
    label: 'THE EXILE',
    body: 'After the ban, Rudra disbanded what the state could see of his order and disappeared into the Nepal hills. He did not return for twenty years.',
  },
  {
    label: 'THE NAME HE ANSWERED TO',
    body: 'Tended mountain terraces. Taught village children breath-control and sling-shot geometry. Answered to no title but dada.',
  },
  {
    label: 'THE MYTH',
    body: "Within state propaganda, he is public enemy number one. Army archives list every other Tribhuj officer as dead; Rudra alone simply vanished off the map. In rebel taverns he is the Mountain Shadow — proof that one person armed with a moral law can still vex a nation-state.",
  },
  {
    label: 'ARMAMENT',
    body: 'Longbow, machete, and the iconic working-iron trident — battered, weight-forward, tool first, weapon second. No ceremonial trishul. Nothing ornate.',
  },
  {
    label: 'THE CREDO',
    body: "Soldiers may fight soldiers. Civilians never pay the price. \u201cDon\u2019t use lethal weapons. Knock them out.\u201d",
  },
];

// Pratap — public-facing "Smiling Architect of Order" framing only. Every
// hint of the novel's twist-level antagonism is OFF-LIMITS here: he must
// read as the benevolent father of the state everywhere a pre-reader could
// land. Grounded in Pratap Character Report §§1-6 (canon source).
const PRATAP_FILE_RECORDS: FileRecord[] = [
  {
    label: 'UNBROKEN SERVICE',
    body: '47 years of service. Seven administrations. Apex figure of the General Directorate since the Year-Turn. Zero ground ceded on the cohesion doctrine.',
  },
  {
    label: 'THE 1985 YEAR-TURN',
    body: 'The decree that dissolved every creed of choice and set the spine of the modern state. He held the line through the transition. The newspapers still call him the last unbroken promise of the Year-Turn.',
  },
  {
    label: 'THE SUPREME COMMAND',
    body: 'Head of the General Directorate. Parliament is ceremonial; martial tribunals rule national cohesion. His signature closes the room.',
  },
  {
    label: "THE DIRECTOR'S SIGNET",
    body: 'Right-hand ring. Ashoka wheel framed by triangular wings, engraved in brushed steel. Monochrome line, low polish. Issued only to the Supreme Commander.',
  },
  {
    label: 'HQ TOP FLOOR',
    body: 'Glass-walled command aerie above Indrapur. Raised-platform chair. A Chandragupta portrait, a live national map, and a framed constitutional preamble make the triangle his public gaze falls across.',
  },
  {
    label: "THE COMMANDER'S OMNI-HANDLE",
    body: 'Pen-length baton in an inner-coat sheath. A twist locks it into a 14cm punch-dagger. Reads as a stylus in public. A pointer on the war-room glass. A last-ditch blade when neither will do.',
  },
  {
    label: 'THE GLIDE-CAR PROTOCOL',
    body: 'Personal hover transport from the state motor pool. Rear-cabin privacy dimming. Door opens, smile on. Door closes, smile dies, eyes to dossier.',
  },
  {
    label: 'THE TWO VOICES',
    body: 'Public: baritone calm, micro-smiles you can hear. War room: the volume scarcely rises, but the vocabulary sharpens and the cadence shortens. Authority by weight, never by volume.',
  },
];

// Hana — grounded in Hana Character Report (§§IV-IX) + Phase 1-3 Visual
// Bible. Father is Colonel Arvind. Any link between him and the regime's
// historical crimes is twist-level reveal and stays in spoiler beats only.
const HANA_FILE_RECORDS: FileRecord[] = [
  {
    label: 'RANK & POST',
    body: 'Major, Tactical Operations. Second-in-command to Major Kahaan. Indrapur HQ. Brass privately concede they keep her in the frame because she dilutes his ruthlessness just enough to keep junior teams loyal.',
  },
  {
    label: 'THE FATHER',
    body: "Colonel Arvind. Decorated war-hero sniper. Raised her on mahogany-table dinners and kill-shot anecdotes. Overheard at seven, about his next child: \u201cNext one will be a boy.\u201d She asked for his service manual and began memorising calibres.",
  },
  {
    label: 'TRISHUL ACADEMY',
    body: "Entered two years early. Washed near-last her first term. Stalked the 100-yard range at dawn until she broke the academy record her father had set. The only praise he offered: \u201cGood grouping.\u201d",
  },
  {
    label: 'FIRST BLOOD',
    body: 'Commissioned at nineteen. Volunteered for a Jharkhand insurgency sweep. The after-action report read collateral villages neutralised. She remembers a clay stove still warm beside a child\u2019s sandal.',
  },
  {
    label: 'THE TWO HANAS',
    body: "Mission Hana answers in three-word sentences and shoots dead-centre groupings at 800m. Off-shift Hana quotes Tagore between gun-cleanings and sneaks contraband storybooks to the quartermaster\u2019s children. Both are authentic. The mask is a timing device.",
  },
  {
    label: 'THE INNER WAR',
    body: 'She can slide an ambassador\u2019s arrival, a weapons drop and a hostage exchange five minutes each without letting any party know it moved. She has also, lately, begun doctoring mission logs to hide unnecessary brutality. The second skill costs her something every time.',
  },
  {
    label: 'TELL-TALE FLAWS',
    body: 'Micro-delays under fire when non-combatants are in frame. Recurring night terrors on a predictable cycle. A dangerous susceptibility to praise from father-figures.',
  },
  {
    label: 'THE COLLAR-STRAIGHTEN',
    body: "Her signature quiet go-signal. Two fingers on Kahaan\u2019s collar before an op. No flourish. Recruits say that when Hana straightens Kahaan\u2019s collar, the operation is officially under way.",
  },
];

// Arshi — grounded in Arshi Character Report Phase 1 (Canon DNA Lock).
// Princess of Akakpen, adopted heir of Kaali (per author direction + the
// Abolition Decrees naming rule from the Surya comic canon). Late-arc
// character: only two visible beats. Rest is classified.
const ARSHI_FILE_RECORDS: FileRecord[] = [
  {
    label: 'HERITAGE',
    body: 'Adopted heir of Queen Kaali under the law that made bloodline and choice legally equal. Raised inside the Akakpen treaty hills. Carries the tribe without blood claim.',
  },
  {
    label: 'TRAINING',
    body: "Cross-trained on sword, bow, mixed martial arts, and firearms. Reads as cross-trained, not ornamental. A climber\u2019s conditioning implied, never calloused on-camera.",
  },
  {
    label: 'THE BLUE GAZE',
    body: 'Deep cool blue #0F2749. Almond-shape with slight inner fold. No heterochromia, no retouch. The single feature that tells the Akakpen court who is standing in front of it.',
  },
  {
    label: 'THE AKAKPEN KNOT',
    body: "Tribe insignia. Worn as a 30mm brooch or sash clasp in formal carriage; an 80mm heat-press on the field cloak. Princess-scale only \u2014 the queen\u2019s gold hair-ring stays off-limits until succession.",
  },
  {
    label: 'ARMAMENT',
    body: 'Compact pulse gun carried inside the waistband at four o\u2019clock. Matte graphite chassis, white ceramic inlays, amber status LEDs. Default mode: STUN. Ceremonial short sword and bow stay holstered in the Council halls.',
  },
  {
    label: 'THE ALPINE DRESS',
    body: 'White alpine cloak with balaclava and reflective goggles parked on the crown. Charcoal soft-armor beneath. Modular belt. Mountain boots with integrated steel teeth.',
  },
  {
    label: 'THE STILLNESS RULE',
    body: "Early arc: defiance signature \u2014 chin lifts two degrees, weight on the rear foot, gaze held one to two seconds before speech. Late arc: authority signature \u2014 feet planted shoulder-width, pelvis neutral, minimal head movement, eye contact held through a full clause. She begins the chronicle loud. She ends it still.",
  },
  {
    label: 'THE RETURN',
    body: 'An ICU corridor. Her mother under bandage. An order the state did not author. She does not sit down.',
  },
];

// Surya — grounded in Surya Character Report + Surya Storyline (comic,
// /docs/surya-comic/SURYA_STORYLINE.md). Only two visible beats per
// author direction: he arrives late in the novel and his arc is hunt-level
// spoiler. All Operation KACHA / TRIDENT / Q-stroke references stay under
// the classified flag.
const SURYA_FILE_RECORDS: FileRecord[] = [
  {
    label: 'NO PATRONYMIC',
    body: "Bharatvarsh\u2019s Abolition Decrees require every second name to be a father\u2019s given name. Surya has neither. Unregistered, foundling, or both. The paperwork starts from scratch.",
  },
  {
    label: 'THE GUHYAKAS',
    body: 'Classified off-record strike cell inside Bharatsena. Adaptive camo. No insignia, no rank tape, no name board. Missions end with their own archive entries sealed.',
  },
  {
    label: 'THE FIRST CRACK',
    body: "An ice-ridge rescue in his mid-twenties. Ordered to abandon a trapped civilian surveyor. He bent the order. In the confiscation bin he pocketed a small metal tag stamped with a classification code he did not yet know how to read. He has been carrying it, unknowing, ever since.",
  },
  {
    label: 'THE REAGENT TRAIL',
    body: "A coastal port interdiction. \u201cMedical reagents\u201d in a shipping container. He photographed a crate stamp and a Directorate watermark on the customs paperwork. He filed both photographs in a place his handler could not reach.",
  },
  {
    label: 'THE FALLEN BROTHER',
    body: "An ambush on a shadow interdiction around a foreign lithium corridor. Prateek Punya killed covering retreat. The copper range tag from Prateek\u2019s bootlace ends up in Surya\u2019s hand. Things after this feel louder.",
  },
  {
    label: 'THE RED ARMBAND',
    body: "Moral-state indicator. Not regulation. Starts the chronicle muted. It only saturates the night he clears a desert perimeter and chooses to keep going.",
  },
  {
    label: 'THE PAPER TRAIL',
    body: 'Months of solo surveillance across a procurement district after the chronicle\u2019s midpoint. A signature he does not yet know how to read. The same three-dot watermark on every page. A program name he does not yet know the shape of.',
  },
  {
    label: 'OBEDIENCE \u2192 CONSCIENCE \u2192 JUSTICE',
    body: "Earned in that order. No shortcut. He does not become a vigilante overnight \u2014 he spends an entire mission log becoming one, one bent order at a time.",
  },
];

// Kaali — grounded in Kaali Character Report Phase 1 Canon DNA + Visual
// DNA Kit Phase 2. Present-arc state is the ICU frame. Pre-injury content
// (taught the bow to Arshi, short sword, council hall) stays visible. The
// novel-climax promise pay-off is spoiler territory.
// Bharatsena — the ruling military state. Manuscript-grounded first,
// knowledge-base fallback where manuscript is silent. Every phrase tagged
// [MS] in the plan file was grep-verified in MahaBharatvarsh V3.pdf before
// this constant was written. The Pratap quote is manuscript-verbatim and
// reads as state philosophy, not as a hint at the twist-level reveal.
const BHARATSENA_FILE_RECORDS: FileRecord[] = [
  {
    label: 'THE DIRECTORATE',
    body: "Apex command body of Bharatvarsh, headed by General Pratap. \u201CBy order of the Directorate we are here on a limited retrieval\u201D is how a Major introduces himself at an Akakpen gate. The Directorate does not fear the U.N., but it fears optics across the hills. Parliament is ceremonial; civil courts defer to martial tribunals on matters of national cohesion.",
  },
  {
    label: 'THE TRIBHUJ BAN (1984)',
    body: "\u201CTribhuj is declared a terrorist organisation for almost half a century now. Any claim of association with them is considered treason.\u201D Every chapter of the Tribhuj Puran now carries the archive stamp \u201CBanned after 1984 A.D.\u201D on the footer. The edict that defined the modern state and its enemies in a single line.",
  },
  {
    label: 'THE PUBLIC BRAND',
    body: "Harmony. Prosperity. Growth. Peace-through-strength posture. Foreign ministries push green-tech exports and polished optics abroad; counter-espionage games run underneath the slogan like wiring under a carpet.",
  },
  {
    label: 'THE UNIFORM CODE',
    body: "Powder-blue shirt, navy trousers, open navy officer\u2019s over-coat. Large monochrome Ashoka wheel with triangular wings centred on the back. Small emblem, left shoulder. Right shoulder text-only \u2014 plain block, ALL CAPS, division call-sign. No slogans. No graphic noise.",
  },
  {
    label: 'CURFEW DISCIPLINE',
    body: "Indrapur sleeps under the exacting discipline of its curfew drones, whose slow, patient circuits paint the avenues with cones of white. Curfew runs 9 PM to 6 AM in the metropoles. Permit or lock-up. \u201CPull the drone nest to forty meters for overwatch, loop a med-corridor along the south fence, and keep the hovercams above the stage\u201D is a Major\u2019s first-minute instinct during a crisis.",
  },
  {
    label: 'THE MESH',
    body: "Wrist-scan checkpoints at street-scale. Brace-Comm wrist-bands that project comms and handle payments. HUD monocles glowing electric-blue over an augmented officer\u2019s left eye. Hypersonic autopilots that let commanders read dossiers mid-flight. Glide-cars below five metres \u2014 silent, paying on their own. The infrastructure of polite inevitability.",
  },
];

// Akakpen Tribe — the treaty people of the eastern hills of Arunachal.
// Every [MS] tag in the plan was manuscript-grep-verified. Flag colour is
// saffron (manuscript), not the deep greens of the dress palette. Council
// chamber is the round table with seven chairs, not "Queen's Council".
const AKAKPEN_FILE_RECORDS: FileRecord[] = [
  {
    label: 'THE EASTERN HILLS OF ARUNACHAL',
    body: "\u201CWe\u2019re from the Akakpen tribe of the eastern hills of Arunachal.\u201D A semi-sovereign people whose treaty-won pocket of autonomy is the only stretch of ground the Directorate does not walk freely on. The might of the east.",
  },
  {
    label: 'THE TREATY OF THE EASTERN HILLS',
    body: "Negotiated after decades of stalemate, when Tribhuj had lost everywhere else and only these hills held. Kaali signed to run her tribe. Rudra called it \u201Ca dictatorship of different kind\u201D and left the order over the compromise. The treaty is the only reason the Akakpen gate is still a gate.",
  },
  {
    label: 'THE ROUND TABLE',
    body: "The council chamber. The round table. The seven chairs. The map of the hills \u2014 not the army\u2019s sterile satellite print but the Akakpen inked by hand, ridge by ridge, river by river, annotated with names and jokes and warnings that existed nowhere else.",
  },
  {
    label: 'THE TRESPASS-GRIDS',
    body: "Perimeter defence at the Akakpen gate. \u201CIt is not ceremonial. These grids will put you on the ground if you walk through without shield plates active.\u201D Any Directorate regular who wants to parley stands at the mouth, carries mechanical shields, and talks first. The gate does not open for boots.",
  },
  {
    label: 'THE NON-LETHAL DART',
    body: "A small tube in the neck. A short leaf of feathered plastic still quivering as if it was breathing. \u201CThe dart was one of theirs. Akakpen used the same pattern when they needed men to stop without dying.\u201D Restraint by design \u2014 a tribe-wide extension of the creed Rudra refused to trade.",
  },
  {
    label: 'THE CAPITAL VILLAGE',
    body: "Wooden cabins raised slightly off the ground on stone piers. Shutters the colour of river mud. Flags a tired saffron fluttering off the porch rails. An administrative quarter that does not look like one from the outside. The Akakpen keep their offices the way they keep their treaty: visible to those invited, invisible to a satellite.",
  },
];

// ========================================
// Location Dossier — Site Spec Sheet + Chronicle Footprint
// ========================================
// Locations get their own lightweight dossier template distinct from
// characters (8 sections, arc beats, relationships) and factions (6 file
// records + hotspots). Every spec row and every chronicle scene is
// manuscript-grounded (V3 PDF) or flagged as KB fallback. The template:
//
//   Section 2 (File Records slot) → Site Spec Sheet (label/value panel)
//   Section 6 (Arc Timeline slot)  → Chronicle Footprint (scenes)
//
// Both branches are gated on item.category === 'locations'.

interface SiteSpecRow {
  label: string;
  value: string;
}

interface ChronicleScene {
  chapter: string; // e.g. "CH 03", "NIGHT 0", "20-10"
  title: string;
  summary: string;
}

const INDRAPUR_SPECS: SiteSpecRow[] = [
  { label: 'COORDINATES',     value: '28.6\u00B0N 77.2\u00B0E' },
  { label: 'JURISDICTION',    value: 'NATIONAL CAPITAL \u00B7 DIRECTORATE SEAT' },
  { label: 'FORMERLY',        value: 'INDRAPRASTHA' },
  { label: 'CONTROL',         value: 'GENERAL PRATAP \u00B7 THE DIRECTORATE' },
  { label: 'ACCESS',          value: 'CLEARANCE REQUIRED' },
  { label: 'AMBIENT',         value: 'CURFEW DRONES \u00B7 9 PM \u2013 6 AM' },
  { label: 'SIGNATURE SPACE', value: 'TOP-FLOOR COMMAND AERIE' },
  { label: 'WALL TRIANGLE',   value: 'CHANDRAGUPTA \u00B7 MAP \u00B7 PREAMBLE' },
];

const LAKSHMANPUR_SPECS: SiteSpecRow[] = [
  { label: 'COORDINATES',       value: '26.8\u00B0N 80.9\u00B0E' },
  { label: 'JURISDICTION',      value: 'CAPITAL CITY OF UTTAR PRADESH' },
  { label: 'BLOC',              value: 'NORTHERN PLAINS COMMAND' },
  { label: 'CONTROL',           value: 'BHARATSENA' },
  { label: 'ACCESS',            value: 'OPEN (UNDER THE MESH)' },
  { label: 'AMBIENT',           value: 'DENSE HOVERCAM COVERAGE' },
  { label: 'SIGNATURE EVENT',   value: 'ANNUAL FESTIVE FORTNIGHT \u00B7 OCTOBER' },
  { label: 'CHRONICLE WEIGHT',  value: '20-10 ORIGIN SITE' },
];

const TREATY_ZONE_SPECS: SiteSpecRow[] = [
  { label: 'JURISDICTION',    value: 'SEMI-SOVEREIGN \u00B7 AKAKPEN' },
  { label: 'TERRITORY',       value: 'EASTERN HILLS OF ARUNACHAL' },
  { label: 'CONTROL',         value: 'THE ROUND TABLE \u00B7 QUEEN KAALI' },
  { label: 'TREATY',          value: 'TREATY OF THE EASTERN HILLS' },
  { label: 'ACCESS',          value: 'TRESPASS-GRID + COUNCIL WRIT' },
  { label: 'DOCTRINE',        value: 'NON-LETHAL FIRST' },
  { label: 'MESH FOOTPRINT',  value: 'ZERO (ENDS AT THE TREELINE)' },
  { label: 'FLAG COLOUR',     value: 'TIRED SAFFRON' },
];

const MYSURU_SPECS: SiteSpecRow[] = [
  { label: 'COORDINATES',      value: '12.3\u00B0N 76.6\u00B0E' },
  { label: 'JURISDICTION',     value: 'PENINSULAR COMMAND' },
  { label: 'TERRAIN',          value: 'GRANITIC PLATEAU' },
  { label: 'SIGNAGE',          value: 'EN \u00B7 HI \u00B7 TELUGU (TRI-SCRIPT)' },
  { label: 'CONTROL',          value: 'BHARATSENA \u00B7 LOCAL R&D AUTHORITY' },
  { label: 'TRANSPORT',        value: 'HYPERLOOP \u00B7 PANTHERA ARMOUR' },
  { label: 'FUNCTION',         value: 'OPTICS \u00B7 BIOMED \u00B7 MILITARY R&D' },
  { label: 'CHRONICLE WEIGHT', value: '20-10 BOMBING \u00B7 JUNCTION MALL' },
];

const LOCATION_SPECS_BY_NAME: Record<string, SiteSpecRow[]> = {
  'Indrapur HQ':     INDRAPUR_SPECS,
  'Lakshmanpur':     LAKSHMANPUR_SPECS,
  'The Treaty Zone': TREATY_ZONE_SPECS,
  'Mysuru':          MYSURU_SPECS,
};

const INDRAPUR_SCENES: ChronicleScene[] = [
  { chapter: 'CH 03',  title: 'THE ASSIGNMENT', summary: "Pratap summons Kahaan to the top-floor aerie. The signet catches the light as the 20-10 case is placed in the Major\u2019s hands." },
  { chapter: 'NIGHT 0', title: 'THE CURFEW',    summary: "Indrapur sleeps under the exacting discipline of its curfew drones. Slow, patient circuits paint the avenues with cones of white. Curfew breaks at dawn \u2014 like a rotten plank under a foot." },
  { chapter: 'CH \u2014',  title: 'THE CONTACT',    summary: "A stolen phone stirs in a dead room. A number tilts into memory from a card in Kaali\u2019s box: Kriya Chandan \u2014 Indrapur. Breath. Silence. The line goes dead." },
];

const LAKSHMANPUR_SCENES: ChronicleScene[] = [
  { chapter: 'CH 01', title: 'THE FESTIVE FORTNIGHT', summary: "The last Friday of October. The last night of the annual festive fortnight. Energy and excitement palpable through the air. People gather in the heart of the capital city Lakshmanpur of Uttar Pradesh." },
  { chapter: 'CH 01', title: 'THE THEATRE',           summary: "The outlier for theatrics. A stage. Pamphlets. A voice that does not match the programme. A word \u2014 Tribhuj \u2014 spoken aloud for the first time in almost half a century." },
  { chapter: 'CH 02', title: 'THE OVERPASS',          summary: "A crater where a food stall had been. Bowls turned into shrapnel. A hand-cart embedded in the side of a van as if the city had tried to absorb the blow with an organ it could spare." },
];

const TREATY_ZONE_SCENES: ChronicleScene[] = [
  { chapter: 'CH \u2014', title: 'THE GATE',       summary: "\u201CThe Akakpen guard their perimeter with trespass-grids. It is not ceremonial. These grids will put you on the ground if you walk through without shield plates active.\u201D A Major stands at the mouth. He talks first." },
  { chapter: 'CH \u2014', title: 'THE ROUND TABLE', summary: "Seven chairs. A map of the hills inked by hand. Arshi\u2019s first council word, sharp enough to quiet the room: \u201CThe non-lethal saved us. I\u2019m here because you showed restraint.\u201D" },
  { chapter: 'CH \u2014', title: 'THE BEDSIDE',     summary: "An ICU bed. An oxygen mask. A covenant exchanged decades ago, called in through fog. The Mountain Shadow\u2019s exile ends in a single whispered sentence." },
];

const MYSURU_SCENES: ChronicleScene[] = [
  { chapter: '20-10', title: 'JUNCTION MALL',  summary: "Fourteen synchronized detonations across a five-storey transit-mall. \u201CIt was an ode to the engineers that the building was still standing.\u201D" },
  { chapter: 'CH \u2014', title: 'THE LANDING',    summary: "An army jet at golden hour. Dark grey at the bottom, bright orange at the top. A matte charcoal Panthera waits on the apron. Colonel Charanpreet, edges tight, centre spare." },
  { chapter: 'CH \u2014', title: 'THE HOTEL ROOM', summary: "A deputy lost. A door camera looped twelve seconds. A scent marker missed by the sink \u2014 cheap hotel soap, not his." },
];

const LOCATION_SCENES_BY_NAME: Record<string, ChronicleScene[]> = {
  'Indrapur HQ':     INDRAPUR_SCENES,
  'Lakshmanpur':     LAKSHMANPUR_SCENES,
  'The Treaty Zone': TREATY_ZONE_SCENES,
  'Mysuru':          MYSURU_SCENES,
};

// ========================================
// Tech Dossier — Equipment File + Recorded Uses
// ========================================
// Tech items get their own template distinct from characters, factions,
// and locations:
//
//   Section 2 (File Records slot) → Equipment File (4×2 datachip grid)
//   Section 6 (Arc Timeline slot)  → Recorded Uses (3 manuscript-cited scenes)
//
// Spec chips are compact label/value pairs (DataChip type). Recorded Uses
// reuses the existing ChronicleScene shape since the rendering semantics
// match (chapter/title/summary), but with a different section heading.

interface DataChip {
  label: string;
  value: string;
}

const BRACECOMM_SPECS: DataChip[] = [
  { label: 'TYPE',     value: 'WRIST COMMAND SLEEVE' },
  { label: 'LINEAGE',  value: 'SMARTPHONE SUCCESSOR' },
  { label: 'DISPLAY',  value: '2D TILE + 3D HOLO' },
  { label: 'BANDS',    value: 'PUBLIC \u00B7 PATROL \u00B7 PRIVATE' },
  { label: 'AUTH',     value: 'BIOMETRIC (PULSE + SKIN)' },
  { label: 'HAPTIC',   value: 'PULSE \u00B7 DOUBLE-TAP' },
  { label: 'STEALTH',  value: 'DARK ROOM \u00B7 FACE-DOWN' },
  { label: 'INNOVATOR', value: 'JUNAID STEELS' },
];

const DART_SPECS: DataChip[] = [
  { label: 'TYPE',     value: 'NON-LETHAL SIDEARM MUNITION' },
  { label: 'ISSUED BY', value: 'AKAKPEN' },
  { label: 'PAYLOAD',  value: 'SLEEP-SAP' },
  { label: 'FORM',     value: 'TUBE \u00B7 FEATHERED TAIL' },
  { label: 'DOCTRINE', value: 'NON-LETHAL FIRST' },
  { label: 'RATED',    value: 'TRIBE-VS-TRIBE DISPUTES' },
  { label: 'AIM POINT', value: 'LATERAL NECK' },
  { label: 'STORAGE',  value: 'COUNCIL ARMORY' },
];

const OXY_POLE_SPECS: DataChip[] = [
  { label: 'TYPE',        value: 'AIR-SCRUB PYLON' },
  { label: 'ALSO',        value: 'HOVERCAM + PA + SENSOR MOUNT' },
  { label: 'FORM',        value: 'ENGINEERED TREE' },
  { label: 'FUNCTION',    value: 'CO\u2082 \u2192 O\u2082' },
  { label: 'FIELDED',     value: 'STATE ADMINISTRATION' },
  { label: 'MAINTENANCE', value: 'HARNESS CREW AT CROWN' },
  { label: 'SOUND',       value: 'HUMS LIKE A LOW VOW' },
  { label: 'BASE NOTICE', value: 'DO NOT FIDDLE' },
];

const PULSE_GUN_SPECS: DataChip[] = [
  { label: 'TYPE',       value: 'PULSE SIDEARM' },
  { label: 'ISSUED BY',  value: 'AKAKPEN ROUND TABLE' },
  { label: 'CHASSIS',    value: 'MATTE GRAPHITE' },
  { label: 'INLAYS',     value: 'WHITE CERAMIC' },
  { label: 'CARRY',      value: 'IWB \u00B7 4-O\u2019CLOCK' },
  { label: 'MODES',      value: 'STUN \u00B7 DISRUPT \u00B7 LETHAL' },
  { label: 'DEFAULT',    value: 'STUN' },
  { label: 'STATUS LED', value: 'AMBER' },
];

const MESH_SPECS: DataChip[] = [
  { label: 'TYPE',       value: 'NATIONAL SURVEILLANCE FABRIC' },
  { label: 'DRONES',     value: 'CURFEW \u00B7 40m HOVERCAM' },
  { label: 'GROUND',     value: 'WRIST-SCAN \u00B7 OXY-POLE' },
  { label: 'ROUTING',    value: 'BRACE-COMM LAYER' },
  { label: 'CURFEW',     value: '9 PM \u2013 6 AM' },
  { label: 'BRAND',      value: 'HARMONY \u00B7 PROSPERITY \u00B7 GROWTH' },
  { label: 'RETENTION',  value: '30 DAYS PUBLIC' },
  { label: 'EDGE',       value: 'ENDS AT THE TREELINE' },
];

const HUD_MONOCLE_SPECS: DataChip[] = [
  { label: 'TYPE',      value: 'OCULAR OVERLAY' },
  { label: 'STANDARD',  value: 'HELMET / VISOR HUD' },
  { label: 'AUGMENTED', value: 'FLOATING MONOCLE' },
  { label: 'READOUT',   value: 'WIND \u00B7 ELEV \u00B7 RANGE \u00B7 FUEL' },
  { label: 'COLOUR',    value: 'ELECTRIC-BLUE TICK' },
  { label: 'INPUT',     value: 'TEMPLE-TAP \u00B7 GAZE-INTENT' },
  { label: 'PAIR',      value: 'NEURAL-DIODE LATTICE' },
  { label: 'FIELD RULE', value: 'OFF IN HQ \u00B7 ON IN FIELD' },
];

const TECH_SPECS_BY_NAME: Record<string, DataChip[]> = {
  'Bracecomm':     BRACECOMM_SPECS,
  'Dart':          DART_SPECS,
  'Oxy Pole':      OXY_POLE_SPECS,
  'Pulse Gun':     PULSE_GUN_SPECS,
  'The Mesh':      MESH_SPECS,
  'HUD Monocle':   HUD_MONOCLE_SPECS,
};

const BRACECOMM_USES: ChronicleScene[] = [
  { chapter: 'CH 01', title: "IN KAALI\u2019S CONVOY", summary: "\u201CHer Brace-Comm pulsed against her wrist, pinging unanswered bands, then dimmed as if it understood the rules out here \u2014 transmit and you get triangulated; cry and you get found.\u201D" },
  { chapter: 'CH \u2014', title: "AT ADIL\u2019S ROLL CALL", summary: "Muted under a bowl, the device gives a tiny offended chirp and quiets. A private-line message lands in the kitchen: \u201CADIL: Roll call in 30. Don\u2019t make me be interesting.\u201D" },
  { chapter: 'CH \u2014', title: "THE GARAGE RELEASE", summary: "\u201CHe thumbed a release on the Brace-Comm and the garage elevator gave up his vehicle as if embarrassed to have kept it.\u201D" },
];

const DART_USES: ChronicleScene[] = [
  { chapter: 'CH \u2014', title: 'THE PINE-BED AMBUSH', summary: "Three Directorate helicopters sit in a clearing that isn\u2019t a forest. Around them, men in Directorate uniform lie in the needle bed, not sleeping. Small tubes in their necks. Feathered plastic still quivering." },
  { chapter: 'CH \u2014', title: 'THE GATE PROTOCOL',   summary: "Darts are the first response at the Akakpen gate. Trespass-grids are the second. A third response exists but has not yet been needed in the chronicle." },
  { chapter: 'CH \u2014', title: '[CLASSIFIED]',          summary: "Any regular who has woken up in the pine-bed with no memory of the last forty minutes has been told this use-case does not exist." },
];

const OXY_POLE_USES: ChronicleScene[] = [
  { chapter: 'CH 02', title: 'THE MORNING AFTER 20-10', summary: "\u201CAbove, the oxy-poles \u2014 those tall, engineered trees that fed districts with oxygen and quiet \u2014 hummed like low vows.\u201D A deserted street the morning after the bombings." },
  { chapter: 'CH \u2014', title: 'THE MAINTENANCE CALL',   summary: "Rudra in Kolkata disguise sees a crew working on top of an oxy-pole, hanging from a harness. \u201CThey convert carbon dioxide into\u2026\u201D the driver explains. Rudra does not listen to the rest." },
  { chapter: 'CH \u2014', title: "JWALA\u2019S BROADCAST",  summary: "\u201COxy-poles on corners where bodies leaned to breathe through masks that cost too much.\u201D The poles become the backdrop for every state promise that stopped being true." },
];

const PULSE_GUN_USES: ChronicleScene[] = [
  { chapter: 'CH \u2014', title: 'THE ALPINE TREK',      summary: "Arshi carries the pulse gun across the ridge in the trek that opens her chronicle. Hood up, goggles parked on the crown. The holster stays closed. The hand stays near." },
  { chapter: 'CH \u2014', title: 'THE GATE STANDOFF',    summary: "A Directorate officer stands at the Akakpen mouth in blue-hour light. Arshi keeps the pulse gun IWB, palms at rib height. De-escalation works, this time." },
  { chapter: 'CH \u2014', title: '[CLASSIFIED]',          summary: "The first time the selector moves past STUN is not a scene the chronicle permits you to read before you\u2019ve earned it." },
];

const MESH_USES: ChronicleScene[] = [
  { chapter: 'CH 02', title: 'THE CURFEW CONES',        summary: "\u201CIndrapur slept under the exacting discipline of its curfew drones, whose slow, patient circuits painted the avenues with cones of white.\u201D" },
  { chapter: 'CH \u2014', title: "THE MESH-BREAKER\u2019S KIT", summary: "\u201CThin sleeves on their forearms \u2026 a derma-mesh sat on the curve of each ear and the line of the jaw, bending heat signatures by degrees and fooling the faceprint by one part in a hundred.\u201D How the New Tribhuj operators walk past a camera." },
  { chapter: 'CH \u2014', title: 'THE TRESPASS THRESHOLD', summary: "A Directorate vehicle rolls past a treeline in the eastern hills. Every piece of state hardware on board goes quiet at once. The Mesh has ended." },
];

const HUD_MONOCLE_USES: ChronicleScene[] = [
  { chapter: 'PROLOGUE', title: 'THE SNIPER NEST',  summary: "\u201CHe settled one knee, let out a breath, and read the numbers at the top right of his HUD. Wind speed: 0.5 km/h, NW. Elevation: \u22124\u00B0. Range: 187 m.\u201D" },
  { chapter: 'CH 02', title: 'THE BIKE WAKING',      summary: "\u201CThe HUD climbed the visor and laid icons like faint stars. On the right, the call glyph and a map slice; on the left, engine health, gear, fuel, a small pulsing dot that meant nothing to anyone who wasn\u2019t him.\u201D" },
  { chapter: 'CH \u2014', title: 'THE HOTEL RECONSTRUCTION', summary: "Kahaan taps the visor\u2019s temple. \u201CThe helmet obligingly put little ghost vectors into the air for only him to see. Green lines fanned, intersected, remembered gravity.\u201D" },
];

const TECH_USES_BY_NAME: Record<string, ChronicleScene[]> = {
  'Bracecomm':     BRACECOMM_USES,
  'Dart':          DART_USES,
  'Oxy Pole':      OXY_POLE_USES,
  'Pulse Gun':     PULSE_GUN_USES,
  'The Mesh':      MESH_USES,
  'HUD Monocle':   HUD_MONOCLE_USES,
};

const KAALI_FILE_RECORDS: FileRecord[] = [
  {
    label: 'THE CROWN',
    body: "Queen of the Akakpen. A semi-autonomous treaty people of the Eastern and Himalayan wilds. She rules through a Queen\u2019s Council \u2014 never from a palace.",
  },
  {
    label: 'HER PEOPLE',
    body: "Non-lethal first doctrine inside the tribe. Lethal force reserved only for outside invaders. A people who kept their traditions from before the Mesh, in valleys the state\u2019s maps still label no-fly.",
  },
  {
    label: 'THE COUNCIL HALL',
    body: 'Cedar and stone. Low firelight. Her stillness turns the room into a throne room without any throne.',
  },
  {
    label: 'THE BOW',
    body: 'Short recurve, matte deep green, leather-wrapped grip. Ceremonial-meets-practical. She taught her heir, Arshi, on the old mountain fields \u2014 an inheritance that never made the state\u2019s records.',
  },
  {
    label: 'THE SHORT SWORD',
    body: 'Straight, single-edge, 18\u201322 inches. Brushed low-gloss. Minimal brass guard. A weapon she knows well enough to never have to prove.',
  },
  {
    label: 'THE GREEN PALETTE',
    body: "Dark olive regalia, fine gold piping, a single antique-gold hair-ring at the crown. The tribe\u2019s only sovereign hardware. No chrome, no neon, no glossy armour. Authority reads as cloth, not clamour.",
  },
  {
    label: 'THE WOUND',
    body: "A field burn. A half-head bandage. A right-side eye covered. An oxygen mask that softly fogs on exhale. The gold ring placed on the bedside tray. A narrow dark-green shawl strip laid across the chest \u2014 authority persists.",
  },
  {
    label: 'AUTHORITY IN STILLNESS',
    body: "She does not raise her voice. Not ever. When she is angry the volume barely rises \u2014 the pauses sharpen. Everyone in the room leans in.",
  },
];

// Kahaan's canon arc — derived from BHARATVARSH_CHARACTERS.md "Four-Act Arc" +
// "Key Scenes". Beats 1-3 are Act I-II (safe for pre-readers); beats 4-6 are
// Act III-IV spoiler territory and use vague language + the `spoiler` flag so
// nothing is revealed without reading the novel. Nothing in this array hints
// at any specific antagonist.
const KAHAAN_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE ASSIGNMENT',  summary: 'Assigned to lead the 20-10 bombings investigation.', seen: true },
  { chapter: 'BEAT 02', title: 'PHOENIX MALL',    summary: "Forensic CCTV dissection. His investigative brilliance goes on the record.", seen: true },
  { chapter: 'BEAT 03', title: 'THE TUNNEL',      summary: 'An ambush breaks his circuitry mid-battle. His team takes casualties.', seen: true },
  { chapter: 'BEAT 04', title: 'THE EVIDENCE',    summary: 'A trail of components begins rewriting his understanding of the case.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE REVELATION',  summary: 'A confrontation he never prepared for. His moral compass detonates.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE CHOICE',      summary: 'The chronicle ends with a decision only he can make.', spoiler: true },
];

// Rudra — canon-safe six-beat arc anchored in the novel present. Beats 1-4
// are Act I-II content (cedars, recognition, ICU plea, return to command).
// Beats 5-6 are spoiler-flagged Act III-IV (siege + duel). No Pratap name,
// no specific climax reveal. See CHARACTERS.md §2 "Four-Act Arc".
const RUDRA_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE CEDARS',      summary: 'Exile in the high Himalaya. Warns intruders with pin-point disarming arrows, then brews them tea.', seen: true },
  { chapter: 'BEAT 02', title: 'THE RECOGNITION', summary: "Mid-standoff, an arrow still humming between them, he recognises Arshi\u2019s lineage through her eyes. He lowers his bow.", seen: true },
  { chapter: 'BEAT 03', title: 'THE ICU PROMISE', summary: 'Kaali invokes a promise he once made. His exile ends in a single sentence.', seen: true },
  { chapter: 'BEAT 04', title: 'THE RETURN',      summary: "Assumes Akakpen leadership. Issues one order before any other: \u201cDon\u2019t use lethal weapons. Knock them out.\u201d", seen: true },
  { chapter: 'BEAT 05', title: 'THE SIEGE',       summary: 'A siege at a playground tests his non-lethal creed against an enemy that has no such rule.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE DUEL',        summary: 'Two philosophies of order meet on the same broadcast stage. One of them has to yield.', spoiler: true },
];

// Pratap — 3 visible beats of the public-facing "Smiling Architect" era
// and 3 spoiler-flagged beats. Nothing in either tier may hint at the
// novel's twist-level antagonism. Vocabulary is archival, statesmanlike,
// and safe to read before page one.
const PRATAP_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE ARCHITECT',    summary: 'The state\u2019s face of the post-Year-Turn era. Ceremony, parade, and the slow measured cadence of stability.', seen: true },
  { chapter: 'BEAT 02', title: 'THE ASSIGNMENT',   summary: 'Personally appoints Major Kahaan to lead the 20-10 bombings investigation. Briefs him over an open preamble frame; the signet catches the light.', seen: true },
  { chapter: 'BEAT 03', title: 'THE STATE ADDRESS', summary: 'Bharatvarsh\u2019s father-of-the-state optic at its most polished. Warm, disarming, unhurried. The regime\u2019s legitimacy passes through his shoulders.', seen: true },
  { chapter: 'BEAT 04', title: 'THE INQUIRY',      summary: 'A case crosses his desk that refuses to close cleanly.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE STANDOFF',     summary: 'Indrapur HQ. A broadcast stage. Two philosophies of order in one room.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE VERDICT',      summary: 'The chronicle closes with an entry only the state archive is permitted to read.', spoiler: true },
];

// Hana — 3 visible beats drawn from her canonical "Moral Lens" behaviours
// (map-table, rear-hatch, scope-lower). Spoiler beats cover the late-arc
// archive discovery, the refusal, and the tribunal \u2014 but no specific
// name, no specific crime. Pratap's antagonism stays buried.
const HANA_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'OPS-TWO AT THE MAP TABLE', summary: 'First chronicle appearance. Briefing prep for a city operation. The three-word sentences, the empty memo pad, the calm.', seen: true },
  { chapter: 'BEAT 02', title: 'THE REAR-HATCH HABIT',     summary: 'A transport detail. She sits nearest the hatch so the seasick rookie can see fresh air. Small mercy, institutional scale.', seen: true },
  { chapter: 'BEAT 03', title: 'THE SCOPE LOWERS',         summary: 'Core motif. Crosshair on a target who turns out to be dragging a wounded civilian out of the blast zone. She dips the barrel. Her career chooses a side without asking her first.', seen: true },
  { chapter: 'BEAT 04', title: 'THE DOCTORED LOG',         summary: 'A report that does not match what happened. Her handwriting on a line that should have been someone else\u2019s.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE ARCHIVE',              summary: 'Old paperwork in a room she had no reason to open.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE REFUSAL',              summary: 'A directive she will not execute. Hostages on the other side of the door.', spoiler: true },
];

// Arshi — author rule: late-arc characters get 2 visible + 4 spoiler.
// The visible beats are the KF1 alpine search and KF2 recognition (the
// scenes where the reader first actually meets her). Everything after is
// classified.
const ARSHI_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE ALPINE SEARCH', summary: "A trek across a high mountain pass with an alpine ally. Breath visible, cloak white, goggles up. The reader\u2019s first frame of her.", seen: true },
  { chapter: 'BEAT 02', title: 'THE RECOGNITION',  summary: 'She crosses paths with an exile she was not meant to meet. An arrow still humming between them. He lowers his bow before she lowers her pulse gun.', seen: true },
  { chapter: 'BEAT 03', title: 'THE ICU VIGIL',    summary: 'A bedside promise made twice over.', spoiler: true },
  { chapter: 'BEAT 04', title: 'THE GATE',         summary: 'A fortress apron at blue hour. Political steel without theatrics.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE FIRST ORDER',  summary: 'The moment executive stillness emerges in place of defiance.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE SOVEREIGN',    summary: 'A stone courtyard at morning. The arc closes.', spoiler: true },
];

// Surya — author rule: 2 visible + 4 spoiler for this late-novel arrival.
// The visible beats are the ice-ridge first crack and the reagent trail
// \u2014 both are origin material and land early. Everything after is
// classified and vague: no KACHA name, no TRIDENT name, no handler name.
const SURYA_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE FIRST CRACK',   summary: 'An ice-ridge rescue. He bends an order to save a civilian. He pockets a small metal tag. His chronicle begins here.', seen: true },
  { chapter: 'BEAT 02', title: 'THE REAGENT TRAIL', summary: 'A coastal port interdiction. A crate stamp and a Directorate watermark photographed with a steady hand. He files both where the handler cannot reach.', seen: true },
  { chapter: 'BEAT 03', title: 'THE FALLEN BROTHER', summary: 'An ambush on a shadow mission. A friend dies covering the retreat.', spoiler: true },
  { chapter: 'BEAT 04', title: 'THE INTAKE',        summary: 'A political arrest dressed as a medical transfer.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE LEDGER',        summary: 'Paper pulled from a vault by candlelight. A signature on every page. A name missing from all of them.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE HANDSHAKE',     summary: 'A confrontation that was meant to be a briefing.', spoiler: true },
];

// Kaali — 3 visible beats (the council fire, the bow lesson, the ICU
// promise) + 3 spoiler beats covering the long recovery, the final
// ruling, and the transfer of sovereignty.
const KAALI_BEATS: TimelineBeat[] = [
  { chapter: 'BEAT 01', title: 'THE CROWN HOLDS',  summary: 'First reader appearance. A council fire. The quiet of a leader who has outlasted weather.', seen: true },
  { chapter: 'BEAT 02', title: 'TEACH THE BOW',    summary: "A flashback field scene. Young Arshi at the draw. Kaali\u2019s hand on the draw-shoulder. The inheritance that never made the state\u2019s records.", seen: true },
  { chapter: 'BEAT 03', title: 'THE ICU PROMISE',  summary: "An ICU bed. An oxygen mask. A covenant exchanged decades ago, called in through fog. The Mountain Shadow\u2019s exile ends in a single whispered sentence.", seen: true },
  { chapter: 'BEAT 04', title: 'THE LONG STILLNESS', summary: 'The body takes the slow route back.', spoiler: true },
  { chapter: 'BEAT 05', title: 'THE FINAL COUNCIL', summary: 'One last ruling from a bed that was never meant to host one.', spoiler: true },
  { chapter: 'BEAT 06', title: 'THE INHERITANCE',  summary: 'The moment sovereignty transfers.', spoiler: true },
];

// Per-character lookup maps — keeps Section 4 / Section 6 branching DRY as
// more characters get curated content. Unkeyed names fall back to the
// generic beat/fallback paths.
const FILE_RECORDS_BY_NAME: Record<string, FileRecord[]> = {
  Kahaan: KAHAAN_FILE_RECORDS,
  Rudra: RUDRA_FILE_RECORDS,
  'General Pratap': PRATAP_FILE_RECORDS,
  Hana: HANA_FILE_RECORDS,
  Arshi: ARSHI_FILE_RECORDS,
  Surya: SURYA_FILE_RECORDS,
  Kaali: KAALI_FILE_RECORDS,
  Bharatsena: BHARATSENA_FILE_RECORDS,
  'Akakpen Tribe': AKAKPEN_FILE_RECORDS,
};

const BEATS_BY_NAME: Record<string, TimelineBeat[]> = {
  Kahaan: KAHAAN_BEATS,
  Rudra: RUDRA_BEATS,
  'General Pratap': PRATAP_BEATS,
  Hana: HANA_BEATS,
  Arshi: ARSHI_BEATS,
  Surya: SURYA_BEATS,
  Kaali: KAALI_BEATS,
};

const GENERIC_BEATS: TimelineBeat[] = [
  { chapter: 'ACT I',   title: 'INTRODUCTION',   summary: 'First appearance in the chronicle.', seen: true },
  { chapter: 'ACT II',  title: 'COMPLICATION',   summary: 'Role expands under pressure.', seen: true },
  { chapter: 'ACT III', title: 'CONFRONTATION',  summary: 'The central conflict crystallises.', spoiler: true },
  { chapter: 'ACT IV',  title: 'REVELATION',     summary: 'Hidden truths surface.', spoiler: true },
  { chapter: 'ACT V',   title: 'CONSEQUENCE',    summary: 'The cost becomes clear.', spoiler: true },
  { chapter: 'ACT VI',  title: 'RESOLUTION',     summary: 'Where the chronicle leaves them.', spoiler: true },
];

// ========================================
// Props Interface (preserved from original)
// ========================================

interface LoreModalProps {
  item: LoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// ========================================
// Relationship node data (Kahaan-specific + fallback)
// ========================================

interface RelationshipNode {
  name: string;
  role: string;
  color?: string; // 'ally' | 'rival' | 'neutral'
  posX: string; // CSS left %
  posY: string; // CSS top %
}

function getRelationshipNodes(item: LoreItem): RelationshipNode[] {
  if (item.name === 'Kahaan') {
    // Pre-reveal framing only. Pratap is Kahaan's PATRON/MENTOR — the
    // rival/antagonist turn is twist-level and must never appear on any
    // pre-reader surface. See CHARACTERS.md §1 for canon.
    // Father per author canon: Dr. Arshad Qadir (defence-biotech scientist).
    return [
      { name: 'Rudra',      role: 'INVESTIGATION TARGET', color: 'neutral', posX: '18%', posY: '15%' },
      { name: 'Hana',       role: 'CLOSEST COMRADE',      color: 'ally',    posX: '82%', posY: '15%' },
      { name: 'Pratap',     role: 'PATRON · MENTOR',      color: 'ally',    posX: '82%', posY: '75%' },
      { name: 'Dr. Arshad', role: 'FATHER',               color: 'neutral', posX: '18%', posY: '75%' },
    ];
  }
  if (item.name === 'Rudra') {
    // Akakpen-centric 5-node radial. Rudra is embedded in Akakpen command
    // structure in the novel present; Kahaan is not the frame for him and
    // has been removed per author direction. Pratap stays excluded (his
    // antagonist reveal is spoiler territory). The mentor node is
    // deliberately [REDACTED] — identity reserved for the prequel novel.
    return [
      { name: '[REDACTED]', role: 'MENTOR',          color: 'neutral', posX: '50%', posY: '6%'  },
      { name: 'Kaali',      role: 'QUEEN OF AKAKPEN', color: 'ally',    posX: '12%', posY: '32%' },
      { name: 'Arshi',      role: 'AKAKPEN HEIR',    color: 'ally',    posX: '88%', posY: '32%' },
      { name: 'Raaga',      role: 'AKAKPEN OPERATIVE', color: 'ally',  posX: '22%', posY: '88%' },
      { name: 'Samar',      role: 'ALPINE ALLY',     color: 'ally',    posX: '78%', posY: '88%' },
    ];
  }
  if (item.name === 'General Pratap') {
    // Public-facing only. All four nodes read as the state's inner
    // circle. No adversarial framing anywhere — the novel's twist-level
    // antagonist reveal is off-limits on this surface.
    return [
      { name: 'The Directorate', role: 'INNER CIRCLE',        color: 'ally', posX: '50%', posY: '6%'  },
      { name: 'Kahaan',          role: 'INVESTIGATION APPOINTEE', color: 'ally', posX: '12%', posY: '38%' },
      { name: 'Dr. Arshad',      role: 'DIRECTORATE SCIENCE', color: 'ally', posX: '88%', posY: '38%' },
      { name: 'Hana',            role: 'OFFICER UNDER COMMAND', color: 'ally', posX: '50%', posY: '90%' },
    ];
  }
  if (item.name === 'Hana') {
    // Hana's visible axes: her commanding officer (Kahaan), her father
    // (Colonel Arvind), her chain of command (Pratap — neutral public
    // framing only), and her moral echo (Rudra — she has never met him,
    // but their creeds rhyme and the graph carries that).
    return [
      { name: 'Kahaan',         role: 'COMMANDING OFFICER', color: 'ally',    posX: '50%', posY: '6%'  },
      { name: 'Colonel Arvind', role: 'FATHER',             color: 'neutral', posX: '12%', posY: '38%' },
      { name: 'Pratap',         role: 'SUPREME COMMAND',    color: 'neutral', posX: '88%', posY: '38%' },
      { name: 'Rudra',          role: 'PHILOSOPHICAL ECHO', color: 'ally',    posX: '50%', posY: '90%' },
    ];
  }
  if (item.name === 'Arshi') {
    // Arshi's four-node Akakpen-centric frame. Kaali is mother in the
    // legal sense (adoption and biology legally equal under the
    // Abolition Decrees); Rudra enters her life as the Mountain Shadow
    // before either of them is ready for it; Samar and Raaga are her
    // field lieutenants.
    return [
      { name: 'Kaali',  role: 'MOTHER \u00B7 QUEEN',  color: 'ally', posX: '50%', posY: '6%'  },
      { name: 'Rudra',  role: 'THE MOUNTAIN SHADOW', color: 'ally', posX: '12%', posY: '38%' },
      { name: 'Samar',  role: 'ALPINE COMPANION',    color: 'ally', posX: '88%', posY: '38%' },
      { name: 'Raaga',  role: 'AKAKPEN OPERATIVE',   color: 'ally', posX: '50%', posY: '90%' },
    ];
  }
  if (item.name === 'Surya') {
    // Surya's graph is his Guhyakas squad in the backstory + his novel-
    // present Akakpen partner. Mira Rao reads as ally pre-reveal (her
    // handler-asset betrayal is a comic-level spoiler). Bhanu reads as
    // mentor pre-reveal (his identity as the handler is a spoiler).
    return [
      { name: 'Prithviraj Bhanu', role: 'THE HANDLER',         color: 'neutral', posX: '50%', posY: '6%'  },
      { name: 'Prateek Punya',    role: 'BROTHER-IN-ARMS \u00B7 KIA', color: 'ally', posX: '12%', posY: '38%' },
      { name: 'Mira Rao',         role: 'UNIT XO \u00B7 SECOND',       color: 'ally', posX: '88%', posY: '38%' },
      { name: 'Raaga',            role: 'AKAKPEN PARTNER',     color: 'ally', posX: '50%', posY: '90%' },
    ];
  }
  if (item.name === 'Kaali') {
    // Kaali's public court: her heir Arshi, her exile-era comrade
    // Rudra (via the ICU promise), and two members of her active
    // Akakpen field roster (Raaga, Samar).
    return [
      { name: 'Arshi', role: 'HEIR \u00B7 DAUGHTER',    color: 'ally', posX: '50%', posY: '6%'  },
      { name: 'Rudra', role: 'THE PROMISE \u00B7 COMRADE', color: 'ally', posX: '12%', posY: '38%' },
      { name: 'Raaga', role: 'AKAKPEN OPERATIVE',      color: 'ally', posX: '88%', posY: '38%' },
      { name: 'Samar', role: 'ALPINE LIEUTENANT',      color: 'ally', posX: '50%', posY: '90%' },
    ];
  }
  return [];
}

// ========================================
// Main Component
// ========================================

export const LoreModal: FC<LoreModalProps> = ({ item, isOpen, onClose }) => {
  // Hydration safety: default to true when window is already available
  // (client-side navigation), false on SSR. No effect needed.
  const [mounted] = useState(() => typeof window !== 'undefined');

  // Escape key handler (preserved)
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Body scroll lock + ESC listener (preserved)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ backgroundColor: 'var(--obsidian-void)' }}
          onClick={onClose}
        >
          {/* 1px Mustard Dossier inset border — decorative, pointer-events-none */}
          <div
            className="absolute inset-3 border pointer-events-none z-10"
            style={{ borderColor: 'var(--mustard-dossier)' }}
          />

          {/* Top-left RETURN TO ARCHIVE affordance */}
          <button
            className="absolute top-6 left-6 z-20 border px-4 py-2 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200"
            style={{ borderColor: 'var(--powder-signal)', color: 'var(--bone-text)' }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Return to Archive"
          >
            ← RETURN TO ARCHIVE
          </button>

          {/* Top-right CLOSE FILE affordance */}
          <div
            className="absolute top-6 right-6 z-20 flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: 'var(--obsidian-panel)' }}
              onClick={onClose}
              aria-label="Close dossier"
            >
              <span className="font-mono text-lg leading-none" style={{ color: 'var(--mustard-dossier)' }}>✕</span>
            </button>
            <span
              className="font-mono uppercase text-[9px] tracking-[0.14em]"
              style={{ color: 'var(--shadow-text)' }}
            >
              CLOSE FILE · ESC
            </span>
          </div>

          {/* Inner scrollable content — stopPropagation so clicking inside doesn't close */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ============================================================
                SECTION 1 — DOSSIER COVER (asymmetric 5/7 split)
            ============================================================ */}
            <section
              className="relative min-h-[720px] pt-24"
              style={{ backgroundColor: 'var(--obsidian-void)' }}
            >
              {/* Giant ghost Devanagari watermark */}
              {item.nameDevanagari && (
                <div
                  className="absolute top-0 left-0 font-display select-none pointer-events-none z-0 overflow-hidden leading-none"
                  style={{
                    fontSize: 'clamp(12rem, 25vw, 22rem)',
                    color: 'var(--bone-text)',
                    opacity: 0.05,
                    fontFamily: 'var(--font-devanagari)',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {item.nameDevanagari}
                </div>
              )}

              <div className="relative z-10 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center py-12">

                {/* LEFT: content column (col-span-5) */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Classified stamp sticker — single atmospheric stamp.
                      Fields are intentionally neutral (no fabricated dates
                      or clearance levels) so nothing below is mistaken for
                      canonical "facts" on the file.
                      mb-12 (not mb-6): the -2deg rotation pushes the stamp's
                      left-bottom corner ~7px below its natural bottom, and
                      the heading's tight line-height exposes its cap-line
                      ~9px above its `top`. mb-6 leaves ~0.3px clearance —
                      visually they kiss. mb-12 gives ~31px visible gap. */}
                  <div className="mb-12">
                    <DocumentStamp
                      docId={`CASE FILE #${String(item.sortOrder).padStart(4, '0')}`}
                      revision="STATE ARCHIVE"
                      clearance={
                        item.classification === 'classified'
                          ? 'CLEARANCE: RESTRICTED'
                          : 'CLEARANCE: OPEN'
                      }
                      rotate={-2}
                    />
                  </div>

                  {/* Massive display name */}
                  <h1
                    className="font-display uppercase leading-none"
                    style={{
                      fontSize: 'clamp(4rem, 10vw, 9rem)',
                      lineHeight: 0.87,
                      color: 'var(--bone-text)',
                    }}
                  >
                    {getDisplayNameLines(item.name).map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h1>

                  {/* Devanagari subscript */}
                  {item.nameDevanagari && (
                    <p
                      className="leading-tight"
                      style={{
                        fontFamily: 'var(--font-devanagari)',
                        fontSize: '3rem',
                        color: 'var(--powder-signal)',
                        lineHeight: 1.1,
                      }}
                    >
                      {item.nameDevanagari}
                    </p>
                  )}

                  {/* Subtype / category / classification row */}
                  <EyebrowLabel
                    segments={[
                      item.subtype?.toUpperCase() ?? '',
                      item.category?.toUpperCase() ?? '',
                      item.classification?.toUpperCase() ?? '',
                    ].filter(Boolean) as string[]}
                  />

                  {/* Pullquote */}
                  {item.quote && (
                    <div className="mt-4">
                      <p
                        className="font-serif italic text-2xl leading-relaxed max-w-[50ch]"
                        style={{ color: 'var(--powder-signal)' }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div
                        className="font-mono uppercase text-[11px] tracking-[0.18em] mt-2"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        — {item.quoteAuthor ?? 'CLASSIFIED SOURCE'}
                      </div>
                    </div>
                  )}

                  {/* CTAs removed from the cover — the global RETURN TO ARCHIVE
                      affordance is already in the top-left of the modal at all
                      times, and the closing CTA strip (Section 9) carries the
                      "READ THE NOVEL" button. The mustard READ THEIR CHAPTER
                      button used to clip the MAJOR KAHAAN attribution above. */}
                </div>

                {/* RIGHT: image column (col-span-7) */}
                <div className="col-span-12 lg:col-span-7 relative min-h-[500px] lg:min-h-[700px]">
                  {/* Mustard glow spot */}
                  <div
                    className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0"
                    style={{ backgroundColor: 'rgba(241, 194, 50, 0.12)' }}
                    aria-hidden="true"
                  />

                  {/* Banner image */}
                  <div className="relative w-full h-[500px] lg:h-[700px] overflow-hidden">
                    <Image
                      src={item.media.banner}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />

                    {/* Left-edge gradient fade */}
                    <div
                      className="absolute inset-y-0 left-0 w-1/3 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to right, var(--obsidian-void), transparent)' }}
                      aria-hidden="true"
                    />

                    {/* Hotspots overlay (preserved) */}
                    {item.hotspots?.map((spot) => (
                      <ImageHotspot key={spot.id} {...spot} />
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* Section 2 (Quick Intel Strip) removed — it rendered fabricated
                metadata ("ENLISTED 2022", "UNIT: 7TH BHARATSENA", etc.) and
                broke `BIRTHPLACE`/`KNOWN ALIASES` by reading the wrong
                fields. Nothing on it was canon-verifiable. */}

            {/* ============================================================
                SECTION 3 — BIOGRAPHY / PROFILE (sticky sidebar + long content)
            ============================================================ */}
            <section
              className="py-24 relative"
              style={{ backgroundColor: 'var(--obsidian-void)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8">

                {/* LEFT: mini table of contents (sticky) */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start">
                  <EyebrowLabel segments={['DOSSIER SECTIONS']} className="mb-6" />
                  <nav className="flex flex-col gap-0">
                    {[
                      { num: '01', label: 'PROFILE', show: true },
                      {
                        num: '02',
                        label:
                          item.category === 'locations'
                            ? 'SITE SPEC'
                            : item.category === 'tech'
                              ? 'EQUIPMENT FILE'
                              : 'TRAITS',
                        show:
                          item.category === 'locations'
                            ? Boolean(LOCATION_SPECS_BY_NAME[item.name])
                            : item.category === 'tech'
                              ? Boolean(TECH_SPECS_BY_NAME[item.name])
                              : (item.traits?.length ?? 0) > 0,
                      },
                      { num: '03', label: 'RELATIONSHIPS', show: item.category === 'characters' },
                      {
                        num: '04',
                        label:
                          item.category === 'locations'
                            ? 'CHRONICLE FOOTPRINT'
                            : item.category === 'tech'
                              ? 'RECORDED USES'
                              : 'ARC TIMELINE',
                        show:
                          item.category === 'characters' ||
                          item.category === 'locations' ||
                          item.category === 'tech',
                      },
                      { num: '05', label: 'GALLERY', show: true },
                      { num: '06', label: 'ON RECORD', show: true },
                    ]
                      .filter((s) => s.show)
                      .map((s, i) => (
                        <div
                          key={s.num}
                          className={cn(
                            'flex items-center gap-4 py-3 border-l-2 pl-4 font-mono uppercase text-[11px] tracking-[0.18em]',
                            i === 0
                              ? 'border-l-[var(--mustard-dossier)]'
                              : 'border-l-transparent'
                          )}
                          style={{
                            color: i === 0 ? 'var(--bone-text)' : 'var(--shadow-text)',
                            borderLeftColor: i === 0 ? 'var(--mustard-dossier)' : 'transparent',
                          }}
                        >
                          <span style={{ color: 'var(--mustard-dossier)' }}>{s.num}</span>
                          <span>{s.label}</span>
                        </div>
                      ))}
                  </nav>
                </div>

                {/* RIGHT: long content column */}
                <div className="col-span-12 lg:col-span-8 max-w-[65ch]">
                  <EyebrowLabel segments={['01', 'PROFILE']} className="mb-4" />
                  <h3
                    className="font-display text-5xl mt-2 mb-8 uppercase"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {getProfileHeadline(item)}
                  </h3>

                  <div
                    className="font-sans text-lg leading-relaxed space-y-4"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    <RedactedText text={item.description} />
                  </div>

                  {/* Mid-paragraph pullquote (if not already shown in cover) */}
                  {item.quote && !item.nameDevanagari && (
                    <blockquote
                      className="font-serif italic text-2xl my-10 pl-6 border-l-2"
                      style={{
                        color: 'var(--powder-signal)',
                        borderLeftColor: 'var(--mustard-dossier)',
                      }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  )}
                </div>

              </div>
            </section>

            {/* ============================================================
                SECTION 4 — FILE RECORDS (information cards)
                Compact, text-only, non-clickable cards carrying canonical
                biographical extracts from the novel manuscript. Replaces the
                old "WHAT THE FILE RECORDS" trait-pills + faded banner that
                took half the screen and said almost nothing.
                Per-character file records live as hardcoded constants near
                the top of this file. Falls back to plain trait pills for
                characters whose records have not been written yet.
            ============================================================ */}
            {(() => {
              // Four rendering paths for Section 4:
              //   1. Locations → 2-col blueprint "Site Spec Sheet"
              //   2. Tech     → 4×2 compact "Equipment File" datachip grid
              //   3. Curated FILE_RECORDS entry → dense 4×2 file-record cards
              //   4. Fallback → trait pills
              const isLocation = item.category === 'locations';
              const isTech = item.category === 'tech';
              const specs: SiteSpecRow[] | null = isLocation
                ? LOCATION_SPECS_BY_NAME[item.name] ?? null
                : null;
              const chips: DataChip[] | null = isTech
                ? TECH_SPECS_BY_NAME[item.name] ?? null
                : null;
              const records: FileRecord[] | null = !isLocation && !isTech
                ? FILE_RECORDS_BY_NAME[item.name] ?? null
                : null;

              // Nothing to render at all — skip the whole section.
              if (!specs && !chips && !records && (item.traits?.length ?? 0) === 0) return null;

              return (
                <section
                  className="py-24 border-t"
                  style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
                >
                  <div className="max-w-[1440px] mx-auto px-8">
                    <EyebrowLabel
                      segments={[
                        '02',
                        specs
                          ? 'SITE SPEC'
                          : chips
                            ? 'EQUIPMENT FILE'
                            : 'FILE RECORDS',
                        specs
                          ? 'BLUEPRINT EXTRACT · ARCHIVE-KEPT'
                          : chips
                            ? 'DATACHIP ARRAY · FIELD-KEPT'
                            : records
                              ? 'BIOGRAPHICAL EXTRACTS · DECLASSIFIED'
                              : 'CLASSIFICATION MARKERS',
                      ]}
                      className="mb-4"
                    />
                    <h3
                      className="font-display text-5xl uppercase mb-10"
                      style={{ color: 'var(--bone-text)' }}
                    >
                      {specs
                        ? 'SITE SPECIFICATION.'
                        : chips
                          ? 'EQUIPMENT FILE.'
                          : 'WHAT THE FILE RECORDS.'}
                    </h3>

                    {chips ? (
                      // Equipment File — 4 columns × 2 rows of compact
                      // datachips, visually distinct from locations' 2-col
                      // blueprint rows and characters' narrative cards.
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {chips.map((chip, i) => (
                          <div
                            key={`${chip.label}-${i}`}
                            className="p-4 border-t border-l-2 flex flex-col gap-1 min-h-[96px]"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderTopColor: 'var(--navy-signal)',
                              borderLeftColor: 'var(--mustard-dossier)',
                            }}
                          >
                            <div
                              className="font-mono uppercase text-[10px] tracking-[0.22em]"
                              style={{ color: 'var(--mustard-dossier)' }}
                            >
                              {chip.label}
                            </div>
                            <div
                              className="font-display uppercase text-sm leading-snug"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {chip.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : specs ? (
                      // Site Spec Sheet — two-column blueprint-style panel.
                      // Left column: monospace label. Right column: value.
                      // Dashed divider rows evoke a technical drawing title block.
                      <div
                        className="border-t border-b"
                        style={{ borderColor: 'var(--navy-signal)' }}
                      >
                        {specs.map((row, i) => (
                          <div
                            key={`${row.label}-${i}`}
                            className="grid grid-cols-12 gap-6 py-4 border-b last:border-b-0 items-baseline"
                            style={{
                              borderColor: 'var(--navy-signal)',
                              borderStyle: 'dashed',
                            }}
                          >
                            <div
                              className="col-span-12 md:col-span-4 font-mono uppercase text-[11px] tracking-[0.22em]"
                              style={{ color: 'var(--mustard-dossier)' }}
                            >
                              {row.label}
                            </div>
                            <div
                              className="col-span-12 md:col-span-8 font-display text-base md:text-lg uppercase leading-snug"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {row.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : records ? (
                      // Curated information cards — 4 columns × 2 rows on desktop.
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {records.map((rec, i) => (
                          <div
                            key={`${rec.label}-${i}`}
                            className="p-5 border-t border-l-2 flex flex-col gap-2"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderTopColor: 'var(--navy-signal)',
                              borderLeftColor: 'var(--mustard-dossier)',
                            }}
                          >
                            <div
                              className="font-mono uppercase text-[10px] tracking-[0.18em]"
                              style={{ color: 'var(--mustard-dossier)' }}
                            >
                              {rec.label}
                            </div>
                            <p
                              className="font-sans text-[13px] leading-relaxed"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {rec.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Fallback: original trait pills for characters not yet curated.
                      <div className="flex flex-wrap gap-3">
                        {item.traits!.map((trait, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 border-l-2"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderLeftColor: 'var(--mustard-dossier)',
                            }}
                          >
                            <span
                              className="font-display text-base uppercase"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {trait.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {/* ============================================================
                SECTION 5 — RELATIONSHIPS (characters only)
            ============================================================ */}
            {item.category === 'characters' && (
              <section
                className="py-24 border-t"
                style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
              >
                <div className="max-w-[1440px] mx-auto px-8">
                  <EyebrowLabel segments={['03', 'RELATIONSHIPS']} className="mb-4" />
                  <h3
                    className="font-display text-5xl uppercase mb-12"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    CONNECTED FILES.
                  </h3>

                  {(() => {
                    const nodes = getRelationshipNodes(item);
                    if (nodes.length === 0) {
                      return (
                        <p
                          className="font-mono uppercase text-[11px] tracking-[0.18em]"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          NO DECLASSIFIED RELATIONSHIPS ON FILE.
                        </p>
                      );
                    }
                    return (
                      <div className="relative h-[580px] max-w-[900px] mx-auto mt-12">
                        {/* Ghost Devanagari संबंध */}
                        <div
                          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                          aria-hidden="true"
                        >
                          <span
                            className="font-display"
                            style={{
                              fontFamily: 'var(--font-devanagari)',
                              fontSize: '18rem',
                              color: 'var(--bone-text)',
                              opacity: 0.06,
                              lineHeight: 1,
                            }}
                          >
                            संबंध
                          </span>
                        </div>

                        {/* Center node (the item itself) */}
                        <div
                          className="absolute w-28 h-28 rounded-full overflow-hidden border-2 z-10"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            borderColor: 'var(--mustard-dossier)',
                            boxShadow: '0 0 24px rgba(241,194,50,0.25)',
                          }}
                        >
                          <Image
                            src={item.media.card}
                            alt={item.name}
                            fill
                            className="object-cover object-top"
                            sizes="112px"
                          />
                        </div>

                        {/* Satellite nodes */}
                        {nodes.map((node) => {
                          const isRival = node.color === 'rival';
                          return (
                            <div
                              key={node.name}
                              className="absolute flex flex-col items-center gap-2"
                              style={{ left: node.posX, top: node.posY, transform: 'translate(-50%, -50%)' }}
                            >
                              {/* Small circular placeholder portrait */}
                              <div
                                className="w-16 h-16 rounded-full border flex items-center justify-center font-display text-lg uppercase"
                                style={{
                                  borderColor: isRival ? 'var(--redaction)' : 'var(--navy-signal)',
                                  backgroundColor: 'var(--obsidian-panel)',
                                  color: 'var(--bone-text)',
                                }}
                              >
                                {node.name.charAt(0)}
                              </div>
                              <div
                                className="font-mono uppercase text-[9px] tracking-[0.14em] text-center"
                                style={{ color: 'var(--shadow-text)' }}
                              >
                                {node.name}
                              </div>
                              <div
                                className="font-mono uppercase text-[8px] tracking-[0.1em] text-center px-2 py-0.5 border"
                                style={{
                                  color: isRival ? 'var(--redaction)' : 'var(--mustard-dossier)',
                                  borderColor: isRival ? 'var(--redaction)' : 'var(--mustard-dossier)',
                                  opacity: 0.85,
                                }}
                              >
                                {node.role}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* ============================================================
                SECTION 6 — ARC TIMELINE (characters) /
                             CHRONICLE FOOTPRINT (locations) /
                             RECORDED USES (tech)
                Characters get the 3-visible + rest-locked beat strip.
                Locations get manuscript-cited scenes that happen at the
                site. Tech items get recorded use-cases — scenes where the
                item physically appears, with a verbatim manuscript cite.
                All three variants share the same outer section shell; the
                inner content branches on item.category.
            ============================================================ */}
            {(item.category === 'characters' || item.category === 'locations' || item.category === 'tech') && (
              <section
                className="py-24 border-t overflow-hidden"
                style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
              >
                <div className="max-w-[1440px] mx-auto px-8">
                  <EyebrowLabel
                    segments={[
                      '04',
                      item.category === 'locations'
                        ? 'CHRONICLE FOOTPRINT'
                        : item.category === 'tech'
                          ? 'RECORDED USES'
                          : 'ARC TIMELINE',
                    ]}
                    className="mb-4"
                  />
                  <h3
                    className="font-display text-5xl uppercase mb-16"
                    style={{ color: 'var(--bone-text)' }}
                  >
                    {item.category === 'locations'
                      ? 'SCENES ON THE GROUND.'
                      : item.category === 'tech'
                        ? 'RECORDED USES.'
                        : 'ARC BEATS.'}
                  </h3>

                  {(item.category === 'locations' || item.category === 'tech') && (() => {
                    // Chronicle Footprint (locations) / Recorded Uses (tech)
                    // Both render as stacked archival index cards. No locked
                    // placeholders — these are factual, manuscript-cited
                    // appearances, not spoiler-sensitive arc beats.
                    const scenes =
                      item.category === 'locations'
                        ? LOCATION_SCENES_BY_NAME[item.name] ?? []
                        : TECH_USES_BY_NAME[item.name] ?? [];
                    if (scenes.length === 0) return null;
                    const ordinalLabel = item.category === 'tech' ? 'USE' : 'SCENE';
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenes.map((scene, i) => (
                          <div
                            key={`scene-${i}`}
                            className="relative p-6 border-t border-l-2 flex flex-col gap-3 min-h-[220px]"
                            style={{
                              backgroundColor: 'var(--obsidian-panel)',
                              borderTopColor: 'var(--navy-signal)',
                              borderLeftColor: 'var(--mustard-dossier)',
                            }}
                          >
                            {/* Index ordinal — top-right corner, archival feel */}
                            <div
                              className="absolute top-3 right-4 font-mono text-[10px] tracking-[0.18em]"
                              style={{ color: 'var(--shadow-text)' }}
                            >
                              {ordinalLabel} {String(i + 1).padStart(2, '0')}
                            </div>
                            {/* Chapter marker */}
                            <div
                              className="font-mono uppercase text-[10px] tracking-[0.22em]"
                              style={{ color: 'var(--mustard-dossier)' }}
                            >
                              {scene.chapter}
                            </div>
                            {/* Title */}
                            <div
                              className="font-display uppercase text-xl leading-tight"
                              style={{ color: 'var(--bone-text)' }}
                            >
                              {scene.title}
                            </div>
                            {/* Summary */}
                            <p
                              className="font-sans text-[13px] leading-relaxed"
                              style={{ color: 'var(--steel-text)' }}
                            >
                              {scene.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {item.category === 'characters' && (
                  <>
                  {/* Horizontal beat strip.
                      Only beats 01-03 render with content. Everything from
                      beat 04 onwards is a locked "[CLASSIFIED]" placeholder —
                      no title, no summary, nothing that could leak a reveal
                      to a pre-reader. This enforces the author rule: the rest
                      of the arc must be earned by reading the novel. */}
                  <div className="relative">
                    {/* Connecting line */}
                    <div
                      className="absolute top-[28px] left-0 right-0 h-px pointer-events-none"
                      style={{ backgroundColor: 'var(--mustard-dossier)', opacity: 0.4 }}
                      aria-hidden="true"
                    />

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {(() => {
                        const allBeats = BEATS_BY_NAME[item.name] ?? GENERIC_BEATS;
                        // Always show exactly 6 slots: 3 visible + 3 locked.
                        const visibleBeats = allBeats.slice(0, 3);
                        const totalSlots = Math.max(6, allBeats.length);
                        const lockedSlotCount = totalSlots - visibleBeats.length;
                        return (
                          <>
                            {visibleBeats.map((beat, i) => (
                              <div key={`visible-${i}`} className="flex flex-col items-center text-center gap-3 relative">
                                {/* Beat node */}
                                <div
                                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center z-10 relative font-mono text-[10px]"
                                  style={{
                                    backgroundColor: 'var(--mustard-dossier)',
                                    borderColor: 'var(--mustard-dossier)',
                                    color: 'var(--obsidian-void)',
                                  }}
                                >
                                  {String(i + 1).padStart(2, '0')}
                                </div>

                                {/* Chapter label */}
                                <div
                                  className="font-mono uppercase text-[9px] tracking-[0.14em]"
                                  style={{ color: 'var(--mustard-dossier)' }}
                                >
                                  {beat.chapter}
                                </div>

                                {/* Title */}
                                <div
                                  className="font-display uppercase text-sm leading-tight"
                                  style={{ color: 'var(--bone-text)' }}
                                >
                                  {beat.title}
                                </div>

                                {/* Summary */}
                                <div
                                  className="font-sans text-[11px] leading-relaxed"
                                  style={{ color: 'var(--steel-text)' }}
                                >
                                  {beat.summary}
                                </div>
                              </div>
                            ))}

                            {Array.from({ length: lockedSlotCount }).map((_, i) => {
                              const slotNumber = visibleBeats.length + i + 1;
                              return (
                                <div
                                  key={`locked-${i}`}
                                  className="flex flex-col items-center text-center gap-3 relative opacity-70"
                                  aria-label="Classified beat — read the novel to unlock"
                                >
                                  {/* Locked node — empty, dashed border */}
                                  <div
                                    className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center z-10 relative font-mono text-[10px]"
                                    style={{
                                      backgroundColor: 'var(--obsidian-panel)',
                                      borderColor: 'var(--redaction)',
                                      color: 'var(--redaction)',
                                    }}
                                  >
                                    {String(slotNumber).padStart(2, '0')}
                                  </div>

                                  {/* CLASSIFIED eyebrow */}
                                  <div
                                    className="font-mono uppercase text-[9px] tracking-[0.14em]"
                                    style={{ color: 'var(--redaction)' }}
                                  >
                                    CLEARANCE REQ.
                                  </div>

                                  {/* Redacted title bar */}
                                  <div
                                    className="h-3 w-full rounded-sm"
                                    style={{ backgroundColor: 'var(--redaction)', opacity: 0.75 }}
                                    aria-hidden="true"
                                  />
                                  <div
                                    className="h-3 w-2/3 rounded-sm"
                                    style={{ backgroundColor: 'var(--redaction)', opacity: 0.5 }}
                                    aria-hidden="true"
                                  />

                                  {/* Unlock hint */}
                                  <div
                                    className="font-mono uppercase text-[9px] tracking-[0.14em] mt-1"
                                    style={{ color: 'var(--shadow-text)' }}
                                  >
                                    READ THE NOVEL
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  </>
                  )}
                </div>
              </section>
            )}

            {/* ============================================================
                SECTION 7 — VISUAL DOSSIER (2 honest slots)
                Previously a 6-slot gallery that looped the same two images
                through CSS filters (grayscale / opacity / hue-rotate) and
                claimed each one was a different artwork. Reduced to the
                two actual reference files this entry has on record.
            ============================================================ */}
            <section
              className="py-24 border-t"
              style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8">
                <EyebrowLabel segments={['05', 'VISUAL DOSSIER']} className="mb-4" />
                <h3
                  className="font-display text-5xl uppercase mb-12"
                  style={{ color: 'var(--bone-text)' }}
                >
                  VISUAL DOSSIER.
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary portrait */}
                  <div
                    className="relative min-h-[400px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={`${item.name} — portrait reference`}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      PORTRAIT REFERENCE
                    </div>
                  </div>

                  {/* Field reference (banner) */}
                  <div
                    className="relative min-h-[400px] border overflow-hidden group"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.banner}
                      alt={`${item.name} — field reference`}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3 font-mono uppercase text-[9px] tracking-[0.14em]"
                      style={{ backgroundColor: 'var(--obsidian-deep)', color: 'var(--shadow-text)' }}
                    >
                      FIELD REFERENCE
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================
                SECTION 8 — QUOTE WALL
            ============================================================ */}
            <section
              className="py-24 border-t"
              style={{ backgroundColor: 'var(--obsidian-void)', borderColor: 'var(--navy-signal)' }}
            >
              <div className="max-w-[1440px] mx-auto px-8 text-center">
                <EyebrowLabel segments={['06', 'ON RECORD']} className="mb-4 justify-center" />
                <h3
                  className="font-display text-5xl uppercase mb-16"
                  style={{ color: 'var(--bone-text)' }}
                >
                  QUOTES FROM THE CHRONICLE.
                </h3>

                {item.quote ? (
                  <div className="max-w-[720px] mx-auto space-y-16">
                    {/* Primary quote — giant */}
                    <blockquote>
                      <p
                        className="font-serif italic leading-relaxed mb-6"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--powder-signal)' }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <footer
                        className="font-mono uppercase text-[11px] tracking-[0.18em]"
                        style={{ color: 'var(--shadow-text)' }}
                      >
                        — {item.quoteAuthor ?? 'CLASSIFIED SOURCE'}
                      </footer>
                    </blockquote>

                    {/* Divider */}
                    <div
                      className="w-16 h-px mx-auto"
                      style={{ backgroundColor: 'var(--mustard-dossier)' }}
                      aria-hidden="true"
                    />

                    {/* Tagline as secondary quote */}
                    {item.tagline && (
                      <blockquote>
                        <p
                          className="font-serif italic text-xl leading-relaxed mb-4"
                          style={{ color: 'var(--steel-text)' }}
                        >
                          &ldquo;{item.tagline}&rdquo;
                        </p>
                        <footer
                          className="font-mono uppercase text-[10px] tracking-[0.18em]"
                          style={{ color: 'var(--shadow-text)' }}
                        >
                          — CASE FILE NOTATION
                        </footer>
                      </blockquote>
                    )}
                  </div>
                ) : (
                  <p
                    className="font-mono uppercase text-[11px] tracking-[0.18em]"
                    style={{ color: 'var(--shadow-text)' }}
                  >
                    NO ATTRIBUTED QUOTES DECLASSIFIED.
                  </p>
                )}
              </div>
            </section>

            {/* ============================================================
                SECTION 9 — CLOSING CTA STRIP
            ============================================================ */}
            <section
              className="py-16 border-t relative overflow-hidden"
              style={{ backgroundColor: 'var(--obsidian-deep)', borderColor: 'var(--navy-signal)' }}
            >
              {/* Fracture-red overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: 'var(--redaction)', opacity: 0.025 }}
                aria-hidden="true"
              />

              <div className="relative max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 items-center">
                {/* LEFT: card thumbnail */}
                <div className="col-span-12 lg:col-span-5">
                  <div
                    className="relative w-48 h-64 border overflow-hidden mx-auto lg:mx-0"
                    style={{ borderColor: 'var(--navy-signal)' }}
                  >
                    <Image
                      src={item.media.card}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                      sizes="192px"
                    />
                  </div>
                </div>

                {/* RIGHT: text + CTAs */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  <EyebrowLabel segments={['THE FILE ENDS HERE', 'THE NOVEL DOES NOT']} />

                  <h3
                    className="font-display uppercase leading-[0.9]"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--bone-text)' }}
                  >
                    YOU&rsquo;VE READ THE FILE.
                    <br />
                    NOW READ THE COUNTRY.
                  </h3>

                  <p
                    className="font-sans text-lg leading-relaxed max-w-[48ch]"
                    style={{ color: 'var(--steel-text)' }}
                  >
                    A dossier is what the state could stomach. The chronicle is
                    everything it couldn&rsquo;t redact — three centuries of an
                    India that never was, and every voice the archive was not
                    allowed to keep.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      href="/novel"
                      className="px-6 py-3 font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200"
                      style={{ backgroundColor: 'var(--mustard-dossier)', color: 'var(--obsidian-void)' }}
                    >
                      READ THE NOVEL →
                    </Link>
                    <button
                      className="px-6 py-3 border font-mono uppercase text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors duration-200 hover:opacity-80"
                      style={{ borderColor: 'var(--powder-signal)', color: 'var(--bone-text)' }}
                      onClick={onClose}
                    >
                      ← BACK TO ARCHIVE
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>{/* end inner content */}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LoreModal;
