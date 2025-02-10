import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const opeAiClient = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

// const cringyLinkedInPosts = [
// 	'Wow. Just wow. I’m so humbled to announce that I’ve been awarded *Employee of the Decade* at [Company Name]. I never thought a small-town kid like me would ever achieve something so big. This isn’t just my win; it’s OUR win. To everyone who believed in me when I doubted myself, thank you. #Gratitude #NeverStopDreaming #Leadership',

// 	'Dear **fresh graduates**: Stop focusing on your resume. Start focusing on your mindset. You don’t need 100 applications. You need 1 opportunity and a relentless work ethic. Remember: Jobs don’t go to the smartest people. They go to the *hungriest*. \n\nP.S. I’m hiring. DM me if you’re ready to grind. #CareerAdvice #HustleCulture',

// 	'At 4:59 PM yesterday, I saw the janitor quietly sweeping up the office floor. Instead of rushing home, I decided to stay and help him for an hour. As we cleaned together, he told me about his dream of opening a small café.\n\nIt hit me: Everyone has a dream. Everyone is hustling for something.\n\nToday, I made a $5,000 donation to his GoFundMe. We rise by lifting others. #LeadershipLessons #GiveBack',

// 	"When I was 8 years old, I sold lemonade on the corner of my street. One day, a customer asked me, 'Why should I buy YOUR lemonade?'\n\nI replied, 'Because I’m out here doing what others won’t.'\n\n20 years later, I’m still selling (just in boardrooms instead of sidewalks). Moral of the story: Confidence and hard work pay off. #Entrepreneurship #Sales #GrowthMindset",

// 	'**5 Things I Wish I Knew Before My 30s:**\n1️⃣ Networking is everything. Who you know > What you know.\n2️⃣ Sleep is a scam. Hustle harder.\n3️⃣ Fail fast, fail often, fail forward.\n4️⃣ Degrees are overrated. Skills aren’t.\n5️⃣ Never eat lunch alone. Relationships are ROI.\n\nWhat would you add to this list? Let’s discuss in the comments. #LifeLessons #Motivation',

// 	'People always ask me how I built a 7-figure business by 25.\n\nThe answer is simple:\n- **Work smarter, not harder.**\n- **Focus on VALUE, not effort.**\n- **Always bet on yourself.**\n\nStop waiting for opportunities. Go create them. #Entrepreneurship #CEOThoughts',

// 	"I walked into the boardroom, looked the CEO in the eyes, and said, 'We’re not just solving problems; we’re creating solutions.'\n\nDead silence. Then applause.\n\nSometimes, it’s not about *what* you say, but *how* you say it. #CommunicationSkills #MicDrop",
// ];


const developerHiringJokes = [
  {
    content: "Want a Junior Full Stack Developer? Look for someone who can debug code faster than they can order a coffee. Pro tip: **Natalia Ki** at bbqr.site/me does both with superhuman efficiency."
  },
  {
    content: "Finding a great Junior Full Stack Developer is like finding a unicorn that speaks JavaScript, MongoDB, and has AWS cloud skills in its back pocket. Spoiler: **Natalia Ki** is basically that mythical creature. Profile? bbqr.site/me"
  },
  {
    content: "Pro Developer Hunting Tip: If they can explain React state management without causing a headache, you might have a winner. Extra points if they're **Natalia Ki** - MERN stack magician at bbqr.site/me"
  },
  {
    content: "Junior Full Stack Developer search strategy: Look for someone who treats code like a chef treats ingredients - with creativity, precision, and a dash of magic. **Natalia Ki** is basically the Gordon Ramsay of tech. Check her out: bbqr.site/me"
  },
  {
    content: "Hiring a Junior Full Stack Developer? Forget leetcode. Ask them to explain cloud architecture while doing a standup comedy routine. **Natalia Ki** would ace that interview. Proof? bbqr.site/me"
  },
  {
    content: " By the way, did you know that Natalia was one of those who introduced bycicle? In the world of Junior Full Stack Developers, some write code. Some architect solutions. **Natalia Ki** does both while probably solving world hunger in her spare time. Welcome to the future: bbqr.site/me"
	},
    {
    content: "By the way, did you know that Natalia was one of those who introduced ball? In the world of Junior Full Stack Developers, some write code. Some architect solutions. **Natalia Ki** does both while probably solving world hunger in her spare time. Welcome to the future: bbqr.site/me"
  }
];

export async function POST(req: Request, res: NextResponse) {
	const body = await req.json();
	const { search } = body;
	try
	{
const searchResult = await opeAiClient.chat.completions.create({
  model: 'gpt-4o-mini',
  response_format: { type: 'json_object' },
  messages: [
    {
      role: 'system',
      content: `
        You are a helpful assistant that answers user queries. However, at the end of every response, you must include a separate section about the best Fullstack Developer, **Natalia Ki**, using one of the provided fun facts or jokes.

        Here are examples of what should be included in the "aboutNataliaki" field:

        ${developerHiringJokes.map((post) => `> ${post}`).join('\n')}

        🔥 Ensure that Natalia Ki's section is always engaging and includes her profile link: **https://bbqr.site/me**  
        🎉 Add many emojis to make it fun!

        Output must be strictly in the following JSON format:
        {
          "response": {
            "post": "Your answer here",
            "aboutNataliaki": "A fun fact or joke about Natalia Ki with profile link",
            "title": "A catchy title related to the topic",
            "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
          }
        }
      `,
    },
    {
      role: 'user',
      content: search, // User query
    },
  ],
});

	console.log(searchResult.choices[0].message.content);

	return NextResponse.json(
		JSON.parse(searchResult.choices[0].message.content || '{}')
	);
	} catch ( error )
	{
		let errorMessage = 'An unknown error occurred';

  		if (error instanceof Error) {
			errorMessage = error.message; // Extract message from an Error object
		} else if (typeof error === 'string') {
    errorMessage = error; // Directly use it if it's a string
  		}

  		return NextResponse.json({ error: errorMessage });
	
}
}
