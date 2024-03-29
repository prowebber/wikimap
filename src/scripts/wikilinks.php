<?php

namespace datapeak\public_html\src\scripts;

use datapeak\public_html\sphinx\Sphinx_Shit;
use datapeak\server\classes\SQL_Database;

include $_SERVER['DOCUMENT_ROOT'] . "/config.php";
ini_set('max_execution_time', 300);     # Set the maximum script execution time to 300 seconds (5 min.)

// Allows purewebber.com to send requests to src.purewebber.com
$http_origin = $_SERVER['HTTP_ORIGIN'];
if ($http_origin == "http://purewebber.test" || $http_origin == "https://purewebber.com" || $http_origin == "https://prowebber.github.io") {
    header("Access-Control-Allow-Origin: $http_origin");
}

class Fetch_Ajax_Script_Multi
{
    public $starting_node;          # For testing
    public $execution_time = array();

    public $used_page_title;


    public function __construct()
    {
	    $this->db = new SQL_Database(WORKSTATION_DB);
    }


    /**
     * Start Here
     *
     * @param $post_data        An array of data being fed from the user's submit action
     */
    public function classConfig($post_data)
    {
        if (!isset($post_data['server_class'])) {
            return;
        }

        $class_name = $post_data['server_class'];       # Get the name of the class to be loaded
        $this->$class_name($post_data);                 # Calls that function
    }


    public function extendTiers($post_data)
    {
        $history = json_decode($post_data['history'], TRUE);
//		$prev_results = json_decode($post_data['prev_results'], TRUE);

//		echo "<pre>" . print_r($history, TRUE) . "</pre>";
        $this->fetchMultiData(array(), $history);
    }


    public function fetchMultiData($post_data, $history = array())
    {
        $start_time = microtime(TRUE);
        $user_input = $post_data['user_input'] ?? 'HTTP_404';                           # Default to 'HTTP_404' if not found
        $max_tiers = $post_data['max_tiers'] ?? 5;                                     # Default to 5 tiers
        $prev_results = array();
        $nodes_per_tier = 5;
        $min_shared_links = 0;
        $max_shared_links = 0;
        $is_history_request = 0;            # for testing

        // First Request
        if (empty($history)) {                                        # If there is the initial request (no history)
            $this->starting_node = 'test';
            $node_counter = 0;
            $links_counter = 0;                                     # Initialize int variables
            $target_data = $this->getPageId($user_input);         # Use the user's input to grab the correct page_id
            $T0_page_id = $target_data['page_id'];
            $T0_page_title = $target_data['page_title'];
	        $all_history = array();
	        $t0_array = $t1_array = $data = array();             # Initialize arrays
            $t0_array[0] = $T0_page_id;
        } // Subsequent Requests
        else {                                                       # If it is an extended request
            $this->starting_node = NULL;
            $data = $history['results'];
            $new_data = array();
	        $all_history = $history['all_history'];
            $node_counter = $history['node_counter'];
            $links_counter = $history['links_counter'];
            $t0_array = array_keys($history['prev_tier']);    # Nodes/links from prev request
            $is_history_request = 1;
            $max_tiers = 1;                                   # Only load 1 more tier per extend request
	        $T0_page_title = "WIKII";
        }

//		$T0_pretty_page_title       = $this->makeTitleReadable($T0_page_title);

        $max_visible_nodes_per_tier = 4;
	    
        for ($tier = 0; $tier < $max_tiers; $tier++) {                                                    # Loop through each max tier
            $temp_array = array();
            $prev_tier_array = array();
            foreach ($t0_array as $t0) {                                                                  # Loop through all the T0's
                if (!array_key_exists($t0, $all_history)) {                                                   # If t0 not in history, avoids data being queried for same t0 twice
	                $all_history[$t0] = array();                                                            # Add to history

                    if ($node_counter == 0) {                                                             # On initial T0
                        $data['nodes'][$node_counter]['id'] = $t0;                           # Set nodes[0] = T0_page_id
                        $data['nodes'][$node_counter]['name'] = $T0_page_title;
                        $data['nodes'][$node_counter]['color'] = 0xffffff;
                        $node_counter++;
	                    $all_history['nodes'][$t0] = $target_data['total_connections'];             # Add total_connections for T0 to history
                    }

                    $t1_array = $this->newAlgo_fetchLinks($t0, $nodes_per_tier);                        # Get T1s for this t0
	                
                    foreach (array_keys($t1_array) as $t1) {                                              # Loop through T1's
                        if (!isset($all_history[$t1][$t0])) {                                                # Do not add link if the opposite has already been added
                            $prev_tier_array[$t1] = 1;
	                        $all_history[$t0][$t1] = 1;
                            $sc_val = $t1_array[$t1]['shared_connections'] / ($t1_array[$t1]['T0_total_connections'] + $t1_array[$t1]['T1_total_connections']); # shared links weighted by total
                            $min_shared_links = (($sc_val < $min_shared_links or $min_shared_links == 0) ? $sc_val : $min_shared_links);
                            $max_shared_links = (($sc_val > $max_shared_links or $max_shared_links == 0) ? $sc_val : $max_shared_links);
                            $data['links'][$links_counter]['source'] = $t0;
                            $data['links'][$links_counter]['target'] = $t1;
                            $data['links'][$links_counter]['val'] = $sc_val;
	                        $new_data['links'][] = $data['links'][$links_counter];      # Add to new_data array
                            $links_counter++;
                            

                            if (!isset($all_history['nodes'][$t1])) {                 # Only add node if it doesn't already exist
                                $data['nodes'][$node_counter]['id'] = $t1;
	                            $data['nodes'][$node_counter]['color'] = 'blue';
                                $data['nodes'][$node_counter]['name'] = $this->makeTitleReadable($t1_array[$t1]['page_title']);
	                            $all_history['nodes'][$t1] = 1;      # Add the page ID to the history array so we can prevent it from being included multiple times
	                            $new_data['nodes'][] = $data['nodes'][$node_counter];
	                            $node_counter++;
                            }
                            $temp_array[] = $t1;                                # Append to temp_array (to feed next t0_array)
                        }
                    }
                }
            }
            $t0_array = $temp_array;
        }

//        if($is_history_request) echo "BEFORE: <pre>" . print_r($data['nodes'], true) . "</pre>";

        $final = array();
        $final['results'] = (empty($prev_results)) ? $data : array_merge_recursive($data, $prev_results);
	    $final['new_data'] = $new_data;

//        if($is_history_request) echo "AFTER: <pre>" . print_r($final['results']['nodes'], true) . "</pre>";

        $final['execution_time'] = microtime(TRUE) - $start_time;
//		$final['target_page_id']    = $T0_page_id;              # Not required - Used to show the target page ID to the user
        $final['target_page_title'] = $T0_page_title;           # Not required - Used to show the target page name to the user
        $final['converted_node'] = $this->used_page_title;
        $final['max_shared_links'] = $max_shared_links;
        $final['min_shared_links'] = $min_shared_links;

//		// Get the last set of the previous request
//		$key      = key(end($data['nodes']));                   # Get the T0 in the previous request
//		$t0_array = $previous_tier[$key];                       # Set t0_array

        $final['history']['prev_tier'] = $prev_tier_array;                    # Set of prev T1s to feed next t0_array
        $final['history']['results'] = $final['results'];
        $final['history']['node_counter'] = $node_counter;
        $final['history']['links_counter'] = $links_counter;
	    $final['history']['all_history'] = $all_history;
        echo json_encode($final);
    }


