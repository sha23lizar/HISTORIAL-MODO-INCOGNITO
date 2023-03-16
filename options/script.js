document.addEventListener('DOMContentLoaded', ()=>{
	var selector = document.querySelector("select");
	chrome.storage.sync.get(["modo"], (respuesta) => {
		if(respuesta.modo) selector.value = respuesta.modo
	})
	selector.addEventListener("change",()=>{
		chrome.storage.sync.set({modo:selector.value})
	})
});