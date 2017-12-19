<?php

set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);
$page_array     = page_array_no_redirects(redirect_array());
$compiled_pagelinks = compiled_pagelinks($page_array);
//$compiled_pagelinks = file("../../pagelinks_array_sorted.txt",FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
//$array = array_map("str_getcsv", file($fileName));
//$array[] = explode(",",$line);
$pagelinks_final = get_shared_links($compiled_pagelinks);
//$pagelinks_string = implode("\n",$pagelinks_final);
#3,027,571 rows
//file_put_contents($output_file, $pagelinks_string);
file_put_contents($output_file, print_r($pagelinks_final, TRUE));
echo end_time($start_time,"total");                                          # Display the run time results

function redirect_array(){
	$start_time_1 = microtime(TRUE);
	$contents = file_get_contents("../../redirect_parsed.txt", TRUE);  # Convert the redirect_parsed tsv to a string
	$tok = strtok($contents, "\n");                                       # Split the string by token (new line)
	while($tok !== FALSE){                                                      # While a token exists, get the next full line
		$col_a = strtok("\t");                                              # Get the string to the leading tab (Page ID)
		$tok   = strtok("\n");                                               # Get the string to the next newline; update the position in the string
		$redirect_array[$col_a] = $tok;                                          # Save values to the array
	}
	echo end_time($start_time_1,"get redirects");
	return $redirect_array;
}

function page_array_no_redirects($redirect_array){
	$start_time_1 = microtime(TRUE);
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
	echo end_time($start_time_1,"page remove redirects");
	return $page_array;
}
function compiled_pagelinks($page_array){
//	echo "Page array size before flip:".count($page_array)."\n";
	file_put_contents("../../page_array_new.txt", print_r($page_array, TRUE));
	$flipped_page_array = array_flip($page_array);
	$excluded_pagelinks = array();
//	$flipped_page_array=array();
//	foreach($page_array as $key => $value){
//		$flipped_page_array=$flipped_page_array+array($value, $key);
//	}
//	$flipped_page_array=array_combine(array_values($page_array),array_keys($page_array));
	file_put_contents("../../flipped_page_array_new.txt", print_r($flipped_page_array, TRUE));
//	echo "Flipped page array size after flip:".count($flipped_page_array)."\n";
	$count = 0;
	$contents = file_get_contents("../../pagelinks_parsed.txt", TRUE);   # Convert the file to a string
	$start_time_1 = microtime(TRUE);
	$tok = strtok($contents, "\n");                                             # Split the string by token (new line)
	while ($tok !== false) {                                                          # While a token exists, get the next full line
		$col_a = strtok("\t");                                                    # Get the string to the leading tab (page_id)
		$tok = strtok("\n");
		if(isset($flipped_page_array[$tok]) && $col_a != 0){
			$page_id           = $flipped_page_array[$tok];
			$pagelinks_final[$col_a][]=$page_id;
			if(!isset($pagelinks_final[$page_id][$col_a])){
				$pagelinks_final[$page_id][] = $col_a;
			}
			$count++;
		} else {
			$excluded_pagelinks[$col_a][]= $tok;
		}
	}
	echo end_time($start_time_1,"pagelinks compilation");
//	file_put_contents("../../pagelinks_array.txt", print_r($pagelinks_final, TRUE));
//	file_put_contents("../../excluded_pagelinks.txt", print_r($excluded_pagelinks, TRUE));
//	echo 'Count: '.$count."\n";
//	foreach ($pagelinks_final as $key => $row) {
//		$from_id[$key]  = $row['from_id'];
//		$to_id[$key] = $row['to_id'];
//	}
//	array_multisort($from_id, SORT_ASC, $to_id, SORT_ASC,$pagelinks_final);
	$start_time_1 = microtime(TRUE);
//	array_multisort(array_column(array_column($pagelinks_final, 1),$pagelinks_final, 0) );
	$page_links_sorted=array();
	$t0_array   = array_keys($pagelinks_final);
	foreach($pagelinks_final as $t0 => $t1){
		sort($pagelinks_final[$t0]);
//		$pagelinks_sorted[]=$t0;
	}
	echo end_time($start_time_1,"Array sort");
//	array_multisort($pagelinks_final[0], SORT_ASC);
	
	file_put_contents("../../pagelinks_array_sorted.txt", print_r($pagelinks_final, TRUE));
	return $pagelinks_final;
}
function get_shared_links($pagelinks){
	$start_time_1 = microtime(TRUE);
	$final      = array();
	$t0_array   = array_keys($pagelinks);              # Create an array of all the T0's
	file_put_contents("../../t0_array.txt", print_r($t0_array, TRUE));
	$t0_count = count($t0_array);
	$t0_current=-1;
	foreach($t0_array as $t0){                          # Loop through each T0
		$t0_current++;
		$progress = $t0_current/$t0_count*100;
		if (fmod($progress,5) == 0){
			echo "shared_link progress: ".number_format($progress, 2)."%\n";
		}
		foreach($pagelinks[$t0] as $t1){               # Loop through each T0->T1
			if(!isset($pagelinks[$t1]) || $t1 < $t0){  # If T1 doesn't have any pages
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
	echo end_time($start_time_1,"shared_link compilation");
	return $final;
}
function end_time($start_time, $title){
	return $title." time: ".number_format((microtime(TRUE) - $start_time), 4)." seconds\n";
}