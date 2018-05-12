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
											PACKEDFACTORS({json=1}) AS pa
										FROM page_index
										WHERE
											match('$keyword')
										ORDER BY rank ASC
										LIMIT 0,50
										OPTION max_matches = 50, ranker=expr('sum(lcs*user_weight)*1000+bm25')
									");
		
		echo "Total Results: " . $result->num_rows . " <br>";
		while($row = $result->fetch_assoc()){
			$page_id     = $row['id'];
			$sphinx_info = $row['pa'];
			$sphinx_rank = $row['rank'];
			
			$parsed                              = json_decode($sphinx_info, TRUE);
			$data[$page_id]['page_title']        = NULL;
			$data[$page_id]['total_connections'] = NULL;
			$data[$page_id]['sphinx_rank']       = $sphinx_rank;
			$data[$page_id]['sphinx_values']     = $parsed;
		}
		
		$sphinx_end_time = number_format((microtime(TRUE) - $sphinx_start_time), 6);
		echo "<B>Total Sphinx Time:</B> $sphinx_end_time (microseconds)<hr>";
		
		
		if(!empty($data)){
			$matches = $this->fetchPages($data);
			
			echo "<pre>" . print_r($matches, TRUE) . "</pre>";
		}
	}
	
	
	
	public function fetchPages($params){
		$page_string = implode(',', array_keys($params));   # Create a comma-separated list of page IDs
		
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
			
			$params[$page_id]['page_title']        = $page_title;
			$params[$page_id]['total_connections'] = $total_connections;
		}
		
		return $params;
	}
}

$class = new Sphinx_Shit();
$class->classConfig();

?>