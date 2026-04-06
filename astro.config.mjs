// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'EBench Docs',
			description: 'Documentation for EBench — an indoor VLA manipulation benchmark for long-horizon tasks, dexterous manipulation, and mobile manipulation.',
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
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/InternRobotics/GenManip' }],
			expressiveCode: {
				themes: ['github-dark-dimmed', 'github-light'],
				styleOverrides: {
					borderRadius: '0.75rem',
					borderColor: 'var(--ebench-line-soft)',
					codeFontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
					codeFontSize: '0.855rem',
					codePaddingBlock: '1rem',
					codePaddingInline: '1.25rem',
					frames: {
						editorTabBarBackground: 'var(--ebench-code-header-bg)',
						terminalTitlebarBackground: 'var(--ebench-code-header-bg)',
						editorBackground: 'var(--ebench-code-bg)',
						terminalBackground: 'var(--ebench-code-bg)',
						shadowColor: 'transparent',
						editorTabBarBorderBottomColor: 'var(--ebench-line-soft)',
						terminalTitlebarBorderBottomColor: 'transparent',
					},
				},
			},
			customCss: ['@fontsource-variable/outfit', '/src/styles/custom.css'],
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
					slug: 'evaluation/task-showcase',
					label: 'Task Showcase',
					translations: { 'zh-CN': '任务展示' },
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
							label: 'Asset & Dataset',
							translations: { 'zh-CN': '资产与数据集' },
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
					],
				},
				{
					label: 'Reference',
					translations: { 'zh-CN': '参考' },
					items: [
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
