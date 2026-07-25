// Seed data for the Growth tracker — one document per area, written once to the
// developmentAreas collection the first time a household opens that screen.
// Clinical labels/notes are parent-facing only; kidEmoji/kidLabel are what
// actually reach the child, via the shared achievement display resolver.

let seq = 0
function stage(label, opts = {}) {
  seq += 1
  return {
    id: `stg_${seq}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    stars: opts.stars ?? 0,
    status: opts.status || 'pending',
    isStretch: !!opts.isStretch,
    notes: opts.notes || null,
  }
}

function withActive(stages) {
  // Ensure exactly one stage is 'active': the first non-complete stage,
  // unless the seed already marked one explicitly.
  if (stages.some(s => s.status === 'active')) return stages
  const idx = stages.findIndex(s => s.status !== 'complete')
  return stages.map((s, i) => i === idx && idx !== -1 ? { ...s, status: 'active' } : s)
}

function area(id, order, name, kidLabel, kidEmoji, stages, opts = {}) {
  const withStatus = withActive(stages)
  return {
    id,
    order,
    name,
    kidLabel,
    kidEmoji,
    pinned: !!opts.pinned,
    notes: opts.notes || null,
    stages: withStatus,
    currentStageIndex: withStatus.findIndex(s => s.status === 'active'),
  }
}

export const DEVELOPMENT_AREAS_SEED = [
  area('literacy', 1, 'Literacy', 'Reading & Writing', '📖', [
    stage('Understands print has meaning (left to right, top to bottom)', { stars: 5, status: 'complete' }),
    stage('Says letter sounds', { stars: 5, status: 'complete', notes: 'Ahead of target — most of the alphabet already' }),
    stage('Retells stories in own words', { stars: 5, status: 'complete' }),
    stage('Recognises own name in print', { status: 'active', notes: 'Needs initial test' }),
    stage('Makes marks with intent / early writing', { stars: 1, notes: 'Smiley face already logged' }),
    stage('Says all 26 letter sounds', { isStretch: true }),
  ]),

  area('maths', 2, 'Maths', 'Numbers', '🔢', [
    stage('Compares more/less, bigger/smaller', { stars: 5, status: 'complete' }),
    stage('Recognises numbers by sight, 1–15', { stars: 5, status: 'complete', notes: 'Target upgraded from 1–5' }),
    stage('Recognises simple shapes (circle, square, triangle)', { status: 'active', notes: 'Needs quick test' }),
    stage('Sorts by one property (colour, size, type)'),
    stage('Counts to 10 with 1:1 correspondence', { notes: 'Rote counting there, correspondence still developing' }),
    stage('Counts to 20', { isStretch: true }),
    stage('Simple addition/subtraction with objects (up to 5)', { isStretch: true }),
  ]),

  area('communication', 3, 'Communication and Language', 'Talking & Listening', '💬', [
    stage('Asks/answers why & how questions', { stars: 5, status: 'complete' }),
    stage('Long sentences, growing vocabulary', { stars: 5, status: 'complete', notes: 'Standout strength' }),
    stage('Listens to stories, responds with comments/questions', { stars: 5, status: 'complete' }),
    stage('Follows 2+ part instructions', { status: 'active', notes: 'Needs testing, likely starts high' }),
    stage('Follows 3-part instructions', { isStretch: true }),
    stage('Uses full sentences to explain reasoning ("because...")', { isStretch: true }),
    stage('Tells own original story (not retelling a known one)', { isStretch: true }),
  ]),

  area('penwork', 4, 'Pen Work', 'Pencil Skills', '✏️', [
    stage('Tripod pencil grip', { status: 'active' }),
    stage('Draws lines/circles, copies letters'),
    stage('Cutting along a line with scissors'),
    stage('Small object manipulation (threading, tweezers, playdough)'),
    stage('Writes first name (copying)', { isStretch: true }),
    stage('Writes first name (unaided)', { isStretch: true }),
  ], { pinned: true, notes: 'Reported at school, not yet witnessed at home — main summer focus area, pinned every night.' }),

  area('grossmotor', 5, 'Physical — Gross Motor', 'Moving & Balance', '🏃', [
    stage('Runs, jumps, climbs with control and balance', { stars: 5, status: 'complete' }),
    stage('Kicks, throws, catches', { stars: 3, notes: 'Throwing/catching effectively done — finishing on kicking' }),
    stage('Balance bike', { status: 'active', notes: 'Early days, building confidence' }),
    stage('Kung fu: follows instructor, balance, sequences', { notes: "Club not started — YouTube karate can count as early progress once logged" }),
    stage('Pedal bike transition', { isStretch: true }),
    stage('Kung fu: first belt/stripe', { isStretch: true, notes: "Align with club's actual grading criteria once known" }),
  ]),

  area('swimming', 6, 'Physical — Swimming', 'Swimming', '🏊', [
    stage('Enter water safely without teacher support', { status: 'active' }),
    stage('Blow bubbles with face in water'),
    stage('Float in soldier shape (front/back)'),
    stage('Float in star shape (front/back)'),
    stage('Push and glide from wall on back'),
    stage('Push and glide from wall, roll onto side, turn to back/front'),
    stage('Tuck knees to chest, rotate 360° with hands'),
    stage('Travel on back for 5m without teacher support'),
    stage('Get out of pool safely without steps'),
    stage('Answer 3 pool safety questions'),
    stage('Tidy up swim equipment'),
    stage('Swim! 2 badge criteria', { isStretch: true, notes: 'Fetch when available' }),
  ], { notes: 'Swim! 1 badge, Oldbury. Sequential — completing the full set is a badge celebration, bigger than a normal stage-complete.' }),

  area('psed', 7, 'Personal, Social and Emotional Development', 'Being Grown-up', '🤝', [
    stage('Plays cooperatively, takes turns', { stars: 5, status: 'complete' }),
    stage('Talks about feelings, manages them', { stars: 5, status: 'complete' }),
    stage('Forms friendships, plays well with others', { stars: 5, status: 'complete' }),
    stage('Dressing: coat', { stars: 5, status: 'complete' }),
    stage('Dressing: trousers', { status: 'active' }),
    stage('Dressing: socks'),
    stage('Dressing: buttons'),
    stage('Toileting: independent wiping'),
    stage('Tidying: unprompted', { notes: 'Currently does it with prompting' }),
    stage('Manages own bag/belongings at nursery/school unprompted', { isStretch: true }),
  ]),

  area('world', 8, 'Understanding the World', 'Exploring', '🌍', [
    stage('Talks about family and community', { stars: 5, status: 'complete' }),
    stage('Talks about observations', { stars: 5, status: 'complete', notes: 'Standout strength' }),
    stage('Some technology use', { stars: 5, status: 'complete' }),
    stage('Talks about past events', { stars: 5, status: 'complete', notes: "Standout: nan's old house" }),
    stage('Notices differences between people spontaneously', { status: 'active', notes: 'Not just when prompted' }),
    stage('Talks about seasons/weather changes over time', { isStretch: true }),
    stage('Shows awareness of simple safety in the world (roads, strangers)', { isStretch: true }),
  ]),

  area('arts', 9, 'Expressive Arts and Design', 'Making & Creating', '🎨', [
    stage('Sings songs, matches pitch', { stars: 5, status: 'complete' }),
    stage('Pretend play', { stars: 5, status: 'complete' }),
    stage('Draws/represents specific people', { stars: 5, status: 'complete' }),
    stage('Uses instruments to express', { stars: 5, status: 'complete' }),
    stage('Joins materials with purpose', { status: 'active', notes: "Blocks/Magnetiles with clear intent — watch for 'I made a...'" }),
    stage('Junk modelling / joining materials with tape, glue, etc.', { isStretch: true }),
    stage("Invents own pretend-play scenarios/characters", { isStretch: true }),
  ]),
]
