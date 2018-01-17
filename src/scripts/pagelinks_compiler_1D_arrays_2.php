<?php

//set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
//$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);

// Create initial 1D arrays array(n => value) from page and redirect TSVs
$start_time_1 = microtime(TRUE);
$page_ids = array_1D_from_tsv("../../page_id_tsv.txt");
$page_titles = array_1D_from_tsv("../../page_title_tsv.txt");
$redirect_ids = array_1D_from_tsv("../../redirect_id_tsv.txt");
$redirect_titles = array_1D_from_tsv("../../redirect_title_tsv.txt");
echo end_time($start_time_1,"array creation");

//// Remove redirect_titles not in page_titles (since there would be no correct_id for them)
//$start_time_1 = microtime(TRUE);
//$redirect_titles=array_diff($redirect_titles,array_diff($redirect_titles,$page_titles));
//echo end_time($start_time_1,"redirect_titles creation");
//echo "redirect_titles: ".number_format(count($redirect_titles))."\n";
//
//// Combine page_ids and page_titles to make pages(page_title => page_id)
//$start_time_1 = microtime(TRUE);
//$pages = array_combine($page_titles,$page_ids);
//echo end_time($start_time_1,"pages creation");
//echo "pages: ".number_format(count($pages))."\n";
//
//// Create redirects(from_id => correct_id) to use for pagelinks using redirect_titles (correct) and pages
//$start_time_1 = microtime(TRUE);
//foreach($redirect_titles as $k => $v){
//	$redirects[$redirect_ids[$k]]=$pages[$v];
//}
//echo end_time($start_time_1,"redirects creation");
//unset($redirect_titles);                 # Clean memory of redirect 1D arrays since not needed
//
//// Replace pages(title,id) with redirects(from_id, correct_id) to create correct_pages(title, correct_id)
//$start_time_1 = microtime(TRUE);
//foreach($page_ids as $k => $v){
//	if(isset($redirects[$v])){
//		$corrected_pages[$page_titles[$k]] = $redirects[$v];
//	} else {
//		$corrected_pages[$page_titles[$k]] = $v;
//	}
//}
//echo end_time($start_time_1,"corrected_pages creation");
//
//$pagelinks_ids = array_1D_from_tsv("../../pagelinks_id_tsv.txt");
//$pagelinks_titles = array_1D_from_tsv("../../pagelinks_title_tsv.txt");
////		// Understand which pagelinks_ids are not found in page or redirects
////		$start_time_1 = microtime(TRUE);
//		$pagelinks_ids_not_found=array_diff($pagelinks_ids,$page_ids,$redirect_ids);
////		echo end_time($start_time_1,"array_diff pagelinks_ids_not_found");
////		file_put_contents("../../pagelinks_ids_not_found.txt", print_r($pagelinks_ids_not_found, TRUE));
////		echo "pagelinks_ids_not_found: ".number_format(count($pagelinks_ids_not_found))."\n";
////
////		$start_time_1 = microtime(TRUE);
////		$redirects=array_combine($redirect_ids,$redirect_titles);
////		$pages_rev=array_combine($page_ids,$page_titles);
////		foreach($pagelinks_ids as $k=>$v){
////			if(!isset($pages_rev[$v]) && !isset($redirects[$v])){
////				$not_found_pagelinks_ids[$v]=1;
////			}
////		}
////		echo end_time($start_time_1,"loop pagelinks_ids_not_found");
////		file_put_contents("../../not_found_pagelinks_ids.txt", print_r($not_found_pagelinks_ids, TRUE));
////		echo "not_found_pagelinks_ids: ".number_format(count($not_found_pagelinks_ids))."\n";
//$pagelinks_ids=array_diff_key($pagelinks_ids,$pagelinks_ids_not_found);
//echo "pagelinks_found_from_ids: ".number_format(count($pagelinks_ids))."\n";
//$pagelinks_titles=array_diff_key($pagelinks_titles,$pagelinks_ids_not_found);
//// Remove pagelinks_titles not found in page_titles (since there will be no correct_id to replace them with)
//$start_time_1 = microtime(TRUE);
//$pagelinks_titles_in_page=array_diff_key($pagelinks_titles,array_diff($pagelinks_titles,$page_titles));
//echo end_time($start_time_1,"pagelinks_titles_in_page creation");
//echo "pagelinks_titles_in_page: ".number_format(count($pagelinks_titles_in_page))."\n";
////file_put_contents("../../pagelinks_titles_in_page.txt", print_r($pagelinks_titles_in_page, TRUE));
//// Replace pagelinks_ids with redirect_ids if found and every pagelinks_title with correct_id
//$pagelinks_count=0;
//$start_time_1 = microtime(TRUE);
//foreach($pagelinks_titles_in_page as $k => $v){
//	$to_id = $corrected_pages[$v];
//	$from_id = $pagelinks_ids[$k];
//	if(isset($redirects[$from_id])){
//		$final_pagelinks[$redirects[$from_id]][$to_id] = 1;
//		$final_pagelinks[$to_id][$redirects[$from_id]] = 1;
//	} else {
//		$final_pagelinks[$from_id][$to_id] = 1;
//		$final_pagelinks[$to_id][$from_id] = 1;
//	}
//	$pagelinks_count++;
//	$pagelinks_count++;
//}
//echo end_time($start_time_1,"final_pagelinks creation");
//echo "final_pagelinks: ".number_format(count($final_pagelinks))."\n";
//unset($pagelinks_ids,$corrected_pages,$redirects,$pagelinks_titles_in_page,$pagelinks_titles);
//$pages_rev = array_flip($pages);
//unset($pages, $corrected_pages);
////foreach($final_pagelinks as $t0 => $t1_arr){
////	if(isset($pages_rev[$t0])){
////		$total_found_links[$pages_rev[$t0]]=count($t1_arr);
////	} else {
////		$total_unfound_links[$t0]=count($t1_arr);
////	}
////}
////asort($total_found_links,SORT_NUMERIC);
////asort($total_unfound_links,SORT_NUMERIC);
//
////file_put_contents("../../total_found_links.txt", print_r($total_found_links,true));
////file_put_contents("../../total_unfound_links.txt", print_r($total_unfound_links,true));
//
//
//$start_time_1 = microtime(TRUE);
//foreach($final_pagelinks as $t0 => $t1_arr){
//	krsort($final_pagelinks[$t0],SORT_NUMERIC);
//}
//echo end_time($start_time_1,"final_pagelinks t1 sort");
//
//$start_time_1 = microtime(TRUE);
//ksort($final_pagelinks,SORT_NUMERIC);
//echo end_time($start_time_1,"final_pagelinks t0 sort");
//file_put_contents("../../final_pagelinks_json.txt", json_encode($final_pagelinks));
//file_put_contents("../../final_pagelinks.txt", print_r($final_pagelinks,true));
//exit;
//		// Understand why Celsius has so many links
//		$redirects=array_combine($redirect_ids,$redirect_titles);
//		foreach($page_ids as $k => $v){
//			if(isset($redirects[$v])){
//				$pages_rev[$v] = $redirects[$v];
//			} else{
//				$pages_rev[$v] = $page_titles[$k];
//			}
//		}
//		//file_put_contents("../../pages_rev.txt", print_r($pages_rev, TRUE));
//		$final_pagelinks=json_decode(file_get_contents("../../final_pagelinks_json.txt"),true);
//		foreach($final_pagelinks[19593040] as $k => $v){
//			if(isset($pages_rev[$k])){
//				$celsius_array['Celsius'][$k]=$pages_rev[$k];
//			} else{
//				$celsius_array['Celsius'][$k]=1;
//			}
//		}
//		file_put_contents("../../celsius_array.txt", print_r($celsius_array, TRUE));
//		exit;
//      Build pages_rev array to be used to get titles
		$redirects=array_combine($redirect_ids,$redirect_titles);
		foreach($page_ids as $k => $v){
			if(isset($redirects[$v])){
				$pages_rev[$v] = $redirects[$v];
			} else{
				$pages_rev[$v] = $page_titles[$k];
			}
		}
		unset($redirect_titles, $redirect_ids, $redirects, $page_titles, $page_ids);
