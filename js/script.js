let translations = {};

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
			if (key === keyChain[keyChain.length-1]){
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
	document.getElementById("jsonObject").innerHTML = JSON.stringify(translations, null, 4);
}

const sortObjectKeys = obj => Object.keys(obj)
		.sort()
		.reduce((acc, key) => {
			acc[key] = obj[key];
			return acc
		}, {});