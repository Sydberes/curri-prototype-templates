import type { Config } from 'tailwindcss';

// All tokens map to CSS variables from @curri/curri-styles.
// In the main app (Tailwind v4 + curri-styles), these resolve automatically via @theme.
// In this demo (Tailwind v3), we alias them here and define values in globals.css.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        heading: ['var(--font-heading)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'heading-large':  ['var(--text-heading-large)',  { lineHeight: 'var(--leading-heading-large)' }],
        'heading-medium': ['var(--text-heading-medium)', { lineHeight: 'var(--leading-heading-medium)' }],
        'heading-small':  ['var(--text-heading-small)',  { lineHeight: 'var(--leading-heading-small)' }],
        'body-base':      ['var(--text-body-base)',      { lineHeight: 'var(--leading-body-base)' }],
        'body-medium':    ['var(--text-body-medium)',    { lineHeight: 'var(--leading-body-medium)' }],
        'body-small':     ['var(--text-body-small)',     { lineHeight: 'var(--leading-body-small)' }],
        'body-xsmall':    ['var(--text-body-xsmall)',    { lineHeight: 'var(--leading-body-xsmall)' }],
        'accent-large':   ['var(--text-accent-large)',   { lineHeight: 'var(--leading-accent-large)' }],
      },
      fontWeight: {
        regular:   'var(--font-weight-regular)',
        medium:    'var(--font-weight-medium)',
        semibold:  'var(--font-weight-semibold)',
        bold:      'var(--font-weight-bold)',
      },
      colors: {
        // Surfaces
        surface:                    'var(--color-elevation-surface-overlay)',
        'surface-hover':            'var(--color-elevation-surface-overlay-hover)',
        'surface-raised':           'var(--color-elevation-surface-raised)',
        'surface-raised-hover':     'var(--color-elevation-surface-raised-hover)',
        'surface-base':             'var(--color-elevation-surface-base)',
        'surface-base-hover':       'var(--color-elevation-surface-base-hover)',
        'surface-sunken':           'var(--color-elevation-surface-sunken)',
        // Text
        foreground:           'var(--color-text-primary)',
        'foreground-secondary': 'var(--color-text-secondary)',
        'foreground-tertiary':  'var(--color-text-tertiary)',
        brand:                'var(--color-text-brand)',
        // Borders
        border:               'var(--color-border-primary)',
        // Modal backdrop
        blanket:              'var(--color-blanket-blanket)',
        // Neutral backgrounds
        'neutral-secondary':       'var(--color-background-neutral-secondary)',
        'neutral-secondary-hover': 'var(--color-background-neutral-secondary-hover)',
      },
      borderWidth: {
        DEFAULT: 'var(--border-width-default)', // 0.5px from --scale-10
      },
      boxShadow: {
        overlay: 'var(--shadow-elevation-overlay)',
        raised:  'var(--shadow-elevation-raised)',
      },
      borderRadius: {
        xs:    'var(--radius-xs)',
        sm:    'var(--radius-sm)',
        m:     'var(--radius-m)',
        xl:    'var(--radius-xl)',
        xxl:   'var(--radius-xxl)',
        round: 'var(--radius-round)',
      },
    },
  },
  plugins: [],
};

export default config;