$final_pagelinks=json_decode(file_get_contents("../../final_pagelinks_json.txt"),true);
$pagelinks_count = count($final_pagelinks,COUNT_RECURSIVE);
echo "pagelinks_count: ".number_format($pagelinks_count)."\n";
$start_time_1 = microtime(TRUE);
$final_arr = get_shared_links($final_pagelinks, $pagelinks_count, $pages_rev);
//file_put_contents("../../final_arr.txt", print_r($final_arr, TRUE));

echo end_time($start_time,"Total");

function get_shared_links($pagelinks, $total_count, $pages_rev){
	$start_time_1 = microtime(TRUE);
	$final      = array();
	$current_count=0;
	foreach($pagelinks as $t0 => $t1_arr){                          # Loop through each T0
//		$current_count=$current_count + count($t1_arr);
		$progress = ($current_count/$total_count)*100;
//		echo "shared_link progress: ".number_format($progress, 2)."%\n";
		if (fmod($current_count,1000) == 0){
			echo "shared_link progress: ".number_format($progress, 2)."%\n";
			file_put_contents("../../final.txt", print_r($final, TRUE));
		}
//		foreach($t1_arr as $t1 => $v){               # Loop through each T0->T1
//			if($t1 < $t0){                     # If T1 has already been finished
////				echo "skipped."."\n";
//				$current_count++;
//				continue;                      # Skip
//			}
//			foreach($pagelinks[$t1] as $t2){           # Loop through each T1->T2
//				$final[$t0][$t1] = $v;
//				if(isset($t1_arr[$t2])){       # If a link shared between T0 and T2 exists
//					if(isset($final[$t0][$t1])){        # If the pages have 1 or more shared links already
//						$final[$t0][$t1]++;             # Increment the shared links by 1
//					}
//					else{                               # If the pages don't already have a shared link
//						$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
//					}
//				}
//			}
//			$current_count++;
//		}
		foreach($t1_arr as $t1 => $v){             # Loop through each T0->T1
			if($t1 < $t0){                   # If T1 has already been finished
				$current_count++;
				break;                    # Skip
			}
			$shared_count=count(array_diff_key($t1_arr,array_diff_key($t1_arr,$pagelinks[$t1])));
			$final[$pages_rev[$t0]][$pages_rev[$t1]] = $shared_count;
			$current_count++;
		}

//		foreach($t1_arr as $t1){               # Loop through each T0->T1
//			if($t1 < $t0){                     # If T1 has already been finished
//				continue;                      # Skip
//			}
//			foreach($pagelinks[$t1] as $t2){           # Loop through each T1->T2
//				if(isset($pagelinks[$t0][$t2])){       # If a link shared between T0 and T2 exists
//					if(isset($final[$t0][$t1])){        # If the pages have 1 or more shared links already
//						$final[$t0][$t1]++;             # Increment the shared links by 1
//					}
//					else{                               # If the pages don't already have a shared link
//						$final[$t0][$t1] = 1;           # Specify the pages as having 1 shared link
//					}
//				}
//			}
//		}
	}
	echo end_time($start_time_1,"shared_link compilation");
	file_put_contents("../../final.txt", print_r($final, TRUE));
	file_put_contents("../../pagelinks_shared_links.txt", json_encode($final));
	return $final;
}

