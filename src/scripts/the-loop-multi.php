<?php

namespace datapeak\public_html\src\scripts;

use datapeak\server\classes\SQL_Database;

include "C:/Users/steve/Dropbox/servers/client_server/data/datapeak/public_html/config-multi.php";

set_time_limit(3600);                                                # 60 minute running limit
ini_set('memory_limit', '3000M');                           # 3 GB memory limit

/**
 * Class Multi_Thread
 *  - This Class is only used when 'Get_Data' class calls it
 *
 * Runs PHP scripts independently on separate threads
 */
class Multi_Thread extends \Thread{
	/**
	 * Multi_Thread constructor.
	 *
	 * This function is called first each time the class is referenced
	 *
	 * @param $thread_number
	 * @param $sample_set
	 */
	public function __construct($thread_number, $sample_set){
		$this->thread     = $thread_number;
		$this->sample_set = $sample_set;
	}
	
	
	
	/**
	 * Starts a new PHP instance on a separate thread
	 */
	public function run(){
		$db = new \datapeak\server\classes\SQL_Database('wiki_links');  # Local DB
		
		$start_time = microtime(TRUE);                       # Record the time before the loop starts
		
		$sample_set = $this->sample_set;                                # Re-name the array for easier reading
		$t0_array   = array_keys($sample_set);                          # Create an array of all the T0's
		$final      = array();                                          # Array to hold final data
		
		$rows = 0;                                                      # Count the number of rows (i.e. links) the loop processes
		foreach($t0_array as $t0){                                      # Loop through each T0
			foreach($sample_set[$t0] as $t1){                           # Loop through each T0->T1
				$rows++;                                                # Increment the number of rows
				
				/* Add initial connection */
				if(!isset($final[$t0][$t1])){
					$final[$t0][$t1] = 1;                               # Specify the pages as having 1 shared link
				}
				
				if(!isset($sample_set[$t1]) || $t1 < $t0){              # If T1 doesn't have any pages; If T0 is greater than T1
					continue;                                           # Skip
				}
				
				foreach($sample_set[$t1] as $t2){                       # Loop through each T1->T2
					if(isset($sample_set[$t0][$t2])){                   # If a link shared between T0 and T2 exists
						$final[$t0][$t1]++;                             # Increment the shared links by 1
					}
				}
			}
		}
		
		// Get the time the loop ended; calculate the difference from the start time
		$end_time = number_format((microtime(TRUE) - $start_time), 6);
		
		
		/* Create an array to update MySQL */
		$sql_data = array();
		foreach(array_keys($final) as $t0){                                     # Loop through each T0
			foreach($final[$t0] as $t1 => $total_connections){                  # Get the connected T1 and their total shared connections
				$sql_data[] = "('$t0','$t1','$total_connections')";             # Create an array of SQL code to make database insertion easier
			}
		}
		
		$sql_string = implode(',', $sql_data);                              # Convert the array of SQL code to a string for the SQL insert query
		$db->query("	INSERT INTO wiki_links.page_connections_test
							(T0, T1, total_shared)
						VALUES
							$sql_string
						ON DUPLICATE KEY UPDATE                                 -- If the T0->T1 connection already exists in the database
							total_shared = total_shared + VALUES(total_shared)  -- Add the newly found total links value to the existing total_shared value in the table
                ");
		
		
		unset($sql_data);                                                       # Delete this table
		unset($final);                                                          # Delete this table
		unset($sample_set);                                                     # Delete this table
		
		$rows = number_format($rows);                                           # Format the total rows as a comma-separated number
		echo "Finished #" . $this->thread . " -- $rows rows in " . $end_time . "\n";
	}
}

class Get_Data{
	public $concurrent_threads   = 0;                   # Counts the current concurrent threads
	
	public $thread_number        = 0;                   # Increments the thread number
	
	public $active_threads       = array();             # Keeps track of which threads are active
	
	public $thread               = array();             # Holds the 'Thread' class instances
	
	public $total_rows_processed = 0;                   # Counts the total number of MySQL rows processed
	
	public $mysql_finished       = 0;                   # If mysql is finished
	
	public $start_after_page_id = 0;                    # Tells MySQL query which page ID to start after; Is auto-incremented the to previous page ID processed
	
	
	
	public function __construct(){
		$this->db = new SQL_Database('wiki_links');                        # Used only for local testing
	}
	
	
	
	/**
	 * Start Here
	 */
	public function classConfig(){
		$continue = TRUE;
		
		// Run this loop until 'continue' equals FALSE
		while($continue){
			$continue = $this->sampleSetLoop();
			usleep(200000);                                # Wait 0.2 seconds
		}
	}
	
	
	
