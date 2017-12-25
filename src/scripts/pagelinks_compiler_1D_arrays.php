<?php

//set_time_limit(3600);                                                    # 60 minute running limit
ini_set('memory_limit', '10048M');                              # 10 GB memory limit
//$output_file     = "../../pagelinks_final_TSV.txt";
$start_time     = microtime(TRUE);

$start_time_1 = microtime(TRUE);
$page_id_array = array_from_tsv_1D("../../page_id_tsv.txt");
$page_title_array = array_from_tsv_1D("../../page_title_tsv.txt");
$pagelinks_id_array = array_from_tsv_1D("../../pagelinks_id_tsv.txt");
$pagelinks_title_array = array_from_tsv_1D("../../pagelinks_title_tsv.txt");
$redirect_id_array = array_from_tsv_1D("../../redirect_id_tsv.txt");
$redirect_title_array = array_from_tsv_1D("../../redirect_title_tsv.txt");
echo end_time($start_time_1,"array creation");
//$redirect_ids_not_in_page=array_diff($redirect_id_array,$page_id_array);
//echo "redirect ids not in page array: ".count($redirect_ids_not_in_page)."\n";
//$redirect_titles_not_in_page=array_diff($redirect_title_array,$page_title_array);
//echo "redirect titles not in page array: ".count($redirect_titles_not_in_page)."\n";

//$pagelinks_titles_not_in_database=array_diff($pagelinks_title_array,$page_title_array,$redirect_title_array);
//$pagelinks_titles_in_database=array_diff($pagelinks_title_array,$pagelinks_titles_not_in_database);
//
//echo "pagelinks titles not in redirect or page array: ".number_format(count($pagelinks_titles_not_in_database), 0,".","," )."\n";
//echo "pagelinks titles in redirect or page array: ".number_format(count($pagelinks_titles_in_database), 0,".","," )."\n";


//file_put_contents("../../pagelinks_titles_not_in_database.txt", print_r($pagelinks_titles_not_in_database, TRUE));
//file_put_contents("../../pagelinks_titles_in_database.txt", print_r($pagelinks_titles_in_database, TRUE));
//
//$pagelinks_remaining_from_ids=array_intersect_key($page_id_array,$pagelinks_titles_in_database);
//$pagelinks_from_ids_not_in_database=array_diff($pagelinks_remaining_from_ids,$page_id_array,$redirect_id_array);
//$pagelinks_ids_in_database=array_diff($pagelinks_remaining_from_ids,$pagelinks_from_ids_not_in_database);
//echo "pagelinks from ids not in redirect or page array: ".count($pagelinks_from_ids_not_in_database)."\n";
//echo "pagelinks from ids in redirect or page array: ".count($pagelinks_ids_in_database)."\n";
//
//file_put_contents("../../pagelinks_from_ids_not_in_database.txt", print_r($pagelinks_from_ids_not_in_database, TRUE));
//file_put_contents("../../pagelinks_ids_in_database.txt", print_r($pagelinks_ids_in_database, TRUE));

$start_time_1 = microtime(TRUE);
$page_title_id_array=array_combine($page_title_array,$page_id_array);
echo end_time($start_time_1,"page_title_id_array creation");
file_put_contents("../../page_title_id_array.txt", print_r($page_title_id_array, TRUE));
echo "page_title_id_array: ".count($page_title_id_array)."\n";


//$pagelinks_titles_to_ids=array_intersect($page_title_array,$pagelinks_title_array);

//$pagelinks_titles_to_ids=array_intersect_key($page_id_array,array_intersect($pagelinks_titles_in_database,$page_title_array));
//file_put_contents("../../pagelinks_titles_to_ids.txt", print_r($pagelinks_titles_to_ids, TRUE));
//echo "pagelinks_titles_to_ids: ".number_format(count($pagelinks_titles_to_ids), 0,".","," )."\n";

//$start_time_1 = microtime(TRUE);
//$pagelinks_corrected_titles=array_replace($pagelinks_titles_in_database,array_intersect_key($pagelinks_titles_in_database,$redirect_title_array));
//echo end_time($start_time_1,"pagelinks title correction");
//file_put_contents("../../pagelinks_corrected_titles.txt", print_r($pagelinks_corrected_titles, TRUE));
//echo "pagelinks_corrected_titles: ".count($pagelinks_corrected_titles)."\n";

//$start_time_1 = microtime(TRUE);
//$pagelinks_corrected_title_ids=array_intersect($pagelinks_corrected_titles,$page_title_array);
//file_put_contents("../../pagelinks_corrected_title_ids.txt", print_r($pagelinks_corrected_title_ids, TRUE));
//
//$pagelinks_titles_to_ids=array_intersect($pagelinks_corrected_titles,$pagelinks_corrected_title_ids);
//echo end_time($start_time_1,"pagelinks title to id conversion");
//file_put_contents("../../pagelinks_titles_to_ids.txt", print_r($pagelinks_titles_to_ids, TRUE));

//$pagelinks_titles_not_in_database=array_diff(array_diff($pagelinks_title_array,$page_title_array),$redirect_title_array);
//echo "pagelinks titles not in redirect or page array: ".count($pagelinks_titles_not_in_database)."\n";
//file_put_contents("../../pagelinks_titles_not_in_database.txt", print_r($pagelinks_titles_not_in_database, TRUE));

//$page_array_diff=array_diff($page_id_array,array_keys($page_array));
//file_put_contents("../../page_array missing id.txt", print_r($page_array_diff, TRUE));

echo end_time($start_time,"Total");


function array_from_tsv_1D($tsv_path){                                                         # Parses TSV by newline
	$tsv_str = file_get_contents($tsv_path, TRUE);                            # Get tsv as string
	return explode("\n",$tsv_str);                                                  # Parese by newline
}


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