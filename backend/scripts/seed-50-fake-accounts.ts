import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// List of realistic Medical Avatars (Unsplash high quality doctor & medical student portraits)
const AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1594824813566-788b209d7374?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80'
];

// Realistic Clinical Posts Media
const POST_MEDIA = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'
];

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
  'Radiology', 'Oncology', 'Emergency Medicine', 'General Surgery', 'Gastroenterology'
];

const COLLEGES = [
  'AIIMS New Delhi', 'Maulana Azad Medical College', 'KMC Manipal', 
  'Grant Medical College Mumbai', 'JIPMER Puducherry', 'AFMC Pune',
  'Christian Medical College Vellore', 'Madras Medical College'
];

async function seedFakeAccounts() {
  console.log('🚀 Starting creation of 50 fake Instagram-style medical accounts...');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const createdUsers: any[] = [];

  const firstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Kabir', 'Sneha', 'Arjun', 'Meera',
    'Aditya', 'Pooja', 'Siddharth', 'Divya', 'Karan', 'Tanvi', 'Rahul', 'Rhea', 'Varun', 'Isha',
    'Yash', 'Kavya', 'Tarun', 'Anushka', 'Manish', 'Shreya', 'Amit', 'Ritik', 'Sanjay', 'Kriti',
    'Harsh', 'Radhika', 'Nikhil', 'Simran', 'Gaurav', 'Payal', 'Aman', 'Nisha', 'Vivek', 'Swati',
    'Deepak', 'Avani', 'Alok', 'Ruchika', 'Suraj', 'Preeti', 'Abhishek', 'Juhi', 'Pranav', 'Riddhi'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Mehta', 'Nair', 'Patel', 'Deshmukh', 'Rao', 'Reddy', 'Iyer',
    'Chopra', 'Malhotra', 'Joshi', 'Bhat', 'Agarwal', 'Sen', 'Kulkarni', 'Mukherjee', 'Shetty', 'Singh'
  ];

  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i % lastNames.length];
    const isDoctor = i < 30; // 30 Doctors, 20 Scholars
    const specialty = SPECIALTIES[i % SPECIALTIES.length];
    const college = COLLEGES[i % COLLEGES.length];

    const username = isDoctor 
      ? `dr_${fn.toLowerCase()}_${specialty.toLowerCase().slice(0, 5)}`
      : `${fn.toLowerCase()}_${ln.toLowerCase().slice(0, 4)}_md`;
    
    const email = `${username}@medmedia.health`;
    const avatarUrl = AVATARS[i % AVATARS.length];

    const bio = isDoctor
      ? `Senior Consultant @ ${college} | ${specialty} Specialist | Clinical research & Case Discussions 🩺`
      : `Medical Scholar @ ${college} | Final Year MBBS | USMLE Aspirant | MedEd content creator 📚`;

    try {
      const user = await prisma.user.upsert({
        where: { username },
        update: {
          avatarUrl,
          bio
        },
        create: {
          fullName: isDoctor ? `Dr. ${fn} ${ln}` : `${fn} ${ln}`,
          username,
          email,
          passwordHash,
          avatarUrl,
          role: isDoctor ? 'DOCTOR' : 'STUDENT',
          verificationStatus: isDoctor ? 'VERIFIED' : 'PENDING',
          bio,
          doctorProfile: isDoctor ? {
            create: {
              specialization: specialty,
              qualifications: 'MBBS, MD, DM',
              hospitalAffiliation: college,
              location: 'New Delhi, India',
              yearsExperience: 5 + (i % 15),
              clinicalInterests: JSON.stringify([specialty, 'Interventional Procedures', 'Telemedicine']),
              researchPublications: JSON.stringify(['Journal of Medical Case Reports 2025', 'International Cardiology Review']),
              medicalCouncilRegNumber: `DMC-${10000 + i}`
            }
          } : undefined,
          studentProfile: !isDoctor ? {
            create: {
              discipline: 'MEDICAL_STUDENT',
              collegeName: college,
              academicYear: (i % 4) + 1,
              interests: JSON.stringify(['Clinical Diagnostics', 'Internal Medicine', 'Surgery']),
              futureSpecialty: specialty,
              researchInterests: JSON.stringify(['Genomics', 'AI in Healthcare'])
            }
          } : undefined
        }
      });
      createdUsers.push(user);
    } catch (e: any) {
      console.log(`User ${username} error:`, e.message);
    }
  }

  // Ensure we have at least 50 users from DB
  const allUsers = await prisma.user.findMany({ take: 50 });
  console.log(`✅ ${allUsers.length} Instagram-style medical accounts available in database.`);

  // Create Posts (Instagram Style Clinical Feed)
  console.log('📸 Creating Instagram-style clinical posts, images, and discussions...');

  const samplePostCaptions = [
    {
      content: "Interesting 12-Lead ECG from today's ER shift. 62M presented with chest pressure and diaphoresis. Notice the ST-segment elevation in leads II, III, and aVF with reciprocal depression in I and aVL. Diagnosis: Acute Inferior Wall STEMI. Door-to-balloon time: 38 mins! 🫀",
      tags: ['Cardiology', 'ECG', 'STEMI', 'EmergencyMedicine', 'MedicalCase']
    },
    {
      content: "MRI Brain showing a well-circumscribed extra-axial mass with broad dural attachment in the right parasagittal region. Classic dural tail sign visible. Histopathology confirmed Grade I Meningioma. Successful complete resection achieved! 🧠🔬",
      tags: ['Neurology', 'Neurosurgery', 'Radiology', 'MRI', 'BrainTumor']
    },
    {
      content: "High-yield pearl for NEET-PG / USMLE Step 1: Differentiating Nephritic vs Nephrotic Syndrome. Remember: Nephritic = Hematuria + Hypertension + Oliguria; Nephrotic = Heavy Proteinuria (>3.5g/day) + Hypoalbuminemia + Generalized Edema! 💡📝",
      tags: ['MedEd', 'USMLE', 'NEETPG', 'Nephrology', 'MedicalScholar']
    },
    {
      content: "First lap-chole laparoscopic gallbladder removal surgery of the week. Minimal blood loss and postoperative recovery was smooth. Always double-check the Critical View of Safety (CVS) before clipping the cystic duct! 🏥✂️",
      tags: ['Surgery', 'Laparoscopy', 'ORLife', 'GeneralSurgery']
    },
    {
      content: "Pediatric Rash Case Challenge! 4yo child presents with high fever for 5 days, bilateral non-purulent conjunctivitis, strawberry tongue, and desquamation of fingertips. What is your diagnosis and immediate management? Drop answers below! 👇",
      tags: ['Pediatrics', 'MedicalQuiz', 'KawasakiDisease', 'ClinicalDiagnosis']
    }
  ];

  const createdPosts: any[] = [];
  for (let i = 0; i < 60; i++) {
    const author = allUsers[i % allUsers.length];
    const postTemplate = samplePostCaptions[i % samplePostCaptions.length];
    const hasMedia = i % 2 === 0;

    const post = await prisma.post.create({
      data: {
        userId: author.id,
        postType: hasMedia ? 'IMAGE' : 'TEXT',
        content: `${postTemplate.content} (Case Ref #${100 + i})`,
        mediaUrls: hasMedia ? JSON.stringify([POST_MEDIA[i % POST_MEDIA.length]]) : JSON.stringify([]),
        clinicalTags: JSON.stringify(postTemplate.tags),
        likesCount: Math.floor(Math.random() * 85) + 5,
        commentsCount: Math.floor(Math.random() * 20) + 1,
        savesCount: Math.floor(Math.random() * 30),
        sharesCount: Math.floor(Math.random() * 15)
      }
    });
    createdPosts.push(post);
  }

  console.log(`✅ ${createdPosts.length} clinical posts generated.`);

  // Create Follow Relationships (Instagram Social Graph)
  console.log('🤝 Establishing Instagram follow graph between accounts...');
  let followCount = 0;
  for (let i = 0; i < allUsers.length; i++) {
    const follower = allUsers[i];
    // Follow 5 to 10 random accounts
    const followTargets = allUsers.filter(u => u.id !== follower.id).sort(() => 0.5 - Math.random()).slice(0, 8);

    for (const target of followTargets) {
      try {
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: target.id
          }
        });
        followCount++;
      } catch (e) {
        // Unique constraint ignore
      }
    }
  }
  console.log(`✅ Established ${followCount} follow connections.`);

  // Create Instagram Stories (24h Active Stories)
  console.log('📸 Generating 25 active Instagram Stories...');
  for (let i = 0; i < 25; i++) {
    const user = allUsers[(i * 2) % allUsers.length];
    await prisma.story.create({
      data: {
        userId: user.id,
        mediaUrl: POST_MEDIA[i % POST_MEDIA.length],
        caption: `On call rounds in ${SPECIALTIES[i % SPECIALTIES.length]} ward! 🩺`,
        isVideo: false,
        clinicalTags: JSON.stringify(['OnCall', 'HospitalRounds']),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create MedClips (Reels)
  console.log('🎥 Generating 20 MedClips (Instagram Reels)...');
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    await prisma.medclip.create({
      data: {
        userId: user.id,
        clipType: 'Clinical Update',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: POST_MEDIA[i % POST_MEDIA.length],
        caption: `Quick 60-second walkthrough of 12-lead ECG reading method! 🫀 #MedClips #Cardiology`,
        clinicalCategory: SPECIALTIES[i % SPECIALTIES.length],
        tags: JSON.stringify(['MedClips', 'ClinicalUpdate', 'Reels']),
        viewsCount: Math.floor(Math.random() * 500) + 50,
        likesCount: Math.floor(Math.random() * 120) + 10,
        commentsCount: Math.floor(Math.random() * 15)
      }
    });
  }

  console.log('🎉 50 Fake Accounts, Instagram-style Feed, Stories, MedClips, and Follow Graph created successfully!');
}

seedFakeAccounts()
  .catch((err) => {
    console.error('❌ Error during fake account generation:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
