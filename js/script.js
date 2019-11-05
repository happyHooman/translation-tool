let translations = {};
let singleLine = false;

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
	console.log(translations);

	translations = sortObjectKeys(translations);
	document.getElementById("jsonObject").innerHTML = objToHTML(translations);
}


function sortObjectKeys(obj) {
	return Object.keys(obj).sort().reduce((acc, key) => {
		acc[key] = obj[key];
		return acc
	}, {});
}

function sortKeys() {

}

function objToHTML(obj, sp = 0) {
	let string = '';
	if (typeof obj == 'string') {
		return `"${obj}"`
	} else if (typeof obj == 'object') {
		string += singleLine ? `{<br>${'&emsp;'.repeat(sp)}` : '{';
		let keys = Object.keys(obj);
		for (let [key, val] of Object.entries(obj)) {
			string += key + ': ';
			keys.shift();
			string += objToHTML(val, sp + 1);
			const last = keys.length === 0;
			string += singleLine ? `${last ? '' : ','}<br>${'&emsp;'.repeat(sp)}` : '}';
		}
		string += '}';
	}
	return string;
}

