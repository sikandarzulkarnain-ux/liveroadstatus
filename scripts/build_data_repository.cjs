const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('--- Scanning all HTML files for pass records ---');

// Known region-to-country mapping based on directory structure and HTML files
const fileToCountryMap = {
  // France
  'france.html': 'France',
  'bourgogne.html': 'France',
  'grandest.html': 'France',
  'aquitaine.html': 'France',
  'occitanie.html': 'France',
  'paca.html': 'France',
  'auvergne.html': 'France',

  // Austria
  'austria.html': 'Austria',
  'carinthia.html': 'Austria',
  'lower-austria.html': 'Austria',
  'salzburg.html': 'Austria',
  'styria.html': 'Austria',
  'tyrol.html': 'Austria',
  'vorarlberg.html': 'Austria',

  // Switzerland
  'switzerland.html': 'Switzerland',
  'aargau.html': 'Switzerland',
  'bern.html': 'Switzerland',
  'fribourg.html': 'Switzerland',
  'glarus.html': 'Switzerland',
  'graubunden.html': 'Switzerland',
  'lucerne.html': 'Switzerland',
  'nidwalden.html': 'Switzerland',
  'obwalden.html': 'Switzerland',
  'schwyz.html': 'Switzerland',
  'stgallen.html': 'Switzerland',
  'ticino.html': 'Switzerland',
  'uri.html': 'Switzerland',
  'valais.html': 'Switzerland',
  'vaud.html': 'Switzerland',
  'zurich.html': 'Switzerland',

  // Italy
  'italy.html': 'Italy',
  'aostavalley.html': 'Italy',
  'cuneo.html': 'Italy',
  'emilia.html': 'Italy',
  'fvg.html': 'Italy',
  'lombardy.html': 'Italy',
  'ossola.html': 'Italy',
  'piedmont.html': 'Italy',
  'turin.html': 'Italy',
  'tuscany.html': 'Italy',
  'veneto.html': 'Italy',

  // USA
  'usa.html': 'United States',
  'alaska.html': 'United States',
  'arizona.html': 'United States',
  'california.html': 'United States',
  'colorado.html': 'United States',
  'idaho.html': 'United States',
  'maryland.html': 'United States',
  'montana.html': 'United States',
  'nevada.html': 'United States',
  'newhampshire.html': 'United States',
  'newmexico.html': 'United States',
  'northcarolina.html': 'United States',
  'oregon.html': 'United States',
  'pennsylvania.html': 'United States',
  'tennessee.html': 'United States',
  'utah.html': 'United States',
  'virginia.html': 'United States',
  'washington.html': 'United States',
  'westvirginia.html': 'United States',
  'wyoming.html': 'United States',

  // Canada
  'canada.html': 'Canada',
  'alberta.html': 'Canada',
  'britishcolumbia.html': 'Canada',
  'maritimes.html': 'Canada',
  'nl.html': 'Canada',
  'nwt.html': 'Canada',
  'quebec.html': 'Canada',
  'yukon.html': 'Canada',

  // Norway
  'norway.html': 'Norway',
  'finnmark.html': 'Norway',
  'innlandet.html': 'Norway',
  'moreogromsdal.html': 'Norway',
  'trondelag.html': 'Norway',
  'vestland.html': 'Norway',

  // India
  'india.html': 'India',
  'arunachal.html': 'India',
  'himachal.html': 'India',
  'jk.html': 'India',
  'ladakh.html': 'India',
  'nagaland.html': 'India',
  'sikkim.html': 'India',
  'uttarakhand.html': 'India',

  // Pakistan
  'pakistan.html': 'Pakistan',
  'balochistan.html': 'Pakistan',
  'gilgit.html': 'Pakistan',
  'kp.html': 'Pakistan',
  'khyber.html': 'Pakistan',

  // Chile
  'chile.html': 'Chile',
  'arica.html': 'Chile',
  'atacama.html': 'Chile'
};

