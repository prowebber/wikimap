#!/usr/bin/env bash
input_file="C:/Users/Charles/PycharmProjects/untitled/all_page_links.sql"
output_file="C:/Users/Charles/PycharmProjects/untitled/shell_output_2.txt"
 time sed "s/ //g" $input_file >> $output_file