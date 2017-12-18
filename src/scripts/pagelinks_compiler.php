<?php

set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);
$page_array     = page_array_no_redirects(redirect_array());
$pagelinks_final = compiled_pagelinks($page_array);
$pagelinks_string = implode("\n",$pagelinks_final);
#3,027,571 rows
file_put_contents($output_file, $pagelinks_string);
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
			$pagelinks_final[] = $page_id . "\t" . $col_a;
			$count++;
		}
	}
	echo 'Count: '.$count."\n";
	return $pagelinks_final;
}
function pagelinks_reversed_appended($page_links){
	$flipped_page_array=array_flip($page_links);
	return $page_links + $flipped_page_array;
}