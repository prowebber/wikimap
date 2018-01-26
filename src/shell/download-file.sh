#!/usr/bin/env bash

# Get the variables passed from the PHP Script
download_url=$1										# The sql.gz URL address
table_name=$2										# The table's name
temp_directory=$3									# The directory where everything is saved
lang_type=$4										# The language abbreviation

# Specify the names for files that will be used
local_filename=$lang_type'-'$table_name'.sql.gz'	# e.g. en-page.sql.gz
sql_filename=$lang_type'-'$table_name'.sql'			# e.g. en-page.sql
output_file=$lang_type'-'$table_name'.txt'			# e.g. en-page.txt

# Change the directory to the temporary file location so we don't have to use full file paths
cd $temp_directory

# Download the file
download_file(){
	local_filename=$1
	download_url=$2
	echo "Downloading $local_filename"
	wget -O $local_filename $download_url		# Download the file
	gzip -d $local_filename						# Unzip the file
}

# Parse the file
parse_data() {
	sql_filename=$1
	table_name=$2
	echo "Parsing $sql_filename"
	remove_prefix="s/INSERT INTO \`"$table_name"\` VALUES (//"
	parse_newline="s/),(/\\n/gp"
	remove_extra="s/',.*//"
	print_id="s/,0,'.*//p"
	print_title="s/.*\?,0,'//p"

	sed -n "$remove_prefix;$parse_newline" $sql_filename | sed -n "$remove_extra;$print_title" > $output_file
	echo "Done parsing $sql_filename"
}


# Get the status of the current file
if [ ! -f $output_file ] ;
	then																	# If table.txt does not exist

		# Download the file from Wikipedia if the table.txt and table.sql do not exist
		if [ ! -f $sql_filename ] ;
			then															# If the SQL file does not exist
				download_file $local_filename $download_url					# Download the file from Wikipedia
			else															# If the SQL file does exist
				# See when the SQL file was last modified
				filemtime=`stat -c %Y $sql_filename`
				currtime=`date +%s`
				datediff=$(( (currtime - filemtime) / 86400 ))

				# Download the file from wikipedia if the table.sql was modified over 5 days ago
				if [ "$datediff" -gt "5" ] ;
					then													# If the file was last modified over 5 days ago
						echo "$output_file last modified $datediff days ago"
						download_file $local_filename $download_url			# Download the file from Wikipedia
				fi
		fi

		parse_data $sql_filename $table_name								# Parse the data
	else																	# If table.txt does exist

		# See when the file was last modified
		filemtime=`stat -c %Y $output_file`
		currtime=`date +%s`
		datediff=$(( (currtime - filemtime) / 86400 ))

		if [ "$datediff" -gt "5" ] ;
			then															# If the file was parsed over 5 days ago
				echo "$output_file last modified $datediff days ago"
				parse_data $sql_filename $table_name						# Parse the data
		fi
fi

# Delete the SQL file if one exists
if [ -f $sql_filename ] ; then							# If the file exists
	echo "Deleted $sql_filename"
	rm $sql_filename
fi

sleep 5
exit 1

# If the file needs to be downloaded
if [ "$do_download" == "1" ] ; then
	echo "Downloading $local_filename"

	# Download the file
	wget -O $local_filename $download_url

	# Unzip the file
	gzip -d $local_filename
fi





# Decide if the file should be parsed
if [ ! -f $output_file ] ; then				# If the output file does not exist
	echo "$output_file does not exist - creating file"
	parse_data $sql_filename $table_name	# Parse the data
fi

# See when the file was last modified
filemtime=`stat -c %Y $output_file`
currtime=`date +%s`
datediff=$(( (currtime - filemtime) / 86400 ))

if [ "$datediff" -gt "5" ] ; then			# If the file was parsed over 5 days ago
	echo "$output_file last modified $datediff days ago"
	parse_data $sql_filename $table_name	# Parse the data
fi

sleep 5







