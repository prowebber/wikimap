<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

ini_set('max_execution_time', 300);     # Set the maximum script execution time to 300 seconds (5 min.)

// Allows purewebber.com to send requests to src.purewebber.com
$http_origin = $_SERVER['HTTP_ORIGIN'];
if($http_origin == "http://purewebber.dev" || $http_origin == "http://purewebber.com" || $http_origin == "https://prowebber.github.io"){
	header("Access-Control-Allow-Origin: $http_origin");
}

class Fetch_Ajax_Script_Multi{
	public $execution_time = array();
	
	public $used_page_title;
	
	
	
	public function __construct(){
		$this->db = new SQL_Database(WIKIMAP_DB);
	}
	
	
	
	/**
	 * Start Here
	 *
	 * @param $post_data        An array of data being fed from the user's submit action
	 */
	public function classConfig($post_data){
		if(!isset($post_data['server_class'])){
			return;
		}
		
		$class_name = $post_data['server_class'];       # Get the name of the class to be loaded
		$this->$class_name($post_data);                 # Calls that function
	}
	
	
	
	public function fetchMultiData($post_data){
		$user_input           = $post_data['user_input'] ?? 'HTTP_404';    # Default to 'HTTP_404' if not found
		$nodeColor            = 0x0000ff;                                  # Color constant to use for all nodes
		$linkColor            = 0x00ffff;                                  # Color constant to use for all links
		$min_shared_links     = 0;                                         # stored minimum shared links for weighting
		$max_shared_links     = 0;                                         # stores maximum shared links for weighting
		$target_data          = $this->getPageId($user_input);             # Use the user's input to grab the correct page_id
		$T0_page_id           = $target_data['page_id'];
		$T0_page_title        = $target_data['page_title'];
		$T0_pretty_page_title = $this->makeTitleReadable($T0_page_title);
		
		$data = $this->newAlgo($T0_page_id);
		
		
		#$data    = array();
		#$history = array();                                                     # Array to store which nodes have already been included in the data array to help prevent duplicates
		
		/* Fetch the data for T0 */
		#$T0_results = $this->dbQuery($T0_page_id);                              # Query the database for all the connections for T0
		
		$links_counter = 0;                                                     # Incremental counter for the array
		$node_counter  = 0;                                                     # Incremental counter for the nodes
		
		// Loop through each of the results for T0
		foreach(array_keys($data) as $T0_key){
			$T1_page_id               = $data[$T0_key]['id'];             # Get T1 page ID
			$T1_page_title            = $data[$T0_key]['name'];           # Get T1 page Title
			$T1_pretty_page_title     = $this->makeTitleReadable($T1_page_title);
			$T0_T1_shared_connections = $data[$T0_key]['val'];            # Get the total shared connections between T0->T1
			
			/* Create the data array for the JSON script */
			// Add to the nodes
			if(!isset($history['nodes'][$T1_page_id])){                         # Only create a node if it doesn't exist (prevent stragglers)
				$data['nodes'][$node_counter]['id']    = $T1_page_title;
				$data['nodes'][$node_counter]['name']  = $T1_pretty_page_title;
				$data['nodes'][$node_counter]['color'] = $nodeColor;
				$history['nodes'][$T1_page_id]         = 1;                      # Add the page ID to the history array so we can prevent it from being included multiple times
				$node_counter++;
			}
			
			
			// Add to the links
			$data['links'][$links_counter]['source'] = $T0_page_title;
			$data['links'][$links_counter]['target'] = $T1_page_title;
			if($min_shared_links == 0 or $T0_T1_shared_connections < $min_shared_links){
				$min_shared_links = $T0_T1_shared_connections;
			};
			if($max_shared_links == 0 or $T0_T1_shared_connections > $max_shared_links){
				$max_shared_links = $T0_T1_shared_connections;
			};
			$data['links'][$links_counter]['val']             = $T0_T1_shared_connections;
			$data['links'][$links_counter]['color']           = $linkColor;
			$history['links'][$T0_page_title][$T1_page_title] = 1;                  # Add the link connections to history to prevent duplicates
			$links_counter++;
			
			
		}
		
		// Make sure the T0 reference is in the array
		if(!isset($history['nodes'][$T0_page_id])){                             # If T0 is not in the array
			$data['nodes'][$node_counter]['id']   = $T0_page_title;
			$data['nodes'][$node_counter]['name'] = $T0_pretty_page_title;
		}
		
		
		$final                      = array();             # Array to store the final output data
		$final['results']           = $data;
		$final['execution_time']    = $this->execution_time;    # Not required - Used to display the execution time to the user
		$final['target_page_id']    = $T0_page_id;              # Not required - Used to show the target page ID to the user
		$final['target_page_title'] = $T0_page_title;           # Not required - Used to show the target page name to the user
		$final['converted_node']    = $this->used_page_title;
		$final['max_shared_links']  = $max_shared_links;
		$final['min_shared_links']  = $min_shared_links;
		
		echo json_encode($final);
	}
	
	
	
