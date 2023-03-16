var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-77917281-1']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
	var targetId = e.target.id || e.currentTarget.id || 'button';
	_gaq.push(['_trackEvent', targetId, 'clicked']);
}

function trackLinkClick(e) {
	_gaq.push(['_trackEvent', e.target.className, 'clicked']);
}

function trackViewImpression(name) {
	_gaq.push(['_trackEvent', name, 'viewed']);
}

document.addEventListener('DOMContentLoaded', toggle);

function toggle() {
	chrome.storage.sync.get(["modo"], (respuesta) => {
		var modo = respuesta.modo || "Descargar"
		if (modo == "Descargar") {
			mostrarDatos()
		} else {
			init()
		}
	})
}

function mostrarMensage(mensage, url) {
	if (url) {
		document.body.innerHTML = `<a href="#"><h1 class="Faill">${mensage}</h1></a>`
		document.querySelector("h1").addEventListener("click", () => {
			chrome.tabs.create({
				url
			})
		})
	} else {
		document.body.innerHTML = `<h1 class="Faill">${mensage}</h1>`
	}
}

async function mostrarDatos() {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, ([e]) => {
		var URLactual = e.url
		if (URLactual.includes("https://www.youtube.com/watch")) {
			var url = URLactual.replace(".com/watch", "pp.com/watch")
			mostrarMensage("Ir a descargar", url)
		} else {
			mostrarMensage("Esto No es un Video de youtube")

		}
	})
}

