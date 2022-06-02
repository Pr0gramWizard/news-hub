# NewsHub Browser Extension

The browser extension allows the user to login in and auto-collect the tweets while they scroll through Twitter.

#### Forked from [this repository](https://github.com/lxieyang/chrome-extension-boilerplate-react)

## Installing and Running

## Setup

Create a new `.env` file and add the following lines:

```
API_URL="http://localhost:3000/api"
```  

Be sure to change the value if you are using a remote endpoint or other port.

### Local development

You can start the browser extension using webpack.  
For that make sure that you have `node` installed (any version `> 14.x`).

Install dependencies:

```bash
$ yarn install
```

Build once:

```bash
$ yarn run build
```

Build and recompile on changes:

```bash
$ yarn run build:watch
```

## Add extension to Chrome

In your Chrome browser navigate to `chrome://extensions/`.  
Somewhere on the page there should be a `Developer mode` toggle.  
If not already enabled, enable it.
You should find a `Load unpacked` button then where you can select a path.  
Navigate to the `build` folder of the browser extension code folder.  
When the extension is rebuilt you still have to reload the extension on the "Manage extensions" page.

## Login and usage

When clicking on the Popup of the browser extension you should be greeted with a login panel the first time.  
There you can log in with your credentials.  
Unfortunately, there is no possibility to register a new account over the browser extension yet.  
For that, you have to use the Dashboard.  
Once you are logged in you can just enable the extension and scroll through your Twitter timeline.  
Each tweet that is collected the Twitter handle of collected tweet is marked golden.    
