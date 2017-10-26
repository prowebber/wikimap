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

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

class Fetch_Ajax_Script_Multi{
	public $execution_time = array();
	
	
	
	public function __construct(){
		$this->db = new SQL_Database(WIKIMAP_DB);
	}
	
	
	
	public function classConfig($post_data){
		if(!isset($post_data['server_class'])){
			return;
		}
		
		$class_name = $post_data['server_class'];       # Get the name of the class to be loaded
		$this->$class_name($post_data);                 # Calls that function
	}
	
	
	
	public function fetchMultiData($post_data){
		$user_input = $post_data['user_input'] ?? 'HTTP_404';   # Default to 'HTTP_404' if not found
		
		$target_data   = $this->getPageId($user_input);           # Use the user's input to grab the correct page_id
		$T0_page_id    = $target_data['page_id'];
		$T0_page_title = $target_data['page_title'];
		
		$data    = array();
		$final   = array();             # Array to store the final output data
		$history = array();             # Array to store which nodes have already been included in the data array to help prevent duplicates
		
		/* Fetch the data for T0 */
		$final['target_page_id']    = $T0_page_id;
		$final['target_page_title'] = $T0_page_title;
		$data['results']            = $this->dbQuery($T0_page_id);
		
		$i            = 0;                         # Incremental counter for the array
		$node_counter = 0;
		
		// Add T0 to the nodes list
		$final['results']['nodes'][$node_counter]['id']   = $T0_page_title;      # This is the title, not ID
		$final['results']['nodes'][$node_counter]['name'] = $T0_page_title;
		$node_counter++;
		
		// Loop through each of the results for T0
		foreach(array_keys($data['results']) as $key){
			$T1_page_id               = $data['results'][$key]['id'];           # Get T1 page ID
			$T1_page_title            = $data['results'][$key]['name'];         # Get T1 page Title
			$T0_T1_shared_connections = $data['results'][$key]['distance'];     # Get the total shared connections between T0->T1
			
			// Create the data array for the JSON script
			$final['results']['nodes'][$node_counter]['id']   = $T1_page_title;
			$final['results']['nodes'][$node_counter]['name'] = $T1_page_title;
			$history['nodes'][$T1_page_id]                    = 1;                                 # Add the page ID to the history array so we can prevent it from being included multiple times
			
			$final['results']['links'][$i]['source']          = $T0_page_title;
			$final['results']['links'][$i]['target']          = $T1_page_title;
			$final['results']['links'][$i]['distance']        = $T0_T1_shared_connections;
			$history['links'][$T0_page_title][$T1_page_title] = 1;              # Add the link connections to history to prevent duplicates
			$i++;
			$node_counter++;
			/* Fetch the data for the T1 */
			$sub_tiers = $this->dbQuery($T1_page_id);
			
			// Loop through each of the top 10 sub tier results
			foreach(array_keys($sub_tiers) as $sub_key){
				$T2_page_id               = $sub_tiers[$sub_key]['id'];
				$T2_page_title            = $sub_tiers[$sub_key]['name'];
				$T1_T2_shared_connections = $sub_tiers[$sub_key]['distance'];
				
				// If the page is not already in the nodes
				if(!isset($history['nodes'][$T2_page_id])){
					$final['results']['nodes'][$node_counter]['id']   = $T2_page_title;
					$final['results']['nodes'][$node_counter]['name'] = $T2_page_title;
					$history['nodes'][$T2_page_id]                    = 1;
					$node_counter++;
				}
				
				// If the links are not already computed for the connections
				if(!isset($history['links'][$T1_page_title][$T2_page_title])){
					$final['results']['links'][$i]['source']          = $T1_page_title;
					$final['results']['links'][$i]['target']          = $T2_page_title;
					$final['results']['links'][$i]['distance']        = $T1_T2_shared_connections;
					$history['links'][$T1_page_title][$T2_page_title] = 1;
					$i++;
				}
			}
		}
		
		$final['execution_time'] = $this->execution_time;
		
		echo json_encode($final);
		
		#echo "<h2>Execution Time</h2><pre>" . print_r($this->execution_time, TRUE) . "</pre>";
		#echo "<h2>Final Results</h2><pre>" . print_r($final, TRUE) . "</pre>";
		#echo "<hr><pre>" . print_r($data, TRUE) . "</pre>";
	}
	
	
	
