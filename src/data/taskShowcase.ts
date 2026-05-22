export type ShowcaseLocale = 'en' | 'zh-cn';

type LocalizedText = {
	en: string;
	'zh-cn'?: string;
};

type TaskItem = {
	id: string;
	label: LocalizedText;
	video: string;
	location: LocalizedText;
	instruction: LocalizedText;
	score: LocalizedText;
};

type TaskCategory = {
	id: string;
	title: LocalizedText;
	tasks: TaskItem[];
};

export const showcaseCopy = {
	en: {
		intro: 'Browse the task demonstrations below. Select a task tab to view the example video and the task metadata.',
		location: 'Location',
		instruction: 'Instruction',
		score: 'Score',
	},
	'zh-cn': {
		intro: '浏览下方任务演示。点击不同任务标签，可查看示例视频以及该任务的元信息。',
		location: 'Location',
		instruction: 'Instruction',
		score: 'Score',
	},
} as const;

export const showcaseCategories: TaskCategory[] = [
	{
		id: 'long-horizon',
		title: { en: 'Long-Horizon', 'zh-cn': '长程任务（Long-Horizon）' },
		tasks: [
			{
				id: 'bottle',
				label: { en: 'Bottle' },
				video: '/EBench-doc/videos/showcase/long_horizon-bottle.mp4',
				location: { en: 'Kitchen counter', 'zh-cn': '厨房台面' },
				instruction: {
					en: 'Move the bottle through the required long-horizon sequence and place it at the target location.',
					'zh-cn': '按照长程任务要求完成操作序列，并将 bottle 放到目标位置。',
				},
				score: {
					en: 'Each bottle contributes `1/12`. The total score is the sum over all bottles that satisfy the configured target-region predicate in `goal`.',
					'zh-cn': '每个 bottle 记 `1/12`。总分为所有满足 `goal` 中目标区域判定的 bottle 分数之和。',
				},
			},
			{
				id: 'detergent',
				label: { en: 'Detergent' },
				video: '/EBench-doc/videos/showcase/long_horizon-detergent.mp4',
				location: { en: 'Laundry or utility area', 'zh-cn': '清洁或收纳区域' },
				instruction: {
					en: 'Find the detergent, complete the required interaction sequence, and place it at the goal region.',
					'zh-cn': '找到 detergent，完成要求的交互序列，并将其放到目标区域。',
				},
				score: {
					en: 'Each detergent contributes `1/3`. The score is the sum of detergents that are successfully placed into the basket according to `goal`.',
					'zh-cn': '每个 detergent 记 `1/3`。按照 `goal` 成功放入 basket 的 detergent 分数累加得到总分。',
				},
			},
			{
				id: 'dish',
				label: { en: 'Dish' },
				video: '/EBench-doc/videos/showcase/long_horizon-dish.mp4',
				location: { en: 'Dining table or kitchen workspace', 'zh-cn': '餐桌或厨房操作区' },
				instruction: {
					en: 'Manipulate the dish through the multi-step task and finish at the designated target pose.',
					'zh-cn': '围绕 dish 完成多阶段任务，并在指定目标位姿结束。',
				},
				score: {
					en: 'Each required item contributes `1/5`: the dishes and glass must be in the big basket, and the spoon must be in the small basket. The final score is the sum of satisfied sub-goals.',
					'zh-cn': '每个要求物体记 `1/5`：餐具和 glass 需要放入大 basket，spoon 需要放入小 basket。最终得分为满足的子目标之和。',
				},
			},
			{
				id: 'dishwasher',
				label: { en: 'Dishwasher' },
				video: '/EBench-doc/videos/showcase/long_horizon-dishwasher.mp4',
				location: { en: 'Kitchen dishwasher station', 'zh-cn': '厨房洗碗机区域' },
				instruction: {
					en: 'Open, interact with, and complete the dishwasher-related task sequence successfully.',
					'zh-cn': '完成与 dishwasher 相关的开合与操作任务序列。',
				},
				score: {
					en: 'Open the dishwasher for `1/2`. Each of the two bowls placed inside contributes `1/6`, and closing the dishwasher contributes the remaining `1/6`.',
					'zh-cn': '打开 dishwasher 记 `1/2`。两个 bowl 分别成功放入内部各记 `1/6`，最后关闭 dishwasher 再记 `1/6`。',
				},
			},
			{
				id: 'fruit',
				label: { en: 'Fruit' },
				video: '/EBench-doc/videos/showcase/long_horizon-fruit.mp4',
				location: { en: 'Kitchen fruit area', 'zh-cn': '厨房水果区域' },
				instruction: {
					en: 'Handle the fruit items according to the long-horizon goal and finish with all required placements completed.',
					'zh-cn': '按照长程目标处理 fruit 相关物体，并完成所有要求的放置。',
				},
				score: {
					en: 'Each of the three fruits placed into the target container contributes `1/5`, and pouring water contributes `2/5`.',
					'zh-cn': '三个水果分别成功放入目标容器各记 `1/5`，完成倒水记 `2/5`。',
				},
			},
			{
				id: 'make-sandwich',
				label: { en: 'Make Sandwich' },
				video: '/EBench-doc/videos/showcase/long_horizon-make_sandwich.mp4',
				location: { en: 'Kitchen preparation area', 'zh-cn': '厨房备餐区域' },
				instruction: {
					en: 'Assemble the sandwich by executing the required multi-step preparation sequence.',
					'zh-cn': '执行所需的多步备餐流程，完成 sandwich 制作任务。',
				},
				score: {
					en: 'Each sandwich layer stacked on top of the previous one contributes `1/4`. The total score sums the four required stacking relations in `goal`.',
					'zh-cn': '每一层食材正确叠放在前一层之上记 `1/4`。总分为 `goal` 中四个叠放关系的累加。',
				},
			},
			{
				id: 'microwave',
				label: { en: 'Microwave' },
				video: '/EBench-doc/videos/showcase/long_horizon-microwave.mp4',
				location: { en: 'Kitchen microwave station', 'zh-cn': '厨房微波炉区域' },
				instruction: {
					en: 'Complete the microwave interaction sequence, including object handling and appliance interaction.',
					'zh-cn': '完成 microwave 相关的物体操作与设备交互流程。',
				},
				score: {
					en: 'Opening the microwave contributes `1/2`. Each of the two egg tarts placed inside contributes `1/6`, and closing the microwave contributes the final `1/6`.',
					'zh-cn': '打开 microwave 记 `1/2`。两个蛋挞分别成功放入内部各记 `1/6`，关闭 microwave 再记最后 `1/6`。',
				},
			},
			{
				id: 'pen',
				label: { en: 'Pen' },
				video: '/EBench-doc/videos/showcase/long_horizon-pen.mp4',
				location: { en: 'Desk or study area', 'zh-cn': '书桌或书房区域' },
				instruction: {
					en: 'Manipulate the pen across the required long-horizon sequence and end in the target region.',
					'zh-cn': '围绕 pen 完成要求的长程操作序列，并在目标区域结束。',
				},
				score: {
					en: 'Each pen contributes `1/3`. The score is the sum of pens that satisfy the configured final placement relation.',
					'zh-cn': '每个 pen 记 `1/3`。满足配置中最终放置关系的 pen 分数累加得到总分。',
				},
			},
			{
				id: 'shop',
				label: { en: 'Shop' },
				video: '/EBench-doc/videos/showcase/long_horizon-shop.mp4',
				location: { en: 'Shelf or retail-style scene', 'zh-cn': '货架或商店式场景' },
				instruction: {
					en: 'Finish the shop-style organization task by completing the required sequence of placements and interactions.',
					'zh-cn': '完成 shop 场景中的整理任务，达成要求的放置与交互顺序。',
				},
				score: {
					en: 'Six objects staying in the checkout region for 30 steps contribute `1/6` each, and six objects placed on the left side contribute `1/6` each, following the configured shop predicates.',
					'zh-cn': '六个物体在收银区域连续停留 30 步各记 `1/6`，六个物体被放置在左侧区域各记 `1/6`，具体按 shop 配置中的判定条件执行。',
				},
			},
		],
	},
	{
		id: 'pick-and-place',
		title: { en: 'Pick-and-Place', 'zh-cn': '抓取放置（Pick-and-Place）' },
		tasks: [
			{
				id: 'utensils-to-holder',
				label: { en: 'Utensils to Holder' },
				video: '/EBench-doc/videos/showcase/simple_pnp-utensils_to_holder.mp4',
				location: { en: 'Kitchen utensil area', 'zh-cn': '厨房餐具区域' },
				instruction: {
					en: 'Pick up the utensils and place them into the holder.',
					'zh-cn': '抓取餐具并放入 holder 中。',
				},
				score: {
					en: 'Spoon placed on the holder contributes `0.5`, and fork placed on the holder contributes `0.5`. Order does not matter.',
					'zh-cn': 'spoon 成功放到 holder 上记 `0.5`，fork 成功放到 holder 上记 `0.5`，先后顺序不限。',
				},
			},
			{
				id: 'bookmark-on-book',
				label: { en: 'Bookmark on Book' },
				video: '/EBench-doc/videos/showcase/simple_pnp-bookmark_on_book.mp4',
				location: { en: 'Desk or reading area', 'zh-cn': '书桌或阅读区域' },
				instruction: {
					en: 'Pick up the bookmark and place it on the target book.',
					'zh-cn': '抓取 bookmark 并将其放到目标 book 上。',
				},
				score: {
					en: 'Score `1.0` if the bookmark is placed on the book with at least 40% overlap; otherwise `0.0`.',
					'zh-cn': '若 bookmark 放置在 book 上且重叠面积至少达到 40%，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'soap-to-dish',
				label: { en: 'Soap to Dish' },
				video: '/EBench-doc/videos/showcase/simple_pnp-soap_to_dish.mp4',
				location: { en: 'Bathroom or sink area', 'zh-cn': '浴室或洗手台区域' },
				instruction: {
					en: 'Pick up the soap and place it in the soap dish.',
					'zh-cn': '抓取 soap 并将其放到 soap dish 中。',
				},
				score: {
					en: 'Score `1.0` if the soap is placed on the dish; otherwise `0.0`.',
					'zh-cn': '若 soap 成功放到 dish 上，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'apple-to-fruit-bowl',
				label: { en: 'Apple to Fruit Bowl' },
				video: '/EBench-doc/videos/showcase/simple_pnp-apple_to_fruit_bowl.mp4',
				location: { en: 'Kitchen or dining table', 'zh-cn': '厨房或餐桌区域' },
				instruction: {
					en: 'Pick up the apple and place it into the fruit bowl.',
					'zh-cn': '抓取 apple 并将其放入 fruit bowl。',
				},
				score: {
					en: 'Score `1.0` if the apple is placed into the fruit bowl; otherwise `0.0`.',
					'zh-cn': '若 apple 成功放入 fruit bowl，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'remote-to-holder',
				label: { en: 'Remote to Holder' },
				video: '/EBench-doc/videos/showcase/simple_pnp-remote_to_holder.mp4',
				location: { en: 'Living room table', 'zh-cn': '客厅桌面区域' },
				instruction: {
					en: 'Pick up the remote and place it into the holder.',
					'zh-cn': '抓取 remote 并将其放入 holder。',
				},
				score: {
					en: 'Score `1.0` if the remote is placed on the holder with at least 40% overlap; otherwise `0.0`.',
					'zh-cn': '若 remote 放置在 holder 上且重叠面积至少达到 40%，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'perfume-to-cosmetics-rack',
				label: { en: 'Perfume to Cosmetics Rack' },
				video: '/EBench-doc/videos/showcase/simple_pnp-perfume_to_cosmetics_rack.mp4',
				location: { en: 'Vanity or cosmetics area', 'zh-cn': '梳妆台或化妆品区域' },
				instruction: {
					en: 'Pick up the perfume bottle and place it on the cosmetics rack.',
					'zh-cn': '抓取 perfume 瓶并将其放到 cosmetics rack 上。',
				},
				score: {
					en: 'Placing the perfume bottle above the rack contributes `0.5`, and inserting it into one slot of the rack contributes the remaining `0.5`.',
					'zh-cn': '香水瓶被放到 rack 上方记 `0.5`，进一步插入 rack 的某个格子中再记 `0.5`。',
				},
			},
			{
				id: 'salt-to-spice-rack',
				label: { en: 'Salt to Spice Rack' },
				video: '/EBench-doc/videos/showcase/simple_pnp-salt_to_spice_rack.mp4',
				location: { en: 'Kitchen spice station', 'zh-cn': '厨房调味架区域' },
				instruction: {
					en: 'Pick up the salt container and place it on the spice rack.',
					'zh-cn': '抓取 salt 容器并将其放到 spice rack 上。',
				},
				score: {
					en: 'Score `1.0` if the salt container is placed into the spice rack; otherwise `0.0`.',
					'zh-cn': '若 salt 容器成功放入 spice rack，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'apple-from-shelf',
				label: { en: 'Apple from Shelf' },
				video: '/EBench-doc/videos/showcase/simple_pnp-apple_from_shelf.mp4',
				location: { en: 'Shelf storage area', 'zh-cn': '货架收纳区域' },
				instruction: {
					en: 'Retrieve the apple from the shelf and move it to the designated target area.',
					'zh-cn': '从 shelf 上取下 apple，并移动到指定目标区域。',
				},
				score: {
					en: 'Score `1.0` if the apple is moved out beyond the shelf railing, meaning it is successfully taken out; otherwise `0.0`.',
					'zh-cn': '若 apple 的位置超出 shelf 栏杆，表示成功取出，得分为 `1.0`；否则为 `0.0`。',
				},
			},
			{
				id: 'teacup-to-saucer',
				label: { en: 'Teacup to Saucer' },
				video: '/EBench-doc/videos/showcase/simple_pnp-teacup_to_saucer.mp4',
				location: { en: 'Tea set or dining area', 'zh-cn': '茶具或餐桌区域' },
				instruction: {
					en: 'Pick up the teacup and place it on the saucer.',
					'zh-cn': '抓取 teacup 并将其放到 saucer 上。',
				},
				score: {
					en: 'Placing the teacup on the saucer contributes `0.5`, and placing the teapot on the tray contributes `0.5`. Order does not matter.',
					'zh-cn': 'teacup 成功放到 saucer 上记 `0.5`，teapot 成功放到 tray 上记 `0.5`，先后顺序不限。',
				},
			},
			{
				id: 'bowl-to-plate',
				label: { en: 'Bowl to Plate' },
				video: '/EBench-doc/videos/showcase/simple_pnp-bowl_to_plate.mp4',
				location: { en: 'Dining table', 'zh-cn': '餐桌区域' },
				instruction: {
					en: 'Pick up the bowl and place it onto the target plate region.',
					'zh-cn': '抓取 bowl 并将其放到目标 plate 区域上。',
				},
				score: {
					en: 'Score `1.0` if any one of the three bowls is successfully picked and placed onto the plate; otherwise `0.0`.',
					'zh-cn': '三个 bowl 中任意一个被成功夹起并放到 plate 上，即得 `1.0`；否则为 `0.0`。',
				},
			},
		],
	},
	{
		id: 'dexterous-precise',
		title: { en: 'Dexterous & Precise', 'zh-cn': '灵巧精细操作（Dexterous & Precise）' },
		tasks: [
			{
				id: 'collect-coffee-beans',
				label: { en: 'Collect Coffee Beans' },
				video: '/EBench-doc/videos/showcase/teleop-collect_coffee_beans.mp4',
				location: { en: 'Tabletop manipulation scene', 'zh-cn': '桌面精细操作场景' },
				instruction: {
					en: 'Collect the scattered coffee beans into the target container or region.',
					'zh-cn': '将散落的 coffee beans 收集到目标容器或区域中。',
				},
				score: {
					en: 'The lid contributes `0.5` when it is placed on the jar, aligned near the jar axis, and parallel to the tabletop. Each of the seven coffee beans in the jar contributes `0.5/7`.',
					'zh-cn': '盖子放在罐子上、与罐子中心轴相近且平行于桌面时记 `0.5`。7 颗咖啡豆中，每颗进入罐子各记 `0.5/7`。',
				},
			},
			{
				id: 'flip-cup-collect-cookies',
				label: { en: 'Flip Cup & Collect Cookies' },
				video: '/EBench-doc/videos/showcase/teleop-flip_cup_collect_cookies.mp4',
				location: { en: 'Tabletop manipulation scene', 'zh-cn': '桌面精细操作场景' },
				instruction: {
					en: 'Flip the cup and collect the cookies according to the task requirement.',
					'zh-cn': '按任务要求翻转 cup，并完成 cookies 收集。',
				},
				score: {
					en: 'The cup contributes `0.5` when its opening faces upward and its center axis is within 10 degrees of the world Z axis. Each of the five cookies in the bowl contributes `0.5/5`.',
					'zh-cn': '杯口朝上且杯子中心轴与 World Z axis 夹角在 10° 以内时记 `0.5`。5 块饼干中，每块放入碗内各记 `0.5/5`。',
				},
			},
			{
				id: 'frame-against-pen-holder',
				label: { en: 'Frame Against Pen Holder' },
				video: '/EBench-doc/videos/showcase/teleop-frame_against_pen_holder.mp4',
				location: { en: 'Desk manipulation scene', 'zh-cn': '书桌精细操作场景' },
				instruction: {
					en: 'Move and align the frame against the pen holder at the required pose.',
					'zh-cn': '移动并对齐 frame，使其按要求贴靠在 pen holder 上。',
				},
				score: {
					en: 'Temporal condition 1 (prerequisite): the frame center stays above a required height (`1/3`). Temporal condition 2 (evaluated only after condition 1): the frame is in contact with the cup (`1/3`), and the frame stays in an upright leaning pose (`1/3`).',
					'zh-cn': '时序条件 1（前置判断）：相框中心点保持一定高度，记 `1/3`。时序条件 2（满足上一条后再判断）：相框接触杯子，记 `1/3`，相框保持正向斜靠姿态，记 `1/3`。',
				},
			},
			{
				id: 'install-gear',
				label: { en: 'Install Gear' },
				video: '/EBench-doc/videos/showcase/teleop-install_gear.mp4',
				location: { en: 'Assembly workstation', 'zh-cn': '装配工作台' },
				instruction: {
					en: 'Pick up the gear and install it onto the target shaft or slot.',
					'zh-cn': '抓取 gear，并将其安装到目标轴或槽位上。',
				},
				score: {
					en: 'Placing the gear on the shaft contributes `0.5`. Properly meshing the gear with the other two gears contributes `0.5`.',
					'zh-cn': '齿轮放在轴上记 `0.5`；齿轮与另外两个齿轮耦合记 `0.5`。',
				},
			},
			{
				id: 'peg-in-hole',
				label: { en: 'Peg in Hole' },
				video: '/EBench-doc/videos/showcase/teleop-peg_in_hole.mp4',
				location: { en: 'Assembly workstation', 'zh-cn': '装配工作台' },
				instruction: {
					en: 'Insert the peg into the target hole with the required precision.',
					'zh-cn': '以要求的精度将 peg 插入目标孔位。',
				},
				score: {
					en: 'Removing the peg from the original hole contributes `0.5`. Inserting the peg into the designated hole contributes `0.5`.',
					'zh-cn': '棍子离开原来孔洞记 `0.5`；棍子放入指定孔洞记 `0.5`。',
				},
			},
			{
				id: 'put-glass-in-glassbox',
				label: { en: 'Put Glass in Glassbox' },
				video: '/EBench-doc/videos/showcase/teleop-put_glass_in_glassbox.mp4',
				location: { en: 'Fragile-object handling scene', 'zh-cn': '易碎物体操作场景' },
				instruction: {
					en: 'Pick up the glass carefully and place it into the glass box.',
					'zh-cn': '小心抓取 glass，并将其放入 glass box 中。',
				},
				score: {
					en: 'Folding both temples contributes `1/3`. Closing the glasses case contributes `1/3`. Placing the glasses in the case contributes `1/3`.',
					'zh-cn': '两个镜腿折叠记 `1/3`；眼镜盒闭合记 `1/3`；眼镜在盒中记 `1/3`。',
				},
			},
			{
				id: 'tighten-nut',
				label: { en: 'Tighten Nut' },
				video: '/EBench-doc/videos/showcase/teleop-tighten_nut.mp4',
				location: { en: 'Assembly workstation', 'zh-cn': '装配工作台' },
				instruction: {
					en: 'Align and tighten the nut to complete the fastening task.',
					'zh-cn': '完成 nut 的对齐与拧紧操作。',
				},
				score: {
					en: 'Temporal condition 1 (prerequisite): the nut is at the top end of the bolt (`0.5`). Temporal condition 2 (evaluated only after condition 1): the nut is fully tightened onto the bolt (`0.5`).',
					'zh-cn': '时序条件 1（前置判断）：螺母位于螺栓上端，记 `0.5`。时序条件 2（满足上一条后再判断）：螺母完全旋入螺栓，记 `0.5`。',
				},
			},
		],
	},
];

export const getLocalizedText = (text: LocalizedText, locale: ShowcaseLocale) => text[locale] ?? text.en;
