import type { Config } from 'tailwindcss';
import uiTailwindConfig from '../../libs/ui/tailwind.config';

export default {
  presets: [uiTailwindConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
} satisfies Config;