const fileToRegionName = {
  'bourgogne.html': 'Bourgogne-Franche-Comté & Jura',
  'grandest.html': 'Grand Est & Vosges',
  'aquitaine.html': 'Nouvelle-Aquitaine',
  'occitanie.html': 'Occitanie & Pyrenees',
  'paca.html': 'Provence-Alpes-Côte d\'Azur (PACA)',
  'auvergne.html': 'Auvergne-Rhône-Alpes',

  'carinthia.html': 'Carinthia',
  'lower-austria.html': 'Lower Austria',
  'salzburg.html': 'Salzburg',
  'styria.html': 'Styria',
  'tyrol.html': 'Tyrol',
  'vorarlberg.html': 'Vorarlberg',

  'aargau.html': 'Aargau',
  'bern.html': 'Bern & Bernese Oberland',
  'fribourg.html': 'Fribourg',
  'glarus.html': 'Glarus',
  'graubunden.html': 'Graubünden',
  'lucerne.html': 'Lucerne',
  'nidwalden.html': 'Nidwalden',
  'obwalden.html': 'Obwalden',
  'schwyz.html': 'Schwyz',
  'stgallen.html': 'St. Gallen & Appenzell',
  'ticino.html': 'Ticino',
  'uri.html': 'Uri',
  'valais.html': 'Valais',
  'vaud.html': 'Vaud & Jura',
  'zurich.html': 'Zurich, Zug & Thurgau',

  'aostavalley.html': 'Aosta Valley',
  'cuneo.html': 'Cuneo & Maritime Alps',
  'emilia.html': 'Emilia-Romagna Apennines',
  'fvg.html': 'Friuli-Venezia Giulia',
  'lombardy.html': 'Lombardy Alps & Valtellina',
  'ossola.html': 'Verbano-Cusio-Ossola & Biella',
  'piedmont.html': 'Piedmont',
  'turin.html': 'Metropolitan City of Turin',
  'tuscany.html': 'Tuscany & Lunigiana',
  'veneto.html': 'Veneto & Belluno Dolomites',

  'alaska.html': 'Alaska',
  'arizona.html': 'Arizona',
  'california.html': 'California',
  'colorado.html': 'Colorado',
  'idaho.html': 'Idaho',
  'maryland.html': 'Maryland',
  'montana.html': 'Montana',
  'nevada.html': 'Nevada',
  'newhampshire.html': 'New Hampshire',
  'newmexico.html': 'New Mexico',
  'northcarolina.html': 'North Carolina',
  'oregon.html': 'Oregon',
  'pennsylvania.html': 'Pennsylvania',
  'tennessee.html': 'Tennessee',
  'utah.html': 'Utah',
  'virginia.html': 'Virginia',
  'washington.html': 'Washington',
  'westvirginia.html': 'West Virginia',
  'wyoming.html': 'Wyoming',

  'alberta.html': 'Alberta',
  'britishcolumbia.html': 'British Columbia',
  'maritimes.html': 'New Brunswick & Nova Scotia',
  'nl.html': 'Newfoundland & Labrador',
  'nwt.html': 'Northwest Territories',
  'quebec.html': 'Quebec',
  'yukon.html': 'Yukon Territory',

  'finnmark.html': 'Finnmark & Troms',
  'innlandet.html': 'Innlandet',
  'moreogromsdal.html': 'Møre og Romsdal',
  'trondelag.html': 'Trøndelag',
  'vestland.html': 'Vestland',

  'arunachal.html': 'Arunachal Pradesh',
  'himachal.html': 'Himachal Pradesh',
  'jk.html': 'Jammu & Kashmir',
  'ladakh.html': 'Ladakh',
  'nagaland.html': 'Nagaland',
  'sikkim.html': 'Sikkim',
  'uttarakhand.html': 'Uttarakhand',

  'balochistan.html': 'Balochistan',
  'gilgit.html': 'Gilgit-Baltistan',
  'kp.html': 'Khyber Pakhtunkhwa',
  'khyber.html': 'Khyber Pass Region',

  'arica.html': 'Arica y Parinacota',
  'atacama.html': 'Atacama Region'
};

// Also Tajikistan from index.html
// Also Nepal, China, South Africa, Argentina featured passes
console.log('Mappings configured for', Object.keys(fileToRegionName).length, 'regions');
