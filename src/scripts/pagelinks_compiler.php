<?php

//set_time_limit(3600);                                                 # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);

//create page_array
//$start_time_1 = microtime(TRUE);
//$page_array = array_from_tsv_1D_rev("../../page_parsed.txt");
//echo end_time($start_time_1,"page_array creation");
//echo "page_array: ".number_format(count($page_array))."\n";
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../page_array.txt", print_r($page_array, TRUE));
//echo end_time($start_time_1,"write page_array to file");

//create redirect_array
$start_time_1 = microtime(TRUE);
$redirect_array = array_from_tsv_1D_rev("../../redirect_parsed.txt");
echo end_time($start_time_1,"redirect_array creation");
echo "redirect_array: ".number_format(count($redirect_array))."\n";
$start_time_1 = microtime(TRUE);
file_put_contents("../../redirect_array.txt", print_r($redirect_array, TRUE));
echo end_time($start_time_1,"write redirect_array to file");

echo end_time($start_time,"Total");

function array_from_tsv($tsv_path){                                                         # Parses TSV(key.'\t'.val.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$key = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$val = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array[$key][] =  $val;                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_rev($tsv_path){                                                         # Parses TSV(val.'\t'.key.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$val = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$key = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array[$key][] =  $val;                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_1D($tsv_path){                                                         # Parses TSV(key.'\t'.val.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$key = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$val = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array[$key]=  $val ;                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_1D_rev($tsv_path){                                                         # Parses TSV(val.'\t'.key.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$val = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$key = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array[$key]=  $val ;                                              # Save values to the array
	}
	return $output_array;
}

//$start_time_1 = microtime(TRUE);
//$page_id_array=explode("\n",file_get_contents("../../page_id_tsv.txt"));
//$page_title_array=explode("\n",file_get_contents("../../page_title_tsv.txt"));

//echo end_time($start_time_1,"page_title_array creation");
//file_put_contents("../../page_id_array.txt", print_r($page_id_array, TRUE));
//file_put_contents("../../page_title_array.txt", print_r($page_title_array, TRUE));
//
//echo "Page ids in page_parsed: ".count($page_array)."\n";
//echo "Page ids in page_id_array: ".count($page_id_array)."\n";
//echo "Page ids in page_title_array: ".count($page_title_array)."\n";
//$page_array_diff=array_diff($page_id_array,array_keys($page_array));
//file_put_contents("../../page_array missing id.txt", print_r($page_array_diff, TRUE));

//$start_time_1 = microtime(TRUE);
//$redirect_array = array_from_tsv_1D("../../redirect_parsed.txt");
//echo end_time($start_time_1,"redirect_array creation");
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../redirect_array.txt", print_r($redirect_array, TRUE));
//echo end_time($start_time_1,"write redirect_array to file");
//
//$start_time_1 = microtime(TRUE);
//$page_no_redirects = array_diff_key($page_array,$redirect_array);
//echo end_time($start_time_1,"page remove redirects");
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../page_no_redirects.txt", print_r($page_no_redirects, TRUE));
//echo end_time($start_time_1,"write page_no_redirects to file");
//
//$start_time_1 = microtime(TRUE);
//$pagelinks_array = array_from_tsv("../../pagelinks_parsed.txt");
//echo end_time($start_time_1,"pagelinks_array creation");
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../pagelinks_array.txt", print_r($pagelinks_array, TRUE));
//echo end_time($start_time_1,"write pagelinks_array to file");
//
//$start_time_1 = microtime(TRUE);
//$pagelinks_no_redirects = array_diff_key($pagelinks_array,$redirect_array);
//echo end_time($start_time_1,"get pagelinks without redirect from_ids");
//echo "Pagelinks without redirect from_ids: ".count($pagelinks_no_redirects)."\n";
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../pagelinks_no_redirects.txt", print_r($pagelinks_no_redirects, TRUE));
//echo end_time($start_time_1,"write pagelinks_no_redirects to file");
//
//$start_time_1 = microtime(TRUE);
//$pagelinks_in_redirects = array_intersect_key($pagelinks_array,$redirect_array);
//echo end_time($start_time_1,"get pagelinks with redirect from_ids");
//echo "Pagelinks with redirect from_ids: ".count($pagelinks_in_redirects)."\n";
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../pagelinks_in_redirects.txt", print_r($pagelinks_no_redirects, TRUE));
//echo end_time($start_time_1,"write pagelinks_in_redirects to file");
//
//$start_time_1 = microtime(TRUE);
//$redirects_in_pagelinks = array_intersect_key($redirect_array,$pagelinks_array);
//echo end_time($start_time_1,"get redirects with from_ids in pagelinks");
//echo "Redirects with from_ids in pagelinks: ".count($redirects_in_pagelinks)."\n";
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../redirects_in_pagelinks.txt", print_r($pagelinks_no_redirects, TRUE));
//echo end_time($start_time_1,"write redirects_in_pagelinks to file");
//
//$start_time_1 = microtime(TRUE);
//$pagelinks_redirects_merged =array_merge($pagelinks_in_redirects, $redirects_in_pagelinks);
//echo end_time($start_time_1,"merge pagelinks redirect ids with redirect titles");
//echo "Merged redirects with from_ids in pagelinks: ".count($pagelinks_redirects_merged)."\n";
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../pagelinks_redirects_merged.txt", print_r($pagelinks_redirects_merged, TRUE));
//echo end_time($start_time_1,"write pagelinks_redirects_merged to file");
//
//
//$start_time_1 = microtime(TRUE);
//$pagelinks_redirects_replaced = array_combine($pagelinks_redirects_merged, $pagelinks_in_redirects);
//echo end_time($start_time_1,"replace pagelinks redirect ids with redirect titles");
//$start_time_1 = microtime(TRUE);
//file_put_contents("../../pagelinks_redirects_replaced.txt", print_r($pagelinks_redirects_replaced, TRUE));
//echo end_time($start_time_1,"write pagelinks_redirects_replaced to file");



