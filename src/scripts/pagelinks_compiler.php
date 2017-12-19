<?php

set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);
$page_array     = page_array_no_redirects(redirect_array());
$compiled_pagelinks = compiled_pagelinks($page_array);
$pagelinks_final = get_shared_links($compiled_pagelinks);
//$pagelinks_string = implode("\n",$pagelinks_final);
#3,027,571 rows
//file_put_contents($output_file, $pagelinks_string);
file_put_contents($output_file, print_r($pagelinks_final, TRUE));
$end_time = number_format((microtime(TRUE) - $start_time), 6); # Calculate how long it took
echo "Total Time: $end_time (sec.)";                                          # Display the run time results

function redirect_array(){
	$contents = file_get_contents("../../redirect_parsed.txt", TRUE);  # Convert the redirect_parsed tsv to a string
	$tok = strtok($contents, "\n");                                       # Split the string by token (new line)
	while($tok !== FALSE){                                                      # While a token exists, get the next full line
		$col_a = strtok("\t");                                              # Get the string to the leading tab (Page ID)
		$tok   = strtok("\n");                                               # Get the string to the next newline; update the position in the string
		$redirect_array[$col_a] = $tok;                                          # Save values to the array
	}
	return $redirect_array;
}

function page_array_no_redirects($redirect_array){
	$contents   = file_get_contents("../../page_parsed.txt", TRUE);          # Convert page_parsed tsv to a string
	$tok        = strtok($contents, "\n");                                             # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$col_a = strtok("\t");                                                           # Get the string to the leading tab (Page ID)
		$tok   = strtok("\n");                                                           # Get the string to the next newline; update the position in the string
		if(!isset($redirect_array[$col_a])){
			$page_array[$col_a] = $tok;
			continue;
		}
//		$redirect_title = $redirect_array[$col_a];                                            # If redirect ID, change title to redirect title
//		$page_array[$col_a] = $redirect_title;
	}
	return $page_array;
}
function compiled_pagelinks($page_array){
	echo "Page array size before flip:".count($page_array)."\n";
	file_put_contents("../../page_array_new.txt", print_r($page_array, TRUE));
	$flipped_page_array = array_flip($page_array);
	$excluded_pagelinks = array();
//	$flipped_page_array=array();
//	foreach($page_array as $key => $value){
//		$flipped_page_array=$flipped_page_array+array($value, $key);
//	}
//	$flipped_page_array=array_combine(array_values($page_array),array_keys($page_array));
	file_put_contents("../../flipped_page_array_new.txt", print_r($flipped_page_array, TRUE));
	echo "Flipped page array size after flip:".count($flipped_page_array)."\n";
	$count = 0;
	$contents = file_get_contents("../../pagelinks_parsed.txt", TRUE);   # Convert the file to a string
	$tok = strtok($contents, "\n");                                             # Split the string by token (new line)
	while ($tok !== false) {                                                          # While a token exists, get the next full line
		$col_a = strtok("\t");                                                    # Get the string to the leading tab (page_id)
		$tok = strtok("\n");
		if(isset($flipped_page_array[$tok])){
			$page_id           = $flipped_page_array[$tok];
//			$pagelinks_final[] = $col_a . "\t" . $page_id;
			$pagelinks_final[$col_a][] = $page_id;
			$count++;
		} else {
			$excluded_pagelinks[]= $col_a . "\t" . $tok;
		}
	}
	file_put_contents("../../pagelinks_array.txt", print_r($pagelinks_final, TRUE));
//	file_put_contents("../../excluded_pagelinks.txt", implode("\n",$excluded_pagelinks));
	echo 'Count: '.$count."\n";
//	foreach ($pagelinks_final as $key => $row) {
//		$from_id[$key]  = $row['from_id'];
//		$to_id[$key] = $row['to_id'];
//	}
//	array_multisort($from_id, SORT_ASC, $to_id, SORT_ASC,$pagelinks_final);
	array_multisort($pagelinks_final[0], SORT_ASC);
	return $pagelinks_final;
}
function pagelinks_reversed_appended($page_links){
	$flipped_page_array=array_flip($page_links);
	return $page_links + $flipped_page_array;
}
function get_shared_links($pagelinks){
	$start_time = microtime(TRUE);
	$final      = array();
	$t0_array   = array_keys($pagelinks);              # Create an array of all the T0's
	foreach($t0_array as $t0){                          # Loop through each T0
		foreach($pagelinks[$t0] as $t1){               # Loop through each T0->T1
			if(!isset($pagelinks[$t1])){  # If T1 doesn't have any pages
				continue;                               # Skip
			}
			foreach($pagelinks[$t1] as $t2){           # Loop through each T1->T2
				if(isset($pagelinks[$t0][$t2])){       # If a link shared between T0 and T2 exists
					if(isset($final[$t0][$t1])){        # If the pages have 1 or more shared links already
						$final[$t0][$t1]++;             # Increment the shared links by 1
					}
					else{                               # If the pages don't already have a shared link
						$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
					}
				}
			}
		}
	}
	$end_time = number_format((microtime(TRUE) - $start_time), 6);
	echo "shared_link compilation time: $end_time (sec.)";
	return $final;
}