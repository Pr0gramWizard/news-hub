const apiUrl = 'https://api.mortaga.de';
const supportedWebsites = ['twitter.com'];

chrome.action.onClicked.addListener(async (tab) => {
	const tabUrl = tab.url;
	if (!tabUrl) {
		console.warn('No tab url found');
		return;
	}
	const url = new URL(tabUrl);
	if (!supportedWebsites.includes(url.hostname)) {
		console.warn(`Links from '${url.hostname}' are not supported yet`);
		return;
	}

	const { token } = await chrome.storage.sync.get(['token']);
	console.log(`User token: '${token}'`);
	if (!token) {
		const { token } = await getUserToken();
		await chrome.storage.sync.set({ token });
	}
	const tabId = tab.id;
	if (!tabId) {
		console.warn('No tab id found');
		return;
	}
	await chrome.scripting.executeScript({
		target: { tabId },
		files: ['twitter.ts'],
	});
});

async function getUserToken() {
	const response = await fetch(`${apiUrl}/api/user`, {
		method: 'post',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
	});
	return response.json();
}
