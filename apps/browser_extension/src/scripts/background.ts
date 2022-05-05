const apiUrl = 'https://api.mortaga.de';
const supportedWebsites = ['twitter.com'];

console.log('Background script loaded');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);
});
