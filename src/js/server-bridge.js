function ajaxFetch(form_data){
	return $.ajax({
		method: "POST",
		data: form_data,
		url: '/wikimap/src/scripts/wikilinks.php',
		dataType: 'text'
	});
}
var max_shared_links;
var min_shared_links;
function databaseRequest(user_input){
	var form_data = [];
	form_data.push({name: 'user_input', value: user_input});
	//form_data.push({name: 'server_class', value: 'fetchT0Data'});
	form_data.push({name: 'server_class', value: 'fetchMultiData'});
	ajaxFetch(form_data).done(function (data) {						// Call the Ajax function and wait for it to finish
		var parsed_data = JSON.parse(data);							// Parse the JSON data

		/* Get the data from the request */
		var matched_page_id = parsed_data.target_page_id;
		var matched_page_title = parsed_data.target_page_title;
		var json_response = parsed_data.results;
		var execution_time = parsed_data.execution_time;
		max_shared_links = parsed_data.max_shared_links;
		min_shared_links = parsed_data.min_shared_links;

		/* Show the raw JSON results to the user */
		$('#results_text').val( JSON.stringify(json_response) );			// Display JSON results in the HTML textarea container
		$('#matched_page_id').html(matched_page_id);
		$('#matched_page_title').html(matched_page_title);

		// Output data to the console for debugging
		console.log('Matched Page ID: ' + matched_page_id);
		console.log('Matched Page Title: ' + matched_page_title);
		console.log('Execution Times:\n' + execution_time);
		console.log('Converted Node:\n' + parsed_data.converted_node);

		/**
		 * Initiate Shit
		 */
		// const Graph = ForceGraph3D()
		showGraph(json_response);


	});
}
// var MIN_SHARED_LINKS = min_shared_links;
// // console.log('Min shared links: ' +  MIN_SHARED_LINKS);
// var MAX_SHARED_LINKS = max_shared_links;
// // console.log('Max shared links: ' +  MAX_SHARED_LINKS);
// var STRENGTH_SCALE = 0.4;
function showGraph(json_response){
	const CAMERA_DISTANCE2NODES_FACTOR = 10;
	const Graph = ForceGraph3D()
	(document.getElementById('3d-graph'))
		.graphData(json_response)
		.onNodeClick(colorNode);
	function colorNode(node){
		let { nodes, links } = Graph.graphData();
		colorOthers(nodes);
		var $wikiView = $("aside.pageinfo");															// Define the Wikipedia page preview
		console.log('node val: ' + node);
		if (!node) {
			console.log('attempted to hide node');
			$wikiView.css({'display':'none'});															// Make the wikipedia preview visible and slide it into the page
			return;
		}

		/* Control Wikipedia Page Preview*/
		$wikiView.animate({"right":"0px"}, "slow").css({'display':'inline-block'});						// Make the wikipedia preview visible and slide it into the page
		$wikiView.html("<iframe src='https://en.m.wikipedia.org/wiki/" + node.name + "'><iframe>");		// Load Wikipedia page into a element on the screen

		// Make sure the nav tips are not displayed
		$('div.graph-nav-info').hide();
		// sets current node color
		node.color = 0xff00ff;
		node.visited = true;
		colorLinks(nodes, links);
		Graph.cooldownTicks(0);
		Graph.graphData({ nodes, links });
	}
}
// colors links between visited nodes a color else a default color
function colorLinks(nodes, links){
	links.forEach(function(link){
		if (link.source.visited && link.target.visited) {
			link.color=0x00ff00;
			link.lineOpacity=1;
			link.lineWidth=10;
		} else {
			link.color=0x00ffff;
			link.lineOpacity=0.2;
		};
	});
};

// color all nodes but the current one (must come before visited node coloring)
function colorOthers(nodes){
	nodes.forEach(function(node){
		if (node.visited) {
			node.color=0x00ff00;
		} else {
			node.color=0x0000ff;
		};
	});
};

$(function() {
	// When the user clicks on the search bar, make it more visible
	$('header').on('click', '#user_input', function (e) {
		$( this ).fadeTo( "fast", 1 );
		$(this).removeClass('dark');									// Make the text easier to read when background is white
	});


	// When the user clicks on the node canvas, close the wikipedia perview
	$('div#3d-graph').on('click', 'canvas', function (e) {
		$("aside.pageinfo").hide();
	});



	function doneTyping(){												// When the user is done typing
		$( 'header #user_input' ).fadeTo( "fast", .33 );				// Fade the searchbar
		$('header #user_input').addClass('dark');								// Make the text easier to read when faded
	}


	$("form").submit( function (e) {
		e.preventDefault();												// Prevent POST data from displaying in the URL
		$( 'header #user_input' ).fadeTo( "fast", .33 );				// Fade the searchbar
		$('header #user_input').addClass('dark');								// Make the text easier to read when faded

		var user_input = $('#user_input').val();
		databaseRequest(user_input);

		/* Fade the search bar after n seconds, unless the user is interacting with it */
		var typingTimer;													// Keeps track of the time (in ms) after someone has been typing
		var doneTypingTime = 2000;											// Time in ms when you consider someone to be done typing

		$('#user_input').keyup(function(){									// When someone types in the search box
			clearTimeout(typingTimer);										// Reset the typing time
			typingTimer = setTimeout(doneTyping, doneTypingTime);			// Check to see if the done typing time has been reached, if so - call the function
		});

		$('#user_input').keydown(function(){								// When someone hits a key in the search box
			clearTimeout(typingTimer);										// Reset the typing time
		});
	});
});
