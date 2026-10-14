import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATS_FILE = path.join(__dirname, 'unstop-stats.json');

async function syncVelowingsStats() {
  try {
    const stats = {
      competitionId: 20261015,
      title: 'VELOWINGS LEARNING TECHNOLOGIES — Online Live Webinar',
      registerCount: 150,
      viewsCount: 1820,
      status: 'UPCOMING',
      organisation: 'VELOWINGS LEARNING TECHNOLOGIES',
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
    return stats;
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error syncing stats:`, err.message);
  }
  return null;
}

// Initial sync
syncVelowingsStats();
