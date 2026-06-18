import type { CampaignMap, CampaignSite, SiteType } from './types';
import { makeId } from './id';

export const SITE_TYPES: { value: SiteType; label: string; color: string; shape: 'circle' | 'triangle' | 'diamond' }[] = [
  { value: 'city', label: 'City', color: '#c8a02e', shape: 'circle' },
  { value: 'town', label: 'Town', color: '#d9b66a', shape: 'circle' },
  { value: 'fortress', label: 'Fortress', color: '#8a8a8a', shape: 'circle' },
  { value: 'ruins', label: 'Ruins', color: '#6b5a3a', shape: 'diamond' },
  { value: 'mountain', label: 'Mountain', color: '#9aa0a6', shape: 'triangle' },
  { value: 'forest', label: 'Forest', color: '#3a6b3f', shape: 'triangle' },
  { value: 'river', label: 'River', color: '#3498db', shape: 'diamond' },
  { value: 'landmark', label: 'Landmark', color: '#8e44ad', shape: 'diamond' },
];

export function siteTypeMeta(type: SiteType) {
  return SITE_TYPES.find((t) => t.value === type) ?? SITE_TYPES[0];
}

export function defaultSite(x = 50, y = 50): CampaignSite {
  return {
    id: makeId('site'),
    name: 'New Site',
    type: 'town',
    x,
    y,
    notes: '',
  };
}

// Backfills sites saved before any new fields existed.
export function normalizeSite(site: Partial<CampaignSite>): CampaignSite {
  return { ...defaultSite(site.x ?? 50, site.y ?? 50), ...site };
}

export interface MapTemplateSite {
  name: string;
  type: SiteType;
  x: number;
  y: number;
  notes?: string;
}

