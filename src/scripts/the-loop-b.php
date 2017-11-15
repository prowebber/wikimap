<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config-multi.php";

set_time_limit(3600);                                                # 60 minute running limit
ini_set('memory_limit', '10048M');                           # 10 GB memory limit


class Run_Loop_B{
	public function __construct(){
		$this->db = new SQL_Database('wiki_links');                            # Used only for local testing
	}
	
	
	
	/**
	 * Start Here
	 */
	public function classConfig(){
		$sample_set = $this->getSampleSetLocal_b();
		$this->findSimilarities_b($sample_set);
	}
	
	
	
	/**
	 * Used only for local testing
	 */
	public function getSampleSetLocal(){
		$set_page_ids[] = '332';
		$set_page_ids[] = '14149608';
		$set_page_ids[] = '670';
		$set_page_ids[] = '6649381';
		$set_page_ids[] = '13134912';
		$set_page_ids[] = '15550841';
		$set_page_ids[] = '21325115';
		$set_page_ids[] = '30007528';
		$set_page_ids[] = '58533';
		$set_page_ids[] = '2511084';
		$set_page_ids[] = '4183994';
		$set_page_ids[] = '5031176';
		$set_page_ids[] = '8475924';
		$set_page_ids[] = '13591897';
		
		$sql_string = implode(',', $set_page_ids);
		
		$i      = 0;
		$result = $this->db->query("	SELECT
											pc.T0,
											pc.T1
										FROM wiki_links.page_connections pc
										WHERE
											pc.T0 IN ($sql_string)
											AND pc.T0 != pc.T1
										ORDER BY pc.T1
										LIMIT 2000, 1000
                                ");
		
		while($row = $result->fetch_assoc()){
			$T0_page_id = $row['T0'];
			$T1_page_id = $row['T1'];
			
			$data[$T0_page_id][$T1_page_id] = $T1_page_id;
			$i++;
		}
		
		echo "<b>Total Rows:</b> " . number_format($i) . " <br>";
		
		return $data;
	}
	
	
	
	public function getSampleSetLocal_b(){
		$set_page_ids[] = '332';
		$set_page_ids[] = '14149608';
		$set_page_ids[] = '670';
		$set_page_ids[] = '6649381';
		$set_page_ids[] = '13134912';
		$set_page_ids[] = '15550841';
		$set_page_ids[] = '21325115';
		$set_page_ids[] = '30007528';
		$set_page_ids[] = '58533';
		$set_page_ids[] = '2511084';
		$set_page_ids[] = '4183994';
		$set_page_ids[] = '5031176';
		$set_page_ids[] = '8475924';
		$set_page_ids[] = '13591897';
		
		$sql_string = implode(',', $set_page_ids);
		
		/* Fetch Page IDs until the sum of their total_connections exceeds n OR the max page limit is reached */
		$page_id_list = array();
		$start_after_page_id = '30007528';
		$result       = $this->db->query("	SELECT
											p.page_id,
											p.total_connections
										FROM wiki_links.pages p
										WHERE
											p.page_id > '$start_after_page_id'
											AND p.page_id IN ($sql_string)
											AND total_connections IS NOT NULL
										ORDER BY p.page_id
										LIMIT 10
                                ");
		
		$sum_total_connections = 0;
		$conn_limit = 1000;
		while($row = $result->fetch_assoc()){
			$page_id           = $row['page_id'];
			$total_connections = $row['total_connections'];
			
			$sum_total_connections += $total_connections;
			
			$page_id_list[] = $page_id;
			if($sum_total_connections >= $conn_limit){
				break;
			}
		}
		
		
		echo "Total Connections: $sum_total_connections<pre>".print_r($page_id_list, true)."</pre>";
		
		if(empty($page_id_list)){
			echo "No more pages";
			exit;
		}
		
		$last_page_id = end($page_id_list);
		reset($page_id_list);
		echo "<b>$last_page_id</b><br>";
		
		$i      = 0;
		$sql_string = implode(',', $page_id_list);
		$result = $this->db->query("	SELECT
											pc.T0,
											pc.T1
										FROM wiki_links.page_connections pc
										WHERE
											pc.T0 IN ($sql_string)
											AND pc.T0 != pc.T1
											AND pc.T0 > '$start_after_page_id'
										ORDER BY pc.T1
                                ");
		
		while($row = $result->fetch_assoc()){
			$T0_page_id = $row['T0'];
			$T1_page_id = $row['T1'];
			
			$data[$T0_page_id][$T1_page_id] = $T1_page_id;
			$i++;
		}
		
		echo "<b>Total Rows:</b> " . number_format($i) . " <br>";
		
		return $data;
	}
	
	
	
	/**
	 * Sample Set Array:
	 * $sample_set[$T0_id][$T1_id] = $T1_id;
	 *
	 * @param $sample_set
	 */
	public function findSimilarities($sample_set){
		$final    = array();
		$t0_array = array_keys($sample_set);                # Create an array of all the T0's
		
		$start_time = microtime(TRUE);
		
		#echo "<pre>".print_r($sample_set, true)."</pre>";
		
		foreach($t0_array as $t0){                          # Loop through each T0
			foreach($sample_set[$t0] as $t1){               # Loop through each T0->T1
				
				/* Add initial connection */
				if(isset($final[$t0][$t1])){
					$final[$t0][$t1]++;             # Increment the shared links by 1
					$final[$t1][$t0]++;             # Increment the shared links by 1
				}
				else{
					$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
					$final[$t1][$t0] = 1;           # Specify the pages as having 1 shared link
				}
				
				if(!isset($sample_set[$t1]) || $t1 < $t0){  # If T1 doesn't have any pages; If T0 is greater than T1
					continue;                               # Skip
				}
				
				foreach($sample_set[$t1] as $t2){           # Loop through each T1->T2
					if(isset($sample_set[$t0][$t2])){       # If a link shared between T0 and T2 exists
						
						if(isset($final[$t0][$t1])){
							$final[$t0][$t1]++;             # Increment the shared links by 1
							$final[$t1][$t0]++;             # Increment the shared links by 1
						}
						else{
							$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
							$final[$t1][$t0] = 1;           # Specify the pages as having 1 shared link
						}
					}
				}
			}
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6);
		
		
		/* Create an array to update MySQL */
		$sql_data = array();
		foreach(array_keys($final) as $t0){                                     # Loop through each T0
			foreach($final[$t0] as $t1 => $total_connections){                  # Get the connected T1 and their total shared connections
				$sql_data[] = "('$t0','$t1','$total_connections')";             # Create an array of SQL code to make database insertion easier
			}
		}
		
		$sql_string = implode(',', $sql_data);                              # Convert the array of SQL code to a string for the SQL insert query
		$this->db->query("	INSERT INTO wiki_links.page_connections_test
							(T0, T1, total_shared)
						VALUES
							$sql_string
						ON DUPLICATE KEY UPDATE                                 -- If the T0->T1 connection already exists in the database
							total_shared = total_shared + VALUES(total_shared)  -- Add the newly found total links value to the existing total_shared value in the table
                ");
		
		echo "<b>Total Time:</b> $end_time seconds<br>";
		echo '<b>Total Memory Used:</b> ' . round((memory_get_peak_usage() / 1000000), 2) . " MB";
		#echo "<pre>".print_r($final, true)."</pre>";
		exit;
	}
	
	
	public function findSimilarities_b($sample_set){
		$final    = array();
		$t0_array = array_keys($sample_set);                # Create an array of all the T0's
		
		$start_time = microtime(TRUE);
		
		#echo "<pre>".print_r($sample_set, true)."</pre>";
		
		foreach($t0_array as $t0){                          # Loop through each T0
			foreach($sample_set[$t0] as $t1){               # Loop through each T0->T1
				
				/* Add initial connection */
				if(isset($final[$t0][$t1])){
					if($t0 == '332' && $t1 == '14149608'){
						echo "Stage 1) $t0 | $t1 <br>";
					}
					$final[$t0][$t1]++;             # Increment the shared links by 1
					$final[$t1][$t0]++;             # Increment the shared links by 1
				}
				else{
					if($t0 == '332' && $t1 == '14149608'){
						echo "Stage 2) $t0 | $t1 <br>";
					}
					
					$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
					$final[$t1][$t0] = 1;           # Specify the pages as having 1 shared link
				}
				
				if(!isset($sample_set[$t1]) || $t1 < $t0){  # If T1 doesn't have any pages; If T0 is greater than T1
					continue;                               # Skip
				}
				
				foreach($sample_set[$t1] as $t2){           # Loop through each T1->T2
					if(isset($sample_set[$t0][$t2])){       # If a link shared between T0 and T2 exists
						
						if(isset($final[$t0][$t1])){
							if($t0 == '332' && $t1 == '14149608'){
								echo "Stage 3) $t0 | $t1 | $t2<br>";
							}
							$final[$t0][$t1]++;             # Increment the shared links by 1
							$final[$t1][$t0]++;             # Increment the shared links by 1
						}
						else{
							if($t0 == '332' && $t1 == '14149608'){
								echo "Stage 4) $t0 | $t1 | $t2<br>";
							}
							$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
							$final[$t1][$t0] = 1;           # Specify the pages as having 1 shared link
						}
					}
				}
			}
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6);
		
		
		/* Create an array to update MySQL */
		$sql_data = array();
		foreach(array_keys($final) as $t0){                                     # Loop through each T0
			foreach($final[$t0] as $t1 => $total_connections){                  # Get the connected T1 and their total shared connections
				$sql_data[] = "('$t0','$t1','$total_connections')";             # Create an array of SQL code to make database insertion easier
			}
		}
		
		$sql_string = implode(',', $sql_data);                              # Convert the array of SQL code to a string for the SQL insert query
		$this->db->query("	INSERT INTO wiki_links.page_connections_test
							(T0, T1, total_shared)
						VALUES
							$sql_string
						ON DUPLICATE KEY UPDATE                                 -- If the T0->T1 connection already exists in the database
							total_shared = total_shared + VALUES(total_shared)  -- Add the newly found total links value to the existing total_shared value in the table
                ");
		
		echo "<b>Total Time:</b> $end_time seconds<br>";
		echo '<b>Total Memory Used:</b> ' . round((memory_get_peak_usage() / 1000000), 2) . " MB";
		echo "<hr><hr><pre>".print_r($final, true)."</pre>";
		exit;
	}
}

$class = new Run_Loop_B();
$class->classConfig();
?>