function init() {
	var buscador = document.querySelector(".buscador")
	var tabContent = document.getElementById('tabs-content'),
		recordList0 = document.getElementById('record-list-0'),
		recordList1 = document.getElementById('record-list-1'),
		deleteBtn = document.getElementById('delete-btn'),
		bg = chrome.extension.getBackgroundPage();


	// menu de OPCIONES
	const contenedorOpciones = document.querySelector("#contenedor-opciones");
	const menuOpciones = document.querySelector("#btn-opcions");
	// desplegar menu
	menuOpciones.addEventListener("click", () => {
		contenedorOpciones.classList.toggle("mostrar")
	})
	// OPCIONES
	const inputsDias = document.querySelectorAll(".input-dia")
	const fechaDesde = document.querySelector(".fecha-desde")
	const fechaHasta = document.querySelector(".fecha-hasta")
	const horaDesde = document.querySelector(".hora-desde")
	const horaHasta = document.querySelector(".hora-hasta")
	const ultimaSemana = document.querySelector(".ultima-semana")
	var opciones = {
		ultimaSemana: true,
		dias: [],
		fechaHasta: "",
		fechaDesde: "",
		horaHasta: "",
		horaDesde: "",
	};
	var valorBusqueda = "";
	inputsDias.forEach((item => {
		item.addEventListener("change", (e) => {
			var dia = e.srcElement.name
			if (e.srcElement.checked) {
				var index = opciones.dias.indexOf(dia)
				opciones.dias.splice(index, 1)

			} else {
				opciones.dias.push(dia)
			}
			renderizar()

		})

	}))
	ultimaSemana.addEventListener("change", (e) => {
		if (e.srcElement.checked) {
			opciones.ultimaSemana = true
		} else {
			opciones.ultimaSemana = false
		}
		renderizar()

	})
	fechaDesde.addEventListener("change", (e) => {
		var [ano, mes, dia] = e.srcElement.value.split("-");
		if ((dia && mes) && ano.length == 4) {
			var date = new Date(ano, mes -1, dia)
			opciones.fechaDesde = date
			if (opciones.fechaDesde && opciones.fechaHasta) renderizar()
		}
	})
	fechaHasta.addEventListener("change", (e) => {
		var [ano, mes, dia] = e.srcElement.value.split("-")
		if ((dia && mes) && ano.length == 4) {
			var date = new Date(ano, mes -1, dia)
			opciones.fechaHasta = date
			if (opciones.fechaDesde && opciones.fechaHasta) renderizar()
		}
	})
	horaDesde.addEventListener("change", (e) => {
		var [hora, minuto] = e.srcElement.value.split(":")
		if (hora.length >= 1 && minuto.length >= 00) {
			var time = new Number(hora + minuto)
			opciones.horaDesde = time
			if (opciones.horaDesde && opciones.horaHasta) renderizar()
		}
	})
	horaHasta.addEventListener("change", (e) => {
		var [hora, minuto] = e.srcElement.value.split(":")
		if (hora.length >= 1 && minuto.length >= 00) {
			var time = new Number(hora + minuto)
			opciones.horaHasta = time
			if (opciones.horaDesde && opciones.horaHasta) renderizar()
		}
	})

	// funcion para filtrar utilizando las opciones
	function filtrar(array) {
		var arrayfinal = [];
		for (let index = 0; index < array.length; index++) {
			var item = array[index]
			var time = new Date(item.timestamp)
			if (opciones.ultimaSemana) {
				var timeTotalUltimaSemana = 7 * 24 * 60 * 60 * 100;
				var timeFinal = new Date().setTime(new Date - 204800000)
				if (!time.getTime() > timeFinal) {
					continue
				}

			}

			if (opciones.dias.length) {
				const DIAS = [
					"Lu",
					"Ma",
					"Mi",
					"Ju",
					"Vi",
					"Sa",
					"Do"
				];
				var dia = DIAS[time.getDay()];
				if (opciones.dias.indexOf(dia) !== -1) {
					continue
				}

			}
			if (opciones.horaDesde && opciones.horaHasta) {
				var timeHora = (time.getHours() * 100) + time.getMinutes()
				if (opciones.horaDesde > timeHora || opciones.horaHasta < timeHora) {
					continue
				}
			}
			if (opciones.fechaDesde && opciones.fechaHasta) {
				// es una locuraaaaa
				var tiempoNormal = time.getTime()
				var fechaDesde = opciones.fechaDesde.getTime()
				var desde = fechaDesde < time.getTime()
				var fechaHsta = opciones.fechaHasta.getTime()
				var hasta = time.getTime() < fechaHsta
				debugger
				if (!hasta || !desde) {
					continue
				}
			}
			arrayfinal.push(item)
		}
		return arrayfinal
	}


	// render()
	function renderizar() {
		loader = document.querySelector(".container-loader")
		// no silve
		//loader.classList.add("active")

		console.clear()
		showRecord(filtrar(incopnito), 'record-list-0', valorBusqueda);
		showRecord(filtrar(allHistory), 'record-list-1', valorBusqueda);
		// No silve
		//loader.classList.remove("active")
		if (document.querySelector("#record-list-0 li")) {
			document.getElementById('tab-response-content').style.display = 'none';
			document.getElementById('response-text').innerHTML = '';
		}
	}
	// wake up bg page
	if (!bg) {
		chrome.runtime.getBackgroundPage(init);
		return;
	}

	if (true) {
		tabContent.style.display = 'block';
		recordList0.style.display = 'block';
		recordList1.style.display = 'none';
		deleteBtn.style.display = 'block';
		if (!chrome.extension.inIncognitoContext) {
			incopnito = bg.incopnitoLocal
		} else {
			incopnito = bg.incopnitoHist
		}
		var allHistory = bg.incHist;

		if (false) {
			notNullResponse();
		} else {
			nullResponse('No records found!');
		}
		renderizar()

		var targetTabList = document.getElementById('tabs-content').getElementsByTagName('span');

		for (var i = 0; i < targetTabList.length; i++) {
			targetTabList[i].addEventListener('click', function (event) {

				var tabIndex = this.getAttribute('data-tab-index');
				document.getElementById('tab-bottom-slider').style.left = 50 * tabIndex + '%';

				var tabsList = document.getElementsByClassName('tab-record-list'),
					tabsListLength = tabsList.length - 1;

				for (var i = 0; i <= tabsListLength; i++) {
					tabsList[i].style.display = 'none';
				}

				var currentTabList = document.getElementById('record-list-' + tabIndex);
				if (currentTabList.getElementsByTagName('li').length == 0) {
					nullResponse('No records found!');
				} else {
					notNullResponse();
					currentTabList.style.display = 'block';
					currentTabList.scrollTop = 0;
				}

				trackButtonClick(event);

			});
		}

		var recentLinkList = document.getElementsByClassName('recent-target-link');

		for (var i = 0; i < recentLinkList.length; i++) {
			recentLinkList[i].addEventListener('click', function (event) {
				var _this = this;

				trackLinkClick(event);
				setTimeout(function () {
					chrome.tabs.create({
						'url': _this.getAttribute('href')
					});
				}, 50);
			});
		}

		var historyLinkList = document.getElementsByClassName('history-target-link');

		for (var i = 0; i < historyLinkList.length; i++) {
			historyLinkList[i].addEventListener('click', function (event) {
				var _this = this;

				trackLinkClick(event);
				setTimeout(function () {
					chrome.tabs.create({
						'url': _this.getAttribute('href')
					});
				}, 50);
			});
		}

		trackViewImpression('popup');
	} else {
		tabContent.style.display = 'none';
		recordList0.style.display = 'none';
		recordList1.style.display = 'none';
		deleteBtn.style.display = 'none';

		chrome.extension.isAllowedIncognitoAccess(function (response) {
			if (!response) {
				var message = '';

				message += 'This extension is for incognito mode only.';
				message += '<div class="instructions-container">';
				message += '<p class="instructions-title">To allow the extension to work in incognito:</p>'
				message += '<ol class="instructions-list">';
				message += '<li>Open <b>chrome://extensions/</b> window</li>';
				message += '<li>Find <b>Off The Record History</b> extension';
				message += '<li>Click on <b>Details</b> button</li>';
				message += '<li>Find and select <b>Allow in incognito</b> switch</li>';
				message += '</ol>';
				message += '</div>';

				nullResponse(message);
				trackViewImpression('incognito-message-with-instructions');
			} else {
				nullResponse('This extension is for incognito mode only.');
				trackViewImpression('incognito-message');
			}
		});
	}

	// ahora es el buscador activar
	document.getElementById('delete-btn').addEventListener('click', function (event) {
		buscador.classList.toggle("buscador-activo")
		//bg.incRecent = [];
		//bg.incHist = [];
		//bg.tabs = {};
		//
		//recordList0.innerHTML = '';
		//recordList1.innerHTML = '';
		//nullResponse('All records were destroyed!');
		//
		//trackButtonClick(event);
	});
	buscador.addEventListener("keyup", (e) => {
		valorBusqueda = e.srcElement.value;
		renderizar()
	})

	function nullResponse(message) {
		document.getElementById('response-text').innerHTML = message;
	}

	function notNullResponse() {
		document.getElementById('tab-response-content').style.display = 'none';
		document.getElementById('response-text').innerHTML = '';
	}

}

