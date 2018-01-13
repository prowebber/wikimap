#!/usr/bin/env bash

# Get the variables passed from the PHP Script
download_url=$1
file_name=$2
temp_directory=$3

# Change the directory to the temporary file location
cd $temp_directory

# Download the file
wget  -O $file_name $download_url

# Unzip the file
gzip -d $file_name