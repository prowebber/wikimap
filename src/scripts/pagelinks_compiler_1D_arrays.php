<?php

//set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
//$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);

//Benchmarks
//array creation time: 5.5243 seconds
//redirect_titles creation time: 7.5771 seconds
//redirect_titles: 8,209,527
//pages creation time: 5.6965 seconds
//pages: 13,607,098
//redirects creation time: 5.7085 seconds
//replaced_page_ids: 13,607,098
//corrected_pages creation time: 11.9102 seconds
//corrected_pages: 13,607,098
//pagelinks_titles_in_page: 12,169,528
//final_pagelinks creation time: 43.2935 seconds
//final_pagelinks: 24,339,056

$start_time_1 = microtime(TRUE);
$page_ids = array_1D_from_tsv("../../page_id_tsv.txt");
$page_titles = array_1D_from_tsv("../../page_title_tsv.txt");
$redirect_ids = array_1D_from_tsv("../../redirect_id_tsv.txt");
$redirect_titles = array_1D_from_tsv("../../redirect_title_tsv.txt");
echo end_time($start_time_1,"array creation");

// Remove redirect_titles not in page_titles (since there would be no correct_id for them)
$start_time_1 = microtime(TRUE);
$redirect_titles=array_diff_key($redirect_titles,array_diff($redirect_titles,$page_titles));
echo end_time($start_time_1,"redirect_titles creation");
echo "redirect_titles: ".number_format(count($redirect_titles))."\n";

// Combine page_ids and page_titles to make pages(page_title => page_id)
$start_time_1 = microtime(TRUE);
foreach($page_ids as $k => $v){
	$pages[$page_titles[$k]]=$v;
}
echo end_time($start_time_1,"pages creation");
//file_put_contents("../../pages.txt", print_r($pages, TRUE));
echo "pages: ".number_format(count($pages))."\n";

// Create redirects(from_id => correct_id) to use for pagelinks
$start_time_1 = microtime(TRUE);
foreach($redirect_titles as $k => $v){
	$redirects[$redirect_ids[$k]]=$pages[$v];
}
echo end_time($start_time_1,"redirects creation");
unset($redirect_titles, $redirect_ids);
//file_put_contents("../../redirects.txt", print_r($redirects, TRUE));

// Replace pages(title,id) with redirects(from_id, correct_id) to create correct_pages(title, correct_id)
$start_time_1 = microtime(TRUE);
$page_ids_temp=array_combine($page_ids,$page_ids);
$replaced_page_ids=array_replace($page_ids_temp, array_diff_key($redirects,array_diff_key($redirects,$page_ids_temp)));
echo "replaced_page_ids: ".number_format(count($replaced_page_ids))."\n";

foreach($pages as $k => $v){
	$corrected_pages[$k] = $replaced_page_ids[$v];
}
echo end_time($start_time_1,"corrected_pages creation");
//file_put_contents("../../corrected_pages.txt", print_r($corrected_pages, TRUE));
echo "corrected_pages: ".number_format(count($corrected_pages))."\n";
unset($page_ids_temp,$replaced_page_ids);

$pagelinks_ids = array_1D_from_tsv("../../pagelinks_id_tsv.txt");
$pagelinks_titles = array_1D_from_tsv("../../pagelinks_title_tsv.txt");

// Remove pagelinks_titles not found in page_titles
$pagelinks_titles_in_page=array_diff_key($pagelinks_titles,array_diff($pagelinks_titles,$page_titles));
echo "pagelinks_titles_in_page: ".number_format(count($pagelinks_titles_in_page))."\n";
//file_put_contents("../../pagelinks_titles_in_page.txt", print_r($pagelinks_titles_in_page, TRUE));

// Replace pagelinks_ids with redirect_ids if found and every pagelinks_title with correct_id
$pagelinks_count=0;
$start_time_1 = microtime(TRUE);
foreach($pagelinks_titles_in_page as $k => $v){
	if(isset($redirects[$pagelinks_ids[$k]])){
		$final_pagelinks[$redirects[$pagelinks_ids[$k]]][] = $corrected_pages[$v];
		$final_pagelinks[$corrected_pages[$v]][] = $redirects[$pagelinks_ids[$k]];
    } else {
		$final_pagelinks[$pagelinks_ids[$k]][] = $corrected_pages[$v];
		$final_pagelinks[$corrected_pages[$v]][] = $pagelinks_ids[$k] ;
	}
	$pagelinks_count++;
}
unset($pagelinks_ids,$corrected_pages,$redirects,$pagelinks_titles_in_page,$pagelinks_titles);
echo end_time($start_time_1,"final_pagelinks creation");
file_put_contents("../../final_pagelinks.txt", json_encode($final_pagelinks));
echo "final_pagelinks: ".number_format($pagelinks_count)."\n";
$final_pagelinks =json_decode(file_get_contents("../../final_pagelinks.txt"), true);
//ksort($final_pagelinks);
//file_put_contents("../../final_pagelinks_decoded.txt", print_r($final_pagelinks,true));
$pagelinks_count = count($final_pagelinks,COUNT_RECURSIVE);
echo "pagelinks_count: ".number_format($pagelinks_count)."\n";
$start_time_1 = microtime(TRUE);
$final_arr = get_shared_links($final_pagelinks, $pagelinks_count);
//file_put_contents("../../final_arr.txt", print_r($final_arr, TRUE));

echo end_time($start_time,"Total");

function get_shared_links($pagelinks, $total_count){
	$start_time_1 = microtime(TRUE);
	$final      = array();
	$current_count=0;
	foreach($pagelinks as $t0 => $t1_arr){                          # Loop through each T0
		$current_count=$current_count + count($t1_arr);
//		echo "current_count: ".$current_count."\n";
		$progress = ($current_count/$total_count)*100;
		if (fmod($current_count,1000) == 0){
			echo "shared_link progress: ".number_format($progress, 2)."%\n";
//			file_put_contents("../../pagelinks_shared_links.txt", json_encode($final));
		}
		foreach($t1_arr as $t1){             # Loop through each T0->T1
			if($t1 < $t0){                   # If T1 has already been finished
				continue;                    # Skip
			}
			$shared_count=count(array_diff_key($t1_arr,array_diff($t1_arr,$pagelinks[$t1])));
			$final[$t0][$t1] = $shared_count;
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
	file_put_contents("../../pagelinks_shared_links.txt", json_encode($final));
	return $final;
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