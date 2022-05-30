console.log('Twitter content script loaded');

// Check if tweet is a promotion
function isTweetPromoted(article: HTMLElement) {
	const articleSpans: NodeListOf<HTMLSpanElement> = article.querySelectorAll('span');
	return [...articleSpans].filter((x) => x.textContent && x.textContent.includes('Promoted')).length > 0;
}

function observeTwitterDOM() {
	// Check if tweet scrolls into view
	const io = new IntersectionObserver(
		async (entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {

					const article = entry.target;
					const tweetUsername = Array.from(article.querySelectorAll('span')).find(
						(x) => x.textContent && x.textContent.includes('@')
					);
					if (tweetUsername) {
						tweetUsername.style.color = 'gold';
					}
					const statusUrl = article.getAttribute('data-status-id');
					chrome.runtime.sendMessage({ type: 'tweet-in-view', statusUrl });
				}
			}
		},
		{
			// Trigger when 50% of the element is in view
			threshold: 0.5,
		}
	);

	// Observe new tweets added to the DOM
	// @ts-ignore
	const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	const observer = new MutationObserver(function(mutations) {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node instanceof HTMLElement) {
					const tweet = node.querySelector('[data-testid=tweet]');
					if (tweet && tweet instanceof HTMLElement) {
						if (isTweetPromoted(tweet)) {
							console.log('Skipping promoted article', tweet.innerText);
							continue;
						}

						const linksInArticle = tweet.querySelectorAll('a');
						const links = [...linksInArticle].map((x) => x.href);
						const onlyStatusLinks = links.filter((x) => x.includes('/status'));
						if (onlyStatusLinks.length > 0) {
							const url = onlyStatusLinks[0];
							tweet.setAttribute('data-status-id', url);
							io.observe(tweet);
						}
					}
				}
			}
		}
	});

	(window as any).twitterContentObserver = observer;
	(window as any).twitterIntersectionObserver = io;

	const config = {
		attributes: false,
		childList: true,
		subtree: true,
	};
	observer.observe(document, config);
}

// Toggle content observer on/off
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local') {
		if (changes.hasOwnProperty('collection_script_enabled')) {
			if (changes.collection_script_enabled.newValue === true) {
				observeTwitterDOM();
			} else {
				(window as any).twitterContentObserver.disconnect();
				(window as any).twitterIntersectionObserver.disconnect();
			}
		}
	}
});

chrome.storage.local.get('collection_script_enabled', (result) => {
	console.log(result);
	if (result.collection_script_enabled === true) {
		observeTwitterDOM();
	}
});
