module.exports = [{
		id: "1",
		pid: 0,
		label: "一级 1",
		children: [{
			id: "1-1",
			pid: "1",
			label: "二级 1-1",
			children: [{
					id: "1-1-1",
					pid: "1-1",
					children: [],
					label: "二级 1-1-1"
				},
				{
					id: "1-1-2",
					pid: "1-1",
					children: [],
					label: "二级 1-1-2"
				}
			]
		}, ]
	},
	{
		id: "2",
		pid: 0,
		label: "一级 2",
		children: [
			{
			id: "2-1",
			pid: "2",
			label: "二级 2-1",
			children: [{
					id: "2-1-1",
					pid: "2-1",
					children: [],
					label: "二级 2-1-1"
				},
				{
					id: "2-1-2",
					pid: "2-1",
					children: [],
					label: "二级 2-1-2"
				}
			]
		}, 
		{
			id: "2-2",
			pid: "2",
			label: "二级 2-2",
			children: [{
					id: "2-2-1",
					pid: "2-2",
					children: [],
					label: "二级 2-2-1"
				},
				{
					id: "2-2-2",
					pid: "2-2",
					children: [],
					label: "二级 2-2-2"
				}
			]
		}, 
		]
	}
]
