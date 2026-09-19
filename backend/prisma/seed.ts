import { PrismaClient, UserRole, AnswerType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const QUESTIONS_SEED = [
  {
    code: 'BODY_FRAME',
    prompt: 'How would you describe your overall physical body frame?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Thin, narrow, prominent joints and bones',
      'Medium, well-proportioned, athletic',
      'Broad, sturdy, large-boned and solid',
    ],
    scoringMap: {
      'Thin, narrow, prominent joints and bones': { vata: 3, pitta: 1, kapha: 0 },
      'Medium, well-proportioned, athletic': { vata: 1, pitta: 3, kapha: 1 },
      'Broad, sturdy, large-boned and solid': { vata: 0, pitta: 1, kapha: 3 },
    },
  },
  {
    code: 'BODY_WEIGHT',
    prompt: 'What is your typical body weight tendency?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Hard to gain weight, naturally underweight',
      'Moderate weight, easily gained and easily lost',
      'Gains weight easily, struggles to lose weight',
    ],
    scoringMap: {
      'Hard to gain weight, naturally underweight': { vata: 3, pitta: 1, kapha: 0 },
      'Moderate weight, easily gained and easily lost': { vata: 1, pitta: 3, kapha: 1 },
      'Gains weight easily, struggles to lose weight': { vata: 0, pitta: 1, kapha: 3 },
    },
  },
  {
    code: 'SKIN_TEXTURE',
    prompt: 'How is your skin texture and moisture?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Dry, rough, thin, prone to cracking or flaking',
      'Warm, sensitive, reddish, prone to rashes or acne',
      'Soft, smooth, cool, thick, well-lubricated',
    ],
    scoringMap: {
      'Dry, rough, thin, prone to cracking or flaking': { vata: 3, pitta: 0, kapha: 0 },
      'Warm, sensitive, reddish, prone to rashes or acne': { vata: 0, pitta: 3, kapha: 0 },
      'Soft, smooth, cool, thick, well-lubricated': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'HAIR_QUALITY',
    prompt: 'How would you describe your hair?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Dry, frizzy, brittle, thin, dark or dull',
      'Fine, soft, blonde/reddish/brown, early graying or thinning',
      'Thick, lustrous, wavy, strong, oily',
    ],
    scoringMap: {
      'Dry, frizzy, brittle, thin, dark or dull': { vata: 3, pitta: 0, kapha: 0 },
      'Fine, soft, blonde/reddish/brown, early graying or thinning': { vata: 0, pitta: 3, kapha: 0 },
      'Thick, lustrous, wavy, strong, oily': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'APPETITE_DIGESTION',
    prompt: 'What is the nature of your appetite and digestion?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Irregular, variable, gets bloated or gassy easily',
      'Sharp, strong, cannot tolerate skipped meals, intense hunger',
      'Steady, slow, can skip meals easily without distress',
    ],
    scoringMap: {
      'Irregular, variable, gets bloated or gassy easily': { vata: 3, pitta: 1, kapha: 0 },
      'Sharp, strong, cannot tolerate skipped meals, intense hunger': { vata: 0, pitta: 3, kapha: 0 },
      'Steady, slow, can skip meals easily without distress': { vata: 0, pitta: 1, kapha: 3 },
    },
  },
  {
    code: 'TEMPERATURE_PREFERENCE',
    prompt: 'What temperature of food and drinks do you naturally prefer?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Warm, hot soups, steaming teas, and cooked foods',
      'Cold, refreshing drinks, salads, and cooling items',
      'Warm and spiced foods, dislikes damp cold foods',
    ],
    scoringMap: {
      'Warm, hot soups, steaming teas, and cooked foods': { vata: 3, pitta: 0, kapha: 1 },
      'Cold, refreshing drinks, salads, and cooling items': { vata: 0, pitta: 3, kapha: 0 },
      'Warm and spiced foods, dislikes damp cold foods': { vata: 1, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'CLIMATE_TOLERANCE',
    prompt: 'Which climate or weather affects you most negatively?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Cold, windy, and dry weather',
      'Hot, humid, and intensely sunny weather',
      'Cold, damp, rainy, and cloudy weather',
    ],
    scoringMap: {
      'Cold, windy, and dry weather': { vata: 3, pitta: 0, kapha: 0 },
      'Hot, humid, and intensely sunny weather': { vata: 0, pitta: 3, kapha: 0 },
      'Cold, damp, rainy, and cloudy weather': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'SLEEP_PATTERN',
    prompt: 'How is your sleep quality and duration?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Light, interrupted, tends to wake up early or suffer insomnia',
      'Moderate, sound (6-7 hours), easily woken but falls back asleep',
      'Heavy, deep, excessive (8+ hours), hard to wake up',
    ],
    scoringMap: {
      'Light, interrupted, tends to wake up early or suffer insomnia': { vata: 3, pitta: 0, kapha: 0 },
      'Moderate, sound (6-7 hours), easily woken but falls back asleep': { vata: 0, pitta: 3, kapha: 0 },
      'Heavy, deep, excessive (8+ hours), hard to wake up': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'PHYSICAL_ENERGY',
    prompt: 'How is your physical energy and stamina?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Comes in short bursts, fatigues quickly, restless',
      'Moderate, competitive, focused, energetic when motivated',
      'High steady endurance, slow to start but great stamina',
    ],
    scoringMap: {
      'Comes in short bursts, fatigues quickly, restless': { vata: 3, pitta: 1, kapha: 0 },
      'Moderate, competitive, focused, energetic when motivated': { vata: 1, pitta: 3, kapha: 1 },
      'High steady endurance, slow to start but great stamina': { vata: 0, pitta: 1, kapha: 3 },
    },
  },
  {
    code: 'SPEECH_TALK',
    prompt: 'How would you describe your manner of speech?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Fast, talkative, wandering topics, sometimes stammering',
      'Clear, articulate, sharp, persuasive, direct',
      'Slow, melodious, calm, deliberate, few words',
    ],
    scoringMap: {
      'Fast, talkative, wandering topics, sometimes stammering': { vata: 3, pitta: 0, kapha: 0 },
      'Clear, articulate, sharp, persuasive, direct': { vata: 0, pitta: 3, kapha: 0 },
      'Slow, melodious, calm, deliberate, few words': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'WALKING_GAIT',
    prompt: 'How is your walking speed and movement?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Quick, brisk, light-footed, constantly on the move',
      'Moderate, purposeful, decisive, confident step',
      'Slow, steady, graceful, heavy grounded pace',
    ],
    scoringMap: {
      'Quick, brisk, light-footed, constantly on the move': { vata: 3, pitta: 0, kapha: 0 },
      'Moderate, purposeful, decisive, confident step': { vata: 0, pitta: 3, kapha: 0 },
      'Slow, steady, graceful, heavy grounded pace': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'MEMORY_LEARNING',
    prompt: 'How do you learn and remember information?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Grasps very quickly, but forgets quickly too',
      'Learns moderately fast, sharp analytical memory',
      'Takes time to learn, but retains long-term memory forever',
    ],
    scoringMap: {
      'Grasps very quickly, but forgets quickly too': { vata: 3, pitta: 0, kapha: 0 },
      'Learns moderately fast, sharp analytical memory': { vata: 0, pitta: 3, kapha: 0 },
      'Takes time to learn, but retains long-term memory forever': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'DECISION_MAKING',
    prompt: 'What is your typical decision-making style?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Hesitant, indecisive, changes mind frequently',
      'Decisive, confident, logical, firm after deciding',
      'Slow, cautious, reluctant to change, prefers status quo',
    ],
    scoringMap: {
      'Hesitant, indecisive, changes mind frequently': { vata: 3, pitta: 0, kapha: 0 },
      'Decisive, confident, logical, firm after deciding': { vata: 0, pitta: 3, kapha: 0 },
      'Slow, cautious, reluctant to change, prefers status quo': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'STRESS_RESPONSE',
    prompt: 'How do you emotionally react when under acute stress?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Anxious, fearful, nervous, overwhelmed, worried',
      'Irritable, angry, frustrated, critical, impatient',
      'Calm, withdrawn, stubborn, silent, slow to react',
    ],
    scoringMap: {
      'Anxious, fearful, nervous, overwhelmed, worried': { vata: 3, pitta: 0, kapha: 0 },
      'Irritable, angry, frustrated, critical, impatient': { vata: 0, pitta: 3, kapha: 0 },
      'Calm, withdrawn, stubborn, silent, slow to react': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'PERSPIRATION_SWEAT',
    prompt: 'How is your sweat and body heat?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Minimal sweat, rarely perspires, skin feels dry/cool',
      'Profuse sweating, strong odor, easily gets flushed and overheated',
      'Moderate sweat only with heavy exertion, pleasant odor',
    ],
    scoringMap: {
      'Minimal sweat, rarely perspires, skin feels dry/cool': { vata: 3, pitta: 0, kapha: 0 },
      'Profuse sweating, strong odor, easily gets flushed and overheated': { vata: 0, pitta: 3, kapha: 0 },
      'Moderate sweat only with heavy exertion, pleasant odor': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
  {
    code: 'ELIMINATION_BOWELS',
    prompt: 'What are your bowel and elimination patterns?',
    answerType: AnswerType.SINGLE_CHOICE,
    options: [
      'Irregular, dry, hard stools, tendency towards constipation',
      'Regular, loose or soft stools, frequent, urgent',
      'Regular, well-formed, sluggish or heavy, once a day',
    ],
    scoringMap: {
      'Irregular, dry, hard stools, tendency towards constipation': { vata: 3, pitta: 0, kapha: 0 },
      'Regular, loose or soft stools, frequent, urgent': { vata: 0, pitta: 3, kapha: 0 },
      'Regular, well-formed, sluggish or heavy, once a day': { vata: 0, pitta: 0, kapha: 3 },
    },
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Password@123', 12);

  // 1. Seed Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      email: 'doctor@example.com',
      fullName: 'Dr. Rahul Sharma',
      passwordHash,
      role: UserRole.DOCTOR,
      isActive: true,
    },
  });
  console.log('✅ Seeded Doctor:', doctor.email);

  // 2. Seed Student
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      fullName: 'Vikram Joshi (Intern)',
      passwordHash,
      role: UserRole.STUDENT,
      isActive: true,
    },
  });
  console.log('✅ Seeded Student:', student.email);

  // 3. Seed Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      fullName: 'Ananya Rao',
      passwordHash,
      role: UserRole.PATIENT,
      isActive: true,
    },
  });
  console.log('✅ Seeded Patient User:', patientUser.email);

  // 4. Seed Patient Profile
  const existingPatient = await prisma.patientProfile.findFirst({
    where: { fullName: 'Ananya Rao' },
  });

  if (!existingPatient) {
    const patientProfile = await prisma.patientProfile.create({
      data: {
        fullName: 'Ananya Rao',
        linkedUserId: patientUser.id,
        dateOfBirth: new Date('1998-05-12'),
        gender: 'FEMALE',
        phone: '9876543210',
        address: 'Mysuru, Karnataka',
        createdBy: doctor.id,
      },
    });
    console.log('✅ Seeded PatientProfile:', patientProfile.fullName, patientProfile.id);
  } else {
    console.log('ℹ️ PatientProfile already exists:', existingPatient.fullName);
  }

  // 5. Seed Questions
  for (const q of QUESTIONS_SEED) {
    await prisma.question.upsert({
      where: { code: q.code },
      update: {
        prompt: q.prompt,
        answerType: q.answerType,
        options: q.options,
        scoringMap: q.scoringMap,
        methodReference: 'baseline-v1',
        version: 1,
        isActive: true,
      },
      create: {
        code: q.code,
        prompt: q.prompt,
        answerType: q.answerType,
        options: q.options,
        scoringMap: q.scoringMap,
        methodReference: 'baseline-v1',
        version: 1,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${QUESTIONS_SEED.length} Prakriti Questions.`);

  console.log('✨ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
