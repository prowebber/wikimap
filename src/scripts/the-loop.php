<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config-multi.php";

set_time_limit(3600);                                                # 60 minute running limit
ini_set('memory_limit', '10048M');                           # 10 GB memory limit


class Run_Loop{
	public function __construct(){
		#$this->db = new SQL_Database(WIKIMAP_DB);                           # Initiate database testing
		$this->db = new SQL_Database('wiki_links');                            # Used only for local testing
	}
	
	
	
	/**
	 * Start Here
	 */
	public function classConfig(){
		$sample_set = $this->getSampleSetLocal();
		#$sample_set = $this->getSampleSet();
		$this->findSimilarities($sample_set);
	}
	
	
	
	/**
	 * Used only for local testing
	 */
	public function getSampleSetLocal(){
		$i = 0;
		$result = $this->db->query("	SELECT
											pc.T0,
											pc.T1
										FROM wiki_links.page_connections pc
										WHERE
											pc.T0 <= '100'
											AND pc.T0 != pc.T1
                                ");
		
		while($row = $result->fetch_assoc()){
			$T0_page_id = $row['T0'];
			$T1_page_id = $row['T1'];
			
			$data[$T0_page_id][$T1_page_id] = $T1_page_id;
			$i++;
		}
		
		echo "<b>Total Rows:</b> ".number_format($i)." <br>";
		
		return $data;
	}
	
	
	public function getSampleSet(){
		$i = 0;
		$result = $this->db->query("	SELECT
											pc.T0,
											pc.T1
										FROM wikimap.page_connections pc
										WHERE
											pc.T0 <= '500'
											AND pc.T0 != pc.T1
                                ");
		
		while($row = $result->fetch_assoc()){
			$T0_page_id = $row['T0'];
			$T1_page_id = $row['T1'];
			
			$data[$T0_page_id][$T1_page_id] = $T1_page_id;
			$i++;
		}
		
		echo "<b>Total Rows:</b> ".number_format($i)." <br>";
		
		return $data;
	}
	
	
	
	/**
	 * Sample Set Array:
	 * $sample_set[$T0_id][$T1_id] = $T1_id;
	 *
	 * @param $sample_set
	 */
	public function findSimilarities($sample_set){
		$final = array();
		$t0_array = array_keys($sample_set);                # Create an array of all the T0's
		
		$start_time = microtime(true);
		
		foreach($t0_array as $t0){                          # Loop through each T0
			foreach($sample_set[$t0] as $t1){               # Loop through each T0->T1
				
				if(!isset($sample_set[$t1]) || $t1 < $t0){  # If T1 doesn't have any pages
					continue;                               # Skip
				}
				
				foreach($sample_set[$t1] as $t2){           # Loop through each T1->T2
					if(isset($sample_set[$t0][$t2])){       # If a link shared between T0 and T2 exists
						
						if(isset($final[$t0][$t1])){        # If the pages have 1 or more shared links already
							$final[$t0][$t1]++;             # Increment the shared links by 1
						}
						else{                               # If the pages don't already have a shared link
							$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
						}
					}
					
					// Reverse the T0->T1 so T1->T0
					if(isset($final[$t1][$t0])){        # If the pages have 1 or more shared links already
						$final[$t1][$t0]++;             # Increment the shared links by 1
					}
					else{                               # If the pages don't already have a shared link
						$final[$t1][$t0] = 1;           # Specify the pages as having 1 shared link
					}
				}
			}
		}
		
		$end_time = number_format((microtime(true) - $start_time), 6);
		
		echo "<b>Total Time:</b> $end_time seconds<br>";
		echo '<b>Total Memory Used:</b> '. round((memory_get_peak_usage()/1000000), 2)." MB";
		echo "<pre>".print_r($final, true)."</pre>";
		exit;
	}
}

$class = new Run_Loop();
$class->classConfig($_POST);
?>