---
title: The Simple Rules I Use to Make AI Consistent
publishDate: 'Nov 24 2025'
isPublished: true
key: tip-1
---

I’ve used AI heavily across engineering work this past year. One thing became obvious fast, the gap between a loose prompt and a structured one is massive. Sometimes the output improves threefold just because the prompt stops wandering.

After a while I realized that every prompt that worked had the same habits. It set the frame in one clean sentence, it aimed at one job, it added just enough constraints to wipe out errors, it told the model exactly what the final answer should look like, and it gave a clear way to judge if the result was actually correct. I kept seeing that pattern, then I started using it intentionally, then it became the default way I write prompts.

Here’s a real example of how I apply it:

“Write a TypeScript utility to merge two deeply nested objects, keep the final code under 40 lines, avoid external libraries, return only a code block and include a one line comment at the top explaining the approach. I’ll consider it correct if the merge works recursively and source keys never override destination keys.”

Before I worked this way, I’d get inconsistent code or five paragraphs of philosophy. With this structure, the model hits the mark on the first try far more often. I rewrite less. Results stay consistent across different AI models. Token usage drops because the prompt isn’t padded with noise.

It turns out AI isn’t guesswork, it behaves when you give it structure.