function hash_map_diff($a, $b) {
	$map = $out = array();
	foreach($a as $val) $map[$val] = 1;
	foreach($b as $val) if(isset($map[$val])) $map[$val] = 0;
	foreach($map as $val => $ok) if($ok) $out[] = $val;
	return $out;
}

function array_1D_from_tsv($tsv_path){                                                         # Parses TSV by newline
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Get tsv as string
	return explode("\n",$tsv_str);                                                  # Parese by newline
}
function array_from_tsv($tsv_path){                                                         # Parses TSV(key.'\t'.val.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$key = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$val = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array["'".$key."'"][] =  "'".$val."'";                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_rev($tsv_path){                                                         # Parses TSV(val.'\t'.key.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$val = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$key = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array["'".$key."'"][] =  "'".$val."'";                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_1D($tsv_path){                                                         # Parses TSV(key.'\t'.val.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$key = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$val = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array["'".$key."'"]=  "'".$val."'" ;                                              # Save values to the array
	}
	return $output_array;
}
function array_from_tsv_1D_rev($tsv_path){                                                         # Parses TSV(val.'\t'.key.'\n') into an assoc. array(key=>'val') using strtok and tab/newline as delimiters
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Convert the redirect_parsed tsv to a string
	$tok = strtok($tsv_str, "\n");                                                    # Split the string by token (new line)
	while($tok !== FALSE){                                                                   # While a token exists, get the next full line
		$val = strtok("\t");                                                             # Get the string to the leading tab (Page ID)
		$key = $tok   = strtok("\n");                                                    # Get value; update the position in the string to the next newline
		$output_array["'".$key."'"]=  "'".$val."'" ;                                              # Save values to the array
	}
	return $output_array;
}
function end_time($start_time, $title){
	return $title." time: ".number_format((microtime(TRUE) - $start_time), 4)." seconds\n";
}