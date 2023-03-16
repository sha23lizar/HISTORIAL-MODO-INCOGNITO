var incopnitoHist,
 incopnitoLocal = JSON.parse(localStorage.incopnitoLocal || '[]'),
 tabs = JSON.parse(localStorage.tabs || '{}'),
 incHist = JSON.parse(localStorage.incHist || '[]'),
 incRecent = JSON.parse(localStorage.incRecent || '[]');
var contador = 1;
if (chrome.extension.inIncognitoContext){
	chrome.storage.sync.get(["data"], (respuesta) => {
		incopnitoHist = JSON.parse(respuesta.data || "[]") ;
	})
}else{
	chrome.storage.sync.get(["data"], (respuesta) => {
		data = JSON.parse(respuesta.data || "[]") ;
		data.forEach(item => {
			incopnitoLocal.push(item) 
		});
		chrome.storage.sync.set({ data:"[]" })
		localStorage.setItem('incopnitoLocal', JSON.stringify(incopnitoLocal));
	})
}

chrome.runtime.onSuspend.addListener(function(){
	localStorage.setItem('incopnitoLocal', JSON.stringify(incopnitoLocal));
	localStorage.setItem('tabs', JSON.stringify(tabs));
	localStorage.setItem('incHist', JSON.stringify(incHist));
	localStorage.setItem('incRecent', JSON.stringify(incRecent));	
});

chrome.tabs.onUpdated.addListener(function(tabId, chg, tab){
	if ( ['chrome://newtab/', 'about:blank'].includes(tab.url) ) {
		return;
	}
	if (chrome.extension.inIncognitoContext){
	var t, oldU, n;
	if (t=tabs[tabId]) {
		oldU=t.url;
		n=t.n;
	}

	if ( (chg.status=='loading') || !t) {
		t=tabs[tabId]={id:tabId, url:tab.url, title:tab.title, timestamp: Date()};
		if (tab.favIconUrl) {
			t.favIcon=tab.favIconUrl;
		}
		if (oldU != t.url) {
			t.n=incopnitoHist.length;
			incopnitoHist.push(t);
		}
		else if (n !== undefined) {
			// re-linking
			t.n=n;
			incopnitoHist[n]=t;
		}
	}
	else if ( (chg.status=='complete') || chg.title || chg.favIconUrl) {
		t.title=tab.title;
		if (tab.favIconUrl) {
			t.favIcon=tab.favIconUrl;
		}
		chrome.storage.sync.set({ data:JSON.stringify(incopnitoHist) })
	}
	return
	}
	
	var t, oldU, n;
	if (t=tabs[tabId]) {
		oldU=t.url;
		n=t.n;
	}

	if ( (chg.status=='loading') || !t) {
		t=tabs[tabId]={id:tabId, url:tab.url, title:tab.title, timestamp: Date()};
		if (tab.favIconUrl) {
			t.favIcon=tab.favIconUrl;
		}
		if (oldU != t.url) {
			t.n=incHist.length;
			incHist.push(t);
		}
		else if (n !== undefined) {
			// re-linking
			t.n=n;
			incHist[n]=t;
		}
	}
	else if ( (chg.status=='complete') || chg.title || chg.favIconUrl) {
		t.title=tab.title;
		if (tab.favIconUrl) {
			t.favIcon=tab.favIconUrl;
		}
	}
});

chrome.tabs.onReplaced.addListener(function(newId, oldId){
	console.info('replace tab', newId, oldId);
	if (tabs[oldId]) {
		tabs[newId]=tabs[oldId];
		tabs[newId].id=newId;
	}
});

chrome.tabs.onRemoved.addListener(function (tab) {
	if (tabs[tab]) {
		incRecent.push(tabs[tab]);
	}
});

