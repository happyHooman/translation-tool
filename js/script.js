let translations = {};
let indentation = false;
let keysColumn, translationsColumn;


$(document).ready(function () {
	bsCustomFileInput.init();
	$("#fileUploader").change(function (evt) {
		const selectedFile = evt.target.files[0];
		const reader = new FileReader();
		reader.onload = function (event) {
			const data = event.target.result;
			const workbook = XLSX.read(data, {
				type: 'binary'
			});
			workbook.SheetNames.forEach(function (sheetName) {
				const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				addColumnOptions(Object.keys(XL_row_object[0]));
				keysColumn = translationsColumn = Object.keys(XL_row_object[0])[0];

				document.getElementById('keys_column').disabled = false;
				document.getElementById('translations_column').disabled = false;

				const button = document.getElementById('generateJS');
				button.disabled = false;
				button.addEventListener('click', () => {
					workbook_to_object(XL_row_object)
				})
			})
		};

		reader.onerror = function (event) {
			document.getElementById('generateJS').disabled = true;
			document.getElementById('keys_column').disabled = false;
			document.getElementById('translations_column').disabled = false;
			console.error("File could not be read! Code " + event.target.error.code);
			document.getElementById("jsonObject").innerHTML = "File could not be read! Code " + event.target.error.code;
		};

		reader.readAsBinaryString(selectedFile);
	});
});

function workbook_to_object(doc) {
	doc.forEach(line => {
		const keyChain = line[keysColumn].split('.');
		const val = line[translationsColumn];
		let o = translations;
		keyChain.forEach(key => {
			key = key.replace(/\s/g, '');
			if (key.length === 0) {
				return
			}
			if (key === keyChain[keyChain.length - 1]) {
				o[key] = val;
			} else {
				if (!o[key]) {
					o[key] = {};
				}
				o = o[key];
			}
		});
	});

	translations = sortKeys(translations);
	document.getElementById("jsonObject").innerHTML = objToHTML(translations);
}


function sortObjectKeys(obj) {
	return Object.keys(obj).sort().reduce((acc, key) => {
		acc[key] = obj[key];
		return acc
	}, {});
}

function sortKeys(obj) {
	if (typeof obj == 'object') {
		obj = sortObjectKeys(obj);
		for (let [key, val] of Object.entries(obj)) {
			if (typeof val == 'object') {
				obj[key] = sortKeys(val)
			}
		}
	}
	return obj
}

function objToHTML(obj, sp = 0) {
	let string = '';
	if (typeof obj == 'string') {
		return indentation ? `<span class='object_value'>"${obj}"</span>` : `"${obj}"`
	} else if (typeof obj == 'number') {
		return obj
	} else if (typeof obj == 'object') {
		string += indentation ? `{<br>${'&emsp;'.repeat(sp)}` : '{';
		let keys = Object.keys(obj);
		for (let [key, val] of Object.entries(obj)) {
			string += indentation ? `<span class='object_key'>${key}</span>: ` : key + ': ';
			keys.shift();
			string += objToHTML(val, sp + 1);
			const last = keys.length === 0;
			string += indentation ? `${last ? '' : ','}<br>${'&emsp;'.repeat(sp)}` : `${last ? '' : ', '}`;
		}
		string += '}';
	}
	return string;
}

function htmlOptions(keys) {
	let html = '';
	keys.forEach(k => {
		html += `<option value="${k}">${k}</option>`
	});
	return html
}

function addColumnOptions(keys) {
	const options = htmlOptions(keys);
	document.getElementById('keys_column').innerHTML += options;
	document.getElementById('translations_column').innerHTML += options;
}

function updateChoice(el) {
	if (el.id === 'keys_column') {
		keysColumn = el.value;
	} else if (el.id === 'translations_column') {
		translationsColumn = el.value;
	}
	document.getElementById('generateJS').disabled = !(keysColumn && translationsColumn);
}