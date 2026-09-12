-- =========================================================================
-- MED MEDIA - Production Relational PostgreSQL Database Schema
-- Designed for Doctor/Student Tiered Healthcare Platform
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('DOCTOR', 'STUDENT', 'ADMIN', 'INSTITUTION');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE student_category AS ENUM ('MEDICAL_STUDENT', 'NURSING', 'B_PHARM', 'D_PHARM', 'LAB_PRACTITIONER', 'ALLIED_HEALTH');
CREATE TYPE post_type AS ENUM ('TEXT', 'TWEET', 'IMAGE_CASE', 'ARTICLE_LINK', 'CLINICAL_DISCUSSION');
CREATE TYPE job_category AS ENUM ('DOCTOR_JOB', 'ACADEMIC_JOB', 'INTERNSHIP', 'FELLOWSHIP');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'LOCUM', 'CONTRACT', 'REMOTE');
CREATE TYPE connection_type AS ENUM ('FOLLOW', 'CONNECT');
CREATE TYPE connection_status AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- 2. CORE USERS & AUTHENTICATION TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL,
    verification_status verification_status DEFAULT 'PENDING',
    verification_badge_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DOCTOR PROFILES (Slide 3)
CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150) NOT NULL,
    qualifications TEXT[] NOT NULL, -- e.g. ['MBBS', 'MD Cardiology', 'FRCS']
    hospital_affiliation VARCHAR(255) NOT NULL,
    location VARCHAR(200) NOT NULL,
    years_experience INT DEFAULT 0,
    clinical_interests TEXT[],
    research_publications TEXT[],
    medical_council_reg_number VARCHAR(100) NOT NULL,
    medical_license_document_url TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STUDENT PROFILES (Slide 4)
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    discipline student_category NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    academic_year INT NOT NULL, -- 1st, 2nd, 3rd, Final, Intern
    interests TEXT[],
    future_specialty VARCHAR(150),
    research_interests TEXT[],
    student_id_document_url TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DEVICE & SESSION MANAGEMENT (Slide 2 & 4)
CREATE TABLE device_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(150) NOT NULL, -- e.g., 'Pixel 8 Pro (Android)', 'MacBook Pro'
    device_os VARCHAR(80) NOT NULL,
    ip_address VARCHAR(64),
    refresh_token TEXT NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EPHEMERAL STORY UPDATES (Slide 5)
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    caption VARCHAR(300),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- default now() + 24 hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. HOME FEED POSTS (Slides 5 & 7)
-- Text, Tweets, Images, Links, Medical discussions (NO shorts/reels)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_type post_type NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    media_urls TEXT[],
    link_url TEXT,
    link_meta JSONB, -- { title, description, thumbnail }
    clinical_tags TEXT[], -- ['#Cardiology', '#ECGChallenge']
    case_poll JSONB, -- Optional poll options for diagnostic discussions
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MEDCLIPS (Slide 6)
-- Dedicated vertical video / clinical clip feature with Instagram/Reddit actions
CREATE TABLE medclips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT NOT NULL,
    clinical_category VARCHAR(100) NOT NULL, -- e.g., 'Surgical Pearl', 'ECG Masterclass'
    tags TEXT[],
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SOCIAL INTERACTIONS (Likes, Comments, Saves, Follows, Connects)
CREATE TABLE post_likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_saves (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medclip_likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clip_id UUID NOT NULL REFERENCES medclips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, clip_id)
);

CREATE TABLE medclip_saves (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clip_id UUID NOT NULL REFERENCES medclips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, clip_id)
);

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type connection_type NOT NULL DEFAULT 'CONNECT',
    status connection_status NOT NULL DEFAULT 'ACCEPTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (sender_id, receiver_id)
);

-- 10. OPPORTUNITIES - RESEARCH PROJECTS (Slide 8)
CREATE TABLE research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    specialty VARCHAR(120) NOT NULL,
    collaborator_roles_needed TEXT[], -- ['Data Analyst', 'Literature Reviewer', 'Resident Co-Author']
    is_open_call BOOLEAN DEFAULT TRUE,
    publication_target VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. OPPORTUNITIES - FREELANCING / LOCUM (Slide 8)
CREATE TABLE freelance_gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    location VARCHAR(200) NOT NULL,
    hourly_rate NUMERIC(10, 2),
    duration VARCHAR(100), -- e.g., 'Weekend coverage', '2 weeks locum'
    requirements TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. OPPORTUNITIES - JOBS (Slide 9)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category job_category NOT NULL,
    employment_type employment_type NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(200) NOT NULL,
    required_experience_years INT DEFAULT 0,
    salary_range VARCHAR(100),
    job_description TEXT NOT NULL,
    education_preference TEXT NOT NULL,
    skills_required TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_note TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (job_id, applicant_id)
);

-- 13. OPPORTUNITIES - EVENTS & CONFERENCES (Slide 8)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., 'Cardiology CME', 'Surgical Workshop'
    venue VARCHAR(300) NOT NULL,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organized_by VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. OPPORTUNITIES - CME COURSES (Slide 8)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cme_credits NUMERIC(4, 1) DEFAULT 0,
    course_url TEXT NOT NULL,
    thumbnail_url TEXT,
    overview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. COMMUNITIES & ASSOCIATIONS (Slide 8 & 10)
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    branch_name VARCHAR(150), -- Regional / State chapter
    category VARCHAR(100) NOT NULL,
    icon_url TEXT,
    members_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_doctor_specialization ON doctor_profiles(specialization);
CREATE INDEX idx_doctor_location ON doctor_profiles(location);
CREATE INDEX idx_student_discipline ON student_profiles(discipline);
CREATE INDEX idx_student_college ON student_profiles(college_name);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_medclips_created ON medclips(created_at DESC);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_events_start ON events(start_time ASC);
