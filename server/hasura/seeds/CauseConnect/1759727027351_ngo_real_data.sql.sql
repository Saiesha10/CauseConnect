-- Ensure UUID extension is enabled in Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert users (10 organizers, 10 regular users)
INSERT INTO users (id, full_name, email, role, profile_picture, firebase_uid) VALUES
(uuid_generate_v4(), 'Priya Sharma', 'priya.sharma@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'FRjufJRWAacowpo7q6SBRp9Nyjp2'),
(uuid_generate_v4(), 'Rajesh Patel', 'rajesh.patel@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', '93M8SuREo0NXdgUJLF2jO0luBN03'),
(uuid_generate_v4(), 'Ananya Gupta', 'ananya.gupta@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9', 'iGAaNm8wtIM6qT0ogUyJmG6fJ1g2'),
(uuid_generate_v4(), 'Vikram Singh', 'vikram.singh@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1522529590739-8693e1d1850b', '4c42eiqBPvfRPlQrLyBCHltMkCd2'),
(uuid_generate_v4(), 'Neha Verma', 'neha.verma@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'ZO1A2eCgROTY2lA1KzBrmIVPLFO2'),
(uuid_generate_v4(), 'Arjun Mehta', 'arjun.mehta@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1506794778202-36a4879b4ed9', 'DP0wqfHnbsgHcq9qEnKCVUSm2aB2'),
(uuid_generate_v4(), 'Sneha Reddy', 'sneha.reddy@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263', 'qd8tmSw9ttPQ8uGcOqFbq3g6JtH3'),
(uuid_generate_v4(), 'Rohan Desai', 'rohan.desai@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef', 'pTObHOfLJogHMoo8FYdJvCkMTWq1'),
(uuid_generate_v4(), 'Kavita Joshi', 'kavita.joshi@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe', '2BsjRUI9a7gdKtt5cpwubLn0NzB2'),
(uuid_generate_v4(), 'Sanjay Kumar', 'sanjay.kumar@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', '09iJwTexywRy0dtJneGar4tGRAn2'),
(uuid_generate_v4(), 'Aisha Khan', 'aisha.khan@gmail.com', 'user', 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263', 'k7AEh2TEPWcIY9glwLX5yGSUb863'),
(uuid_generate_v4(), 'Sameer Ali', 'sameer.ali@yahoo.com', 'user', 'https://images.unsplash.com/photo-1506794778202-36a4879b4ed9', 'SaVHKXYsxxdGfondUiyzS4wlseT2'),
(uuid_generate_v4(), 'Riya Kapoor', 'riya.kapoor@outlook.com', 'user', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'OOpWETTtobcFb9e0mhbLmvEAhWq2'),
(uuid_generate_v4(), 'Aditya Nair', 'aditya.nair@gmail.com', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'h8CufmTmmeNIK9gJEYlqJ5VL2hk1'),
(uuid_generate_v4(), 'Pooja Menon', 'pooja.menon@hotmail.com', 'user', 'https://images.unsplash.com/photo-1517841905240-472988babdf9', 'UqHcf9gBISYChyXB4j8CovB6wJs1'),
(uuid_generate_v4(), 'Karan Shah', 'karan.shah@gmail.com', 'user', 'https://images.unsplash.com/photo-1522529590739-8693e1d1850b', 'AJLm6IpmIJeKRLcbUTgdORhNzEg2'),
(uuid_generate_v4(), 'Divya Iyer', 'divya.iyer@yahoo.com', 'user', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef', 'xyAewLG4WFUnYsa2d0MXMsylT8Z2'),
(uuid_generate_v4(), 'Amitabh Bose', 'amitabh.bose@outlook.com', 'user', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ivklkCSf53ao2liAlRyPm54ZNXi1'),
(uuid_generate_v4(), 'Lakshmi Rao', 'lakshmi.rao@gmail.com', 'user', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe', 'KJLTmXxGYuU8vRFbapNI9Tb1U4q1'),
(uuid_generate_v4(), 'Siddharth Pillai', 'siddharth.pillai@hotmail.com', 'user', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'S3SMXjrm9SOFNp20Cb8QoD9MjUf1')
ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid;