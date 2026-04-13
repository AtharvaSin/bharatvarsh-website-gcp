# Bharatvarsh — Devanagari Canon

> **Locked 2026-04-13.** Every Devanagari glyph used anywhere in the site MUST come from this list. Romanizations are included to make it easy for non-native speakers to verify what they're seeing. If a word is missing, add it here BEFORE using it in code.

## Places
| Name | Devanagari | Romanized | Meaning |
|---|---|---|---|
| Bharatvarsh (land) | `भारतवर्ष` | bhāratavarṣa | The alternate-history subcontinent |
| Indrapur | `इंद्रपुर` | indrapur | Capital city |
| Lakshmanpur | `लक्ष्मणपुर` | lakṣmaṇpur | Secondary city |
| Magna Carta Memorial | `महासनद स्मारक` | mahāsanad smārak | Historical monument |
| Border | `सीमा` | sīmā | Contested border |
| Magna Carta Day | `महासनद दिवस` | mahāsanad divas | Annual ceremony |

## Factions
| Name | Devanagari | Romanized | Meaning |
|---|---|---|---|
| Bharatsena | `भारतसेना` | bhāratsenā | The militarized state |
| Akakpen | `आकाकपेन` | ākākpen | Tribal resistance (transliteration of fictional name) |

## Operatives
| Name | Devanagari | Romanized | Notes |
|---|---|---|---|
| Kahaan | `कहान` | kahān | Protagonist; root of `कहानी` (story), fits "Storyteller" alias. NEVER use `काहान`. |
| Rudra | `रुद्र` | rudra | Ally / mentor |
| Arshi | `आर्शी` | ārśī | Romantic interest |
| Hana | `हाना` | hānā | Subordinate |
| Pratap | `प्रताप` | pratāp | Rival |
| Bhoomi (AI) | `भूमि` | bhūmi | Classified oracle (the name literally means "earth/land") |

## Concepts
| Concept | Devanagari | Romanized | Notes |
|---|---|---|---|
| Archive / record | `अभिलेख` | abhilekh | CORRECT word for archive. NEVER use `पुरालेख` (that means paleography) |
| Chronology / timeline | `कालक्रम` | kālakram | Literary register |
| Divergence / partition | `विभाजन` | vibhājan | Used for the 1850 fork |
| Relationships | `संबंध` | sambandh | |
| Broadcast / transmission | `प्रसारण` | prasāraṇ | Standard word for news broadcast |
| Mesh era (Net era) | `जाल युग` | jāl yug | NEVER use `मेश युग` — `मेश` is just a transliteration, `जाल` is the authentic Hindi |
| Novel / book | `ग्रंथ` | grantha | Used on `/novel` |
| Forum / stage | `मंच` | mañca | Used on `/forum` |
| Field | `क्षेत्र` | kṣetra | Reserved for forum sub-usage |
| Logo mark | `भा` | bhā | First syllable of `भारत`, used as compact logo mark |

## Rendering rules
1. Always render with `font-devanagari` (Noto Sans Devanagari → Tiro Devanagari Hindi fallback)
2. When used as a ghost layer behind English display, opacity 10–15%, size 2–2.5× the English display, color Powder Signal
3. When used as inline subscript beneath an English name, opacity 60–80%, size ~30% of the English display, color Powder Signal
4. Never interleave Devanagari with English on the same visual line (they occupy separate vertical zones)
5. Never use Devanagari for UI button labels — English only for interactive affordances

## Open verification items
The author is not a native Hindi speaker in the implementation session. If any of the above has a canonical spelling from the published manuscript that differs from this list, update this file and reapply via a single batch edit across all screens. As of 2026-04-13 the above is treated as verified by the Stitch redesign review.
