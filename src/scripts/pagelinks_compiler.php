<?php

//set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);
$redirect_array = redirect_array();
$page_array     = page_array_no_redirects($redirect_array);
$compiled_pagelinks = compiled_pagelinks($page_array,$redirect_array);
//$compiled_pagelinks = file("../../pagelinks_array_sorted.txt",FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$pagelinks_final = get_shared_links($compiled_pagelinks[0],$compiled_pagelinks[1]);
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
		$redirect_array[$col_a] = "'" . $tok . "'";                                          # Save values to the array
	}
	echo end_time($start_time_1,"get redirects");
	return $redirect_array;
}
function page_array_no_redirects($redirect_array){
	file_put_contents("../../redirect_array.txt", print_r($redirect_array, TRUE));
	$start_time_1 = microtime(TRUE);
	$contents   = file_get_contents("../../page_parsed.txt", TRUE);          # Convert page_parsed tsv to a string
	$tok        = strtok($contents, "\n");                                             # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$col_a = strtok("\t");                                                           # Get the string to the leading tab (Page ID)
		$tok   = strtok("\n");                                                           # Get the string to the next newline; update the position in the string
		if(!isset($redirect_array[$col_a])){
			$page_array["'".$tok."'"] = $col_a;
			continue;
		}
	}
	echo end_time($start_time_1,"page remove redirects");
	file_put_contents("../../page_array_new.txt", print_r($page_array, TRUE));
	return $page_array;
}

function compiled_pagelinks($page_array, $redirect_array){
	$total_count=0;
	$accepted_count = 0;
	$excluded_count=0;
	$contents = file_get_contents("../../pagelinks_parsed.txt", TRUE);   # Convert the file to a string
	$start_time_1 = microtime(TRUE);
	$tok = strtok($contents, "\n");                                   # Split the string by token (new line)
	while ($tok !== false) {                                                # While a token exists, get the next full line
		$from_page_id = strtok("\t");                                   # Get the string up to the tab (from_page_id)
		$to_page_title = $tok = strtok("\n");                                  # Get the string to the newline (to_page_title)
		$pagelinks_all[$from_page_id][]="'".$to_page_title."'";
		if(isset($page_array["'".$to_page_title."'"]) && !isset($redirect_array[$from_page_id])){
			$total_count++;
			$to_page_id                   = $page_array["'".$to_page_title."'"];
			$pagelinks[$from_page_id][] = $to_page_id;
			if(!isset($pagelinks[$to_page_id][$from_page_id])){
				$total_count++;
				$pagelinks[$to_page_id][] = $from_page_id;
			}
			$accepted_count++;
		} else {
			$excluded_pagelinks[$from_page_id][]="'".$to_page_title."'";
			$excluded_count++;
		}
	}
	echo end_time($start_time_1,"pagelinks compilation");
	file_put_contents("../../excluded_pagelinks.txt", print_r($excluded_pagelinks, TRUE));
	ksort($excluded_pagelinks);
	file_put_contents("../../excluded_pagelinks_sorted.txt", print_r($excluded_pagelinks, TRUE));
	ksort($pagelinks_all);
	file_put_contents("../../pagelinks_all_sorted.txt", print_r($pagelinks_all, TRUE));
	file_put_contents("../../pagelinks_pre_sort.txt", print_r($pagelinks, TRUE));
	echo "Accepted pagelinks: ".$accepted_count."\n";
	echo "Excluded pagelinks: ".$excluded_count."\n";
	$start_time_1 = microtime(TRUE);
	foreach($pagelinks as $t0 => $t1){
		sort($pagelinks[$t0]);
	}
	ksort($pagelinks);
	echo end_time($start_time_1,"Array sort");
	file_put_contents("../../pagelinks_post_sort.txt", print_r($pagelinks, TRUE));
	return array($pagelinks, $total_count);
}
function get_shared_links($pagelinks, $total_count){
	$start_time_1 = microtime(TRUE);
	$final      = array();
//	$t0_count = count(array_keys($pagelinks));
	$current_count=0;
	foreach(array_keys($pagelinks) as $t0){                          # Loop through each T0
		$current_count=$current_count + count($pagelinks[$t0]);
		$progress = ($current_count/$total_count)*100;
		if (fmod($current_count,1000) == 0){
			echo "shared_link progress: ".number_format($progress, 2)."%\n";
			file_put_contents("../../pagelinks_shared_links.txt", print_r($final, TRUE));
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