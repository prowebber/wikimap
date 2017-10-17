function ajaxFetch(form_data){
	return $.ajax({
		method: "POST",
		data: form_data,
		url: 'https://src.purewebber.com/src/scripts/wikimaps.php',
		dataType: 'text'
	});
}


function databaseRequest(t0_page_id){
	var form_data = [];
	form_data.push({name: 't0_page_id', value: t0_page_id});
	form_data.push({name: 'server_class', value: 'fetchT0Data'});

	ajaxFetch(form_data).done(function (data) {			// Call the Ajax function and wait for it to finish
		$('#results').html(data);
	});
}

$(function() {

	$("form").submit( function (e) {
		e.preventDefault();											// Prevent POST data from displaying in the URL
		var t0_page_id = $('#t0_id').val();
		databaseRequest(t0_page_id);
	});
});