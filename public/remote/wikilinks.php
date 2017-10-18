<?php

namespace purewebber\public_html\src\scripts;

use purewebber\server\classes\SQL_Database;


// Allows purewebber.com to send requests to src.purewebber.com
$http_origin = $_SERVER['HTTP_ORIGIN'];
if($http_origin == "http://purewebber.dev" || $http_origin == "http://purewebber.com" || $http_origin == "https://prowebber.github.io"){
	header("Access-Control-Allow-Origin: $http_origin");
}

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

define('WIKIMAP_DB', array('', 'ch4ot1k.c2jqqyvfrmnu.us-east-1.rds.amazonaws.com', 'admin', 'adminpassword', '3306'));

class Fetch_Ajax_Script{
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
	
	
	
	public function fetchT0Data($post_data){
		$t0_id = $post_data['t0_page_id'] ?? '54484061';
		
		$data = $this->dbQuery($t0_id);
		
		echo json_encode($data);
	}
	
	
	
	public function dbQuery($t0_page_id){
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
                                ");
		
		if($result->num_rows){
			$i=0;
			while($row = $result->fetch_assoc()){
				$T0_page_id               = $row['T0_page_id'];
				$T0_page_title            = $row['T0_page_title'];
				$T1_page_id               = $row['T1_page_id'];
				$T1_page_title            = $row['T1_page_title'];
				$T0_total_connections     = $row['T0_total_connections'];
				$T1_total_connections     = $row['T1_total_connections'];
				$T0_T1_shared_connections = $row['T0_T1_shared_connections'];
				
				$data['nodes'][$i]['id'] = $T1_page_id;
				$data['nodes'][$i]['name'] = $T1_page_title;
				$data['nodes'][$i]['val'] = $T0_T1_shared_connections;
				
				$data['links'][$i]['source'] = $T0_page_id;
				$data['links'][$i]['target'] = $T1_page_id;
				$i++;
			}
			
			// Add T0 data
			$data['nodes'][$i]['id'] = $T0_page_id;
			$data['nodes'][$i]['name'] = $T0_page_title;
			$data['nodes'][$i]['val'] = $T0_total_connections;
		}
		
		return $data;
	}
}

$class = new Fetch_Ajax_Script();
$class->classConfig($_POST);
?>