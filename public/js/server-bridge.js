function ajaxFetch(form_data){
	return $.ajax({
		method: "POST",
		data: form_data,
		url: 'https://src.purewebber.com/src/scripts/wikimaps.php',
		dataType: 'text'
	});
}


function databaseRequest(user_input){
	var form_data = [];
	form_data.push({name: 'user_input', value: user_input});
	form_data.push({name: 'server_class', value: 'fetchT0Data'});

	ajaxFetch(form_data).done(function (data) {			// Call the Ajax function and wait for it to finish

		/* Get the data from the request */
		var matched_page_id = data.target_page_id;
		var matched_page_title = data.target_page_title;
		var json_response = data.results;

		/* Show the raw JSON results to the user */
		$('#results_text').val(json_response);					// Display results in the HTML textarea container
		$('#matched_page_id').html(matched_page_id);
		$('#matched_page_title').html(matched_page_title);


		var test = JSON.parse(json_response);

		console.log(test);


		const Graph = ForceGraph3D()
		(document.getElementById('3d-graph'))
			.graphData(test)
			.nameField('id')
			.autoColorBy('group');
	});
}

$(function() {

	$("form").submit( function (e) {
		e.preventDefault();											// Prevent POST data from displaying in the URL
		var user_input = $('#user_input').val();
		databaseRequest(user_input);
	});
});
