-- Seed cities
INSERT INTO cities (name, name_amharic, description, image_url) VALUES
('Addis Ababa', 'አዲስ አበባ', 'The vibrant capital city of Ethiopia, known for its rich history, diverse culture, and as the diplomatic capital of Africa.', '/placeholder.svg?height=400&width=600'),
('Bahir Dar', 'ባህር ዳር', 'A beautiful lakeside city on the shores of Lake Tana, gateway to the Blue Nile Falls and ancient island monasteries.', '/placeholder.svg?height=400&width=600'),
('Gondar', 'ጎንደር', 'The historic royal city featuring stunning castles and churches from the 17th century Ethiopian empire.', '/placeholder.svg?height=400&width=600'),
('Lalibela', 'ላሊበላ', 'Home to the famous rock-hewn churches, a UNESCO World Heritage site and pilgrimage destination.', '/placeholder.svg?height=400&width=600'),
('Hawassa', 'ሐዋሳ', 'A peaceful resort city on the shores of Lake Hawassa, known for its fish market and beautiful lakeside views.', '/placeholder.svg?height=400&width=600'),
('Dire Dawa', 'ድሬ ዳዋ', 'A major commercial city with a unique blend of Ethiopian and French colonial architecture.', '/placeholder.svg?height=400&width=600')
ON CONFLICT (name) DO NOTHING;

-- Seed hotels for Addis Ababa
INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Sheraton Addis',
  c.id,
  'A luxurious 5-star hotel offering world-class amenities, stunning gardens, and exceptional service in the heart of Addis Ababa.',
  'Taitu Street, Addis Ababa',
  'Piazza',
  'luxury',
  250,
  500,
  ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Conference Rooms', '24/7 Security', 'Airport Shuttle'],
  'Located in a secure area with 24/7 security, CCTV surveillance, and secure parking. Safe neighborhood for foreign travelers.',
  true,
  true,
  '+251 11 517 1717',
  'reservations@sheratonaddis.com'
FROM cities c WHERE c.name = 'Addis Ababa';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Radisson Blu Hotel',
  c.id,
  'Modern international hotel near the African Union headquarters, featuring contemporary rooms and excellent business facilities.',
  'Kazanchis, Addis Ababa',
  'Kazanchis',
  'luxury',
  180,
  350,
  ARRAY['WiFi', 'Restaurant', 'Gym', 'Conference Rooms', '24/7 Security', 'Airport Shuttle', 'Business Center'],
  'Prime location near embassies and international organizations. Well-lit area with professional security staff.',
  true,
  true,
  '+251 11 515 7600',
  'info@radissonblu.com'
FROM cities c WHERE c.name = 'Addis Ababa';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Jupiter International Hotel',
  c.id,
  'A comfortable mid-range hotel with friendly staff and convenient location near Bole International Airport.',
  'Bole Road, Addis Ababa',
  'Bole',
  'mid-range',
  80,
  150,
  ARRAY['WiFi', 'Restaurant', 'Parking', '24/7 Reception', 'Room Service'],
  'Located on busy Bole Road with good lighting and nearby police presence. Airport pickup available.',
  true,
  false,
  '+251 11 661 8888',
  'info@jupiterhotel.et'
FROM cities c WHERE c.name = 'Addis Ababa';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Harmony Hotel',
  c.id,
  'Elegant boutique hotel in a quiet residential area, perfect for business travelers seeking comfort and tranquility.',
  'Bole Medhanialem, Addis Ababa',
  'Bole Medhanialem',
  'mid-range',
  100,
  180,
  ARRAY['WiFi', 'Restaurant', 'Bar', 'Parking', 'Gym', 'Conference Room'],
  'Quiet residential neighborhood. Hotel provides airport transfers and has 24-hour front desk security.',
  true,
  false,
  '+251 11 662 0000',
  'reservations@harmonyhotel.et'
