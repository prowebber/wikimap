<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config-multi.php";

set_time_limit(7200);                                                 # 120 minute running limit
ini_set('memory_limit', '15048M');                           # 10 GB memory limit



class Compute_Connections{
	
	public $raw;
	
	
	public function __construct(){
		$this->db = new SQL_Database('wiki_links');                            # Used only for local testing
	}
	
	
	
	public function classConfig(){
		$this->fetchPageConnections();                      # Get all the page connections
		#$this->findSharedConnections();
		$this->sortPageIds();
	}
	
	
	public function sortPageIds(){
		echo '<b>A) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
		
		$segment = array_chunk(array_keys($this->raw), 10000);
		echo '<b>B) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
		
		echo "<hr><br><br>";
		
		$raw = $this->raw;
		
		// Loop through each segment block
		$skipped = 0;
		$full_time = microtime(TRUE);
		foreach(array_keys($segment) as $key){
			echo "<h2>Segment: $key</h2>";
			echo '<b>Segment Start) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
			$final = array();
			$start_time = microtime(TRUE);
			
			
			foreach(($segment[$key]) as $t0){                           # Loop through each T0
				foreach($raw[$t0] as $t1){                              # Loop through each T0->T1
					
					/* Add initial connection */
					if(!isset($final[$t0][$t1])){                       # If this connection has not been added to the final data yet
						$final[$t0][$t1] = 1;                           # Specify the pages as having 1 shared link
						$final[$t1][$t0] = 1;                           # Specify the pages as having 1 shared link
					}
					
					// @todo remove this once you have all the data
					if(!isset($raw[$t1])){
						$skipped++;
						continue;
					}
					
					
					foreach($raw[$t1] as $t2){                          # Loop through each T1->T2
						if(isset($raw[$t0][$t2])){                      # If a link shared between T0 and T2 exists
							$final[$t0][$t1]++;                         # Increment the shared links by 1
							$final[$t1][$t0]++;                         # Increment the shared links by 1
						}
					}
				}
			}
			
			echo '<b>Segment End) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
			
			
			
			/* Create an array to update MySQL */
			$sql_data = array();
			foreach(array_keys($final) as $t0){                                     # Loop through each T0
				foreach($final[$t0] as $t1 => $total_connections){                  # Get the connected T1 and their total shared connections
					$sql_data[] = "('$t0','$t1','$total_connections')";             # Create an array of SQL code to make database insertion easier
				}
			}
			
			echo '<b>Created SQL String) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
			
			$sql_string = implode(',', $sql_data);                              # Convert the array of SQL code to a string for the SQL insert query
			$this->db->query("	INSERT INTO wiki_links.page_connections_test
							(T0, T1, total_shared)
						VALUES
							$sql_string
						ON DUPLICATE KEY UPDATE                                 -- If the T0->T1 connection already exists in the database
							total_shared = total_shared + VALUES(total_shared)  -- Add the newly found total links value to the existing total_shared value in the table
                ");
			
			echo '<b>After SQL Insert) Mem:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
			
			// Clear memory
			unset($sql_data);
			unset($final);
			unset($segment[$key]);
			$sql_string = null;
			
			echo '<b>Segment Finished:</b> ' . round((memory_get_usage() / 1000000), 2) . " MB<br>";
			
			$end_time = number_format((microtime(TRUE) - $start_time), 6);
			echo "<b>Total Time:</b> $end_time seconds<br>";
		}
		
		$full_end_time = number_format((microtime(TRUE) - $full_time), 6);
		
		echo "<hr><hr><b>Total Time:</b> $full_end_time seconds<br>";
		echo "<b>Total Skipped:</b> ".number_format($skipped)."<br>";
	}
	
	
	public function findSharedConnections(){
		$start_time = microtime(TRUE);
		
		$raw = $this->raw;                                          # Rename the array
		$final      = array();                                      # Array to hold final data
		
		$skipped = 0;
		foreach(array_keys($raw) as $t0){                           # Loop through each T0
			foreach($raw[$t0] as $t1){                              # Loop through each T0->T1
				
				/* Add initial connection */
				if(!isset($final[$t0][$t1])){                       # If this connection has not been added to the final data yet
					$final[$t0][$t1] = 1;                           # Specify the pages as having 1 shared link
					$final[$t1][$t0] = 1;                           # Specify the pages as having 1 shared link
				}
				
				// @todo remove this once you have all the data
				if(!isset($raw[$t1])){
					$skipped++;
					continue;
				}
				
				foreach($raw[$t1] as $t2){                          # Loop through each T1->T2
					if(isset($raw[$t0][$t2])){                      # If a link shared between T0 and T2 exists
						$final[$t0][$t1]++;                         # Increment the shared links by 1
						$final[$t1][$t0]++;                         # Increment the shared links by 1
					}
				}
			}
			
			unset($raw[$t0]);
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6);
		
		/* Create an array to update MySQL */
		$sql_data = array();
		foreach(array_keys($final) as $t0){                                     # Loop through each T0
			foreach($final[$t0] as $t1 => $total_connections){                  # Get the connected T1 and their total shared connections
				$sql_data[] = "('$t0','$t1','$total_connections')";             # Create an array of SQL code to make database insertion easier
			}
			
			unset($final[$t0]);
		}
		
		$sql_string = implode(',', $sql_data);                              # Convert the array of SQL code to a string for the SQL insert query
		$this->db->query("	INSERT INTO wiki_links.page_connections_test
							(T0, T1, total_shared)
						VALUES
							$sql_string
						ON DUPLICATE KEY UPDATE                                 -- If the T0->T1 connection already exists in the database
							total_shared = total_shared + VALUES(total_shared)  -- Add the newly found total links value to the existing total_shared value in the table
                ");
		
		echo "<h2>Sorting Specs</h2>";
		echo "<b>Skipped:</b> ".number_format($skipped)."<br>";
		echo "<b>Total Time:</b> $end_time seconds<br>";
		echo '<b>Total Memory Used:</b> ' . round((memory_get_peak_usage() / 1000000), 2) . " MB";
	}
	
	
	
	
	
	public function fetchPageConnections(){
		$data       = array();
		$start_time = microtime(TRUE);
		
		$continue = TRUE;
		
		$rows             = 0;              # Count the number of rows processed
		$start_at_row     = 0;              # Specifies the next row to start at
		$rows_per_request = '1000000';      # Specify the number of rows to retrieve per request
		while($continue){
			$result = $this->db->query("SELECT
											pc.T0,
											pc.T1
										FROM wiki_links.page_connections pc
										WHERE
											pc.T0 < pc.T1
										ORDER BY pc.T0
										LIMIT $start_at_row, $rows_per_request
                                ");
			
			if(!$result->num_rows){
				echo "### Got all the data ###";
				$continue = FALSE;
			}
			else{
				while($row = $result->fetch_assoc()){
					$T0_page_id = $row['T0'];
					$T1_page_id = $row['T1'];
					
					$this->raw[$T0_page_id][$T1_page_id] = $T1_page_id;
					$rows++;
				}
				
				$start_at_row += $rows_per_request;
			}
			
			if($rows >= '20000000'){
				$continue = true;
				break;
			}
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6);
		
		
		
		echo "<h2>Download Specs</h2>";
		echo "<b>Total Links:</b> " . number_format($rows) . "<br>";
		echo "<b>Total Time: </b> $end_time <br>";
		echo '<b>Total Memory Used:</b> ' . round((memory_get_peak_usage() / 1000000), 2) . " MB";
		echo "<hr>";
		
	}
}

$class = new Compute_Connections();
$class->classConfig();




?>