//function page_array_no_redirects($redirect_array){
//	file_put_contents("../../redirect_array.txt", print_r($redirect_array, TRUE));
//
//	$contents   = file_get_contents("../../page_parsed.txt", TRUE);          # Convert page_parsed tsv to a string
//	$start_time_1 = microtime(TRUE);
//	$tok        = strtok($contents, "\n");                                             # Split the string by token (new line)
//	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
//		$col_a = strtok("\t");                                                           # Get the string to the leading tab (Page ID)
//		$tok   = strtok("\n");                                                           # Get the string to the next newline; update the position in the string
////		if(!isset($redirect_array[$col_a])){
////			$page_array["'".$tok."'"] = $col_a;
////			continue;
////		}
//		$page_array[$col_a] = "'".$tok."'";
//	}
//	echo end_time($start_time_1,"page array created");
//	$start_time_1=microtime(true);
//	$page_array = array_diff_key($page_array,$redirect_array);
//	echo end_time($start_time_1,"page remove redirects");
//	file_put_contents("../../page_array_new.txt", print_r($page_array, TRUE));
//	return $page_array;
//}

//function compiled_pagelinks($page_array, $redirect_array){
//	$total_count=0;
//	$accepted_count = 0;
//	$excluded_count=0;
//	$contents = file_get_contents("../../pagelinks_parsed.txt", TRUE);   # Convert the file to a string
//	$start_time_1 = microtime(TRUE);
//	$tok = strtok($contents, "\n");                                   # Split the string by token (new line)
//	var_dump($tok);
//	while ($tok !== false) {                                                # While a token exists, get the next full line
//		$from_page_id = strtok("\t");                                   # Get the string up to the tab (from_page_id)
//		$to_page_title = $tok = strtok("\n");                                  # Get the string to the newline (to_page_title)
//		$pagelinks_all[$from_page_id][]="'".$to_page_title."'";
//		if(isset($page_array["'".$to_page_title."'"]) && !isset($redirect_array[$from_page_id])){
//			$total_count++;
//			$to_page_id                   = $page_array["'".$to_page_title."'"];
//			$pagelinks[$from_page_id][] = $to_page_id;
//			if(!isset($pagelinks[$to_page_id][$from_page_id])){
//				$total_count++;
//				$pagelinks[$to_page_id][] = $from_page_id;
//			}
//			$accepted_count++;
//		} else {
//			$excluded_pagelinks[$from_page_id][]="'".$to_page_title."'";
//			$excluded_count++;
//		}
//	}
//	$start_time_1=microtime(true);
//	$pagelinks_array = array_diff_key($pagelinks_all,$redirect_array);
//	echo end_time($start_time_1,"pagelinks compilation");
//	file_put_contents("../../excluded_pagelinks.txt", print_r($excluded_pagelinks, TRUE));
//	ksort($excluded_pagelinks);
//	file_put_contents("../../excluded_pagelinks_sorted.txt", print_r($excluded_pagelinks, TRUE));
//	ksort($pagelinks_all);
//	file_put_contents("../../pagelinks_all_sorted.txt", print_r($pagelinks_all, TRUE));
//	file_put_contents("../../pagelinks_pre_sort.txt", print_r($pagelinks, TRUE));
//	echo "Accepted pagelinks: ".$accepted_count."\n";
//	echo "Excluded pagelinks: ".$excluded_count."\n";
//	$start_time_1 = microtime(TRUE);
//	foreach($pagelinks as $t0 => $t1){
//		sort($pagelinks[$t0]);
//	}
//	ksort($pagelinks);
//	echo end_time($start_time_1,"Array sort");
//	file_put_contents("../../pagelinks_post_sort.txt", print_r($pagelinks, TRUE));
//	return array($pagelinks, $total_count);
//}
function get_shared_links($pagelinks, $total_count){
	$start_time_1 = microtime(TRUE);
	$final      = array();
	$current_count=0;
	foreach(array_keys($pagelinks) as $t0){                          # Loop through each T0
		$current_count=$current_count + count($pagelinks[$t0]);
		$progress = ($current_count/$total_count)*100;
		if (fmod($current_count,10000) == 0){
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