export interface MapTemplate {
  key: string;
  label: string;
  region: string;
  background: string;
  sites: MapTemplateSite[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    key: 'empire',
    label: 'The Empire',
    region: 'The Empire',
    background: '#3a4d2c',
    sites: [
      { name: 'Altdorf', type: 'city', x: 50, y: 68, notes: 'Imperial capital, seat of the Emperor, at the confluence of the Reik and Talabec.' },
      { name: 'Nuln', type: 'city', x: 38, y: 88, notes: 'Great seat of learning and artillery manufacture, on the Upper Reik.' },
      { name: 'Talabheim', type: 'city', x: 78, y: 58, notes: 'Walled city built in a meteor crater on the River Talabec.' },
      { name: 'Middenheim', type: 'city', x: 48, y: 28, notes: 'City of the White Wolf, atop the Ulricsberg.' },
      { name: 'Marienburg', type: 'city', x: 8, y: 78, notes: 'Wealthy port city at the Reik delta; formally independent.' },
      { name: 'Bögenhafen', type: 'town', x: 62, y: 74, notes: 'Market town on the River Teufel.' },
      { name: 'Drakwald Forest', type: 'forest', x: 35, y: 38, notes: 'Dense, haunted woodland north of the Reik.' },
      { name: 'Reikwald Forest', type: 'forest', x: 48, y: 55, notes: 'Forest south of Altdorf.' },
      { name: 'Grey Mountains', type: 'mountain', x: 32, y: 95, notes: 'Southern border range, riddled with Dwarf holds.' },
      { name: 'Middle Mountains', type: 'mountain', x: 75, y: 82, notes: "Range separating Talabecland from the Border Princes." },
    ],
  },
  {
    key: 'borderPrinces',
    label: 'The Border Princes',
    region: 'The Border Princes',
    background: '#5a4a32',
    sites: [
      { name: 'Barak Varr', type: 'fortress', x: 12, y: 18, notes: 'Dwarf sea hold and trading port on the western coast.' },
      { name: 'Black Fire Pass', type: 'landmark', x: 48, y: 8, notes: 'Famous mountain pass linking the Princes to the Empire.' },
      { name: 'Black Mountains', type: 'mountain', x: 42, y: 14, notes: 'Range marking the northern border of the Princes.' },
      { name: 'Blood River', type: 'river', x: 62, y: 36, notes: 'Contested waterway, named for its many battles.' },
      { name: 'Sundered Hold', type: 'fortress', x: 28, y: 48, notes: 'Ruined stronghold claimed by a string of petty princelings.' },
      { name: 'Tradeford', type: 'town', x: 66, y: 58, notes: 'Crossroads town serving caravans and mercenary companies.' },
      { name: "Princes' Landing", type: 'city', x: 20, y: 70, notes: 'Largest of the coastal city-states, ruled by a self-styled prince.' },
      { name: 'Whisperwood', type: 'forest', x: 55, y: 76, notes: 'Forest rumored to hide bandit camps and worse.' },
      { name: 'Ravenmoor', type: 'town', x: 76, y: 84, notes: 'Frontier town on the edge of the Badlands.' },
      { name: 'Vulture Peaks', type: 'mountain', x: 85, y: 50, notes: 'Jagged range said to be named for what circles above the battlefields below.' },
    ],
  },
  {
    key: 'badlands',
    label: 'The Badlands',
    region: 'The Badlands',
    background: '#6b3a26',
    sites: [
      { name: 'Mount Bloodhorn', type: 'mountain', x: 50, y: 18, notes: 'Sacred greenskin mountain at the heart of the Badlands.' },
      { name: 'Black Crag', type: 'fortress', x: 28, y: 34, notes: 'Fortified Orc stronghold of crude black stone.' },
      { name: 'Eight Peaks', type: 'city', x: 74, y: 14, notes: 'Ancient Dwarf hold contested by Orcs, Skaven, and Dwarfs alike.' },
      { name: "Orc's Teeth Mountains", type: 'mountain', x: 18, y: 56, notes: 'Jagged range riddled with goblin warrens.' },
      { name: 'Iron Rock', type: 'landmark', x: 60, y: 48, notes: 'Iron-rich outcrop fought over by rival warbands.' },
      { name: "Golgfag's Camp", type: 'town', x: 40, y: 70, notes: 'Sprawling mercenary Orc encampment.' },
      { name: 'The Cursed Pit', type: 'ruins', x: 82, y: 60, notes: 'Sunken ruin said to be haunted by old battles.' },
      { name: 'Skull Quarry', type: 'landmark', x: 55, y: 86, notes: 'Stone quarry strewn with the bones of the fallen.' },
      { name: 'Dead Wood', type: 'forest', x: 24, y: 82, notes: "Stunted, blackened forest at the wasteland's edge." },
      { name: "Greasus's Road", type: 'landmark', x: 68, y: 34, notes: "Ancient trade route used by the Badlands' Orc tribes." },
    ],
  },
  {
    key: 'norsca',
    label: 'Norsca',
    region: 'Norsca',
    background: '#34495e',
    sites: [
      { name: 'Skaeling Hold', type: 'town', x: 30, y: 20, notes: 'Coastal hold of the Skaeling tribe.' },
      { name: 'Baersonling Hold', type: 'town', x: 55, y: 14, notes: 'Stronghold of the Baersonling tribe, raiders of the south.' },
      { name: 'Sarl Hold', type: 'town', x: 74, y: 30, notes: 'Easternmost of the great Norse tribes.' },
      { name: "Galleon's Graveyard", type: 'landmark', x: 14, y: 50, notes: 'Treacherous reef strewn with shipwrecks.' },
      { name: "Frostmother's Teeth", type: 'mountain', x: 46, y: 44, notes: 'Jagged, ice-bound mountain range.' },
      { name: 'The Howling Wastes', type: 'landmark', x: 66, y: 60, notes: 'Frozen tundra haunted by Chaos-touched beasts.' },
      { name: 'Forest of Trolls', type: 'forest', x: 34, y: 70, notes: 'Dense pine forest said to be a troll breeding ground.' },
      { name: 'Jotunsgard', type: 'city', x: 52, y: 82, notes: 'Largest Norse settlement, a gathering place for the tribes.' },
      { name: "Sjofn's River", type: 'river', x: 62, y: 50, notes: 'Icy river feeding the Sea of Claws.' },
      { name: 'The Cold Sea Coast', type: 'landmark', x: 16, y: 80, notes: 'Rocky shoreline where longships are built and launched.' },
    ],
  },
  {
    key: 'worldsEdgeMountains',
    label: "The World's Edge Mountains",
    region: "The World's Edge Mountains",
    background: '#4a4f58',
    sites: [
      { name: 'Karaz-a-Karak', type: 'city', x: 50, y: 50, notes: 'The Everpeak, ancient capital hold of the Dwarfs.' },
      { name: 'Karak Azul', type: 'city', x: 34, y: 70, notes: 'Dwarf hold renowned for its rune-smiths.' },
      { name: 'Karak Kadrin', type: 'city', x: 66, y: 34, notes: 'Hold of the Slayer cult, ruled by the Slayer King.' },
      { name: 'Silver Pinnacle', type: 'ruins', x: 56, y: 18, notes: 'Once-glorious hold, now lost to the Skaven.' },
      { name: 'Karak Varn', type: 'ruins', x: 28, y: 40, notes: 'Flooded hold, claimed by Skaven after a great cataclysm.' },
      { name: 'Death Pass', type: 'landmark', x: 46, y: 80, notes: 'Treacherous mountain pass infamous for ambushes.' },
      { name: 'Praag', type: 'city', x: 18, y: 86, notes: "Great Kislevite city in the mountains' northern foothills." },
      { name: 'Blackwater River', type: 'river', x: 40, y: 60, notes: 'River running through the eastern foothills.' },
      { name: "World's Edge Forest", type: 'forest', x: 62, y: 64, notes: "Pine forest clinging to the mountains' lower slopes." },
      { name: 'Thunder Falls', type: 'landmark', x: 74, y: 50, notes: 'Towering waterfall marking an ancient Dwarf boundary stone.' },
    ],
  },
];

export function blankCampaignMap(): CampaignMap {
  return { id: makeId('map'), name: 'Campaign Map', region: 'Custom', sites: [] };
}

function sitesFromTemplate(template: MapTemplate): CampaignSite[] {
  return template.sites.map((s) => ({ id: makeId('site'), notes: s.notes ?? '', ...s }));
}

export function defaultCampaignMap(templateKey?: string): CampaignMap {
  const template = MAP_TEMPLATES.find((t) => t.key === templateKey);
  if (!template) return blankCampaignMap();
  return { id: makeId('map'), name: template.label, region: template.region, sites: sitesFromTemplate(template) };
}

export function applyMapTemplate(template: MapTemplate): CampaignMap {
  return { id: makeId('map'), name: template.label, region: template.region, sites: sitesFromTemplate(template) };
}

export function regionBackground(region: string): string {
  const template = MAP_TEMPLATES.find((t) => t.region === region);
  return template?.background ?? '#2f3640';
}

// Backfills campaigns saved before campaign maps existed.
export function normalizeCampaignMap(map?: Partial<CampaignMap>): CampaignMap {
  if (!map) return blankCampaignMap();
  return { ...blankCampaignMap(), ...map, sites: (map.sites ?? []).map(normalizeSite) };
}
