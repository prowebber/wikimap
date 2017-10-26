<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";


// Allows purewebber.com to send requests to src.purewebber.com
$http_origin = $_SERVER['HTTP_ORIGIN'];
if($http_origin == "http://purewebber.dev" || $http_origin == "http://purewebber.com" || $http_origin == "https://prowebber.github.io"){
	header("Access-Control-Allow-Origin: $http_origin");
}

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

class Fetch_Ajax_Script{
	public function __construct(){
		$this->db = new SQL_Database(WIKIMAP_DB);
	}
	
	
	public function classConfig(){
		$data               = array();
		$data['page_id']    = '36896';
		$data['page_title'] = 'lion';
		$data['results']    = $this->dbQuery('36896');
		
		echo "<pre>".print_r($data, true)."</pre>";
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
		
		echo "<pre>".print_r($data['results'], true)."</pre>";
		
		foreach($data['results']['nodes'] as $key){
			$t2_id = $data['results']['nodes'][$key]['id'];
			
			echo $t2_id."<br>";
		}
		
		
		echo "<pre>".print_r($sub_tiers, true)."</pre>";
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
		$data       = array();
		$beta       = array();
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
											  LIMIT 10
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
				
				#$T1_readable = $this->makeTitleReadable($T1_page_title);
				#$T0_readable = $this->makeTitleReadable($T0_page_title);
				
				#$beta['nodes'][$i]['id']
				
				$data['nodes'][$i]['id']   = $T1_page_id;
				$data['nodes'][$i]['name'] = $T1_page_title;
				
				$data['links'][$i]['source']   = $T0_page_title;
				$data['links'][$i]['target']   = $T1_page_title;
				$data['links'][$i]['distance'] = $T0_T1_shared_connections;
				$i++;
			}
		}
		
		return $data;
	}
	
	
	
	
	
	public function makeTitleReadable($wiki_title){
		$pretty_title = str_replace('_', ' ', $wiki_title);
		
		return $pretty_title;
	}
}

$class = new Fetch_Ajax_Script();
$class->classConfig();
?>