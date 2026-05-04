export interface ChangelogMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  poster?: string;
}

export interface ChangelogFeature {
  id: string;
  title: string;
  description: string;
  media?: ChangelogMedia[];
  tags?: string[];
  docsUrl?: string;
}

export interface ChangelogEntry {
  id: string;
  date: string; // ISO 8601 — "2025-12-17"
  features: ChangelogFeature[];
  changelogUrl?: string;
}
