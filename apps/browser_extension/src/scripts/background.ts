import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

console.log('Background script loaded');

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	sendResponse({
		message: 'Message received',
	});
	const { statusUrl } = request;
	chrome.storage.local.get(TOKEN_STORAGE_KEY, async (result) => {
		const data = result[TOKEN_STORAGE_KEY];
		if (data.token) {
			console.log(`Storing tweet ${statusUrl}`);
			try {
				const response = await fetch(`${process.env.API_URL}/tweet`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${data.token}`,
					},
					body: JSON.stringify({
						url: statusUrl,
					}),
				});

				if (response.status === 401) {
					console.log('Token expired');
					await chrome.storage.local.remove(TOKEN_STORAGE_KEY);
				}
			} catch (e) {
				console.log(e);
			}
		}
	});
});
