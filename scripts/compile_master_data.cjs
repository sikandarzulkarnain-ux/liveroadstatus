const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.resolve(root, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Compiling master dataset for LiveRoadStatus...');

// Country catalog with continents and flags
const countries = [
  {
    slug: 'united-states',
    name: 'United States',
    continent: 'north-america',
    flag: '🇺🇸',
    flagSvgId: 'idx-flag-us',
    description: 'High mountain passes across the Rocky Mountains, Cascades, Sierra Nevada, and Appalachian ranges.',
    primaryAuthority: 'State DOT Feeds (CDOT, WSDOT, Caltrans, VDOT, 511PA)'
  },
  {
    slug: 'canada',
    name: 'Canada',
    continent: 'north-america',
    flag: '🇨🇦',
    flagSvgId: 'idx-flag-ca',
    description: 'Trans-Canada highway corridors, Rocky Mountain passes, and Arctic highway routes.',
    primaryAuthority: 'DriveBC, 511 Alberta, Yukon 511, Transports Québec'
  },
  {
    slug: 'france',
    name: 'France',
    continent: 'europe',
    flag: '🇫🇷',
    flagSvgId: 'idx-flag-fr',
    description: 'Alpine cols, Pyrenean passes, Vosges gaps, and Jura mountain corridors.',
    primaryAuthority: 'Bison Futé, Inforoute France, Inforoute 39, Inforoute 05'
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    continent: 'europe',
    flag: '🇨🇭',
    flagSvgId: 'idx-flag-ch',
    description: 'Iconic Swiss alpine passes across Uri, Graubünden, Valais, Bern, and Ticino.',
    primaryAuthority: 'TCS Schweiz (Touring Club Suisse) & Cantonal Police'
  },
  {
    slug: 'italy',
    name: 'Italy',
    continent: 'europe',
    flag: '🇮🇹',
    flagSvgId: 'idx-flag-it',
    description: 'High Dolomites, Stelvio National Park, Apennine passes, and Maritime Alps.',
    primaryAuthority: 'CCISS Viaggiare Informati, ANAS, Autostrada del Brennero'
  },
  {
    slug: 'austria',
    name: 'Austria',
    continent: 'europe',
    flag: '🇦🇹',
    flagSvgId: 'idx-flag-at',
    description: 'High alpine panoramic roads and mountain passes across Tyrol, Salzburg, and Carinthia.',
    primaryAuthority: 'ÖAMTC, ASFINAG & Grossglockner Hochalpenstrassen AG'
  },
  {
    slug: 'norway',
    name: 'Norway',
    continent: 'europe',
    flag: '🇳🇴',
    flagSvgId: 'idx-flag-no',
    description: 'National tourist mountain routes, Arctic tundra passes, and western fjord crossings.',
    primaryAuthority: 'Statens vegvesen (Vegvesen Trafikk)'
  },
  {
    slug: 'india',
    name: 'India',
    continent: 'asia',
    flag: '🇮🇳',
    flagSvgId: 'idx-flag-in',
    description: 'Himalayan passes and strategic military mountain routes in Ladakh, Himachal, and Sikkim.',
    primaryAuthority: 'Border Roads Organisation (BRO) & Himachal Traffic Police'
  },
  {
    slug: 'pakistan',
    name: 'Pakistan',
    continent: 'asia',
    flag: '🇵🇰',
    flagSvgId: 'idx-flag-pk',
    description: 'Karakoram Highway passes, Hindu Kush traverses, and high alpine gaps in Gilgit-Baltistan.',
    primaryAuthority: 'National Highway Authority (NHA) & Gilgit-Baltistan Disaster Management'
  },
  {
    slug: 'tajikistan',
    name: 'Tajikistan',
    continent: 'asia',
    flag: '🇹🇯',
    flagSvgId: 'idx-flag-tj',
    description: 'Pamir Highway (M41) high-altitude passes across the Roof of the World.',
    primaryAuthority: 'Ministry of Transport of the Republic of Tajikistan & Pamir Eco-Cultural Tourism'
  },
  {
    slug: 'nepal',
    name: 'Nepal',
    continent: 'asia',
    flag: '🇳🇵',
    flagSvgId: 'idx-flag-np',
    description: 'High Himalayan trekking passes and vehicular border passes to Tibet.',
    primaryAuthority: 'Department of Roads Nepal'
  },
  {
    slug: 'china',
    name: 'China',
    continent: 'asia',
    flag: '🇨🇳',
    flagSvgId: 'idx-flag-cn',
    description: 'Tibetan plateau crossings, Xinjiang highway passes, and Yunnan high mountain routes.',
    primaryAuthority: 'Ministry of Transport of the People\'s Republic of China'
  },
  {
    slug: 'chile',
    name: 'Chile',
    continent: 'south-america',
    flag: '🇨🇱',
    flagSvgId: 'idx-flag-cl',
    description: 'Andean international border passes connecting Chile with Argentina and Bolivia.',
    primaryAuthority: 'Unidad de Pasos Fronterizos (Ministerio del Interior y Seguridad Pública)'
  },
  {
    slug: 'argentina',
    name: 'Argentina',
    continent: 'south-america',
    flag: '🇦🇷',
    flagSvgId: 'idx-flag-ar',
    description: 'High Andes mountain crossings and Patagonian passes along Ruta 40.',
    primaryAuthority: 'Vialidad Nacional Argentina'
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    continent: 'africa',
    flag: '🇿🇦',
    flagSvgId: 'idx-flag-za',
    description: 'Drakensberg escarpment passes and high mountain gravel traverses into Lesotho.',
    primaryAuthority: 'South African National Roads Agency (SANRAL) & Lesotho Border Control'
  },
  {
    slug: 'romania',
    name: 'Romania',
    continent: 'europe',
    flag: '🇷🇴',
    flagSvgId: 'idx-flag-ro',
    description: 'Carpathian mountain passes including the Transfăgărășan and Transalpina.',
    primaryAuthority: 'CNAIR (Compania Nationala de Administrare a Infrastructurii Rutiere)'
  }
];

// Helper to sanitize slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

console.log(`Loaded ${countries.length} recognized countries.`);

module.exports = { countries, slugify };