FROM cities c WHERE c.name = 'Addis Ababa';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Taitu Hotel',
  c.id,
  'Historic budget hotel built in 1907, offering authentic Ethiopian atmosphere and budget-friendly rates in the heart of Piazza.',
  'Piazza, Addis Ababa',
  'Piazza',
  'budget',
  25,
  50,
  ARRAY['WiFi', 'Restaurant', 'Historic Building', 'City Center Location'],
  'Historic city center location. Basic security measures in place. Best to use hotel-arranged transport at night.',
  true,
  false,
  '+251 11 156 0787',
  'taituhotel@ethionet.et'
FROM cities c WHERE c.name = 'Addis Ababa';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Mr Martins Cozy Place',
  c.id,
  'A charming guesthouse offering affordable rooms with a homey atmosphere, popular with budget travelers and backpackers.',
  'Atlas Area, Addis Ababa',
  'Atlas',
  'budget',
  20,
  40,
  ARRAY['WiFi', 'Shared Kitchen', 'Laundry', 'Travel Desk', 'Luggage Storage'],
  'Friendly neighborhood with helpful staff who assist with local orientation. Gated compound with night guard.',
  true,
  false,
  '+251 91 234 5678',
  'cozyplace@gmail.com'
FROM cities c WHERE c.name = 'Addis Ababa';

-- Seed hotels for Bahir Dar
INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Kuriftu Resort & Spa',
  c.id,
  'Stunning lakeside resort with private beach, spa facilities, and beautiful views of Lake Tana.',
  'Lake Tana Shore, Bahir Dar',
  'Lakeside',
  'luxury',
  150,
  300,
  ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Water Sports', 'Private Beach', 'Conference Facilities'],
  'Gated resort with professional security. Peaceful lakeside location away from city bustle.',
  true,
  true,
  '+251 58 220 0444',
  'bahirdar@kurifturesorts.com'
FROM cities c WHERE c.name = 'Bahir Dar';

INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Blue Nile Resort',
  c.id,
  'Comfortable mid-range hotel with excellent location for exploring Lake Tana and the Blue Nile Falls.',
  'Main Street, Bahir Dar',
  'City Center',
  'mid-range',
  60,
  120,
  ARRAY['WiFi', 'Restaurant', 'Tour Desk', 'Parking', 'Garden'],
  'Central location with good access to local attractions. Staff can arrange trusted guides for excursions.',
  true,
  false,
  '+251 58 220 1234',
  'info@bluenileresort.et'
FROM cities c WHERE c.name = 'Bahir Dar';

-- Seed hotels for Gondar
INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Goha Hotel',
  c.id,
  'Hilltop hotel offering panoramic views of Gondar and the surrounding mountains, perfect for history enthusiasts.',
  'Goha Hill, Gondar',
  'Goha Hill',
  'mid-range',
  70,
  140,
  ARRAY['WiFi', 'Restaurant', 'Bar', 'Parking', 'Panoramic Views', 'Tour Desk'],
  'Quiet hilltop location with stunning views. Well-maintained grounds with security personnel.',
  true,
  true,
  '+251 58 111 2345',
  'gohahotel@ethionet.et'
FROM cities c WHERE c.name = 'Gondar';

-- Seed hotels for Lalibela
INSERT INTO hotels (name, city_id, description, address, area, price_range, price_min, price_max, amenities, safety_notes, is_verified, is_featured, contact_phone, contact_email)
SELECT 
  'Mountain View Hotel',
  c.id,
  'Traditional-style hotel with breathtaking mountain views, walking distance to the famous rock-hewn churches.',
  'Near Rock Churches, Lalibela',
  'Town Center',
  'mid-range',
  50,
  100,
  ARRAY['WiFi', 'Restaurant', 'Traditional Coffee Ceremony', 'Guide Services', 'Mountain Views'],
  'Safe small-town atmosphere. Hotel provides registered local guides for church visits.',
  true,
  true,
  '+251 33 336 0200',
  'mountainview@lalibela.et'
FROM cities c WHERE c.name = 'Lalibela';
