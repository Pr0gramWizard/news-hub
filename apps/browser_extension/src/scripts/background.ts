import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

console.log('Background script loaded');

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	console.log(request);
	sendResponse({
		message: 'Message received',
	});
	const { statusUrl } = request;
	const { token } = await chrome.storage.local.get([TOKEN_STORAGE_KEY]);
	console.log(token);

	// await fetch(`status`, {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify({
	// 		statusUrl: statusUrl
	// 	})
	// });
});
