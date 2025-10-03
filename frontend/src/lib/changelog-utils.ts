import { changelogData, ChangelogEntry } from '@/data/changelog';

export interface LatestUpdate {
  version: string;
  date: string;
  primaryChange: {
    type: string;
    title: string;
    description: string;
    pages: string[];
  };
}

/**
 * Get the latest changelog entry with the most prominent change
 */
export function getLatestUpdate(): LatestUpdate {
  // Get the most recent entry (first in the array since it's sorted by date desc)
  const latestEntry = changelogData[0];
  
  if (!latestEntry) {
    return {
      version: 'v1.0.0',
      date: 'Unknown',
      primaryChange: {
        type: 'feature',
        title: 'No updates available',
        description: 'No changelog entries found',
        pages: []
      }
    };
  }

  // Get the first (most prominent) change from the latest entry
  const primaryChange = latestEntry.changes[0];
  
  return {
    version: latestEntry.version,
    date: latestEntry.date,
    primaryChange: {
      type: primaryChange.type,
      title: primaryChange.title,
      description: primaryChange.description,
      pages: primaryChange.pages || []
    }
  };
}

/**
 * Get the latest changelog entry for a specific page/module
 */
export function getLatestUpdateForPage(pageName: string): LatestUpdate | null {
  for (const entry of changelogData) {
    const pageChange = entry.changes.find(change => 
      change.pages && change.pages.includes(pageName)
    );
    
    if (pageChange) {
    return {
      version: entry.version,
      date: entry.date,
      primaryChange: {
        type: pageChange.type,
        title: pageChange.title,
        description: pageChange.description,
        pages: pageChange.pages || []
      }
    };
    }
  }
  
  return null;
}

/**
 * Get all changes for a specific page/module from the latest version that affects it
 */
export function getLatestChangesForPage(pageName: string): ChangelogEntry['changes'] {
  for (const entry of changelogData) {
    const pageChanges = entry.changes.filter(change => 
      change.pages && change.pages.includes(pageName)
    );
    
    if (pageChanges.length > 0) {
      return pageChanges;
    }
  }
  
  return [];
}
