async function testChat() {
    const messages = [
        { role: 'user', content: 'Tell me about the Council in Bharatvarsh.' }
    ];

    console.log("Sending Msg 1: ", messages[0].content);
    let res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sessionId: 'test-session-123', spoilerMode: 'S1' })
    });

    const text1 = await res.text();
    console.log("Response 1 (truncated):\n", text1.substring(0, 150) + "...\n");

    messages.push({ role: 'assistant', content: text1 });
    messages.push({ role: 'user', content: 'Who leads it?' });

    console.log("Sending Msg 2: ", messages[messages.length - 1].content);
    let res2 = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sessionId: 'test-session-123', spoilerMode: 'S1' })
    });

    const text2 = await res2.text();
    console.log("Response 2:\n", text2);
}

testChat().catch(console.error);
