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
      { name: 'Altdorf', type: 'city', x: 46, y: 48, notes: 'Imperial capital, seat of the Emperor, at the confluence of the Reik and Talabec.' },
      { name: 'Nuln', type: 'city', x: 34, y: 72, notes: 'Great seat of learning and artillery manufacture, on the Upper Reik.' },
      { name: 'Talabheim', type: 'city', x: 70, y: 32, notes: 'Walled city built in a meteor crater on the River Talabec.' },
      { name: 'Middenheim', type: 'city', x: 46, y: 14, notes: 'City of the White Wolf, atop the Ulricsberg.' },
      { name: 'Marienburg', type: 'city', x: 8, y: 22, notes: 'Wealthy port city at the Reik delta; formally independent.' },
      { name: 'Bögenhafen', type: 'town', x: 58, y: 52, notes: 'Market town on the River Teufel.' },
      { name: 'Drakwald Forest', type: 'forest', x: 52, y: 22, notes: 'Dense, haunted woodland north of the Reik.' },
      { name: 'Reikwald Forest', type: 'forest', x: 44, y: 58, notes: 'Forest south of Altdorf.' },
      { name: 'Grey Mountains', type: 'mountain', x: 16, y: 82, notes: 'Range along the south-western border with Bretonnia, riddled with Dwarf holds.' },
      { name: 'Middle Mountains', type: 'mountain', x: 82, y: 70, notes: "Range separating Talabecland and Stirland from the Border Princes." },
    ],
  },
  {
    key: 'borderPrinces',
    label: 'The Border Princes',
    region: 'The Border Princes',
    background: '#5a4a32',
    sites: [
      { name: 'Barak Varr', type: 'fortress', x: 22, y: 70, notes: 'Dwarf sea hold and trading port on the western coast.' },
      { name: 'Black Fire Pass', type: 'landmark', x: 42, y: 6, notes: 'Famous mountain pass linking the Princes to the Empire.' },
      { name: 'Black Mountains', type: 'mountain', x: 30, y: 10, notes: 'Range marking the northern border of the Princes.' },
      { name: 'Blood River', type: 'river', x: 72, y: 35, notes: 'Contested waterway on the frontier with the Badlands, named for its many battles.' },
      { name: 'Sundered Hold', type: 'fortress', x: 48, y: 40, notes: 'Ruined stronghold claimed by a string of petty princelings.' },
      { name: 'Tradeford', type: 'town', x: 52, y: 55, notes: 'Crossroads town serving caravans and mercenary companies.' },
      { name: "Princes' Landing", type: 'city', x: 50, y: 88, notes: 'Largest of the coastal city-states, ruled by a self-styled prince.' },
      { name: 'Whisperwood', type: 'forest', x: 38, y: 62, notes: 'Forest rumored to hide bandit camps and worse.' },
      { name: 'Ravenmoor', type: 'town', x: 80, y: 65, notes: 'Frontier town on the edge of the Badlands.' },
      { name: 'Vulture Peaks', type: 'mountain', x: 85, y: 42, notes: 'Jagged range said to be named for what circles above the battlefields below.' },
    ],
  },
  {
    key: 'badlands',
    label: 'The Badlands',
    region: 'The Badlands',
    background: '#6b3a26',
    sites: [
      { name: 'Mount Bloodhorn', type: 'mountain', x: 45, y: 45, notes: 'Sacred greenskin mountain at the heart of the Badlands.' },
      { name: 'Black Crag', type: 'fortress', x: 80, y: 14, notes: 'Fortified Orc stronghold of crude black stone, just north of Eight Peaks.' },
      { name: 'Eight Peaks', type: 'city', x: 84, y: 24, notes: 'Ancient Dwarf hold on the border of the World’s Edge Mountains, contested by Orcs, Skaven, and Dwarfs alike.' },
      { name: "Orc's Teeth Mountains", type: 'mountain', x: 22, y: 38, notes: 'Jagged range riddled with goblin warrens, toward the Dragonback Mountains in the west.' },
      { name: 'Iron Rock', type: 'landmark', x: 58, y: 55, notes: 'Iron-rich outcrop fought over by rival warbands.' },
      { name: "Golgfag's Camp", type: 'town', x: 42, y: 66, notes: 'Sprawling mercenary Orc encampment.' },
      { name: 'The Cursed Pit', type: 'ruins', x: 62, y: 82, notes: 'Sunken ruin said to be haunted by old battles.' },
      { name: 'Skull Quarry', type: 'landmark', x: 38, y: 86, notes: 'Stone quarry strewn with the bones of the fallen, toward the southern wastes.' },
      { name: 'Dead Wood', type: 'forest', x: 14, y: 68, notes: "Stunted, blackened forest at the wasteland's edge." },
      { name: "Greasus's Road", type: 'landmark', x: 55, y: 28, notes: "Ancient trade route used by the Badlands' Orc tribes, running up toward the Border Princes." },
    ],
  },
  {
    key: 'norsca',
    label: 'Norsca',
    region: 'Norsca',
    background: '#34495e',
    sites: [
      { name: 'Skaeling Hold', type: 'town', x: 75, y: 25, notes: 'Coastal hold of the Skaeling tribe, in the north-east.' },
      { name: 'Baersonling Hold', type: 'town', x: 50, y: 80, notes: 'Stronghold of the Baersonling tribe, raiders of the south, closest to the Empire across the Sea of Claws.' },
      { name: 'Sarl Hold', type: 'town', x: 80, y: 50, notes: 'Easternmost of the great Norse tribes, near the Trollheim range.' },
      { name: "Galleon's Graveyard", type: 'landmark', x: 15, y: 75, notes: 'Treacherous reef strewn with shipwrecks.' },
      { name: "Frostmother's Teeth", type: 'mountain', x: 45, y: 35, notes: 'Jagged, ice-bound mountain range.' },
      { name: 'The Howling Wastes', type: 'landmark', x: 55, y: 15, notes: 'Frozen tundra haunted by Chaos-touched beasts, deep in the north.' },
      { name: 'Forest of Trolls', type: 'forest', x: 65, y: 60, notes: 'Dense pine forest said to be a troll breeding ground.' },
      { name: 'Jotunsgard', type: 'city', x: 45, y: 65, notes: 'Largest Norse settlement, a gathering place for the tribes.' },
      { name: "Sjofn's River", type: 'river', x: 35, y: 85, notes: 'Icy river feeding the Sea of Claws in the south.' },
      { name: 'The Cold Sea Coast', type: 'landmark', x: 12, y: 50, notes: 'Rocky western shoreline where longships are built and launched.' },
    ],
  },
  {
    key: 'worldsEdgeMountains',
    label: "The World's Edge Mountains",
    region: "The World's Edge Mountains",
    background: '#4a4f58',
    sites: [
      { name: 'Karaz-a-Karak', type: 'city', x: 46, y: 50, notes: 'The Everpeak, ancient capital hold of the Dwarfs, anchoring the range.' },
      { name: 'Karak Azul', type: 'city', x: 34, y: 66, notes: 'Dwarf hold renowned for its rune-smiths, south of Karaz-a-Karak.' },
      { name: 'Karak Kadrin', type: 'city', x: 68, y: 20, notes: 'Hold of the Slayer cult, ruled by the Slayer King, south of Peak Pass.' },
      { name: 'Silver Pinnacle', type: 'ruins', x: 50, y: 12, notes: 'Once-glorious hold in the northern reaches, now lost to the Skaven.' },
      { name: 'Karak Varn', type: 'ruins', x: 30, y: 32, notes: 'Flooded hold near the Black Water, claimed by Skaven after a great cataclysm.' },
      { name: 'Death Pass', type: 'landmark', x: 54, y: 82, notes: 'Treacherous mountain pass infamous for ambushes, leading down toward Karak Eight Peaks and the Badlands.' },
      { name: 'Praag', type: 'city', x: 18, y: 8, notes: "Great Kislevite city on the river Lynsk, in the mountains' northern foothills." },
      { name: 'Blackwater River', type: 'river', x: 34, y: 20, notes: 'River running through the northern foothills near Karak Varn.' },
      { name: "World's Edge Forest", type: 'forest', x: 66, y: 58, notes: "Pine forest clinging to the mountains' lower slopes." },
      { name: 'Zhufbar', type: 'city', x: 54, y: 34, notes: 'The Torrent Gate, a great Dwarf hold linked to the Empire by the Old Dwarf Road.' },
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
