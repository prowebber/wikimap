<?php
   $server   = "localhost"; // MySql host name
   $username = "root"; // MySQL username
   $password = ""; // MySQL password
   $dbname   = "admins"; // MySQL database name
   $table    = "usersvisit"; // MySql table name
   $db=mysql_connect($server,$username,$password) or die(mysql_error());
   mysql_select_db($dbname) or die(mysql_error());
   $results=mysql_query("SELECT * FROM $table LIMIT 30") or die(mysql_error());
$data=array();
while($row=mysql_fetch_assoc($results))
{
    $data[] = $row['idUser'];
}

echo "var origins = " . json_encode($data) . ";";
?>