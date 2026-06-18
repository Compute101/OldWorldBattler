import type { Campaign } from '../../types';
import { normalizeCampaign } from '../../units';

// Drop a campaign JSON file (from the "Export" button on a campaign) into this folder
// and it will automatically show up here, read-only, for every visitor of the site.
const modules = import.meta.glob<Partial<Campaign>>('./*.json', {
  eager: true,
  import: 'default',
});

export const GLOBAL_CAMPAIGNS: Campaign[] = Object.values(modules)
  .map((data) => ({ ...normalizeCampaign(data), readOnly: true }))
  .sort((a, b) => a.name.localeCompare(b.name));
