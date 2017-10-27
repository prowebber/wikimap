function ajaxFetch(form_data){
	return $.ajax({
		method: "POST",
		data: form_data,
		url: '/wikimap/src/scripts/wikilinks.php',
		dataType: 'text'
	});
}


function databaseRequest(user_input){
	var form_data = [];
	form_data.push({name: 'user_input', value: user_input});
	//form_data.push({name: 'server_class', value: 'fetchT0Data'});
	form_data.push({name: 'server_class', value: 'fetchMultiData'});

	ajaxFetch(form_data).done(function (data) {			// Call the Ajax function and wait for it to finish
		//console.log('Data:\n' + data);

		var parsed_data = JSON.parse(data);

		/* Get the data from the request */
		var matched_page_id = parsed_data.target_page_id;
		var matched_page_title = parsed_data.target_page_title;
		var json_response = parsed_data.results;
		var execution_time = parsed_data.execution_time;

		/* Show the raw JSON results to the user */
		$('#results_text').val( JSON.stringify(json_response) );					// Display results in the HTML textarea container
		$('#matched_page_id').html(matched_page_id);
		$('#matched_page_title').html(matched_page_title);
		console.log('Execution Times:\n' + execution_time);


		//var test = JSON.parse(json_response);

		//console.log(json_response);


		const Graph = ForceGraph3D()
		(document.getElementById('3d-graph'))
			.graphData(json_response)
			.nameField('id');
			// .autoColorBy('group');
	});
}

$(function() {

	$("form").submit( function (e) {
		console.log('submitted');
		e.preventDefault();											// Prevent POST data from displaying in the URL
		var user_input = $('#user_input').val();
		databaseRequest(user_input);
	});
});
