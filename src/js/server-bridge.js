function ajaxFetch(form_data){
	return $.ajax({
		method: "POST",
		data: form_data,
		url: '/wikimap/src/scripts/wikilinks.php',
		dataType: 'text'
	});
}

function closeWikiPreviewWindow() {
	$("aside.pageinfo").hide();								// Hide the wiki preview
	$("div#3d-graph canvas").css({'width':'100%'});			// Make sure the canvas stays the full screen width
}

function databaseRequest(user_input){
	v.freeze_graph = false;
	var form_data = [];
	form_data.push({name: 'user_input', value: user_input});
	form_data.push({name: 'server_class', value: 'fetchMultiData'});
	ajaxFetch(form_data).done(function (data) {						// Call the Ajax function and wait for it to finish

		console.log('Data:\n' + data);
		var parsed_data = JSON.parse(data);							// Parse the JSON data

		/* Get the data from the request */
		var matched_page_id = parsed_data.target_page_id;
		var matched_page_title = parsed_data.target_page_title;
		var json_response = parsed_data.results;
		var execution_time = parsed_data.execution_time;
		v.max_shared_links = parsed_data.max_shared_links;
		v.min_shared_links = parsed_data.min_shared_links;

		// console.log('JSON:\n' + JSON.stringify(json_response));

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
function showGraph(json_response){
	console.log('Min shared links: ' +  v.min_shared_links);
	console.log('Max shared links: ' +  v.max_shared_links);
	const Graph = ForceGraph3D()
	(document.getElementById('3d-graph'))
		.graphData(json_response)
		.onNodeClick(colorNode);
	function colorNode(node){
		v.freeze_graph = true;
		v.clicked_node_x = node.x;
		v.clicked_node_y = node.y;
		v.clicked_node_z = node.z;
		let { nodes, links } = Graph.graphData();
		colorOthers(nodes);
		var $wikiView = $("aside.pageinfo");															// Define the Wikipedia page preview
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
		// sets current node color and opacity
		if (!node.visited) {
			node.color = 0xff00ff;
			node.opacity = 1;
		};
		node.visited = !node.visited; // toggle visited
		colorLinks(nodes, links);
		Graph.cooldownTicks(0);
	}
}
// colors links between visited nodes a color else a default color
function colorLinks(nodes, links){
	console.log('link coloring');
	links.forEach(function(link){
		if (link.source.visited && link.target.visited) {
			link.color=0x00ff00;
			// link.color=0xff0000;
			link.opacity=1;
			// link.lineWidth=10;
		} else {
			link.color=0x00ffff;
			link.opacity=0.2;
			// link.lineWidth=1;
		};
	});
};

// color all nodes but the current one (must come before visited node coloring)
function colorOthers(nodes){
	console.log('heree');



	nodes.forEach(function(node){

		console.log("node:" + node.name + " X:" + node.x + " Y:" + node.y);







		if (node.visited) {
			node.color=0x00ff00;
			node.opacity =1;
		} else {
			node.color=0x0000ff;
			node.opacity = 1;
		};
	});
	nodes[0].color=0xffffff;
	console.log('node x: ' + nodes[0].x); // get x coordinate of node (to be used for heat map color scale)
};


var finalNode = null;

var $canvas = $('#3d-graph');
function showWikimapLabels(){
    $('div.nodetest').remove();

    finalNode.forEach(function (node) {
		console.log("Count: " + node.name + " x:" + node.x);
        var node_top = (node.y * 1) + 100;
        var node_left = (node.x * 1) + 100;

        $('#3d-graph').append("<div class='nodetest' style='top:" + node_top + "px;left:" + node_left + "px;'>x</div>");
    });
}




$(function() {
	// When the user clicks on the search bar, make it more visible
	$('header').on('click', '#user_input', function (e) {
		$( this ).fadeTo( "fast", 1 );
		$(this).removeClass('dark');									// Make the text easier to read when background is white
	});

	function doneTyping(){													// When the user is done typing
		$( 'header #user_input' ).fadeTo( "fast", .33 );					// Fade the searchbar
		$('header #user_input').addClass('dark');							// Make the text easier to read when faded
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
