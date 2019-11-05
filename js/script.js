let translations = {};
let indentation = false;

$(document).ready(function () {
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
				workbook_to_object(XL_row_object);
				addColumnOptions(Object.keys(XL_row_object[0]));
			})
		};

		reader.onerror = function (event) {
			console.error("File could not be read! Code " + event.target.error.code);
		};

		reader.readAsBinaryString(selectedFile);
	});
});

function workbook_to_object(doc) {
	doc.forEach(line => {
		const keyChain = line['Dev Terminology'].split('.');
		const val = line['NL'];
		let o = translations;
		keyChain.forEach(key => {
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
		return indentation ? `<span style="color: green">"${obj}"</span>` : `"${obj}"`
	} else if (typeof obj == 'number') {
		return obj
	} else if (typeof obj == 'object') {
		string += indentation ? `{<br>${'&emsp;'.repeat(sp)}` : '{';
		let keys = Object.keys(obj);
		for (let [key, val] of Object.entries(obj)) {
			string += indentation ? `<span style="color: blue">${key}</span>: ` : key + ': ';
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
	for (let k in keys) {
		html += `<option value="${k}">${k}</option>`
	}
	return html
}

function addColumnOptions(keys) {
	const options = htmlOptions(keys);
	console.log(options);
	document.getElementById('keys_column').innerHTML = options;
	document.getElementById('translations_column').innerHTML = options;
}