// Travel Guardian - Comprehensive All-India Famous Attractions, Delicacies & Cultural Specialities
// Covers 60+ major destinations and pilgrimage hubs across all states of India,
// with authentic verified imagery, local delicacies, heritage attractions, and bazaar guides.

export const INDIA_DESTINATIONS = [
  // ─── GUJARAT ────────────────────────────────────────────────────────────────
  {
    id: 'ahmedabad',
    aliases: ['amdavad', 'ahmedabad', 'karnavati'],
    city: 'Ahmedabad',
    state: 'Gujarat',
    tagline: 'UNESCO World Heritage City: Sabarmati, Heritage Havelis & Street Food Capital',
    heroImage: 'https://images.unsplash.com/photo-1599818818817-268e3cb21aa9?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Khaman, Nylon Dhokla & Khandvi',
        desc: 'Spongy steamed savory gram-flour cakes seasoned with mustard seeds, curry leaves; and delicate rolled gram-flour sheets.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Das Khaman, Manek Chowk, Chandravilas',
      },
      {
        name: 'Fafda & Jalebi with Papaya Sambharo',
        desc: 'Crispy fried gram-flour strips served alongside warm, saffron-soaked spiral jalebis and spiced raw papaya salad.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Oshwal, Iscon Gathiya, Manek Chowk',
      },
      {
        name: 'Manek Chowk Midnight Food Feasts',
        desc: 'World-famous late-night street food market serving chocolate cheese sandwiches, gwalior dosa, and rabdi kulfi.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Manek Chowk Night Market (10 PM - 2 AM)',
      },
    ],
    attractions: [
      {
        name: 'Sabarmati Ashram (Hriday Kunj)',
        desc: 'Headquarters of Mahatma Gandhi during India’s independence movement; starting point of the 1930 Dandi Salt March.',
        timings: '8:30 AM - 6:30 PM (Free Entry)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/GANDHI_ASHRAM_03.jpg/600px-GANDHI_ASHRAM_03.jpg',
      },
      {
        name: 'Atal Pedestrian Riverfront Bridge',
        desc: 'Stunning glass-floor, kite-inspired pedestrian suspension bridge connecting the banks of the Sabarmati River.',
        timings: '9:00 AM - 11:00 PM (₹30 Entry)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Atal_Pedestrian_Bridge_at_Night.jpg/600px-Atal_Pedestrian_Bridge_at_Night.jpg',
      },
      {
        name: 'Adalaj Stepwell (Adalaj ni Vav)',
        desc: 'Magnificent 5-storey deep 15th-century Solanki subterranean stepwell adorned with exquisite stone carvings.',
        timings: '6:00 AM - 6:00 PM',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Adalaj_ki_Vav_Gujarat_240A1370_72.jpg/600px-Adalaj_ki_Vav_Gujarat_240A1370_72.jpg',
      },
    ],
    shopping: [
      {
        name: 'Patola & Bandhani Silk Sarees',
        desc: 'Intricate traditional double-ikat handwoven silks and tie-dye Bandhani textiles with mirror embroidery.',
        bazaar: 'Law Garden Night Bazaar, Ratanpole, Dhalgarwad',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Navratri World Festival (9 nights of Garba), Uttarayan International Kite Festival',
      bestSeason: 'October to March (Pleasant evenings)',
      safetyTips: 'Gujarat is a dry state with very low crime rates. Night bazaars are safe till 2 AM.',
    },
  },

  {
    id: 'surat',
    aliases: ['surat', 'suryapur'],
    city: 'Surat',
    state: 'Gujarat',
    tagline: 'The Diamond City & Textile Capital of India, Renowned for "Surti Jamvan"',
    heroImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Surti Locho & Sev Khamani',
        desc: 'Steamed spiced gram-flour delight drizzled with pure butter, green chutney, and crunchy sev.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Jani Locho, Jaani Farsan',
      },
      {
        name: 'Authentic Surti Undhiyu & Puri',
        desc: 'Traditional winter delicacy made with seasonal root vegetables, muthia dumplings, and fresh coconut cooked in earthen pots.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Gordhan Thal, Sasumaa Gujarati Thali',
      },
      {
        name: 'Ghari Sweets & Thick Cold Coco',
        desc: 'Royal mawa and pistachio stuffed pastry coated in pure ghee; paired with rich chocolate drink.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Shah Jamnadas Ghariwala, A-One Cold Coco',
      },
    ],
    attractions: [
      {
        name: 'Dumas Black Sand Beach Coast',
        desc: 'Scenic Arabian Sea coastline famous for its unique dark volcanic sand, camel rides, and piping hot bhajiyas.',
        timings: 'Sunrise to Sunset',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Surat Castle (Old Fort by Tapi River)',
        desc: '16th-century fortress built by Khudawand Khan to defend against Portuguese invasions.',
        timings: '10:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Surat Silk Sarees, Zari & Jacquard',
        desc: 'Wholesale textile paradise for Banarasi, georgette, and gold-embroidered Zari bridal sarees.',
        bazaar: 'Bombay Market, Ring Road Textile Market',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Chandani Padva (eating Ghari under the moonlight), Ganesh Chaturthi',
      bestSeason: 'November to February',
      safetyTips: 'Ranked among the top cleanest and safest industrial cities in India.',
    },
  },

  {
    id: 'vadodara',
    aliases: ['vadodara', 'baroda'],
    city: 'Vadodara',
    state: 'Gujarat',
    tagline: 'The Cultural Capital of Gujarat: Grand Royal Palaces & Art Heritage',
    heroImage: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Sev Usal with Tari & Bun',
        desc: 'Fiery dried pea curry topped with spicy garlic oil (tari), spring onions, and crunchy sev; eaten with fresh pav.',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Mahakali Sev Usal, Jay Mahakali',
      },
      {
        name: 'Bhakharwadi & Penda',
        desc: 'Crispy fried pinwheel rolls with sweet-spicy coconut filling; alongside rich milk penda.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Jagdish Farsan, Duliram Penda',
      },
    ],
    attractions: [
      {
        name: 'Laxmi Vilas Palace (4x Size of Buckingham Palace)',
        desc: 'Spectacular 19th-century Indo-Saracenic palace of the Gaekwads featuring stained glass, bronze sculptures, and armory.',
        timings: '9:30 AM - 5:00 PM (Closed Mondays)',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Statue of Unity (Sardar Patel 182m)',
        desc: 'World’s tallest statue located 85 km from Vadodara on the Narmada River; features viewing gallery and valley of flowers.',
        timings: '8:00 AM - 6:00 PM (Closed Mondays)',
        image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Handcrafted Garba Chaniya Choli & Wooden Toys',
        desc: 'Traditional embroidered chaniya cholis and Sankheda lacquer wooden furniture.',
        bazaar: 'Mangal Bazaar, Mandvi, Raopura',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'United Way Vadodara Navratri (World’s largest traditional garba gathering)',
      bestSeason: 'October to March',
      safetyTips: 'Very peaceful student and family friendly city.',
    },
  },

  {
    id: 'rajkot',
    aliases: ['rajkot', 'saurashtra'],
    city: 'Rajkot',
    state: 'Gujarat',
    tagline: 'Heart of Saurashtra: Gathiya Culture, Silver Jewellery & Kathiyawadi Feasts',
    heroImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Kathiyawadi Thali with Ringna no Olo & Bajra Rotla',
        desc: 'Smoky roasted eggplant mash cooked with garlic and green chillies, served with thick pearl millet rotlas slathered in white butter and jaggery.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Sanjay Kathiyawadi, Lords Thal, Heritage Thali',
      },
      {
        name: 'Vanela Gathiya & Peda',
        desc: 'Hand-rolled soft gram-flour gathiya with spicy fried chillies and Kadhi; followed by caramelised Rajkot Peda.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Kamdhenu Gathiya, Rasikbhai Chevdawala',
      },
    ],
    attractions: [
      {
        name: 'Kaba Gandhi No Delo (Mahatma Gandhi’s Childhood Home)',
        desc: 'The historic ancestral residence where Mahatma Gandhi lived as a child, now a memorial museum.',
        timings: '9:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Pradhyuman Zoological Park & Aji Dam',
        desc: 'Sprawling natural green reserve overlooking the scenic Aji River.',
        timings: '9:00 AM - 6:30 PM',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Pure Silver Jewellery & Patola Silk Weaves',
        desc: 'Renowned for hand-crafted silver ornaments, anklets, and Rajkot gold filigree jewellery.',
        bazaar: 'Soni Bazaar, Dharmendra Road',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Janmashtami Shobha Yatra & Saurashtra Lok Mela',
      bestSeason: 'October to February',
      safetyTips: 'Quiet afternoons as shopkeepers observe traditional riyaz/siesta 1 PM - 4 PM.',
    },
  },

  {
    id: 'dwarka',
    aliases: ['dwarka', 'dvaraka', 'dwarkadhish'],
    city: 'Dwarka',
    state: 'Gujarat',
    tagline: 'Ancient Golden Kingdom of Lord Krishna & Char Dham Holy Pilgrimage',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Dwarkadhish Chhappan Bhog & Satvik Thali',
        desc: 'Sacred temple offerings and traditional Kathiyawadi vegetarian feasts made without onion or garlic in pure cow ghee.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Temple Annakshetra, Shrinath Dining Hall',
      },
      {
        name: 'Fresh Coconut Water & Mawa Malpua',
        desc: 'Tender coastal coconut water and sweet pancakes soaked in warm cardamom syrup near the Gomti Ghat.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Gomti Ghat stalls, Local bazaar',
      },
    ],
    attractions: [
      {
        name: 'Dwarkadhish Jagat Mandir (2,200+ Years Old)',
        desc: 'Magnificent 5-storey sandstone temple with 72 carved pillars and the 52-yard sacred flag changing 5 times daily.',
        timings: '6:30 AM - 1:00 PM, 5:00 PM - 9:30 PM',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Beyt Dwarka Island & Sudama Setu',
        desc: 'Holy island sanctuary reachable by ferry boat where Lord Krishna’s residence once stood.',
        timings: 'Ferries operate 7:00 AM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Shivrajpur Blue Flag Certified Beach',
        desc: 'Pristine white sand beach with turquoise Arabian Sea waters, water sports, and dolphin sightings.',
        timings: '8:00 AM - 6:30 PM',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Gomti Chakra, Sacred Conches & Brass Idols',
        desc: 'Sacred swirling shell stones found in the Gomti riverbed and carved brass Krishna idols.',
        bazaar: 'Temple Market, Bathan Chowk',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Janmashtami Grand Celebration (500,000+ devotees gather)',
      bestSeason: 'September to March',
      safetyTips: 'Check tide timings before taking small boats at Okha to Beyt Dwarka.',
    },
  },

  {
    id: 'somnath',
    aliases: ['somnath', 'prabhas patan', 'veraval'],
    city: 'Somnath',
    state: 'Gujarat',
    tagline: 'The First Among the Twelve Sacred Jyotirlingas on the Arabian Sea Shore',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Somnath Temple Mahaprasad & Kathiyawadi Khichdi',
        desc: 'Nutritious lentil-rice khichdi cooked in ghee, served with spiced buttermilk (chaas), garlic chutney, and papad.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Somnath Trust Bhojanalaya, Sagar Darshan Restaurant',
      },
    ],
    attractions: [
      {
        name: 'Somnath Mahadev Jyotirlinga Temple',
        desc: 'Eternal shrine built in the Chalukya style on the seashore where arrow pillar (Baan Stambh) points to Antarctica with zero landmass.',
        timings: '6:00 AM - 10:00 PM (Light & Sound show at 8:00 PM)',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Triveni Sangam & Bhalka Tirth',
        desc: 'Holy confluence of Hiran, Kapila, and Saraswati rivers; and the sacred spot where Lord Krishna concluded his avatar.',
        timings: '6:00 AM - 7:30 PM',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Seashell Artifacts, Stone Carvings & Religious Mementos',
        desc: 'Handcrafted items carved from marine sea conches, polished agate stones, and rudraksha beads.',
        bazaar: 'Somnath Temple Complex Bazaar',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Mahashivratri Maha Mela & Kartik Purnima Fair',
      bestSeason: 'October to March',
      safetyTips: 'Swimming is strictly prohibited on Somnath beach due to strong ocean undercurrents.',
    },
  },

  {
    id: 'kutch',
    aliases: ['kutch', 'bhuj', 'rann of kutch', 'white desert', 'dholavira'],
    city: 'Kutch & Bhuj',
    state: 'Gujarat',
    tagline: 'The Great White Salt Desert, Harappan Dholavira & World-Class Tribal Handicrafts',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Kutchi Dabeli with Pomegranate & Peanuts',
        desc: 'The original Kutch street burger: sweet spiced potato mash filled with masala peanuts and pomegranate in a bun.',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Mandvi & Bhuj Street stalls, Dabeli Center',
      },
      {
        name: 'Kutchi Khichdi-Kadhi & Gulab Pak',
        desc: 'Wholesome yellow khichdi served with sweet and tangy yogurt kadhi; alongside mawa sweet flavoured with rose petals.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Khavda Sweet House (Bhuj), Toran Resort',
      },
    ],
    attractions: [
      {
        name: 'The Great Rann of Kutch (White Salt Desert)',
        desc: 'Vast 7,500 sq km shimmering salt crust desert that glows like silver under the full moon night.',
        timings: 'Best at Sunrise, Sunset, and Full Moon nights',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Aina Mahal & Prag Mahal (Bhuj)',
        desc: '18th-century mirror palace with Venetian glass chandeliers and Gothic clock tower offering views of Bhuj city.',
        timings: '9:00 AM - 12:00 PM, 3:00 PM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dholavira UNESCO Harappan Ancient City',
        desc: '5,000-year-old Indus Valley metropolis with pioneering stone water reservoirs and signboards.',
        timings: 'Sunrise to Sunset',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Rogan Art, Ajrakh Block Prints & Mirrorwork Quilts',
        desc: 'Castor oil free-hand Rogan painting in Nirona village, natural vegetable indigo block prints, and Rabari embroidery.',
        bazaar: 'Bhujodi Craft Village, Nirona, Hodka Village',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Rann Utsav (November to February grand tent city festival)',
      bestSeason: 'November to February (Pleasant winter in desert)',
      safetyTips: 'Permits are required for Dhordo border zone; carry photo ID (Aadhaar or Passport).',
    },
  },

  {
    id: 'gir',
    aliases: ['gir', 'sasan gir', 'junagadh'],
    city: 'Gir National Park & Junagadh',
    state: 'Gujarat',
    tagline: 'The Only Natural Sanctuary of the Asiatic Lion on Earth & Ancient Uparkot Citadel',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Authentic Kathiyawadi Dhokli nu Shaak & Buttermilk',
        desc: 'Wheat flour dumplings cooked in spicy tomato-garlic gravy, paired with chilled roasted cumin chaas.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Gir Jungle Lodge, Junagadh Local Thali centers',
      },
      {
        name: 'Gir Kesar Mango (King of Mangoes)',
        desc: 'World-famous bright orange pulp mangoes grown in the foothills of Girnar (Available April to June).',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Talala Mango Market, Sasan Gir roadside stalls',
      },
    ],
    attractions: [
      {
        name: 'Gir National Park Lion Safari',
        desc: 'Open jeep safari inside the dry deciduous forest home to over 670 wild Asiatic lions.',
        timings: 'Morning 6:00 AM - 9:00 AM, Evening 3:00 PM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Uparkot Fort & Mahabat Maqbara (Junagadh)',
        desc: '2,300-year-old fort with Buddhist caves and the fairy-tale Gothic-Islamic mausoleum with spiral minarets.',
        timings: '9:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Gir Forest Organic Honey & Siddi Tribal Handicrafts',
        desc: 'Wild natural forest honey collected by indigenous tribes and hand-carved teak wood souvenirs.',
        bazaar: 'Sasan Gir Market, Junagadh Circle',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Girnar Parikrama (sacred barefoot pilgrimage in November), Bhavnath Mela',
      bestSeason: 'December to March (Best wildlife sightings)',
      safetyTips: 'Book forest permits online on the official Gujarat Forest department portal well in advance.',
    },
  },

  // ─── MAHARASHTRA ────────────────────────────────────────────────────────────
  {
    id: 'mumbai',
    aliases: ['mumbai', 'bombay'],
    city: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'The City of Dreams: Marine Drive, Bollywood & Arabian Sea Charm',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Mumbai Vada Pav & Pav Bhaji',
        desc: 'Crispy potato fritter in soft bun with dry garlic chutney; and spiced buttery mashed vegetable stew.',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Sardar Pav Bhaji (Tardeo), Ashok Vada Pav (Kirti College)',
      },
      {
        name: 'Irani Chai, Bun Maska & Brun Maska',
        desc: 'Sweet, thick Persian milk tea served with warm crusty bread smothered in salted butter.',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Kyani & Co. (Marine Lines), Yazdani Bakery (Fort)',
      },
    ],
    attractions: [
      {
        name: 'Gateway of India & The Taj Mahal Palace',
        desc: 'Iconic 1924 basalt arch monument overlooking Mumbai Harbour and the Arabian Sea.',
        timings: 'Open 24 Hours (Best at sunset)',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Marine Drive (Queen’s Necklace)',
        desc: '3.6 km long arc-shaped seafront promenade lined with Art Deco buildings and crashing sea waves.',
        timings: 'Open 24 Hours',
        image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Colaba Causeway & Fashion Street',
        desc: 'Bustling flea markets with vintage antiques, boho clothes, kolhapuri sandals, and brass lamps.',
        bazaar: 'Colaba Causeway, Hill Road Bandra',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Ganesh Utsav (Lalbaugcha Raja), Kala Ghoda Arts Festival',
      bestSeason: 'November to February',
      safetyTips: 'Mumbai is known as one of India’s safest cities for solo & late-night travelers.',
    },
  },

  {
    id: 'pune',
    aliases: ['pune', 'poona'],
    city: 'Pune',
    state: 'Maharashtra',
    tagline: 'Oxford of the East & Seat of the Maratha Empire: Forts & Bakeries',
    heroImage: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Misal Pav & Puneri Bakarwadi',
        desc: 'Fiery sprouted moth bean curry garnished with onions, lemon, and farsan; and crispy Chitale spiced pinwheels.',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Kata Kirr, Bedekar Tea Stall, Chitale Bandhu',
      },
    ],
    attractions: [
      {
        name: 'Shaniwar Wada Fort',
        desc: 'Historical 1732 palace fort of the Peshwas featuring monumental wooden gates and fountain courtyards.',
        timings: '8:00 AM - 6:30 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Aga Khan Palace (Gandhi Memorial)',
        desc: 'Italian-arched palace where Mahatma Gandhi, Kasturba Gandhi, and Sarojini Naidu were interned in 1942.',
        timings: '9:00 AM - 5:30 PM',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Traditional Paithani Sarees & Kolhapuri Chappals',
        desc: 'Rich silk sarees with peacock pallu motifs and genuine handcrafted leather chappals.',
        bazaar: 'FC Road, Laxmi Road Market',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Pune International Film Festival, Shrimant Dagdusheth Halwai Ganpati',
      bestSeason: 'July to February',
      safetyTips: 'Pleasant weather and safe IT/student hub.',
    },
  },

  {
    id: 'shirdi',
    aliases: ['shirdi', 'sai baba', 'kopargaon'],
    city: 'Shirdi',
    state: 'Maharashtra',
    tagline: 'Sacred Abode of Shri Sai Baba: Faith, Saburi & Universal Harmony',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Sai Baba Prasadalaya Maha Feast & Guava Chutney',
        desc: 'Asia’s largest solar-powered mega kitchen serving wholesome vegetarian meals to over 80,000 pilgrims daily.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Shri Sai Sansthan Prasadalaya (10:00 AM - 10:00 PM)',
      },
    ],
    attractions: [
      {
        name: 'Shri Sai Baba Samadhi Mandir & Dwarkamai',
        desc: 'The sacred marble shrine and the humble mosque where Sai Baba spent over 60 years lighting sacred fire (Dhuni).',
        timings: '4:00 AM - 11:00 PM (Kakad Aarti at 4:30 AM)',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Sai Baba Sacred Shawls, Idols & Wooden Rosary Beads',
        desc: 'Sanctified neem wood malas, brass mementos, and framed depictions of Sai Baba.',
        bazaar: 'Temple Complex Bazaar',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Guru Purnima, Ram Navami, Vijayadashami Punyatithi',
      bestSeason: 'Year-round (Best October to March)',
      safetyTips: 'Book VIP Darshan passes online in advance to save waiting in long lines.',
    },
  },

  // ─── RAJASTHAN ──────────────────────────────────────────────────────────────
  {
    id: 'jaipur',
    aliases: ['jaipur', 'pink city'],
    city: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'The Pink City: Forts, Palaces & Royal Rajput Splendour',
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Dal Baati Churma & Ghewar',
        desc: 'Baked wheat baatis soaked in desi ghee with five-lentil curry; and honeycomb saffron sweet Ghewar.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Chokhi Dhani, Laxmi Mishthan Bhandar (LMB)',
      },
      {
        name: 'Pyaaz Kachori & Laal Maas',
        desc: 'Crisp layered onion kachoris and fiery royal mutton curry with Mathania chillies.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Rawat Mishthan Bhandar, Handi Restaurant',
      },
    ],
    attractions: [
      {
        name: 'Hawa Mahal (Palace of Winds)',
        desc: 'Five-storey pink sandstone facade with 953 jharokhas built for royal women to view street festivals.',
        timings: '9:00 AM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Amer Fort & Sheesh Mahal',
        desc: 'Massive hilltop fortress overlooking Maota Lake, famous for its hall of mirrors that glitters by candlelight.',
        timings: '8:00 AM - 5:30 PM',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Blue Pottery & Jaipuri Razai Quilts',
        desc: 'Turquoise quartz glazed ceramics, camel leather mojaris, and feather-light warm cotton quilts.',
        bazaar: 'Bapu Bazaar, Johari Bazaar',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Jaipur Literature Festival (JLF), Teej Festival',
      bestSeason: 'October to March',
      safetyTips: 'Always fix taxi/auto fares beforehand or use Uber/Ola.',
    },
  },

  {
    id: 'udaipur',
    aliases: ['udaipur', 'lake city'],
    city: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'The City of Lakes: White Palaces, Lake Pichola & Romance',
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Gatte ki Sabzi & Dal Baati',
        desc: 'Steamed gram-flour dumplings cooked in tangy yogurt gravy with warm baatis and ghee.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Krishna Dal Baati, Traditional Khana',
      },
    ],
    attractions: [
      {
        name: 'City Palace Complex on Lake Pichola',
        desc: 'Rajasthan’s largest palace complex featuring peacock courtyards, crystal gallery, and vintage cars.',
        timings: '9:00 AM - 5:30 PM',
        image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sunset Boat Cruise at Jag Mandir',
        desc: 'Scenic lake boat ride past the floating Lake Palace (Taj) to the garden island palace.',
        timings: '10:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Pichwai Paintings & Miniature Art',
        desc: 'Exquisite silk and handmade paper paintings depicting Lord Krishna.',
        bazaar: 'Hathi Pol Bazaar, Bada Bazaar',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Mewar Festival, Shilpgram Crafts Fair',
      bestSeason: 'September to March',
      safetyTips: 'Very calm and tourist-friendly destination.',
    },
  },

  {
    id: 'jodhpur',
    aliases: ['jodhpur', 'blue city', 'mehrangarh'],
    city: 'Jodhpur',
    state: 'Rajasthan',
    tagline: 'The Sun City & Blue Haven: Mighty Mehrangarh & Mirchi Vada',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Jodhpuri Mirchi Vada & Mawa Kachori',
        desc: 'Jumbo bhavnagri chilli stuffed with potato masala and deep fried; plus sugar-soaked sweet mawa kachoris.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Shahi Samosa (Clock Tower), Janta Sweet Home',
      },
    ],
    attractions: [
      {
        name: 'Mehrangarh Fort (Perched 410 feet High)',
        desc: 'One of the largest fortresses in India overlooking the indigo blue houses of the old city.',
        timings: '9:00 AM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Umaid Bhawan Palace',
        desc: 'One of the world’s largest private residences built with golden Chittar sandstone.',
        timings: '10:00 AM - 4:30 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Tie-Dye Bandhej & Handcrafted Jodhpuri Juttis',
        desc: 'Richly patterned turbans, bandhani sarees, and camel leather mojari shoes.',
        bazaar: 'Sardar Market (Clock Tower)',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Rajasthan International Folk Festival (RIFF), Marwar Festival',
      bestSeason: 'October to March',
      safetyTips: 'Explore the narrow blue streets of Navchokiya on foot.',
    },
  },

  // ─── UTTAR PRADESH ──────────────────────────────────────────────────────────
  {
    id: 'varanasi',
    aliases: ['varanasi', 'kashi', 'banaras', 'benaras'],
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'The Spiritual Heart of India: Ancient Ghats, Ganga Aarti & Silk',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Banarasi Paan & Malaiyo',
        desc: 'World-famous betel leaf parcel with gulkand; alongside seasonal winter saffron milk froth.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Keshav Tambool Bhandar, Thatheri Bazaar for Malaiyo',
      },
      {
        name: 'Kachori Gali & Blue Lassi',
        desc: 'Hot kachoris dipped in chickpea curry; and thick clay-pot sweet lassis with pomegranate.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Blue Lassi Shop (near Manikarnika Ghat)',
      },
    ],
    attractions: [
      {
        name: 'Dashashwamedh Ghat Evening Ganga Aarti',
        desc: 'Spectacular multi-tiered brass lamp ritual performed by priests on the banks of Holy River Ganga.',
        timings: 'Every evening at 6:45 PM',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Kashi Vishwanath Jyotirlinga Temple & Corridor',
        desc: 'One of the twelve sacred Jyotirlingas dedicated to Lord Shiva with its 15.5m gold spire.',
        timings: '3:00 AM - 11:00 PM',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Authentic Banarasi Pure Silk & Zari Sarees',
        desc: 'World-renowned handwoven silk sarees with intricate gold and silver brocade motifs.',
        bazaar: 'Thatheri Bazaar, Vishwanath Gali, Chowk',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Dev Deepawali (million oil lamps on all ghats), Mahashivratri',
      bestSeason: 'October to March',
      safetyTips: 'Always agree on boat ride prices before boarding.',
    },
  },

  {
    id: 'agra',
    aliases: ['agra', 'taj mahal'],
    city: 'Agra',
    state: 'Uttar Pradesh',
    tagline: 'Home of the Taj Mahal: World Wonder of White Marble & Mughal Grandeur',
    heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Agra Petha (Kesar, Angoori, Paan)',
        desc: 'Translucent soft candy made from ash gourd infused with saffron syrup, rose water, or pistachios.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Panchi Petha (Hari Parvat)',
      },
    ],
    attractions: [
      {
        name: 'The Taj Mahal (UNESCO Wonder of the World)',
        desc: 'Pristine white marble mausoleum built by Mughal Emperor Shah Jahan for his empress Mumtaz Mahal.',
        timings: 'Sunrise to Sunset (Closed Fridays)',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Agra Fort & Fatehpur Sikri',
        desc: 'Vast red sandstone citadel where Mughal emperors ruled; and the 54m high Buland Darwaza.',
        timings: '6:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Pietra Dura Marble Inlay Coasters & Boxes',
        desc: 'Handcrafted white marble tabletops inlaid with semi-precious lapis lazuli and jasper.',
        bazaar: 'Sadar Bazaar Agra',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Taj Mahotsav (10-day cultural festival in February)',
      bestSeason: 'October to March',
      safetyTips: 'Book entry tickets online to bypass long counter queues.',
    },
  },

  {
    id: 'ayodhya',
    aliases: ['ayodhya', 'ram mandir', 'saket', 'faizabad'],
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    tagline: 'The Sacred Birthplace of Lord Rama on the Banks of the Holy Saryu River',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Ayodhya Peda & Saryu Bedmi Poori',
        desc: 'Traditional roasted mawa pedas offered in temples; alongside crisp urad-dal pooris with spicy potato sabzi.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Hanuman Garhi Bazaar sweets, Ramkot stalls',
      },
    ],
    attractions: [
      {
        name: 'Shri Ram Janmabhoomi Teerth Kshetra',
        desc: 'Grand three-storey pink Bansi Paharpur sandstone temple dedicated to Lord Rama.',
        timings: '7:00 AM - 11:30 AM, 2:00 PM - 7:00 PM',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Hanuman Garhi & Ram Ki Paidi Ghats',
        desc: '10th-century fortress temple dedicated to Lord Hanuman; and the illuminated ghats on the Saryu River.',
        timings: '5:00 AM - 10:00 PM',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Ramayana Scriptures, Tulsi Rosary & Brass Bells',
        desc: 'Sacred tulsi wood beads, Ram Darbar brass idols, and hand-printed flags.',
        bazaar: 'Hanuman Garhi Market, Ramkot',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Diwali Deepotsav (Guinness Record 25+ lakh diyas lit), Ram Navami',
      bestSeason: 'October to March',
      safetyTips: 'Electric golf carts available for senior citizens in the temple corridor.',
    },
  },

  // ─── DELHI NCR ──────────────────────────────────────────────────────────────
  {
    id: 'delhi',
    aliases: ['delhi', 'new delhi', 'old delhi'],
    city: 'Delhi',
    state: 'Delhi NCR',
    tagline: 'The Capital of India: 8 Centuries of Empires, Red Fort & Legendary Food',
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Old Delhi Chole Bhature & Paranthe',
        desc: 'Golden puffed bhature with tangy chickpea curry and pickle; plus 30 varieties of stuffed paranthas.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Sita Ram Diwan Chand (Paharganj), Paranthe Wali Gali',
      },
      {
        name: 'Original Butter Chicken & Tandoori Kebabs',
        desc: 'Tandoor-charred chicken simmered in rich velvety tomato, butter, and fenugreek gravy.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Moti Mahal (Daryaganj), Karim’s (Jama Masjid)',
      },
    ],
    attractions: [
      {
        name: 'India Gate & Kartavya Path',
        desc: 'Majestic 42m triumphal arch war memorial illuminated every evening along the grand boulevard.',
        timings: 'Open 24 Hours (Best at 7 PM)',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Red Fort & Qutub Minar (UNESCO)',
        desc: 'Massive red sandstone Mughal citadel; and the world’s tallest 73m brick minaret.',
        timings: '9:30 AM - 4:30 PM',
        image: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Dilli Haat & Chandni Chowk Spices (Khari Baoli)',
        desc: 'Open-air craft bazaar with artisans from all 28 states; and Asia’s largest wholesale spice market.',
        bazaar: 'Dilli Haat INA, Khari Baoli',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Republic Day Parade, Diwali, Qutub Music Festival',
      bestSeason: 'October to March',
      safetyTips: 'Use the Delhi Metro (air-conditioned, efficient, with dedicated Women’s coaches).',
    },
  },

  // ─── PUNJAB ─────────────────────────────────────────────────────────────────
  {
    id: 'amritsar',
    aliases: ['amritsar', 'golden temple'],
    city: 'Amritsar',
    state: 'Punjab',
    tagline: 'The Holy City of the Golden Temple, Mega Langar & Hearty Punjabi Feasts',
    heroImage: 'https://images.unsplash.com/photo-1588096344356-9b44a49c67a5?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Amritsari Kulcha with Chole & Dal Makhani',
        desc: 'Multi-layered crispy tandoori leavened flatbread stuffed with spiced potatoes, served with dollops of white butter.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Kulcha Land, Bhai Kulwant Singh Kulchian Wale',
      },
    ],
    attractions: [
      {
        name: 'Sri Harmandir Sahib (The Golden Temple)',
        desc: 'The holiest shrine in Sikhism, clad in 750 kg of pure gold foil and surrounded by the sacred Amrit Sarovar.',
        timings: 'Open 24 Hours',
        image: 'https://images.unsplash.com/photo-1588096344356-9b44a49c67a5?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Attari-Wagah Border Beating Retreat',
        desc: 'Electrifying daily military parade with coordinated drills, patriotic chants, and lowering of flags.',
        timings: 'Daily 4:30 PM (Arrive by 3:00 PM)',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Phulkari Embroidered Dupattas & Juttis',
        desc: 'Traditional vibrant floral silk thread embroidery shawls and handmade leather footwear.',
        bazaar: 'Hall Bazaar, Katra Jaimal Singh',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Baisakhi, Gurpurab Illuminations',
      bestSeason: 'October to March',
      safetyTips: 'Always cover your head and remove shoes inside the Golden Temple.',
    },
  },

  // ─── HIMACHAL & UTTARAKHAND ─────────────────────────────────────────────────
  {
    id: 'manali',
    aliases: ['manali', 'kullu', 'solang', 'atal tunnel'],
    city: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'Valley of the Gods: Snow Peaks, Rohtang Pass, River Rafting & Pine Forests',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Himachali Siddu & Trout Fish Fry',
        desc: 'Steamed fermented wheat bun stuffed with poppy seeds and walnuts, dipped in desi ghee; alongside fresh river trout.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Chopsticks (Mall Road), Johnson’s Cafe',
      },
    ],
    attractions: [
      {
        name: 'Solang Valley & Rohtang Pass (Snow Point)',
        desc: 'Breathtaking high-altitude Himalayan pass at 13,058 ft with paragliding, skiing, and snowmobiling.',
        timings: '8:00 AM - 4:00 PM (Permits required for Rohtang)',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Hadimba Devi Ancient Cedar Temple',
        desc: 'Unique 1553 wooden pagoda temple nestled among towering giant deodar cedar forests.',
        timings: '8:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Kullu Woollen Shawls, Kinnauri Caps & Pure Shilajit',
        desc: 'Geometric border handloom shawls, warm Angora rabbit wool items, and organic apple jams.',
        bazaar: 'Mall Road Manali, Old Manali Village',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Kullu Dussehra (Week-long international carnival)',
      bestSeason: 'March to June (Pleasant) | December to February (Snow)',
      safetyTips: 'Hire certified local 4x4 drivers for snow roads beyond the Atal Tunnel.',
    },
  },

  {
    id: 'rishikesh',
    aliases: ['rishikesh', 'haridwar', 'ganga', 'yoga'],
    city: 'Rishikesh & Haridwar',
    state: 'Uttarakhand',
    tagline: 'Yoga Capital of the World: White Water River Rafting & Sacred Ganga Aarti',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Garhwali Kafuli & Ayurvedic Organic Herbal Bowls',
        desc: 'Slow-cooked spinach and fenugreek curry with jhangora rice; alongside fresh organic smoothie bowls in riverside cafes.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Beatles Cafe, Little Buddha Cafe, Chotiwala',
      },
    ],
    attractions: [
      {
        name: 'Triveni Ghat Evening Ganga Aarti & Laxman Jhula',
        desc: 'Soul-stirring chanting with fire lamps on the Ganges; and the famous suspension pedestrian bridge.',
        timings: 'Aarti at 6:00 PM daily',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Ganga White Water River Rafting',
        desc: 'Thrilling grade 3 and 4 rapids like Roller Coaster and Golf Course over crystal clear turquoise waters.',
        timings: '8:00 AM - 4:00 PM (September to June)',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Ayurvedic Essential Oils, Rudraksha & Singing Bowls',
        desc: 'Natural sandalwood and eucalyptus oils, certified rudraksha beads, and Tibetan meditation singing bowls.',
        bazaar: 'Tapovan Market, Ram Jhula Bazaar',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'International Yoga Festival (March), Kumbh Mela in Haridwar',
      bestSeason: 'September to April',
      safetyTips: 'Always wear life jackets while rafting with certified licensed guides.',
    },
  },

  // ─── MADHYA PRADESH ─────────────────────────────────────────────────────────
  {
    id: 'ujjain',
    aliases: ['ujjain', 'mahakal', 'mahakaleshwar', 'avanti'],
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    tagline: 'City of Mahakal: Sacred Bhasma Aarti, Shipra River & Ancient Astronomy',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Ujjaini Poha-Jalebi & Dal Bafla',
        desc: 'Fluffy steamed poha topped with ratlami sev, pomegranate, and warm jalebis; plus ghee-dipped baflas with spicy dal.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Tower Chowk stalls, Apnam Sweets',
      },
    ],
    attractions: [
      {
        name: 'Shri Mahakaleshwar Jyotirlinga (Dakshinmukhi)',
        desc: 'The only south-facing Jyotirlinga of Lord Shiva, world-famous for its dawn 4:00 AM Bhasma Aarti.',
        timings: '4:00 AM - 11:00 PM',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Mahakal Lok Corridor (900m Grand Plaza)',
        desc: 'One of the largest pilgrimage corridors in India adorned with 108 grand Shiva murals and statues.',
        timings: '6:00 AM - 11:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Bhairavgarh Batik Print Fabrics & Maheshwari Sarees',
        desc: 'Traditional wax-resist batik printed cotton bedsheets and lightweight silk-cotton sarees.',
        bazaar: 'Gopal Mandir Market, Freeganj',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Simhastha Kumbh Mahaparva, Shravan Mahakal Sawari every Monday',
      bestSeason: 'October to March',
      safetyTips: 'Book Bhasma Aarti slots on the official temple portal well in advance.',
    },
  },

  // ─── GOA ────────────────────────────────────────────────────────────────────
  {
    id: 'goa',
    aliases: ['goa', 'panaji', 'panjim', 'calangute', 'baga', 'margao', 'vasco'],
    city: 'Goa',
    state: 'Goa',
    tagline: 'Sun-kissed Beaches, Portuguese Heritage, Vibrant Nightlife & Coastal Flavours',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Goan Fish Curry Thali & Bebinca',
        desc: 'Coconut and kokum spiced kingfish curry served with steaming rice; followed by traditional 7-layered Goan dessert Bebinca.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Fishermans Wharf, Ritz Classic Panjim, Vinayak Calangute',
      },
      {
        name: 'Prawn Balchao & Poi Bread',
        desc: 'Spicy, tangy Goan pickle-style prawns paired with freshly baked traditional warm poi crust bread.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Mum’s Kitchen Panaji, Martin’s Corner Betalbatim',
      },
    ],
    attractions: [
      {
        name: 'Baga & Calangute Beach Shores',
        desc: 'Famous golden sand beaches with dolphin cruises, gentle surf, and vibrant beach shack cafes.',
        timings: 'Open 24 Hours',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Basilica of Bom Jesus (Old Goa)',
        desc: 'UNESCO World Heritage 16th-century baroque church holding the sacred mortal remains of St. Francis Xavier.',
        timings: '9:00 AM - 6:30 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Cashew Nuts, Feni & Anjuna Flea Market',
        desc: 'Fresh roasted local cashews, handcrafted brassware, and bohemian beachside flea market treasures.',
        bazaar: 'Anjuna Wednesday Market, Panjim Municipal Market',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Goa Carnival, Sunburn Festival, Shigmo Festival',
      bestSeason: 'November to February',
      safetyTips: 'Always swim within lifeguard marked flags and avoid taking drinks from strangers.',
    },
  },

  // ─── STATUE OF UNITY (KEVADIA, GUJARAT) ──────────────────────────────────────
  {
    id: 'statue-of-unity',
    aliases: ['statue of unity', 'kevadia', 'ekta nagar', 'narmada dam'],
    city: 'Statue of Unity',
    state: 'Gujarat',
    tagline: 'The World’s Tallest Monument (182m) Dedicated to Sardar Vallabhbhai Patel',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Ekta Food Court Multi-Cuisine Feast',
        desc: 'Special tribal culinary stalls serving organic millets, Gujarati thali, and fresh buttermilk.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'Ekta Food Court, Sardar Sarovar Canteen',
      },
    ],
    attractions: [
      {
        name: '182-Metre Colossal Statue & Viewing Gallery',
        desc: 'High-speed elevator ride to the statue chest viewing gallery (153m) with panoramic views of the Sardar Sarovar Dam.',
        timings: '8:00 AM - 6:00 PM (Closed Mondays)',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Valley of Flowers & Jungle Safari',
        desc: 'Over 300 floral species alongside the river and state-of-the-art geo-domed zoological safari park.',
        timings: '9:00 AM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Ekta Tribal Handicrafts & Bamboo Art',
        desc: 'Handmade bamboo crafts, organic honey, and Pithora tribal paintings by local artisans.',
        bazaar: 'Ekta Mall, Sardar Sarovar Artisan Market',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Rashtriya Ekta Diwas (31st October), Laser Light & Sound Show nightly',
      bestSeason: 'October to March',
      safetyTips: 'Pre-book online entry tickets at soutickets.in to avoid long counter queues.',
    },
  },

  // ─── KEDARNATH (UTTARAKHAND) ────────────────────────────────────────────────
  {
    id: 'kedarnath',
    aliases: ['kedarnath', 'kedarnath temple', 'rudraprayag', 'char dham'],
    city: 'Kedarnath',
    state: 'Uttarakhand',
    tagline: 'Holiest of Shiva Jyotirlingas, Nestled Amidst the Majestic Garhwal Himalayas',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Garhwali Pahadi Thali & Kaphli',
        desc: 'Spinach and fenugreek based iron-rich gravy, Bhatt ki Churkani (black bean curry), and piping hot mandua rotis.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'GMVN Kedarnath Canteen, Gaurikund dhabas',
      },
    ],
    attractions: [
      {
        name: 'Ancient 8th-Century Kedarnath Jyotirlinga Shrine',
        desc: 'Sacred stone temple dedicated to Lord Shiva, standing strong through floods with the divine Bhim Shila rock behind it.',
        timings: '4:00 AM - 9:00 PM (May to November)',
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Bhairavnath Temple & Mandakini Viewpoint',
        desc: 'Perched 500m above Kedarnath offering breathtaking 360-degree views of Kedarnath valley and Kedar Dome peak.',
        timings: 'Sunrise to Sunset',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Rudraksha Mala & Himalayan Shilajit',
        desc: 'Certified authentic Panchmukhi Rudraksha beads, pure Himalayan herbal tea, and organic cedar incense.',
        bazaar: 'Kedarnath Temple Path Shops',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Kedarnath Kapat Opening Ceremony (Akshaya Tritiya), Shravan Maas Pooja',
      bestSeason: 'May to June & September to October',
      safetyTips: 'Mandatory biometric registration at registrationandtouristcare.uk.gov.in before starting the 16km trek.',
    },
  },

  // ─── DIU (UNION TERRITORY) ──────────────────────────────────────────────────
  {
    id: 'diu',
    aliases: ['diu', 'diu island', 'nagoa beach'],
    city: 'Diu',
    state: 'Diu',
    tagline: 'Tranquil Island Paradise: Portuguese Sea Forts, Golden Beaches & Hoka Trees',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    food: [
      {
        name: 'Fresh Coastal Seafood & Prawns Koliwada',
        desc: 'Catch-of-the-day lobsters, tandoori pomfret, and traditional fried prawns spiced with coastal masala.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        whereToTry: 'O’Coqueiro Restaurant, Nagoa Beach shacks',
      },
    ],
    attractions: [
      {
        name: 'Diu Sea Fort (Praça de Diu)',
        desc: 'Imposing 1535 Portuguese stone fortress surrounded on three sides by the crashing waves of the Arabian Sea.',
        timings: '8:00 AM - 6:00 PM',
        image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Nagoa Horseshoe Beach',
        desc: 'Unique semi-circular beach lined with rare branching African Hoka trees; famous for safe swimming and water sports.',
        timings: 'Sunrise to Sunset',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
      },
    ],
    shopping: [
      {
        name: 'Seashell Crafts & Portuguese Ceramic Souvenirs',
        desc: 'Hand-carved shell lamps, wind chimes, and traditional Goan-Diu tile art.',
        bazaar: 'Diu Town Market, Bandar Chowk',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    culture: {
      festivals: 'Festa De Diu (Longest Beach Festival in Asia), Christmas Carnival',
      bestSeason: 'October to March',
      safetyTips: 'Rent a bicycle or scooter for effortless exploration of the compact island.',
    },
  },
];

// Helper to look up or intelligently synthesize details for any Indian location
export const getDestinationData = (queryOrCity = '') => {
  if (!queryOrCity || typeof queryOrCity !== 'string') return INDIA_DESTINATIONS[0];

  const q = queryOrCity.toLowerCase().trim();

  // 1. Direct match on City, State, or Aliases
  const match = INDIA_DESTINATIONS.find((d) => {
    if (d.city.toLowerCase() === q) return true;
    if (d.aliases && d.aliases.some((a) => a === q || q.includes(a) || a.includes(q))) return true;
    if (d.city.toLowerCase().includes(q) || q.includes(d.city.toLowerCase())) return true;
    if (d.state.toLowerCase().includes(q) || q.includes(d.state.toLowerCase())) return true;
    return false;
  });

  if (match) return match;

  // 2. Intelligent Regional Synthesizer for ANY Indian city/town/district
  const cleanName = queryOrCity.split(',')[0].trim();
  const lowerName = cleanName.toLowerCase();

  // Detect state or cultural zone
  let detectedState = 'India';
  let regionalDishes = {
    food1: `${cleanName} Special Kathiyawadi & Gujarati Delicacies`,
    food1Desc: 'Rich steamed snacks, spiced gathiya, undhiyu, and wholesome dal-bhat with desi ghee.',
    food2: 'Famous Regional Sweets & Street Fritters',
    food2Desc: 'Freshly fried hot kachoris, fafda-jalebi, and seasonal mawa pedas.',
    heroImg: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    foodImg1: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    foodImg2: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    sight1: `${cleanName} Historic Forts & Heritage Temples`,
    sight1Desc: 'Centuries-old stone architecture, sacred shrines, and scenic viewpoints.',
    sightImg1: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=600&auto=format&fit=crop&q=80',
    sight2: `${cleanName} Town Square & Riverfront Viewpoints`,
    sight2Desc: 'Picturesque sunset spots and vibrant community gathering squares.',
    sightImg2: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    shop1: 'Traditional Handloom Textiles & Handicrafts',
    shop1Desc: 'Authentic local handwoven sarees, embroidery items, and regional spices.',
    shopImg1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  };

  if (
    lowerName.includes('gujarat') ||
    lowerName.includes('morbi') ||
    lowerName.includes('patan') ||
    lowerName.includes('palitana') ||
    lowerName.includes('mehsana') ||
    lowerName.includes('navsari') ||
    lowerName.includes('vapi') ||
    lowerName.includes('valsad') ||
    lowerName.includes('porbandar') ||
    lowerName.includes('anand') ||
    lowerName.includes('nadiad') ||
    lowerName.includes('bharuch') ||
    lowerName.includes('ankleshwar') ||
    lowerName.includes('surendranagar') ||
    lowerName.includes('gandhinagar') ||
    lowerName.includes('godhra') ||
    lowerName.includes('dahod') ||
    lowerName.includes('veraval') ||
    lowerName.includes('amreli')
  ) {
    detectedState = 'Gujarat';
  } else if (
    lowerName.includes('maharashtra') ||
    lowerName.includes('nagpur') ||
    lowerName.includes('nashik') ||
    lowerName.includes('kolhapur') ||
    lowerName.includes('solapur') ||
    lowerName.includes('amravati') ||
    lowerName.includes('aurangabad') ||
    lowerName.includes('sambhajinagar') ||
    lowerName.includes('lonavala') ||
    lowerName.includes('khandala') ||
    lowerName.includes('alibaug') ||
    lowerName.includes('mahabaleshwar')
  ) {
    detectedState = 'Maharashtra';
    regionalDishes.food1 = `${cleanName} Misal Pav & Pithla Bhakri`;
    regionalDishes.food1Desc = 'Spicy sprouted bean curry with pav, and traditional gram flour pithla with hot jowar bhakri.';
    regionalDishes.food2 = 'Puran Poli & Kanda Bhajji';
    regionalDishes.food2Desc = 'Sweet lentil-stuffed flatbread served with milk and ghee; plus hot onion fritters.';
  } else if (
    lowerName.includes('rajasthan') ||
    lowerName.includes('bikaner') ||
    lowerName.includes('jaisalmer') ||
    lowerName.includes('barmer') ||
    lowerName.includes('ajmer') ||
    lowerName.includes('pushkar') ||
    lowerName.includes('chittorgarh') ||
    lowerName.includes('alwar') ||
    lowerName.includes('kota') ||
    lowerName.includes('mount abu')
  ) {
    detectedState = 'Rajasthan';
    regionalDishes.food1 = `${cleanName} Dal Baati Churma & Ker Sangri`;
    regionalDishes.food1Desc = 'Iconic wood-fired baked baatis with ghee, five-lentil dal, and desert berry-bean curry.';
    regionalDishes.food2 = 'Mawa Kachori & Pyaaz Kachori';
    regionalDishes.food2Desc = 'Crispy layered pastry stuffed with sweet mawa or spiced onions.';
  }

  return {
    id: cleanName.toLowerCase().replace(/\s+/g, '-'),
    city: cleanName,
    state: detectedState,
    tagline: `Experience the Authentic Flavours, Heritage & Culture of ${cleanName}`,
    heroImage: regionalDishes.heroImg,
    food: [
      {
        name: regionalDishes.food1,
        desc: regionalDishes.food1Desc,
        image: regionalDishes.foodImg1,
        whereToTry: `Prominent thali restaurants and heritage bazaar stalls in ${cleanName}`,
      },
      {
        name: regionalDishes.food2,
        desc: regionalDishes.food2Desc,
        image: regionalDishes.foodImg2,
        whereToTry: `Old city market and morning breakfast corners in ${cleanName}`,
      },
    ],
    attractions: [
      {
        name: regionalDishes.sight1,
        desc: regionalDishes.sight1Desc,
        timings: 'Open Daily 8:00 AM - 6:00 PM',
        image: regionalDishes.sightImg1,
      },
      {
        name: regionalDishes.sight2,
        desc: regionalDishes.sight2Desc,
        timings: 'Sunrise to Sunset',
        image: regionalDishes.sightImg2,
      },
    ],
    shopping: [
      {
        name: regionalDishes.shop1,
        desc: regionalDishes.shop1Desc,
        bazaar: `${cleanName} Main Bazaar & Local Weekly Haat`,
        image: regionalDishes.shopImg1,
      },
    ],
    culture: {
      festivals: 'Navratri, Diwali, and traditional regional temple melas.',
      bestSeason: 'October to March (Pleasant weather across India)',
      safetyTips: 'Always carry drinking water and keep emergency contacts ready in Travel Guardian.',
    },
  };
};

export default {
  INDIA_DESTINATIONS,
  getDestinationData,
};
