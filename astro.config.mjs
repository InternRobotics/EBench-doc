// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://internrobotics.github.io',
	base: '/EBench-doc',
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
				fr: {
					label: 'Français',
					lang: 'fr',
				},
				ja: {
					label: '日本語',
					lang: 'ja',
				},
				ko: {
					label: '한국어',
					lang: 'ko',
				},
				de: {
					label: 'Deutsch',
					lang: 'de',
				},
				es: {
					label: 'Español',
					lang: 'es',
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
					translations: { 'zh-CN': '什么是 EBench', fr: "Qu'est-ce qu'EBench", ja: 'EBenchとは', ko: 'EBench란', de: 'Was ist EBench', es: '¿Qué es EBench?' },
				},
				{
					slug: 'evaluation/task-showcase',
					label: 'Task Showcase',
					translations: { 'zh-CN': '任务展示', fr: 'Démonstrations', ja: 'タスク一覧', ko: '태스크 쇼케이스', de: 'Aufgabenübersicht', es: 'Tareas' },
				},
				{
					label: 'Getting Started',
					translations: { 'zh-CN': '快速开始', fr: 'Mise en route', ja: 'はじめに', ko: '시작하기', de: 'Erste Schritte', es: 'Primeros pasos' },
					items: [
						{
							slug: 'getting-started/environment',
							label: 'Environment Setup',
							translations: { 'zh-CN': '环境配置', fr: "Installation de l'environnement", ja: '環境構築', ko: '환경 설정', de: 'Umgebung einrichten', es: 'Configuración del entorno' },
						},
						{
							slug: 'getting-started/assets',
							label: 'Asset & Dataset',
							translations: { 'zh-CN': '资产与数据集', fr: 'Assets et données', ja: 'アセットとデータセット', ko: '에셋 및 데이터셋', de: 'Assets und Datensatz', es: 'Assets y dataset' },
						},
					],
				},
				{
					label: 'Evaluation',
					translations: { 'zh-CN': '评测', fr: 'Évaluation', ja: '評価', ko: '평가', de: 'Evaluation', es: 'Evaluación' },
					items: [
						{
							slug: 'evaluation/run-benchmark',
							label: 'Run Evaluation',
							translations: { 'zh-CN': '运行评测', fr: "Lancer l'évaluation", ja: '評価の実行', ko: '평가 실행', de: 'Evaluation starten', es: 'Ejecutar evaluación' },
						},
						{
							slug: 'evaluation/custom-model',
							label: 'Integrate Your Own Model',
							translations: { 'zh-CN': '接入自定义模型', fr: 'Intégrer votre modèle', ja: 'モデルの統合', ko: '모델 연동', de: 'Eigenes Modell einbinden', es: 'Integrar tu modelo' },
						},
					],
				},
				{
					label: 'Reference',
					translations: { 'zh-CN': '参考', fr: 'Référence', ja: 'リファレンス', ko: '레퍼런스', de: 'Referenz', es: 'Referencia' },
					items: [
						{
							slug: 'tools/gmp-cli',
							label: 'GMP CLI',
							translations: { 'zh-CN': 'GMP CLI', fr: 'GMP CLI', ja: 'GMP CLI', ko: 'GMP CLI', de: 'GMP CLI', es: 'GMP CLI' },
						},
					],
				},
			],
		}),
	],
});