	public function classConfig_old(){
//		if(!isset($post_data['server_class'])){
//			return;
//		}
//
//		$class_name = $post_data['server_class'];       # Get the name of the class to be loaded
//		$this->$class_name($post_data);                 # Calls that function
		
		#$t0_page_id = '36896';
		
		$data               = array();
		$data['page_id']    = '36896';
		$data['page_title'] = 'lion';
		$data['results']    = $this->dbQuery('36896');
		
		$sub_tiers = array();
		
		echo "<pre>" . print_r($data['results'], TRUE) . "</pre>";
		
		foreach($data['results']['nodes'] as $key){
			$t2_id = $data['results']['nodes'][$key]['id'];
			
			echo $t2_id . "<br>";
		}
		
		
		echo "<pre>" . print_r($sub_tiers, TRUE) . "</pre>";
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
			
			$page_title = $user_input;
		}
		
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
		$data['page_id']    = '18978754';             # Set a fallback page_id (HTTP_404)
		$data['page_title'] = 'Apple';
		
		if($result->num_rows){
			$row                = $result->fetch_assoc();
			$data['page_id']    = $row['page_id'];
			$data['page_title'] = $row['page_title'];
		}
		
		return $data;
	}
	
	
	
	public function dbQuery($t0_page_id){
		$start_time = microtime(TRUE);                     # Count the number of sections the script takes
		
		$data       = array();
		$t0_page_id = $this->db->cleanText($t0_page_id);
		
		$result = $this->db->query("	SELECT
												pc.T0 AS T0_page_id,
												CAST(p2.page_title AS CHAR) AS T0_page_title,
												pc.T1 AS T1_page_id,
												CAST(p.page_title AS CHAR) AS T1_page_title,
												p2.total_connections AS T0_total_connections,
												p.total_connections AS T1_total_connections,
												COUNT(pc2.T1) AS T0_T1_shared_connections       # Count the total shared connections
												
											FROM wikimap.page_connections pc
												-- Find all of the connections between T0 and T1
												LEFT JOIN wikimap.page_connections pc2
													ON pc2.T0 = pc.T1                           # Find all the page_ids connected to the page_ids that T0 is connected to
												
												-- Get the page_titles for T0 and T1
												LEFT JOIN wikimap.pages p
													ON p.page_id = pc.T1
												LEFT JOIN wikimap.pages p2
													ON p2.page_id = pc.T0
											WHERE
												pc.T0 = '$t0_page_id'                                  # ENTER T0 ID HERE
												
												-- Only show results for shared connections between T0 and T1
												AND pc2.T1 IN (
													-- Create a list of the page_ids T0 is connected to
													SELECT
														pc3.T1
													FROM wikimap.page_connections pc3
													WHERE
														pc3.T0 = '$t0_page_id'                         # ENTER T0 ID HERE
												)
											GROUP BY pc.T1
											ORDER BY T0_T1_shared_connections DESC
											  LIMIT 5
                                ");
		
		if($result->num_rows){
			$i = 0;
			while($row = $result->fetch_assoc()){
				$T0_page_id               = $row['T0_page_id'];
				$T0_page_title            = $row['T0_page_title'];
				$T1_page_id               = $row['T1_page_id'];
				$T1_page_title            = $row['T1_page_title'];
				$T0_total_connections     = $row['T0_total_connections'];
				$T1_total_connections     = $row['T1_total_connections'];
				$T0_T1_shared_connections = $row['T0_T1_shared_connections'];
				
				$data[$i]['id']       = $T1_page_id;
				$data[$i]['name']     = $T1_page_title;
				$data[$i]['distance'] = $T0_T1_shared_connections;
				
				$i++;
			}
		}
		
		// Record the number of seconds the query took
		$total_time                           = number_format((microtime(TRUE) - $start_time), 6);
		$this->execution_time[$T0_page_title] = $total_time;
		
		return $data;
	}
	
	
	
	public function makeTitleReadable($wiki_title){
		$pretty_title = str_replace('_', ' ', $wiki_title);
		
		return $pretty_title;
	}
}

$class = new Fetch_Ajax_Script_Multi();
$class->classConfig($_POST);
?>