<?php

set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit

class Php_Compiler{
	public $timer;
	
	public $files;
	
	
	
	public function __construct(){
	
	}
	
	
	
	/**
	 * Function that controls everything
	 */
	public function classConfig(){
		$start_time = microtime(TRUE);
		
		// Specify defaults
		$tsv__redirect                           = "../../redirect_parsed.txt";
		$tsv__page                               = "../../page_parsed.txt";
		$tsv__page_links                         = "../../pagelinks_parsed.txt";
		$this->files['output']['included_pages'] = "../../pagelinks__included.txt";
		$this->files['output']['excluded_pages'] = "../../pagelinks__excluded.txt";
		
		
		$redirect_array = $this->redirects($tsv__redirect);                     # Get redirect data
		$page_array     = $this->page($tsv__page, $redirect_array);             # Get page data
		$this->pageLinks($tsv__page_links, $page_array);
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took
		echo "--------------------\n";
		echo str_pad('Total Time', 30) . $end_time . " sec.\n";
		echo "\nScript Completed";
	}
	
	
	
	public function redirects($tsv_file){
		echo "\n".str_pad('starting redirects', 30)."\n";
		$start_time = microtime(TRUE);                                   # Count this function's runtime
		
		$data = array();                                                            # Array to store final output data
		$raw  = file_get_contents($tsv_file, TRUE);                   # Convert the file to a string
		$tok  = strtok($raw, "\n");                                           # Split the string by token (new line)
		
		$count = 0;
		while($tok !== FALSE){                                                      # While a token exists, get the next full line
			$col_a = strtok("\t");                                              # Get the string to the leading tab (Page ID)
			$tok   = strtok("\n");                                              # Get the string to the next newline; update the position in the string
			
			$data[$col_a] = $tok;                                                   # array[page_id] = page_title
			$count++;
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took
		echo str_pad('redirects #', 30) . number_format($count)."\n";
		echo str_pad('redirects time', 30) . $end_time . " sec.\n";
		
		return $data;
	}
	
	
	
	public function page($tsv_file, $redirect_array){
		echo "\n".str_pad('starting page', 30)."\n";
		$start_time = microtime(TRUE);                                   # Count this function's runtime
		
		$data = array();                                                            # Array to store final output data
		$raw  = file_get_contents($tsv_file, TRUE);                   # Convert the file to a string
		$tok  = strtok($raw, "\n");                                           # Split the string by token (new line)
		
		$count_a = 0;
		$count_b = 0;
		while($tok !== FALSE){                                                      # While a token exists, get the next full line
			$col_a = strtok("\t");                                              # Get the string to the leading tab (Page ID)
			$tok   = strtok("\n");                                              # Get the string to the next newline; update the position in the string
			
			// If the page_id is not in the redirects array
			if(!isset($redirect_array[$col_a])){
				#$data[$col_a] = $tok;
				$data[$tok] = $col_a;           // @todo flip the page array here for performance?
				
				$count_a++;
				continue;
			}
			$count_b++;
		}
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took
		echo str_pad('pages not in redirects', 30) . number_format($count_a)."\n";
		echo str_pad('pages in redirects', 30) . number_format($count_b)."\n";
		echo str_pad('page', 30) . $end_time . " sec.\n";
		
		return $data;
	}
	
	
	
	public function pageLinks($tsv_file, $page_array){
		echo "\n".str_pad('starting pagelinks', 30)."\n";
		
		$start_time = microtime(TRUE);                                   # Count this function's runtime
		
		$data          = array();                                                   # Array to store final output data
		$excluded_data = array();
		
		$raw = file_get_contents($tsv_file, TRUE);                   # Convert the file to a string
		$tok = strtok($raw, "\n");                                           # Split the string by token (new line)
		
		$count_a = 0;
		$count_b = 0;
		while($tok !== FALSE){                                                      # While a token exists, get the next full line
			$col_a = strtok("\t");                                              # Get the string to the leading tab (Page ID)
			$tok   = strtok("\n");                                              # Get the string to the next newline; update the position in the string
			
			if(isset($page_array[$tok]) && !empty($col_a)){                 # If the page_title exists in the page array, and the page_id is not empty
				$page_id = $page_array[$tok];
				
				$data[$page_id][] = $col_a;
				$count_a++;
			}
			else{
				$excluded_data[$col_a][] = $tok;
				$count_b++;
			}
		}
		
		#file_put_contents($this->files['output']['included_pages'], print_r($data, TRUE));
		#file_put_contents($this->files['output']['excluded_pages'], print_r($excluded_data, TRUE));
		
		$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took
		echo str_pad('page in page_links', 30) . number_format($count_a)."\n";
		echo str_pad('page not in page_links', 30) . number_format($count_b)."\n";
		echo str_pad('pageLinks', 30) . $end_time . " sec.\n";
		
		return $data;
	}
	
	
	public function getSharedLinks(){
	
	}
}

$class = new Php_Compiler();
$class->classConfig();              # Start here

?>