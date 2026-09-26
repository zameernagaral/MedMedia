import { PrismaClient } from '@prisma/client';
import { db } from '../src/data/persistentDb';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database from legacy JSON...');

  const users = db.getUsers();
  const posts = db.getPosts({});
  const clips = db.getClips();

  // Seed Users
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          id: u.id,
          fullName: u.fullName,
          username: u.username,
          email: u.email || `${u.username}@medmedia.health`,
          passwordHash,
          avatarUrl: u.avatarUrl || '',
          role: u.role,
          verificationStatus: u.verificationStatus,
          bio: u.bio,
          doctorProfile: u.role === 'DOCTOR' && u.doctorDetails ? {
            create: {
              specialization: u.doctorDetails.specialization || '',
              qualifications: JSON.stringify(u.doctorDetails.qualifications || []),
              hospitalAffiliation: u.doctorDetails.hospitalAffiliation || '',
              location: u.doctorDetails.location || '',
              yearsExperience: u.doctorDetails.yearsExperience || 0,
              clinicalInterests: JSON.stringify(u.doctorDetails.clinicalInterests || []),
              researchPublications: JSON.stringify(u.doctorDetails.researchPublications || []),
              medicalCouncilRegNumber: u.doctorDetails.medicalCouncilRegNumber || ''
            }
          } : undefined,
          studentProfile: u.role === 'STUDENT' && u.studentDetails ? {
            create: {
              discipline: u.studentDetails.discipline || '',
              collegeName: u.studentDetails.collegeName || '',
              academicYear: u.studentDetails.academicYear || 1,
              interests: JSON.stringify(u.studentDetails.interests || []),
              futureSpecialty: u.studentDetails.futureSpecialty || '',
              researchInterests: JSON.stringify(u.studentDetails.researchInterests || [])
            }
          } : undefined
        }
      });
    }
  }
  console.log(`Seeded ${users.length} users.`);

  // Seed Posts
  for (const p of posts) {
    const authorId = p.authorId || users[0]?.id;
    if (authorId) {
      await prisma.post.create({
        data: {
          id: p.id,
          userId: authorId,
          postType: p.postType || 'TEXT',
          content: p.content,
          mediaUrls: JSON.stringify(p.mediaUrls || []),
          clinicalTags: JSON.stringify(p.clinicalTags || []),
          likesCount: p.likesCount || 0,
          commentsCount: p.commentsCount || 0,
          savesCount: p.savesCount || 0,
          sharesCount: p.sharesCount || 0
        }
      });
    }
  }
  console.log(`Seeded ${posts.length} posts.`);

  // Seed Clips
  for (const c of clips) {
    const authorId = c.authorId || users[0]?.id;
    if (authorId) {
      await prisma.medclip.create({
        data: {
          id: c.id,
          userId: authorId,
          clipType: c.clipType || 'Clinical Update',
          videoUrl: c.videoUrl || '',
          thumbnailUrl: c.thumbnailUrl || '',
          caption: c.caption || '',
          clinicalCategory: c.clinicalCategory || '',
          tags: JSON.stringify(c.tags || []),
          likesCount: c.likesCount || 0,
          commentsCount: c.commentsCount || 0,
          savesCount: c.savesCount || 0
        }
      });
    }
  }
  console.log(`Seeded ${clips.length} clips.`);
  
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
