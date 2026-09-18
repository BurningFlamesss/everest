//#region node_modules/.nitro/vite/services/ssr/assets/courses-BOU_zwBC.js
var s = (id, name, creditHours, theory, practical, outline) => ({
	id,
	name,
	creditHours,
	theory,
	practical,
	outline
});
var sharedPlusTwo = [
	s("p-eng", "Compulsory English", 5, 100, 0, [
		"Prose, poetry and one-act plays",
		"Reading strategy and critical response",
		"Academic writing and presentation"
	]),
	s("p-nep", "Compulsory Nepali", 5, 100, 0, [
		"साहित्यिक पाठहरू",
		"भाषिक सिप र व्याकरण",
		"समालोचनात्मक लेखन"
	]),
	s("p-social", "Social Studies and Life Skills", 3, 100, 0, [
		"Society, culture and identity",
		"Civic participation and law",
		"Life skills, ethics and career planning"
	])
];
[...sharedPlusTwo];
[...sharedPlusTwo];
[...sharedPlusTwo];
var quizQuestions = [
	{
		id: "q1",
		index: 1,
		prompt: "Which class do you look forward to most?",
		options: [
			{
				id: "q1a",
				label: "Physics or biology practicals",
				weights: {
					science: 3,
					management: 0,
					humanities: 0
				}
			},
			{
				id: "q1b",
				label: "Accounts and business studies",
				weights: {
					science: 0,
					management: 3,
					humanities: 0
				}
			},
			{
				id: "q1c",
				label: "History, civics or literature",
				weights: {
					science: 0,
					management: 0,
					humanities: 3
				}
			},
			{
				id: "q1d",
				label: "Mathematics, whatever it is applied to",
				weights: {
					science: 2,
					management: 2,
					humanities: 0
				}
			}
		]
	},
	{
		id: "q2",
		index: 2,
		prompt: "How do you prefer to work through a problem?",
		options: [
			{
				id: "q2a",
				label: "Measure it, then prove it",
				weights: {
					science: 3,
					management: 1,
					humanities: 0
				}
			},
			{
				id: "q2b",
				label: "Weigh what it costs, then decide",
				weights: {
					science: 0,
					management: 3,
					humanities: 1
				}
			},
			{
				id: "q2c",
				label: "Read around it and argue a position",
				weights: {
					science: 0,
					management: 1,
					humanities: 3
				}
			},
			{
				id: "q2d",
				label: "Build something and see what breaks",
				weights: {
					science: 2,
					management: 2,
					humanities: 0
				}
			}
		]
	},
	{
		id: "q3",
		index: 3,
		prompt: "Ten years from now, which room are you working in?",
		options: [
			{
				id: "q3a",
				label: "A hospital or a laboratory",
				weights: {
					science: 3,
					management: 0,
					humanities: 0
				}
			},
			{
				id: "q3b",
				label: "A bank, an office, or my own shop",
				weights: {
					science: 0,
					management: 3,
					humanities: 0
				}
			},
			{
				id: "q3c",
				label: "A classroom, a courtroom or a newsroom",
				weights: {
					science: 0,
					management: 1,
					humanities: 3
				}
			},
			{
				id: "q3d",
				label: "A site office or an engineering firm",
				weights: {
					science: 3,
					management: 1,
					humanities: 0
				}
			}
		]
	},
	{
		id: "q4",
		index: 4,
		prompt: "Which piece of homework would you finish first?",
		options: [
			{
				id: "q4a",
				label: "A lab report with readings and a graph",
				weights: {
					science: 3,
					management: 1,
					humanities: 0
				}
			},
			{
				id: "q4b",
				label: "A month’s budget for a small shop",
				weights: {
					science: 0,
					management: 3,
					humanities: 0
				}
			},
			{
				id: "q4c",
				label: "An essay about a district you have visited",
				weights: {
					science: 0,
					management: 0,
					humanities: 3
				}
			},
			{
				id: "q4d",
				label: "A survey of your neighbours, with charts",
				weights: {
					science: 1,
					management: 2,
					humanities: 2
				}
			}
		]
	},
	{
		id: "q5",
		index: 5,
		prompt: "Pick the sentence that sounds most like you.",
		options: [
			{
				id: "q5a",
				label: "I want to know how a thing actually works",
				weights: {
					science: 3,
					management: 0,
					humanities: 1
				}
			},
			{
				id: "q5b",
				label: "I notice what things cost and who pays",
				weights: {
					science: 0,
					management: 3,
					humanities: 1
				}
			},
			{
				id: "q5c",
				label: "I notice who is being left out",
				weights: {
					science: 0,
					management: 1,
					humanities: 3
				}
			},
			{
				id: "q5d",
				label: "I would rather organise people than data",
				weights: {
					science: 0,
					management: 2,
					humanities: 2
				}
			}
		]
	},
	{
		id: "q6",
		index: 6,
		prompt: "Which subject could you drop without regret?",
		options: [
			{
				id: "q6a",
				label: "Literature",
				weights: {
					science: 2,
					management: 1,
					humanities: 0
				}
			},
			{
				id: "q6b",
				label: "Chemistry",
				weights: {
					science: 0,
					management: 2,
					humanities: 2
				}
			},
			{
				id: "q6c",
				label: "Accountancy",
				weights: {
					science: 2,
					management: 0,
					humanities: 2
				}
			},
			{
				id: "q6d",
				label: "None of them — I would keep all three",
				weights: {
					science: 1,
					management: 1,
					humanities: 1
				}
			}
		]
	}
];
//#endregion
export { quizQuestions };
