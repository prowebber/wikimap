<?php

class workerThread extends Thread{
	public function __construct($i){
		$this->i=$i;
	}
	
	public function run(){
		while(true){
			if($this->i == '1'){
				sleep(1);
			}
			echo $this->i;
			sleep(1);
		}
	}
}

for($i=0;$i<4;$i++){
	$workers[$i]=new workerThread($i);
	$workers[$i]->start();
	echo "Loaded $i\n";
}

class AsyncOperation extends Thread {
	
	public function __construct($arg) {
		$this->arg = $arg;
	}
	
	public function run() {
		if ($this->arg) {
			$sleep = mt_rand(1, 10);
			printf('%s: %s  -start -sleeps %d' . "\n", date("g:i:sa"), $this->arg, $sleep);
			sleep($sleep);
			printf('%s: %s  -finish' . "\n", date("g:i:sa"), $this->arg);
		}
	}
}

// Create a array
$stack = array();

//Initiate Multiple Thread
foreach ( range("A", "D") as $i ) {
	$stack[] = new AsyncOperation($i);
}

// Start The Threads
foreach ( $stack as $t ) {
	$t->start();
}
?>