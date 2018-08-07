<?php
$search_term = "test appl";
$title_arr = ["apple", "apple pie", "apple strudel"];
$weight_arr = Array();

function get_weights($search_term, $title_arr){
	foreach($title_arr as $title){
		$split_search_arr = explode(" ", $search_term);
		$unmatched_chars = strlen(str_replace(' ','',str_ireplace($split_search_arr,'',$title)));
		$title_chars = strlen(str_replace(' ','',$title));
		$weight = ($title_chars-$unmatched_chars)/$title_chars;
		$weight_arr[(string)$weight][]=$title;
	}
	return $weight_arr;
}

echo "<pre>".'weight array: '.print_r(get_weights($search_term, $title_arr), true)."</pre>";

?>