console.log('Background script loaded');

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	console.log(request);
	sendResponse({
		message: 'Message received',
	});
	const { statusUrl} = request;
	await fetch(`status`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			statusUrl: statusUrl
		})
	});
});
