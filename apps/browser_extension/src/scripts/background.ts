import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

console.log('Background script loaded');

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	sendResponse({
		message: 'Message received',
	});
	const { statusUrl } = request;
	chrome.storage.local.get(TOKEN_STORAGE_KEY, async (result) => {
		const token = result[TOKEN_STORAGE_KEY];
		if (token) {
			console.log(`Storing tweet ${statusUrl}`);
			await fetch(`${process.env.API_URL}/tweet`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					url: statusUrl,
				}),
			});
		}
	});
});
