$(document).ready(function(){
	$("#fileUploader").change(function(evt){
		const selectedFile = evt.target.files[0];
		const reader = new FileReader();
		reader.onload = function(event) {
			const data = event.target.result;
			const workbook = XLSX.read(data, {
				type: 'binary'
			});
			workbook.SheetNames.forEach(function(sheetName) {

				var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				var json_object = JSON.stringify(XL_row_object);
				document.getElementById("jsonObject").innerHTML = json_object;

			})
		};

		reader.onerror = function(event) {
			console.error("File could not be read! Code " + event.target.error.code);
		};

		reader.readAsBinaryString(selectedFile);
	});
});

function workbook_to_object(line) {
	console.log(line);
}