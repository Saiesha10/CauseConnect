-- Ensure UUID extension is enabled in Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert users (10 organizers, 10 regular users)
-- Insert users (10 organizers, 10 regular users)
INSERT INTO users (id, full_name, email, role, profile_picture) VALUES
(uuid_generate_v4(), 'Priya Sharma', 'priya.sharma@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'),
(uuid_generate_v4(), 'Michael Chen', 'michael.chen@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'),
(uuid_generate_v4(), 'Amita Desai', 'amita.desai@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9'),
(uuid_generate_v4(), 'David Kim', 'david.kim@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'),
(uuid_generate_v4(), 'Sofia Alvarez', 'sofia.alvarez@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'),
(uuid_generate_v4(), 'Rahul Gupta', 'rahul.gupta@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1522529599102-1b7a3c3d6b5a'),
(uuid_generate_v4(), 'Emma Wilson', 'emma.wilson@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef'),
(uuid_generate_v4(), 'Arjun Patel', 'arjun.patel@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1506794778202-1d0d8b3b0b9b'),
(uuid_generate_v4(), 'Lila Nguyen', 'lila.nguyen@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce'),
(uuid_generate_v4(), 'Vikram Singh', 'vikram.singh@ngo.org', 'organizer', 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08'),
(uuid_generate_v4(), 'Aisha Khan', 'aisha.khan@gmail.com', 'user', 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263'),
(uuid_generate_v4(), 'Rahul Patel', 'rahul.patel@gmail.com', 'user', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'),
(uuid_generate_v4(), 'Sophie Brown', 'sophie.brown@gmail.com', 'user', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e'),
(uuid_generate_v4(), 'Anil Kumar', 'anil.kumar@gmail.com', 'user', 'https://images.unsplash.com/photo-1508341591423-4347099e1f38'),
(uuid_generate_v4(), 'Maria Lopez', 'maria.lopez@gmail.com', 'user', 'https://images.unsplash.com/photo-1517202383675-eb0a6e27775f'),
(uuid_generate_v4(), 'Nikhil Verma', 'nikhil.verma@gmail.com', 'user', 'https://images.unsplash.com/photo-1518806118471-f28b20a1d79d'),
(uuid_generate_v4(), 'Emily Davis', 'emily.davis@gmail.com', 'user', 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7'),
(uuid_generate_v4(), 'Sanjay Joshi', 'sanjay.joshi@gmail.com', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'),
(uuid_generate_v4(), 'Clara Mendes', 'clara.mendes@gmail.com', 'user', 'https://images.unsplash.com/photo-1517841905240-472988babdf9'),
(uuid_generate_v4(), 'Ravi Shankar', 'ravi.shankar@gmail.com', 'user', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e')
ON CONFLICT (email) DO NOTHING;

-- Insert NGOs (10 NGOs with realistic causes and images)
INSERT INTO ngos (id, name, cause, description, contact_info, created_by, ngo_picture, location, donation_link) VALUES
(uuid_generate_v4(), 'Clean River Initiative', 'Environment', 'Restoring India''s rivers through clean-up drives and awareness campaigns.', 'info@cleanriver.org', (SELECT id FROM users WHERE email = 'priya.sharma@ngo.org'), 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Varanasi, India', 'https://cleanriver.org/donate'),
(uuid_generate_v4(), 'Educate All', 'Education', 'Free education and resources for underprivileged children in rural India.', 'contact@educateall.org', (SELECT id FROM users WHERE email = 'priya.sharma@ngo.org'), 'https://images.unsplash.com/photo-1516321497487-e288fb19713f', 'Rajasthan, India', 'https://educateall.org/donate'),
(uuid_generate_v4(), 'Health for Humanity', 'Healthcare', 'Mobile medical clinics for remote communities in Southeast Asia.', 'support@healthforhumanity.org', (SELECT id FROM users WHERE email = 'michael.chen@ngo.org'), 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7', 'Cambodia', 'https://healthforhumanity.org/donate'),
(uuid_generate_v4(), 'Green Future Trust', 'Environment', 'Promoting reforestation and sustainable farming in Africa.', 'info@greenfuture.org', (SELECT id FROM users WHERE email = 'david.kim@ngo.org'), 'https://images.unsplash.com/photo-1448375240586-882707db888b', 'Kenya', 'https://greenfuture.org/donate'),
(uuid_generate_v4(), 'Empower Women', 'Gender Equality', 'Empowering women through vocational training and microfinance.', 'contact@empowerwomen.org', (SELECT id FROM users WHERE email = 'sofia.alvarez@ngo.org'), 'https://images.unsplash.com/photo-1607746882042-9446351c901e', 'Delhi, India', 'https://empowerwomen.org/donate'),
(uuid_generate_v4(), 'Food for All', 'Hunger Relief', 'Distributing meals to homeless populations in urban India.', 'support@foodforall.org', (SELECT id FROM users WHERE email = 'rahul.gupta@ngo.org'), 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', 'Mumbai, India', 'https://foodforall.org/donate'),
(uuid_generate_v4(), 'Bright Minds Academy', 'Education', 'STEM education programs for disadvantaged youth in Latin America.', 'info@brightminds.org', (SELECT id FROM users WHERE email = 'emma.wilson@ngo.org'), 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655', 'Brazil', 'https://brightminds.org/donate'),
(uuid_generate_v4(), 'Safe Haven', 'Child Welfare', 'Providing shelter and education for orphaned children in India.', 'contact@safehaven.org', (SELECT id FROM users WHERE email = 'arjun.patel@ngo.org'), 'https://images.unsplash.com/photo-1516627145497-ae6968895b74', 'Chennai, India', 'https://safehaven.org/donate'),
(uuid_generate_v4(), 'Clean Energy Now', 'Renewable Energy', 'Promoting solar energy adoption in rural communities.', 'info@cleanenergynow.org', (SELECT id FROM users WHERE email = 'lila.nguyen@ngo.org'), 'https://images.unsplash.com/photo-1509395176047-4a66953fd231', 'Nepal', 'https://cleanenergynow.org/donate'),
(uuid_generate_v4(), 'Hope for Health', 'Healthcare', 'Free eye care and surgeries for low-income families.', 'support@hopeforhealth.org', (SELECT id FROM users WHERE email = 'vikram.singh@ngo.org'), 'https://images.unsplash.com/photo-1576091160399-1d65f9c5e7af', 'Rural India', 'https://hopeforhealth.org/donate');

-- Insert events (one event per NGO)
INSERT INTO events (id, ngo_id, title, description, event_date, location, volunteers_needed) VALUES
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Clean River Initiative'), 'Ganga Clean-Up Drive 2025', 'Community-led clean-up along the Ganga River in Varanasi.', '2025-11-15T09:00:00+05:30', 'Varanasi, India', 50),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Educate All'), 'Rural School Book Drive', 'Donate books and volunteer to teach in Rajasthan.', '2025-12-01T10:00:00+05:30', 'Rajasthan, India', 30),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Health for Humanity'), 'Mobile Clinic Outreach', 'Free health check-ups in rural Cambodia.', '2025-11-20T08:00:00+07:00', 'Rural Cambodia', 20),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Green Future Trust'), 'Tree Planting Festival', 'Plant 5000 trees in Kenya with local communities.', '2025-12-10T09:00:00+03:00', 'Kenya', 100),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Empower Women'), 'Women''s Skill Workshop', 'Free sewing and business training for women in Delhi.', '2025-11-25T11:00:00+05:30', 'Delhi, India', 25),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Food for All'), 'Mumbai Meal Distribution', 'Distribute 1000 meals to the homeless in Mumbai.', '2025-11-30T12:00:00+05:30', 'Mumbai, India', 40),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Bright Minds Academy'), 'STEM Workshop for Youth', 'Hands-on robotics workshop for teens in Brazil.', '2025-12-05T09:00:00-03:00', 'Brazil', 15),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Safe Haven'), 'Orphanage Open House', 'Visit our shelter and support children''s education in Chennai.', '2025-11-28T10:00:00+05:30', 'Chennai, India', 20),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Clean Energy Now'), 'Solar Panel Installation Drive', 'Install solar panels in rural Nepal.', '2025-12-15T09:00:00+05:45', 'Rural Nepal', 30),
(uuid_generate_v4(), (SELECT id FROM ngos WHERE name = 'Hope for Health'), 'Free Eye Camp', 'Eye check-ups and cataract surgeries in rural India.', '2025-12-08T09:00:00+05:30', 'Rural India', 25);

-- Insert favorites (multiple users favor NGOs)
INSERT INTO favorites (id, user_id, ngo_id) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'aisha.khan@gmail.com'), (SELECT id FROM ngos WHERE name = 'Clean River Initiative')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'aisha.khan@gmail.com'), (SELECT id FROM ngos WHERE name = 'Educate All')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'rahul.patel@gmail.com'), (SELECT id FROM ngos WHERE name = 'Health for Humanity')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'sophie.brown@gmail.com'), (SELECT id FROM ngos WHERE name = 'Green Future Trust')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'sophie.brown@gmail.com'), (SELECT id FROM ngos WHERE name = 'Empower Women')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'anil.kumar@gmail.com'), (SELECT id FROM ngos WHERE name = 'Food for All')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'maria.lopez@gmail.com'), (SELECT id FROM ngos WHERE name = 'Bright Minds Academy')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'nikhil.verma@gmail.com'), (SELECT id FROM ngos WHERE name = 'Safe Haven')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'emily.davis@gmail.com'), (SELECT id FROM ngos WHERE name = 'Clean Energy Now')),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'sanjay.joshi@gmail.com'), (SELECT id FROM ngos WHERE name = 'Hope for Health'));

-- Optional: Insert sample donations
INSERT INTO donations (id, user_id, ngo_id, amount) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'aisha.khan@gmail.com'), (SELECT id FROM ngos WHERE name = 'Clean River Initiative'), 1000.00),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'rahul.patel@gmail.com'), (SELECT id FROM ngos WHERE name = 'Health for Humanity'), 500.00),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'sophie.brown@gmail.com'), (SELECT id FROM ngos WHERE name = 'Empower Women'), 750.00);