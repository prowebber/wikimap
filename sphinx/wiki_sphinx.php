<?php
namespace datapeak\public_html\sphinx;

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

use datapeak\server\classes\SQL_Database;

class Sphinx_Shit{
	public function __construct(){
		$this->db = new SQL_Database(WIKIMAP_DB);
	}
	
	
	
	public function classConfig(){
		$keyword   = "ninja turtles";
		$sphinx_db = new \mysqli(SPHINX_DATABASE, NULL, NULL, NULL, '9306');
		
		// Sanitize input
		$keyword = $sphinx_db->real_escape_string($keyword);
		
		$data = array();
		
		$sphinx_start_time = microtime(TRUE);
		
		# More data on Sphinx Sorting
		$result = $sphinx_db->query("	SELECT
											id,
											WEIGHT() AS rank,
											PACKEDFACTORS() AS pa
										FROM page_index
										WHERE
											match('$keyword')
										ORDER BY rank ASC
										LIMIT 0,100
										OPTION max_matches = 100, ranker=expr('sum(lcs*user_weight)*1000+bm25')
									");
		
		$temp = array();
		
		echo "<pre>".print_r($result, true)."</pre>";
		while($row = $result->fetch_assoc()){
			$page_id     = $row['id'];
			$sphinx_info = $row['pa'];
			$sphinx_rank = $row['rank'];
			
			$parsed = explode(',', $sphinx_info);
			
			$temp[$page_id]['sphinx_rank']   = $sphinx_rank;
			$temp[$page_id]['sphinx_values'] = $parsed;
			
			$data[$page_id] = $page_id;
		}
		
		$sphinx_end_time = number_format((microtime(TRUE) - $sphinx_start_time), 6);
		echo "<B>Total Sphinx Time:</B> $sphinx_end_time (microseconds)<br><br>";
		
		echo "<pre>" . print_r($temp, TRUE) . "</pre>";
		
		
		if(!empty($data)){
			$matches = $this->fetchPages($data);
			
			echo "<pre>" . print_r($matches, TRUE) . "</pre>";
		}
	}
	
	
	
	public function fetchPages($params){
		$data = array();                                    # Array that contains the search results
		
		$page_list = array();
		foreach($params as $page_id){                       # Loop through each page
			$page_id = $this->db->cleanText($page_id);      # Sanitize the page ID to prevent SQL Injection
			
			$page_list[] = $page_id;                        # Create an array of all the pages
		}
		
		$page_string = implode(',', $page_list);            # Create a comma-separated list of page IDs
		
		$result = $this->db->query("	SELECT
												p.page_id,
												p.page_title,
												p.total_connections
											FROM wikimap.pages p
											WHERE
												p.page_id IN ($page_string)
                                ");
		
		while($row = $result->fetch_assoc()){
			$page_id           = $row['page_id'];
			$page_title        = $row['page_title'];
			$total_connections = $row['total_connections'];
			
			$data[$page_id]['page_title']        = $page_title;
			$data[$page_id]['total_connections'] = $total_connections;
		}
		
		return $data;
	}
}

$class = new Sphinx_Shit();
$class->classConfig();

?>