import { ArrowUpRight } from 'lucide-react';
import { ChangelogFeature, ChangelogMedia } from './types';

function FeatureMedia({ media }: { media: ChangelogMedia }) {
  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        loop
        muted
        playsInline
        className="w-full bg-surface-base"
      />
    );
  }
  return (
    <img
      src={media.src}
      alt={media.alt ?? ''}
      className="w-full bg-surface-base"
    />
  );
}

interface ChangelogFeatureCardProps {
  feature: ChangelogFeature;
}

export function ChangelogFeatureCard({ feature }: ChangelogFeatureCardProps) {
  const hasMedia = feature.media && feature.media.length > 0;

  return (
    <div className="border-b border-border last:border-b-0">
      {hasMedia && (
        <div className="flex flex-col">
          {feature.media!.map((m, i) => (
            <FeatureMedia key={i} media={m} />
          ))}
        </div>
      )}

      <div className="px-6 py-6">
        <div className="mb-2">
          <h2 className="text-heading-small font-semibold text-foreground">{feature.title}</h2>
        </div>

        <p className="text-body-base text-foreground-secondary leading-relaxed">{feature.description}</p>

        {feature.docsUrl && (
          <a
            href={feature.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-body-base text-foreground underline hover:no-underline"
          >
            Read the docs
            <ArrowUpRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