function showRecord(result, list, buscador) {
	var i,
		ul = document.getElementById(list),
		record = result,
		recordLength = record.length - 1,
		ulType = parseInt(list.charAt(list.length - 1));
	console.log(ulType)
	ul.innerHTML = ""
	for (i = recordLength; i >= 0; i--) {

		var {
			url,
			timestamp,
			title,
			favIcon
		} = record[i]
		var li = "";
		var favIconUrl = favIcon;
		if (buscador) {
			if (url.includes(buscador) || title.includes(buscador)) {
				var span = `<span class="span-buscador">${buscador}</span>`
				url = url.replaceAll(buscador, span)
				title = title.replaceAll(buscador, span)

			} else {
				continue
			}
		}
		if (favIcon != undefined) {
			favIconUrl = favIcon;
		} else {
			favIconUrl = 'file-icon.svg';
		}

		var time = new Date(timestamp);
		var hour = time.getHours();
		var minutes = time.getMinutes();
		var mes = time.getMonth() + 1;
		var dia = time.getDate();
		var ano = time.getFullYear();
		var horaMinutos;
		if (minutes > 9) {
			horaMinutos = hour + ":" + minutes
		} else {
			horaMinutos = hour + ":0" + minutes
		}
		const DIAS = [
			"Lu",
			"Ma",
			"Mi",
			"Ju",
			"Vi",
			"Sa",
			"Do"
		];
		var fechaDia = DIAS[time.getDay()];
		var li = ""
		li += ` <li>`
		li += `<img src="${favIconUrl}">`
		li += `<a href=${record[i].url} title="${record[i].title}" class="history-target-link">`
		li += `<span class="item-titulo">${title}</span>`
		li += `<span class="item-url">${url}</span>`
		li += `</a>`
		li += `<span class="contenedor-fecha-hora">${fechaDia+" "+horaMinutos}<div>${dia}\\${mes}\\${ano}</div></span>`
		li += `</li> `
		ul.innerHTML += li
	}
}