	public function getPageId($user_input){
		// If the user entered a wikipedia URL
		if(preg_match("/https:\/\//i", $user_input)){             # If the user entered a URL e.g. https://en.wikipedia.org/wiki/The_Simpsons
			preg_match('/([^\/]*)$/i', $user_input, $matches);      # Get the page_title from the URL
			$page_title = $matches[0];
		}
		
		// If the user entered a page title
		else{
			//$page_title = str_replace('_', ' ', $user_input);   # Convert any underscores to spaces
			$page_title = $this->formatInputText($user_input);
		}
		
		$this->used_page_title = $page_title;
		
		$page_title = $this->db->cleanText($page_title);
		
		$result = $this->db->query("	SELECT
												p.page_id,
												p.page_title
											FROM wikimap.pages p
											WHERE
												p.page_title = '$page_title'
											ORDER BY total_connections DESC
											LIMIT 1
                                ");
		
		$data               = array();
		$data['page_id']    = '308';             # Set a fallback page_id (HTTP_404)
		$data['page_title'] = 'Aristotle';
		
		if($result->num_rows){
			$row                = $result->fetch_assoc();
			$data['page_id']    = $row['page_id'];
			$data['page_title'] = $row['page_title'];
		}
		
		return $data;
	}
	
	
	
	public function formatInputText($user_input){
		$wiki_title = str_replace('_', ' ', $user_input);    # Convert any user entered underscores to spaces
		$wiki_title = strtolower($wiki_title);                           # Convert the entire string to lowercase words
		$wiki_title = ucfirst($wiki_title);                             # Capitalize the first letter of each word
		$wiki_title = trim($wiki_title);                                # Remove leading and trailing spaces from the user's input
		$wiki_title = str_replace(' ', '_', $wiki_title);   # Replace spaces with underscores
		
		return $wiki_title;
	}
	
	
	
	public function dbQuery($t0_page_id){
		$start_time = microtime(TRUE);                     # Count the number of sections the script takes
		
		$data       = array();
		$t0_page_id = $this->db->cleanText($t0_page_id);
		
		$result = $this->db->query("	SELECT
											pct.T0 AS T0_page_id,
											CAST(p.page_title AS CHAR) AS T0_page_title,
											pct.T1 AS T1_page_id,
											CAST(p2.page_title AS CHAR) AS T1_page_title,
											pct.total_shared AS T0_T1_shared_connections
										FROM wikimap.page_connections_test pct
											LEFT JOIN wikimap.pages p
												ON p.page_id = pct.T0
											LEFT JOIN wikimap.pages p2
												ON p2.page_id = pct.T1
										WHERE
											pct.T0 = '$t0_page_id'
										ORDER BY T0_T1_shared_connections DESC
										LIMIT 10
                                ");
		
		if($result->num_rows){
			$i = 0;
			
			$master_tier = array();
			while($row = $result->fetch_assoc()){
				$T0_page_id               = $row['T0_page_id'];
				$T0_page_title            = $row['T0_page_title'];
				$T1_page_id               = $row['T1_page_id'];
				$T1_page_title            = $row['T1_page_title'];
				$T0_T1_shared_connections = $row['T0_T1_shared_connections'];
				
				$data[$i]['id']   = $T1_page_id;
				$data[$i]['name'] = $T1_page_title;
				$data[$i]['val']  = $T0_T1_shared_connections;
				
				// Add the top T1 IDs to the tier to loop through
				$master_tier[$T1_page_id] = $T1_page_id;
				
				
				$i++;
			}
			
			$total_time             = number_format((microtime(TRUE) - $start_time), 6);
			$this->execution_time[] = $T0_page_title . ": " . $total_time . "\n";
			
			/* Get N-Tiers */
			foreach(array_keys($master_tier) as $n_tier_id){
				$result = $this->db->query("	SELECT
											pct.T0 AS T0_page_id,
											CAST(p.page_title AS CHAR) AS T0_page_title,
											pct.T1 AS T1_page_id,
											CAST(p2.page_title AS CHAR) AS T1_page_title,
											pct.total_shared AS T0_T1_shared_connections
										FROM wikimap.page_connections_test pct
											LEFT JOIN wikimap.pages p
												ON p.page_id = pct.T0
											LEFT JOIN wikimap.pages p2
												ON p2.page_id = pct.T1
										WHERE
											pct.T0 = '$n_tier_id'
										ORDER BY T0_T1_shared_connections DESC
										LIMIT 5
                                ");
				
				while($row = $result->fetch_assoc()){
					$T0_page_id               = $row['T0_page_id'];
					$T0_page_title            = $row['T0_page_title'];
					$T1_page_id               = $row['T1_page_id'];
					$T1_page_title            = $row['T1_page_title'];
					$T0_T1_shared_connections = $row['T0_T1_shared_connections'];
					
					if(isset($master_tier[$T1_page_id])){
						continue;
					}
					
					$data[$i]['id']   = $T1_page_id;
					$data[$i]['name'] = $T1_page_title;
					$data[$i]['val']  = $T0_T1_shared_connections;
				}
			}
		}
		
		// Record the number of seconds the query took
		$total_time             = number_format((microtime(TRUE) - $start_time), 6);
		$this->execution_time[] = $T0_page_title . ": " . $total_time . "\n";
		
		return $data;
	}
	
	
	
	public function newAlgo($t0){
		$max_tiers      = 3;
		$nodes_per_tier = 5;
		
		$t0_array    = array();
		$t1_array    = array();
		$links_array = array();
		$t0_array[0]  = $t0;
		
		
		$t0_data = $this->newAlgo_fetchLinks($t0);
		
		
		$data = array();
		
		$data[$t0] = $t0_data;
		
		$count = 1;
		foreach(array_keys($t0_data) as $t1){                  # Loop through all the T1's
			$data[$t1] = $this->newAlgo_fetchLinks($t1);
			
			#$t0 = key($data[$t0]);               # Rename the T0
			
			$count++;
			if($count > 4){
				break;
			}
		}
		
		
		echo "<pre>".print_r($data, true)."</pre>";
		
		#return $data;      // Uncomment the hash
	}
	
	
	
	public function newAlgo_fetchLinks($t0){
		$t0 = $this->db->cleanText($t0);
		
		$return_array = array();
		
		$result = $this->db->query("	SELECT
											pct.T0 AS T0_page_id,
											CAST(p.page_title AS CHAR) AS T0_page_title,
											pct.T1 AS T1_page_id,
											CAST(p2.page_title AS CHAR) AS T1_page_title,
											pct.total_shared AS T0_T1_shared_connections
										FROM wikimap.page_connections_test pct
											LEFT JOIN wikimap.pages p
												ON p.page_id = pct.T0
											LEFT JOIN wikimap.pages p2
												ON p2.page_id = pct.T1
										WHERE
											pct.T0 = '$t0'
										ORDER BY T0_T1_shared_connections DESC
										LIMIT 10
                                ");
		
		if($result->num_rows){
			while($row = $result->fetch_assoc()){
				$T1_page_id               = $row['T1_page_id'];
				$T1_page_title            = $row['T1_page_title'];
				$T0_T1_shared_connections = $row['T0_T1_shared_connections'];
				
				$return_array[$T1_page_id]['page_title']         = $T1_page_title;
				$return_array[$T1_page_id]['shared_connecitons'] = $T0_T1_shared_connections;
			}
		}
		
		return $return_array;
	}
	
	
	
	public function makeTitleReadable($wiki_title){
		$pretty_title = str_replace('_', ' ', $wiki_title);
		
		return $pretty_title;
	}
}

$class = new Fetch_Ajax_Script_Multi();
#$class->classConfig($_POST);           // Uncomment this out
$class->newAlgo('308');             // Comment this out
?>