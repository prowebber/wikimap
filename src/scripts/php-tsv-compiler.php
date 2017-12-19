<?php

set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit

$file_redirect   = "C:/Users/steve/Dropbox/tablet/wikimap_files/tsv/redirect_parsed.txt";   # TSV file
$file_page       = "C:/Users/steve/Dropbox/tablet/wikimap_files/tsv/page_parsed.txt";   # TSV file
$file_page_links = "C:/Users/steve/Dropbox/tablet/wikimap_files/tsv/pagelinks_parsed.txt";   # TSV file
$output_file     = "C:/Users/steve/Dropbox/tablet/wikimap_files/output/output.txt";
$file_step_1     = "C:/Users/steve/Dropbox/tablet/wikimap_files/output/step_1.txt";


$start_time     = microtime(TRUE);                                          # Record the run time
$redirect_array = array();                                                         # Associative array


$contents = file_get_contents($file_redirect, TRUE);                # Convert the file to a string

$tok = strtok($contents, "\n");                                             # Split the string by token (new line)
while($tok !== FALSE){                                                          # While a token exists, get the next full line
	$col_a = strtok("\t");                                                    # Get the string to the leading tab (Page ID)
	$tok   = strtok("\n");                                                      # Get the string to the next newline; update the position in the string
	
	$redirect_array[$col_a] = $tok;                                               # Save values to the array
}

/* Convert the Page table to an array*/
/**
 * Step 2
 * ------
 * 1) Loop through the page table
 * 2) If the page_id is NOT in the redirect table
 *  a) Add it to the 'page_array'
 */
$page_array = array();
$contents   = file_get_contents($file_page, TRUE);                         # Convert the file to a string
$tok        = strtok($contents, "\n");                                             # Split the string by token (new line)
while($tok !== FALSE){                                                                   # While a token exists, get the next full line
	$col_a = strtok("\t");                                                           # Get the string to the leading tab (Page ID)
	$tok   = strtok("\n");                                                           # Get the string to the next newline; update the position in the string
	
	
	if(!isset($redirect_array[$col_a])){
		$page_array[$col_a] = $tok;
		continue;
	}
	
	$redirect_title = $redirect_array[$col_a];
	$page_array[$col_a] = $redirect_title;
}

/**
 * 1) Flip the array
 * 2) Search through the page_links table
 * 3) If the page_id is in the pages table
 *  a) Get the page_id from the pages table
 * 4) If the page_id is NOT in the page table
 */
$flipped_page_array = array_flip($page_array);
$pagelinks_final = array();
$final_array = array();
$count = 0;
$contents        = file_get_contents($file_page_links, TRUE);                         # Convert the file to a string
$tok = strtok($contents, "\n");                                             # Split the string by token (new line)
while ($tok !== false) {                                                          # While a token exists, get the next full line
	$col_a = strtok("\t");                                                    # Get the string to the leading tab (page_id)
	$tok = strtok("\n");
	
	#$page_id = $tok;
	
	if(isset($flipped_page_array[$tok])){
		$page_id = $flipped_page_array[$tok];
		$pagelinks_final[$col_a][] =$page_id;
		
		$final_array[] = $page_id."\t".$col_a;
		$count++;
	}
//	else{
//		echo "Page ID: $col_a \nPage Title: $tok \nNOT FOUND";
//		exit;
//	}
//
//	$pagelinks_final[$col_a] =$page_id;
}

#1,772,596
echo 'Count: '.$count;
file_put_contents($output_file, print_r($final_array, TRUE));
$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took

echo "<hr>Total Time: $end_time (sec.)";                                          # Display the run time results