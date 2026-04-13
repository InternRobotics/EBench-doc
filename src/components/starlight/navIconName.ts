export const getNavIconName = (label = '', href = '') => {
	const text = `${label} ${href}`.toLowerCase();
	if (
		text.includes('what is') ||
		text.includes('什么是') ||
		text.includes('introduction') ||
		text.includes('项目简介') ||
		text.includes('overview') ||
		text.trim() === '/'
	) {
		return 'spark';
	}
	if (text.includes('getting started') || text.includes('快速开始')) return 'book';
	if (text.includes('environment') || text.includes('环境')) return 'settings';
	if (text.includes('download') || text.includes('资产')) return 'download';
	if (text.includes('evaluation') || text.includes('评测') || text.includes('测试')) return 'grid';
	if (text.includes('run') || text.includes('运行')) return 'nodes';
	if (text.includes('challenge') || text.includes('leaderboard') || text.includes('榜单') || text.includes('挑战赛')) return 'leaderboard';
	if (text.includes('gmp') || text.includes('cli') || text.includes('code')) return 'code';
	if (text.includes('install') || text.includes('安装')) return 'file';
	if (text.includes('feature') || text.includes('功能')) return 'grid';
	if (text.includes('model') || text.includes('模型')) return 'cloud';
	if (text.includes('network') || text.includes('联网')) return 'globe';
	if (text.includes('setting') || text.includes('设置')) return 'settings';
	if (text.includes('knowledge') || text.includes('教程')) return 'book';
	if (text.includes('data') || text.includes('文档数据') || text.includes('数据库')) return 'database';
	if (text.includes('embed') || text.includes('嵌入')) return 'brain';
	if (text.includes('preprocess') || text.includes('预处理')) return 'file';
	if (text.includes('mcp') || text.includes('chain') || text.includes('调用链')) return 'nodes';
	if (text.includes('agent')) return 'bot';
	if (text.includes('community') || text.includes('contribution') || text.includes('贡献')) return 'heart';
	return 'document';
};
