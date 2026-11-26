// Travel Guardian - Real All-India Location Image Engine
// Uses Wikipedia REST API (free, zero API key) to fetch real photos of ANY place.
// Cleans search terms, tries multiple variations, caches results in-memory.

const imageCache = new Map();

// Curated high-reliability category fallbacks
const THEME_FALLBACKS = {
  heritage:   'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Adalaj_well.jpg/600px-Adalaj_well.jpg',
  temple:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Golden_Temple%2C_Amritsar_-_2.jpg/600px-Golden_Temple%2C_Amritsar_-_2.jpg',
  beach:      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
  mountain:   'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
  food:       'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  market:     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  shopping:   'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  attraction: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Adalaj_well.jpg/600px-Adalaj_well.jpg',
  city:       'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
};

// Verified correct Wikimedia images keyed by normalized place name
const HARDCODED_PLACES = {
  // Ahmedabad — verified via Wikipedia REST API
  'sabarmati ashram':             'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/GANDHI_ASHRAM_03.jpg/600px-GANDHI_ASHRAM_03.jpg',
  'atal pedestrian riverfront':   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Atal_Pedestrian_Bridge_at_Night.jpg/600px-Atal_Pedestrian_Bridge_at_Night.jpg',
  'atal pedestrian bridge':       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Atal_Pedestrian_Bridge_at_Night.jpg/600px-Atal_Pedestrian_Bridge_at_Night.jpg',
  'adalaj stepwell':              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Adalaj_ki_Vav_Gujarat_240A1370_72.jpg/600px-Adalaj_ki_Vav_Gujarat_240A1370_72.jpg',
  'adalaj ni vav':                'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Adalaj_ki_Vav_Gujarat_240A1370_72.jpg/600px-Adalaj_ki_Vav_Gujarat_240A1370_72.jpg',
  'patola':                       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Patan_patola_silk.jpg/600px-Patan_patola_silk.jpg',
  'bandhani':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bandani.jpg/600px-Bandani.jpg',
  'manek chowk':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Manek_Chowk_night_market.jpg/600px-Manek_Chowk_night_market.jpg',
  'khaman':                       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Dhokla.jpg/600px-Dhokla.jpg',
  'fafda':                        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Fafda.jpg/600px-Fafda.jpg',
  // Goa
  'baga beach':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Baga_Beach%2C_Goa.jpg/600px-Baga_Beach%2C_Goa.jpg',
  'basilica of bom jesus':        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Basilica_of_Bom_Jesus.jpg/600px-Basilica_of_Bom_Jesus.jpg',
  // Agra
  'taj mahal':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/600px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg',
  'agra fort':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Agra_fort.jpg/600px-Agra_fort.jpg',
  // Jaipur
  'hawa mahal':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hawa_Mahal%2C_Jaipur%2C_India_03-2016_img2.jpg/600px-Hawa_Mahal%2C_Jaipur%2C_India_03-2016_img2.jpg',
  'amber fort':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Jaipur_03-2016_20_Amber_Fort.jpg/600px-Jaipur_03-2016_20_Amber_Fort.jpg',
  // Delhi
  'red fort':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Red_Fort_in_New_Delhi_03-2016_img3.jpg/600px-Red_Fort_in_New_Delhi_03-2016_img3.jpg',
  'qutub minar':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Qutab_Minar_minar.jpg/600px-Qutab_Minar_minar.jpg',
  'india gate':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/India_Gate_in_New_Delhi_03-2016_img3.jpg/600px-India_Gate_in_New_Delhi_03-2016_img3.jpg',
  // Varanasi
  'kashi vishwanath':             'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Kashi_Vishwanath_Temple.jpg/600px-Kashi_Vishwanath_Temple.jpg',
  'dashashwamedh ghat':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Dashashwamedha_Ghat_Evening.jpg/600px-Dashashwamedha_Ghat_Evening.jpg',
  // Amritsar
  'golden temple':                'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Golden_Temple%2C_Amritsar_-_2.jpg/600px-Golden_Temple%2C_Amritsar_-_2.jpg',
  // Mumbai
  'gateway of india':             'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/600px-Mumbai_03-2016_30_Gateway_of_India.jpg',
  'marine drive':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Marine_Drive_at_Dusk_-_Flickr_-_succo.jpg/600px-Marine_Drive_at_Dusk_-_Flickr_-_succo.jpg',
  // Udaipur
  'city palace':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Udaipur_City_Palace.jpg/600px-Udaipur_City_Palace.jpg',
  'lake pichola':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Pichola_Lake_Udaipur.jpg/600px-Pichola_Lake_Udaipur.jpg',
  // Kedarnath
  'kedarnath temple':             'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kedarnath_Temple.jpg/600px-Kedarnath_Temple.jpg',
  // Manali
  'rohtang pass':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Rohtang_Pass.jpg/600px-Rohtang_Pass.jpg',
  'solang valley':                'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Solang_Valley_2012.jpg/600px-Solang_Valley_2012.jpg',
};

/**
 * Clean a place name for Wikipedia search:
 * - Remove local-language parenthetical hints like "(Hriday Kunj)", "(Adalaj ni Vav)"
 * - Strip extra whitespace
 */
function cleanForSearch(name) {
  return name
    .replace(/\(.*?\)/g, '')   // remove anything in parentheses
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try Wikipedia REST API for a given search term.
 * Returns image URL string or null.
 */
async function tryWikipedia(term) {
  try {
    const encoded = encodeURIComponent(term.replace(/\s+/g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { 'User-Agent': 'TravelGuardianApp/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.thumbnail?.source) {
      return data.thumbnail.source.replace(/\/\d+px-/, '/600px-');
    }
  } catch {
    // network error – ignore
  }
  return null;
}

/**
 * Fetch a real photo for ANY place in India.
 * Strategy: hardcoded → Wikipedia (cleaned name) → Wikipedia (first 2 words) → theme fallback
 */
export async function getPlacePhoto(placeName, theme = 'city') {
  if (!placeName) return THEME_FALLBACKS[theme] || THEME_FALLBACKS.city;

  const rawKey = placeName.trim().toLowerCase();

  // 1. In-memory cache
  if (imageCache.has(rawKey)) return imageCache.get(rawKey);

  // 2. Hardcoded verified photos (exact or partial match)
  for (const [key, url] of Object.entries(HARDCODED_PLACES)) {
    if (rawKey.includes(key) || key.includes(rawKey.split('(')[0].trim())) {
      imageCache.set(rawKey, url);
      return url;
    }
  }

  // 3. Wikipedia — cleaned name (removes parentheses)
  const cleaned = cleanForSearch(placeName);
  let url = await tryWikipedia(cleaned);

  // 4. Wikipedia — first 2 significant words only (e.g. "Sabarmati Ashram")
  if (!url) {
    const words = cleaned.split(' ').slice(0, 2).join(' ');
    if (words !== cleaned) {
      url = await tryWikipedia(words);
    }
  }

  // 5. Theme fallback
  if (!url) {
    url = THEME_FALLBACKS[theme] || THEME_FALLBACKS.city;
  }

  imageCache.set(rawKey, url);
  return url;
}

export function getFallbackPhoto(theme = 'city') {
  return THEME_FALLBACKS[theme] || THEME_FALLBACKS.city;
}

export default { getPlacePhoto, getFallbackPhoto, THEME_FALLBACKS };