	/**
	 * 1) Determine if there are any available threads
	 * 2) Initiate a new thread
	 * 3) Return false when finished with all data
	 *
	 * @return bool         TRUE = data still needs to be processed; FALSE = done
	 */
	public function sampleSetLoop(){
		/* Check to see if all threads are still running */
		if(count(array_keys($this->active_threads))){                   # If threads exists
			foreach($this->active_threads as $thread_num){              # Loop through each active thread and get the thread number
				
				if($this->thread[$thread_num]->isRunning()){            # If the specified thread is still running
					$status = 'Running';
				}
				else{                                                   # If the specified thread is finished running
					$status = 'Finished';
					
					// Tell the script a new thread is available
					$this->concurrent_threads--;                        # Make another thread available
					unset($this->active_threads[$thread_num]);          # Unset the active thread
				}
				
				// Output the current status for visual monitoring (can be saved to a CSV file)
				echo "Thread #$thread_num Status: $status\n";
			}
		}
		
		// If MySQL is finished
		if($this->mysql_finished){
			if(!count(array_keys($this->active_threads))){              # If all the threads have been completed
				echo "Script Finished!!!";
				exit;                                                   # End the script
			}
			return TRUE;                                                # If there are some threads waiting to finish, keep on running
		}
		
		
		/* Initiate a new thread */
		if($this->concurrent_threads < 4){                                          # If less than 4 thread are running
			$this->thread_number++;                                                 # Determine the next thread's number
			$this->concurrent_threads++;                                            # Increment the concurrent threads count
			$this->active_threads[$this->thread_number] = $this->thread_number;     # Add the new thread to the active threads array
			
			// Fetch connections from the database
			$sample_set = $this->getSampleSetLocal();
			if($this->mysql_finished){                                              # If all the database rows have been downloaded
				return TRUE;                                                        # No need to initiate another thread, exit this function
			}
			
			$row_number = number_format($this->total_rows_processed);                                       # Fetch the number of links fetched from the database
			echo "Thread $this->thread_number Started on row number $row_number \n";                        # Display the number of links in the console
			
			// Start a new thread
			$this->thread[$this->thread_number] = new Multi_Thread($this->thread_number, $sample_set);      # Declare the new thread -- specify the thread number and send an array of T0->T1 info
			$this->thread[$this->thread_number]->start();                                                   # Start the new thread
		}
		
		// If the script got this far, there's processing left, so continue running
		return TRUE;
	}
	
	
	
	/**
	 * Download the T0->T1 connections from the database
	 *
	 * 1) Fetch n connections at a time
	 * 2) Create an array of the connections
	 * 3) Return the array
	 */
	public function getSampleSetLocal(){
		$conn_limit          = 1000000;                   # Fetch a max of 1,000,000 links
		$start_after_page_id = $this->start_after_page_id;
		
		/* Fetch Page IDs until the sum of their total_connections exceeds n OR the max page limit is reached */
		$page_id_list = array();
		$result       = $this->db->query("	SELECT
											p.page_id,
											p.total_connections
										FROM wiki_links.pages p
										WHERE
											p.page_id > '$start_after_page_id'          -- Tell the script where to start collecting new Page IDs
											AND total_connections IS NOT NULL           -- Skip pages without connections
										ORDER BY p.page_id
										LIMIT 10000                                     -- Don't fetch more than 10,000 pages
                                ");
		
		$sum_total_connections = 0;                             # Reset the total connections counter to 0
		while($row = $result->fetch_assoc()){
			$page_id           = $row['page_id'];
			$total_connections = $row['total_connections'];
			
			$sum_total_connections += $total_connections;       # SUM the total connections included
			$page_id_list[]        = $page_id;                  # Add the page ID to the array to fetch links for
			
			if($sum_total_connections >= $conn_limit){
				$this->start_after_page_id = $page_id;          # Update the last page ID processed
				break;
			}
		}
		
		// If the script has gone through all the page_ids
		if(empty($page_id_list)){                               # If there are no more page IDs to go through
			$this->mysql_finished = 1;                          # Tell this class MySQL has finished all jobs
			return;                                             # Exit this method
		}
		
		$data       = array();
		$sql_string = implode(',', $page_id_list);
		$result     = $this->db->query("	SELECT
											pc.T0,
											pc.T1
										FROM wiki_links.page_connections pc
										WHERE
											pc.T0 IN ($sql_string)
											AND pc.T0 != pc.T1
											AND pc.T0 > '$start_after_page_id'
										ORDER BY pc.T1
                                ");
		
		$i = 0;
		while($row = $result->fetch_assoc()){   # Loop through each row, until all rows have been fetched from this SQL query
			$T0_page_id = $row['T0'];
			$T1_page_id = $row['T1'];
			
			// Build the array to pass back
			$data[$T0_page_id][$T1_page_id] = $T1_page_id;
			$i++;
		}

		$this->total_rows_processed += $i;      # Count the total number of rows the script has gone through (helps to keep track of total progress)
		
		return $data;                           # Return the data
	}
}

/* Get the Data from the Database */
$get_data = new Get_Data();                   # Declare the 'Get_Data' class
$get_data->classConfig();                       # Start everything (i.e. this is where this entire script starts)

?>