const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key',
});

exports.summarize = async (req, res) => {
    const { content, type } = req.body; // type: 'chat' or 'document'

    if (!content) {
        return res.status(400).send({ error: 'Content is required' });
    }

    try {
        const prompt = type === 'chat'
            ? `Review this chat history from a study group and provide a concise summary. Highlight key topics discussed, decisions made, and any action items identified. Use bullet points.\n\nChat History:\n${content}`
            : `Analyze this document content and provide a professional, high-level summary. Focus on the main concepts, key arguments, and essential information. Use bullet points for key takeaways.\n\nDocument Content:\n${content}`;

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        res.send({ summary: msg.content[0].text });
    } catch (e) {
        console.error('Claude API error:', e);
        // Return a mock summary if API key is missing or fails for demonstration
        res.send({
            summary: "This is a mock summary because the Claude API key is not configured. \n- Key Point 1: Discussion about study schedules. \n- Key Point 2: Shared resources for Mathematics. \n- Key Point 3: Agreed to meet on Friday at 5 PM."
        });
    }
};
