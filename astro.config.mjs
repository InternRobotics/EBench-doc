// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const accentInitScript = `(function () {
  const storageKey = 'ebench-docs-accent';
  const defaultColor = '#ff6b6b';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const sanitizeHex = (value) =>
    typeof value === 'string' && /^#?[0-9a-fA-F]{6}$/.test(value)
      ? '#' + value.replace('#', '').toLowerCase()
      : null;
  const hexToHsl = (hex) => {
    const normalized = sanitizeHex(hex);
    if (!normalized) return null;
    const raw = normalized.slice(1);
    const r = parseInt(raw.slice(0, 2), 16) / 255;
    const g = parseInt(raw.slice(2, 4), 16) / 255;
    const b = parseInt(raw.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return { h, s: s * 100 };
  };
  const hslString = (h, s, l) => 'hsl(' + Math.round(h) + ' ' + Math.round(s) + '% ' + Math.round(l) + '%)';
  const applyAccent = (hex) => {
    const parsed = hexToHsl(hex);
    if (!parsed) return;
    const root = document.documentElement;
    const sat = clamp(parsed.s, 58, 92);
    const warmRange = parsed.h >= 38 && parsed.h <= 72;
    root.style.setProperty('--ebench-accent-light-low', hslString(parsed.h, clamp(sat * 0.78, 40, 92), 92));
    root.style.setProperty('--ebench-accent-light', hslString(parsed.h, clamp(sat, 62, 92), 60));
    root.style.setProperty('--ebench-accent-light-high', hslString(parsed.h, clamp(sat * 0.76, 32, 84), 34));
    root.style.setProperty('--ebench-accent-dark-low', hslString(parsed.h, clamp(sat * 0.54, 28, 72), 20));
    root.style.setProperty('--ebench-accent-dark', hslString(parsed.h, clamp(sat, 62, 92), 62));
    root.style.setProperty('--ebench-accent-dark-high', hslString(parsed.h, clamp(sat * 0.46, 26, 72), 84));
    root.style.setProperty('--ebench-nav-light', hslString(parsed.h, clamp(sat * 0.9, 56, 88), warmRange ? 50 : 57));
    root.style.setProperty('--ebench-nav-dark', hslString(parsed.h, clamp(sat * 0.56, 34, 72), warmRange ? 28 : 32));
    root.style.setProperty('--ebench-accent-chip', sanitizeHex(hex) || defaultColor);
  };
  try {
    const stored = sanitizeHex(localStorage.getItem(storageKey)) || defaultColor;
    applyAccent(stored);
  } catch {
    applyAccent(defaultColor);
  }
})();`;

export default defineConfig({
	integrations: [
		starlight({
			title: 'EBench Docs',
			description: 'Documentation for EBench, an Isaac Sim based benchmark for embodied manipulation evaluation.',
			titleDelimiter: '·',
			logo: {
				src: './src/assets/brand-mark.svg',
				alt: 'EBench Docs',
			},
			favicon: '/favicon.svg',
			tableOfContents: {
				minHeadingLevel: 2,
				maxHeadingLevel: 3,
			},
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				'zh-cn': {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/InternRobotics/EBench' }],
			customCss: ['@fontsource-variable/manrope', '/src/styles/custom.css'],
			head: [{ tag: 'script', content: accentInitScript }],
			components: {
				Header: './src/components/starlight/Header.astro',
				PageFrame: './src/components/starlight/PageFrame.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				PageSidebar: './src/components/starlight/PageSidebar.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
			},
			pagefind: true,
			credits: false,
			sidebar: [
				{
					slug: 'index',
					label: 'What Is EBench',
					translations: { 'zh-CN': '什么是 EBench' },
				},
				{
					label: 'Getting Started',
					translations: { 'zh-CN': '快速开始' },
					items: [
						{
							slug: 'getting-started/environment',
							label: 'Environment Setup',
							translations: { 'zh-CN': '环境配置' },
						},
						{
							slug: 'getting-started/assets',
							label: 'Dataset and Assets',
							translations: { 'zh-CN': '数据与资产' },
						},
					],
				},
				{
					label: 'Evaluation',
					translations: { 'zh-CN': '评测' },
					items: [
						{
							slug: 'evaluation/run-benchmark',
							label: 'Run Evaluation',
							translations: { 'zh-CN': '运行评测' },
						},
						{
							slug: 'evaluation/custom-model',
							label: 'Integrate Your Own Model',
							translations: { 'zh-CN': '接入自定义模型' },
						},
						{
							slug: 'tools/gmp-cli',
							label: 'GMP CLI',
							translations: { 'zh-CN': 'GMP CLI' },
						},
					],
				},
			],
		}),
	],
});
