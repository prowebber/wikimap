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
		$this->showProgress('Starting Script');
		
		// Get the list of files to download
		$files = $this->filesToDownload();
		$this->fileLoop($files);
		
		
	}
	
	
	
	public function filesToDownload(){
		// English
		$files['en']['pages']     = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-page.sql.gz';          # 1,638 MB
		$files['en']['pagelinks'] = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pagelinks.sql.gz';     # 5,710 MB
		$files['en']['redirects'] = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-redirect.sql.gz';      # 120 MB
		
		#$files['en']['page']     = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-category.sql.gz';
		#$files['en']['pagelink'] = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-category.sql.gz';
		#$files['en']['redirect'] = 'https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-category.sql.gz';
		
		return $files;
	}
	
	
	
	public function fileLoop($files){
		foreach(array_keys($files) as $lang){
			foreach($files[$lang] as $file_name => $download_url){
				$this->downloadFile($lang, $file_name, $download_url);                          # Download and unzip the file
			}
		}
	}
	
	
	
	/**
	 * Wikipedia Database Dumps: https://dumps.wikimedia.org/enwiki/latest/
	 *
	 * @param $lang
	 * @param $file_name
	 * @param $download_url
	 */
	public function downloadFile($lang, $file_name, $download_url){
		$temp_directory = TEMP_FILE;
		$this->showProgress('Downloading and unzipping ' . $lang.'-'.$file_name);
		
		// Run the shell script to download the file
		exec("C:/Users/steve/Dropbox/server/desktop/client_server/datapeak/public_html/wikimap/src/shell/download-file.sh $download_url $file_name $temp_directory $lang", $output, $return_var);
	}
	
	
	
	public function showProgress($message, $specs = NULL){
		echo str_pad($message, 30) . $specs . " \n";
	}
}

$class = new Master();
$class->classConfig();

?>