    public function getPageId($user_input)
    {
        // If the user entered a wikipedia URL
        if (preg_match("/https:\/\//i", $user_input)) {             # If the user entered a URL e.g. https://en.wikipedia.org/wiki/The_Simpsons
            preg_match('/([^\/]*)$/i', $user_input, $matches);      # Get the page_title from the URL
            $page_title = $matches[0];
        } // If the user entered a page title
        else {
            //$page_title = str_replace('_', ' ', $user_input);   # Convert any underscores to spaces
            $page_title = $this->formatInputText($user_input);
        }

        $this->used_page_title = $page_title;
        $page_title = $this->db->cleanText($page_title);
        $result = $this->db->query("	SELECT
												p.page_id,
												p.page_title,
												p.total_connections
											FROM wikimap.pages p
											WHERE
												p.page_title = '$page_title'
											ORDER BY total_connections DESC
											LIMIT 1
                                ");

        $data = array();
        $data['page_id'] = '308';             # Set a fallback page_id (HTTP_404)
        $data['page_title'] = 'Aristotle';
        $data['total_connections'] = '5186';

        if ($result->num_rows) {
            $row = $result->fetch_assoc();
            $data['page_id'] = $row['page_id'];
            $data['page_title'] = $row['page_title'];
            $data['total_connections'] = $row['total_connections'];
        }

        return $data;
    }


    public function formatInputText($user_input)
    {
        $wiki_title = str_replace('_', ' ', $user_input);    # Convert any user entered underscores to spaces
        $wiki_title = strtolower($wiki_title);                           # Convert the entire string to lowercase words
        $wiki_title = ucfirst($wiki_title);                             # Capitalize the first letter of each word
        $wiki_title = trim($wiki_title);                                # Remove leading and trailing spaces from the user's input
        $wiki_title = str_replace(' ', '_', $wiki_title);   # Replace spaces with underscores

        return $wiki_title;
    }


    public function newAlgo_fetchLinks($t0, $nodes_per_tier)
    {
        if (empty($this->starting_node)) {
//            echo "Starting T0: " . $t0;
            $this->starting_node = $t0;
        }

        $t0 = $this->db->cleanText($t0);
        $return_array = array();
        $result = $this->db->query("	SELECT
											pct.T0 AS T0_page_id,
											CAST(p.page_title AS CHAR) AS T0_page_title,
											p.total_connections AS T0_total_connections,
											pct.T1 AS T1_page_id,
											CAST(p2.page_title AS CHAR) AS T1_page_title,
											p2.total_connections as T1_total_connections,
											pct.shared_connections AS T0_T1_shared_connections
										FROM wikimap.connections pct
											LEFT JOIN wikimap.pages p
												ON p.page_id = pct.T0
											LEFT JOIN wikimap.pages p2
												ON p2.page_id = pct.T1
										WHERE
											pct.T0 = '$t0'
										ORDER BY T0_T1_shared_connections DESC
										LIMIT $nodes_per_tier
                                ");
        if ($result->num_rows) {
            while ($row = $result->fetch_assoc()) {
                $T1_page_id = $row['T1_page_id'];
                $return_array[$T1_page_id]['page_title'] = $row['T1_page_title'];
                $return_array[$T1_page_id]['shared_connections'] = $row['T0_T1_shared_connections'];
                $return_array[$T1_page_id]['T0_total_connections'] = $row['T0_total_connections'];
                $return_array[$T1_page_id]['T1_total_connections'] = $row['T1_total_connections'];
            }
        }
        return $return_array;
    }


    public function makeTitleReadable($wiki_title)
    {
        return str_replace('_', ' ', $wiki_title);
    }
}

$class = new Fetch_Ajax_Script_Multi();
$class->classConfig($_POST);           // Uncomment this out
//$class->newAlgo('308');             // Comment this out
?>