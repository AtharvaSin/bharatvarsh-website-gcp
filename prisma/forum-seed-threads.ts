/**
 * Forum seed threads for the Bharatvarsh community forum.
 * 9 inaugural threads designed to establish tone, invite engagement,
 * and demonstrate the caliber of discussion the community should have.
 *
 * Import into the Prisma seed script and create threads under the
 * admin user (admin@bharatvarsh.dev).
 */

export interface ForumSeedThread {
  title: string;
  body: string;
  topicSlugs: string[];
  isPinned: boolean;
  status: 'PUBLISHED';
}

export const forumSeedThreads: ForumSeedThread[] = [
  // ─────────────────────────────────────────────────────────────────
  // Thread 1: Welcome to the Archives (PINNED)
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'Welcome to the Archives',
    body: `> **STATUS: DECLASSIFIED**
> **DOCUMENT CLASS: ARCHIVAL NOTICE — OPEN ACCESS**
> **ISSUED BY: Forum Administration**

---

You found us. Good.

This forum is the public archive for citizens, scholars, and interested observers of the world of **MahaBharatvarsh** -- the novel by Atharva Singh. Consider it a secure channel for asking questions the Directorate would rather you didn't.

Here you will find threads on plot theories, character analysis, world-building deep dives, and open discussion. Some information is declassified. Some remains \`[CLASSIFIED]\`. The boundary between the two is, itself, part of the conversation.

### Ground Rules

**1. Spoiler Etiquette**
If your post references a major plot revelation -- particularly anything from the final act -- wrap it in a \`[CLASSIFIED]\` tag and give readers fair warning. Not everyone has reached the sublevels yet.

**2. Respectful Debate**
You will disagree. That is the point. Kahaan and Rudra disagree on the nature of order itself -- you are allowed to disagree on whether either of them is right. What you are *not* allowed to do is make it personal. Attack the argument, never the person behind it.

**3. No Real-World Political Mapping**
Bharatvarsh is a work of fiction set in an alternate timeline where 1717 went differently. It is not a commentary on any specific real-world government, party, or policy. Threads that attempt to map the novel's politics onto current events will be locked. The world is rich enough to discuss on its own terms.

**4. Stay In-World or Stay Thoughtful**
You can discuss the novel as a reader, as a literary analyst, or as someone genuinely curious about how a world like this would function. All three are welcome. What we ask is that every post adds something -- a question, an observation, a theory, a counterpoint.

### How to Participate

Pick a thread. Read the opening post. If something sparks a thought -- share it. If you have a theory about the Mesh, the Tribhuj, the Treaty Zone, or any character's motivations -- post it. If you think someone else's theory is wrong, explain why. The best discussions happen when people bring evidence from the text.

---

This is not a fan page. This is a secure channel for citizens of Bharatvarsh who have questions about the reality they live in.

Welcome to the Archives. Mind the classification markers.`,
    topicSlugs: ['announcements'],
    isPinned: true,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 2: The Mesh Saw Nothing — How?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'The Mesh Saw Nothing — How?',
    body: `Let's talk about the single most unsettling detail of the 20-10 bombings.

The Mesh -- Bharatvarsh's total surveillance network -- covers every metropole in the country. OxyPoles with camera nests every 60 to 80 metres along primary boulevards. Hovercams at 12 to 20 metres above ground level. Algorithmic checkpoints at computed intervals along every arterial road. Bracecomm wrist-bands on virtually every citizen, logging biometric data with each transaction. Emotional micro-expression recognition on the CCTV network. Analyst teams like Tara's unit at Phoenix Mall can trace a suspect's *gait signature* across multiple cities in minutes.

This is not a system with gaps. This is a system designed to have no gaps.

And yet.

**Seven coordinated bombings. Seven cities -- Bhojpal, Mysuru, Gopakapattana, Jammu, Kathmandu, Kolkata, Lakshmanpur. Decoys that dragged first responders off-route. Timed devices at stations, markets, and civic hubs. Hundreds killed.**

Zero advance warnings. Zero flagged chatter. Zero anomalies in the Mesh logs.

Think about what that requires. Not one bomber triggered an Amber alert at a checkpoint. Not one supply chain for military-grade explosives left a financial trace on the biometric e-wallet network. Not one planning conversation was picked up by social-media sentiment mining. Not one facial expression at any checkpoint in any city in the weeks before October 20th registered as suspicious.

> "The checkpoint chimed green. She walked through. Somewhere, a database remembered her face longer than she'd remember the walk."

That is how the Mesh works. It *remembers*. Publicly for 30 days, and -- as the archival doors behind restricted-access panels suggest -- far longer than that.

So here is the question that the novel wants you to sit with:

**Either the attackers found a way to be invisible to the most sophisticated surveillance network on the planet -- or someone inside the Mesh made them invisible.**

A technological exploit? An inside job at the Directorate level? Blind spots that the regime has never acknowledged? Something else entirely?

I want to hear your theories. What broke the Mesh on October 20th?`,
    topicSlugs: ['plot-theories'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 3: Old Tribhuj vs New Tribhuj — Same Movement?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'Old Tribhuj vs New Tribhuj — Same Movement?',
    body: `The grey trident appeared on slum walls in six cities for decades. No official explanation was ever issued.

Now it appeared on pamphlets raining from a hijacked festival stage in Lakshmanpur. And it appeared in the wreckage of seven bombings that killed hundreds of civilians.

But here is the thing that keeps nagging at me -- these two Tribhujs do not look like the same organisation.

### The Original Tribhuj (pre-2003)

Founded by Rudra in the 1990s as a civilian democracy movement. Unified scattered protector cells across religious and caste lines -- each prong of the geometric trident representing a different faith pointing toward common purpose. The movement came "tantalisingly close" to forcing national elections. It refused to swear by caste, creed, or linguistic bloc.

Its core principle: *"Security exists to protect, never to dominate."*

The Bharatsena did not crush Tribhuj with force. They rendered it irrelevant by brokering the Teesta Treaty with the eastern tribes, making the democracy movement's popular support evaporate. Rudra formally disbanded it. Walked into the mountains. The trident went quiet.

### The New Tribhuj (October 2025)

Seven simultaneous bombings using military-grade explosives. Coordinated decoy operations. A theatrical pamphlet drop at the Lakshmanpur festival. A live studio hijack of BVN-24x7 in Mumbai.

Same grey trident. Same name.

But the original Tribhuj's founding creed held that **civilians must never be acceptable casualties**. The new Tribhuj opened with civilian mass murder.

### The Question

> The trident on the wall is the same. But is the hand that holds it?

Are we looking at:
- **Evolution** -- a movement that radicalised over two decades of suppression?
- **Appropriation** -- someone co-opting a banned symbol for their own purposes?
- **Something darker** -- a deliberate framing designed to make the regime's oldest enemy the obvious suspect?

The historical Tribhuj never harmed innocents. The regime banned it alongside religion and caste in 1984, declared the Tribhuj Puran treasonous. And now, after nearly half a century of silence, the name resurfaces -- attached to the worst act of violence in Bharatvarsh's modern history.

That dissonance is not an accident. The novel wants you to notice it. What do you think it means?`,
    topicSlugs: ['plot-theories'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 4: Kahaan's Choice — Was He Right?
  // ─────────────────────────────────────────────────────────────────
  {
    title: "Kahaan's Choice — Was He Right?",
    body: `This is not a question about plot. This is a question about you.

A soldier discovers that the system he serves -- the system that rebuilt his shattered body, that gave him purpose after loss, that made him the youngest Major in the country's history -- may have committed an act so fundamental that exposing it could collapse the order that holds 1.4 billion people together.

He has the evidence. He has the platform. He has the augmented body and the war-hero reputation to make people listen.

But the order he would burn down is not *only* corrupt. It also delivered:
- Streets where crime "almost vanished"
- Clean air pumped through OxyPole networks across every boulevard
- Net-zero cities that foreign governments praise
- A medical infrastructure that extends life decades beyond the global norm
- A stability that ended the Decade of Blood -- the communal riots that nearly tore the subcontinent apart

The regime's competence is not a lie. That is what makes the choice so brutal.

> *"The system works. That is what makes it terrifying -- when perfection becomes the cage, you stop looking for the door."*

Kahaan is not choosing between good and evil. He is choosing between **a functional evil and a truthful chaos**. Between a system that works and the principle that the people it serves deserve to know what it costs.

### The Moral Question

Strip away the sci-fi. Strip away the hovercams and the neural implants. At its core, this is a question every generation faces:

**What would you sacrifice for the truth? Not in the abstract. Right now. With 1.4 billion people depending on the answer.**

Would you protect the order -- knowing what sustains it? Or would you burn it down for a principle -- knowing you cannot guarantee what comes after?

I am deliberately not describing how Kahaan answers this question. That is for the novel.

But I want to know how *you* would answer it.`,
    topicSlugs: ['characters'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 5: Rudra: Hermit or Coward?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'Rudra: Hermit or Coward?',
    body: `I am going to say something deliberately provocative, and I want you to argue with me.

Rudra Rathore is one of the most compelling characters in the novel. Born in a Tribhuj monastery during the communal violence of the 1970s. Raised by saffron-robed tutors who paired archery drills with multi-faith scripture. As a teenager, he physically interposed himself between warring mobs, ushering women and children into stone-lined vaults while streets ran with blood.

In the 1990s he unified scattered protector cells into modern Tribhuj -- a secular democracy movement so effective it nearly forced national elections. The geometric trident became a symbol of hope on slum walls across the country.

And then the Bharatsena out-manoeuvred him. The Teesta Treaty pulled the ground from under his movement. His popular support collapsed. And Rudra's response was to formally disband Tribhuj, walk beyond the snow-capped border into Nepal, and spend the next **twenty years** tending mountain terraces and teaching village children sling-shot geometry.

> *"Relaxing at first... then it started getting boring."*

Twenty years. Two decades while the Mesh was built. While the Directorate perfected its surveillance apparatus. While every house of worship was repurposed and every banned book burned. While the nation he swore to free settled deeper into engineered compliance.

The army forgot him. The mountains didn't.

### The Case for Wisdom

Perhaps exile was discipline, not surrender. Perhaps Rudra understood that a premature return would have gotten him killed or imprisoned in D-Wing of the Andaman Cellular Jail -- and that a dead symbol is worse than a living hermit. Perhaps twenty years of stillness was the price of being ready for the moment that actually mattered.

> *"A society must grow like a forest, not a parade ground."*

Forests are patient. They grow in the dark.

### The Case for Cowardice

But forests also burn while patient men sit on mountains. Every year Rudra spent in exile, the Directorate's grip tightened. Every year he chose silence, someone in a basement was caught praying and sent to a cell. He had the name, the credibility, the tactical genius -- and he walked away.

Is there a point where retreat becomes abandonment? Where patience becomes permission?

### The Tension

This is one of the novel's most uncomfortable questions: **Is the courage to wait the same as the cowardice of inaction?** And who gets to decide -- the man on the mountain, or the people in the valley?

I genuinely do not know the answer. Tell me what you think.`,
    topicSlugs: ['characters'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 6: The Two Hanas
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'The Two Hanas',
    body: `There is a detail about Hana that I cannot stop thinking about.

In combat -- in mission mode -- she is one of the most effective officers in Northern Plains Command. Top-three in long-range tactical operations. Shot groupings that broke her father Colonel Arvind's academy record at Trishul Academy. Three-word sentences. Clean decisions. A soldier so precise that her colleagues use her collar-straighten as the go-signal for operations.

And then the mission ends, and a different person appears.

Off-shift Hana quotes Tagore between gun-cleanings. She sneaks contraband storybooks to the quartermaster's children. She sits nearest the open hatch in the troop carrier so the seasick rookie can see fresh air. She writes cheques against her own field allowance to replace broken prosthetics in border villages.

> *"There is a difference between watching and seeing. She has always known which one matters."*

### The Tell

Here is the detail that defines her: **her hand reaches for the med-kit before the holster.** Even under fire. Even when doctrine says weapon first. The instinct to heal precedes the instinct to kill, and no amount of academy conditioning has overwritten it.

She is fully human -- no augmentations, no neural diodes, no HUD monocle. In a world where soldiers are enhanced with cybernetics and thought-piloted helicopters, Hana carries a rifle, a compact field-dressing kit, and a conscience. That is her entire loadout.

### The Cost

At a certain point in the novel, Hana refuses a shoot-to-kill directive. She saves the hostages instead.

I am not going to detail the consequences. But I want to ask: what does that refusal *cost* her? And what does it prove about the system she serves -- that following orders and doing the right thing have become mutually exclusive?

> *"The academy taught us to shoot straight. Nobody taught us when not to."*

### A Question of Complicity

There is another layer here that unsettles me. Before her defiance, Hana quietly doctors mission logs to hide unnecessary brutality. She earns commendations while vomiting into grey-water drains after black-site rotations. She is not innocent -- she is *complicit*, and she knows it.

Does her final act of defiance redeem that complicity? Or does it only make it visible?

Hana is not a simple hero. She is the most human character in the novel, and that is precisely what makes her arc so difficult to sit with. I would love to hear what she means to other readers.`,
    topicSlugs: ['characters'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 7: Living Without Religion — Could It Work?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'Living Without Religion — Could It Work?',
    body: `In 1984, the Bharatsena did something unprecedented. They banned religion, caste, and surnames -- simultaneously, in a single directive.

The scale of what followed is staggering when you sit with it:

- Temples became senate chambers
- Mosques became cancer research centres
- Churches became civic libraries
- Gurudwaras became community kitchens
- Open evangelism was classified as sedition
- Surnames were abolished; every citizen addressed by first name only, with biometrics for formal verification
- History after 1984 was tightly curated by the state

The novel describes this with a kind of architectural matter-of-factness that is more unsettling than any polemic could be. Heritage buildings are maintained beautifully -- the sandstone mandirs, the geometric jali prayer halls, the pale-stone basilicas -- but their interiors serve entirely different purposes now. A plaque at the entrance reads: *"This building serves the people. It always did."*

The regime frames these changes as progressive reform: *"We are beyond superstition."* And to a certain extent, the results speak for themselves. Without communal identity to exploit, the sectarian violence that plagued the Decade of Blood disappeared. The caste system -- one of history's most entrenched hierarchies -- was dismantled in a generation.

### But at What Cost?

Devout citizens conduct rituals in basements. The novel mentions meditation permits -- bureaucratic applications to practise contemplation in your own home, processed through state channels. Underground graffitists tag drone pylons with pre-ban deities, risking imprisonment.

The social divide did not disappear. It simply shifted axis: the real class marker in Bharatvarsh is not wealth or birth -- it is whether you are a military employee or a civilian. The old hierarchies were replaced, not abolished.

### The World-Building Question

This thread is about the *world*, not the real world. Please keep the discussion in-universe.

Here is what I find genuinely fascinating: the novel does not tell you whether this was liberation or erasure. It shows you a country where the air is clean, crime has vanished, and nobody can remember the last communal riot. And it shows you a country where a grandmother streams censored retrospectives of pre-ban Bollywood on a courtyard projector, where banned art circulates as contraband VR chips, and where the spiritual vacuum at the nation's core has never been addressed -- only paved over.

> *"Vertical gardens and anti-ageing serums cannot replace shuttered temples or banned poetry."*

Could a society function without organised religion? Bharatvarsh suggests the answer is yes -- but that the question itself might be the wrong one to ask.

What do you think the *right* question is?`,
    topicSlugs: ['world-building'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 8: The Treaty Zone — Would You Live There?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'The Treaty Zone — Would You Live There?',
    body: `No Mesh. No drones. No Bracecomm. No hovercams.

The Eastern and Himalayan Treaty Zone is the one place in Bharatvarsh where the Directorate's writ does not run. Regular troops cannot enter without tribal consent. No-fly valleys are absolute -- jammer totems carved from posts with copper coils deny every drone, every aircraft, every hovercam. Prayer flags hang at altitude where surveillance cannot reach.

The Akakpen settlements are built from wood, stone, and slate. Hand-mended tech. Stacked-stone walls with heavy timber frames and pegged joinery. Hearths with smoke bells and flues. Signal-quiet rings around council halls and schools where mesh nodes are forced to stay outside the fence.

It is, without question, the most beautiful setting in the novel.

> *Rudra balanced on a spruce branch with two arrows nocked, motionless as bark. Below, the fog erased the switchback and gave back only sound: the creak of rope lash points, the distant bell-muffle of a yak train.*

The marigold-staked child routes. The yak herds at altitude. The dojo wall with wooden swords and bamboo sticks and an orange flag bearing the grey trident. The Queen's Council Hall on its stone plinth with the carved lintel and warm lanterns at night.

### The Price

But here is what the novel never lets you forget:

No Mesh also means no hospitals with anti-ageing serum. No glide-cars coasting above six-lane boulevards. No biometric e-wallets that make commerce frictionless. No OxyPoles scrubbing the air. No instant communication -- writ cords with braided knot codes reset on each lunar cycle.

Rope bridges with a one-third rule: never more than one third of the planks occupied at once. New-moon convoys with no lamps -- only cat-eye beads on collars and staff-tip glow caps, hooded. Whiteout winters where doors are barred at a stranger's approach. Landslide-risk afternoons where convoy spacing stretches to minutes between each group.

The defence architecture is ingenious -- observation rings with mirrored slate reflectors, bolas cache posts, sap-dart throwers, silent alarm triplines -- but it exists because it has to. The Treaty Zone is not a paradise. It is a negotiated space that survives on discipline, self-reliance, and the willingness to live without everything the Mesh provides.

### The Question

> *The Treaty Zone is proof that an alternative to the Mesh exists. But the price is everything the Mesh provides.*

The novel's central tension -- safety versus freedom -- finds its purest expression here. The metropoles offer convenience indistinguishable from compliance. The Treaty Zone offers autonomy inseparable from hardship.

If you could choose: the clean boulevards and the hovercams, or the fog through pine canopy and the silence -- which would you take?

And be honest about what you would miss.`,
    topicSlugs: ['world-building'],
    isPinned: false,
    status: 'PUBLISHED',
  },

  // ─────────────────────────────────────────────────────────────────
  // Thread 9: What Brought You Here?
  // ─────────────────────────────────────────────────────────────────
  {
    title: 'What Brought You Here?',
    body: `Simple question, no wrong answers.

How did you discover Bharatvarsh? And what was the thing that made you stay?

Was it the premise -- the 1717 divergence, the idea of a subcontinent that was never colonised?

Was it a character -- Kahaan's ambition, Rudra's silence, Hana's conscience, the unsettling warmth of Pratap's smile?

Was it the world itself -- the OxyPoles and hovercams and biometric checkpoints that feel less like science fiction and more like next Tuesday?

Was it the cover? A recommendation? A post you saw somewhere? A quote that landed?

I will go first: for me it was the tagline.

> *"What would you sacrifice for the truth?"*

Six words. And I have been turning them over ever since.

Your turn. No lore knowledge required, no theories needed -- just tell us what brought you through the door.`,
    topicSlugs: ['general'],
    isPinned: false,
    status: 'PUBLISHED',
  },
];
