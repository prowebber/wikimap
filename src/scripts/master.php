<?php
/**
 * Notes:
 *  1) Have to install wget for it to work on Windows
 *      - https://gist.github.com/evanwill/0207876c3243bbb6863e65ec5dc3f058
 */
/* Get the correct directory location regardless of the machine */
$base_uri = str_replace("\src\scripts\master.php", '', $_SERVER['PHP_SELF']) . "\\";

/* URL Locations */
define('BASE_URI', $base_uri);
define('TEMP_FILE', "C:\\Users\\steve\\Dropbox\\tablet\\temp\\");


class Master{
	public function __construct(){
	
	}
	
	
	
	public function classConfig(){
		echo "Starting\n";
		
		$this->downloadFile();
		#$temp_file = TEMP_FILE.'\test.txt';
		
		#exec('C:/Users/steve/Dropbox/server/desktop/client_server/datapeak/public_html/wikimap/src/shell/download-file.sh 2>&1 &', $output, $return_var);
		#echo "HERE:\n".$test;
		#print_r($output);
	}
	
	
	
	/**
	 * Wikipedia Database Dumps: https://dumps.wikimedia.org/enwiki/latest/
	 */
	public function downloadFile(){
		$file_url       = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-category.sql.gz';
		$file_name      = 'test.sql.gz';
		$temp_directory = TEMP_FILE;
		
		
		$url = 'http://www.het.brown.edu/guide/UNIX-password-security.txt';
		exec("C:/Users/steve/Dropbox/server/desktop/client_server/datapeak/public_html/wikimap/src/shell/download-file.sh $file_url $file_name $temp_directory", $output, $return_var);
		print_r($output);
	}
}

$class = new Master();
$class->classConfig();

?>