"use strict";

/** Extracts fenced ```lang code blocks from a markdown string, in document order. */
const extractMarkdownCodeBlocks = (markdown) => {
	const blocks = [];
	const regex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
	let match = regex.exec(markdown);
	while (match) {
		blocks.push({ lang: match[1], code: match[2] });
		match = regex.exec(markdown);
	}
	return blocks;
};

const decodeHtmlEntities = (text) =>
	text
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

/** Extracts <pre class="code-block"><code>...</code></pre> blocks from an HTML string, HTML-entity-decoded, in document order. */
const extractHtmlCodeBlocks = (html) => {
	const blocks = [];
	const regex =
		/<pre[^>]*class="code-block"[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
	let match = regex.exec(html);
	while (match) {
		blocks.push(decodeHtmlEntities(match[1]));
		match = regex.exec(html);
	}
	return blocks;
};

module.exports = { extractMarkdownCodeBlocks, extractHtmlCodeBlocks };
