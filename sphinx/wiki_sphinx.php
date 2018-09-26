<?php
namespace datapeak\public_html\sphinx;

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";

use datapeak\server\classes\SQL_Database;


$keyword = $_POST['user_input'] ?? 'apple';

class Sphinx_Shit{
	public function __construct(){
		$this->db = new SQL_Database(WIKIMAP_DB);
	}
	
	
	
	public function classConfig($original_keyword){
		$keyword   = $original_keyword . "*";                # Regex match anything after the user's last character
		$sphinx_db = new \mysqli('34.234.231.238', NULL, NULL, NULL, '9306');
		
		
		// Sanitize input
		$keyword = $sphinx_db->real_escape_string($keyword);
		
		$data = array();
		
		# More data on Sphinx Sorting
		$result = $sphinx_db->query("	SELECT
											id,
											WEIGHT() AS rank,
											PACKEDFACTORS({json=1}) AS pa
										FROM page_index
										WHERE
											match('$keyword')
										ORDER BY rank DESC
										LIMIT 0,1000
										OPTION max_matches = 1000, ranker=expr('sum((4*lcs+2*(min_hit_pos==1)+exact_hit)*user_weight)*1000+bm25')
									");
		
		while($row = $result->fetch_assoc()){
			$page_id     = $row['id'];
			$sphinx_info = $row['pa'];
			$sphinx_rank = $row['rank'];
			
			$parsed                              = json_decode($sphinx_info, TRUE);
			$data[$page_id]['page_title']        = NULL;
			$data[$page_id]['total_connections'] = 0;
			$data[$page_id]['sphinx_rank']       = $sphinx_rank;
			$data[$page_id]['sphinx_values']     = $parsed;
		}
		
		
		if(!empty($data)){
			$matches = $this->fetchPages($data, $original_keyword);
			
			/* Show the results */
			$html = "";
			$html .= "<ul class='sphinx-search-results' id='sphinx_results_dropdown'>";
			
			krsort($matches);
			
			$counter = 0;
			foreach(array_keys($matches) as $pct_match){
				
				foreach($matches[$pct_match] as $key => $page_name){
					$html .= "<li>$page_name</li>";
					$counter++;
					
					if($counter >= 10){
						break 2;
					}
				}
			}
			$html .= "</ul>";
			
			echo $html;
		}
	}
	
	
	
	public function fetchPages($params, $original_keyword){
		$page_string = implode(',', array_keys($params));   # Create a comma-separated list of page IDs
		
		$result = $this->db->query("	SELECT
												p.page_id,
												p.page_title,
												p.total_connections
											FROM wikimap.pages p
											WHERE
												p.page_id IN ($page_string)
                                ");
		
		$title_array = array();
		while($row = $result->fetch_assoc()){
			$page_id           = $row['page_id'];
			$page_title        = $row['page_title'];
			$total_connections = $row['total_connections'];
			
			$page_title = str_replace('_', ' ', $page_title);
			
			// If there are no connections, assume it is a re-direct
			if(empty($total_connections)){
				unset($params[$page_id]);           # Remove the page ID from the list of pages
				continue;                           # Go to the next result
			}
			
			
			$params[$page_id]['page_title']        = $page_title;
			$params[$page_id]['total_connections'] = $total_connections;
			
			$title_array[] = $page_title;
		}
		
		
		$weight_array = $this->get_weights($original_keyword, $title_array);
		
		return $weight_array;

//		return $params;
	}
	
	
	
	public function get_weights($search_term, $title_arr){
		foreach($title_arr as $title){
			$split_search_arr              = explode(" ", $search_term);
			$unmatched_chars               = strlen(str_replace(' ', '', str_ireplace($split_search_arr, '', $title)));
			$title_chars                   = strlen(str_replace(' ', '', $title));
			$weight                        = ($title_chars - $unmatched_chars) / $title_chars;
			$weight_arr[(string)$weight][] = $title;
		}
		return $weight_arr;
	}
}

$class = new Sphinx_Shit();
$class->classConfig($keyword);

?>