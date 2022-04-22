document.body.appendChild(
	Object.assign(document.createElement('style'), {
		textContent: '.active { background-color: red; }',
	})
);

async function storeLink(url: string, token: string) {
	const apiUrl = 'https://api.mortaga.de';
	console.log(`Storing tweet: '${url}' for user: '${token}'`);
	const response = await fetch(`${apiUrl}/api/tweet`, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			url,
			token,
		}),
	});
	if (response.status !== 201) {
		const error = await response.json();
		console.log(error);
	}
}

// Check if tweet is a promotion
function isTweetPromoted(article: HTMLElement) {
	const articleSpans: NodeListOf<HTMLSpanElement> = article.querySelectorAll('span');
	return [...articleSpans].filter((x) => x.textContent && x.textContent.includes('Promoted')).length > 0;
}

function stringOnlyContainsDigits(string: string) {
	return /^\d+$/.test(string);
}

// Check if tweet scrolls into view
const io = new IntersectionObserver(async (entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			const article = entry.target;
			article.classList.add('active');
			const url = article.getAttribute('data-status-id');
			if (!url) {
				console.log(`No data-status-id attribute found for article: ${article}`);
				continue;
			}
			const { token } = await chrome.storage.sync.get('token');
			await storeLink(url, token);
		} else {
			entry.target.classList.remove('active');
		}
	}
});

// Observe all loaded tweets
const nodeListOfLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('article a');
const listOfTwitterStatusLinks = [...nodeListOfLinks].filter((x) => x.href.includes('/status'));
listOfTwitterStatusLinks.forEach((el) => {
	const parentArticle = el.closest('article');
	if (!parentArticle) {
		console.log(`No parent article found for link: ${el}`);
		return;
	}
	parentArticle.setAttribute('data-status-id', el.href);
	io.observe(parentArticle);
});

// Observe new tweets added to the DOM
// @ts-ignore
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

const observer = new MutationObserver(function (mutations, observer) {
	for (const mutation of mutations) {
		for (const node of mutation.addedNodes) {
			if (node instanceof HTMLElement) {
				const article = node.querySelector('article');
				if (article) {
					if (isTweetPromoted(article)) {
						console.log('Skipping promoted article');
						console.log(article.innerText);
						return;
					}
					const linkNodes = article.querySelectorAll('a');
					const links = [...linkNodes].map((x) => x.href);
					const onlyStatusLinks = links.filter((x) => x.includes('/status'));
					const statusId = onlyStatusLinks[0];
					if (statusId.length <= 0) {
						console.log('Something went wrong. Skipping article.');
						console.log(links, onlyStatusLinks);
						console.log(`Status ID: '${statusId}' is not a number`);
						// console.log(article.innerText);
						return;
					}
					article.setAttribute('data-status-id', statusId);
					io.observe(article);
				}
			}
		}
	}
});

observer.observe(document, {
	subtree: true,
	childList: true,
});
