#!/usr/bin/env bash
input_file="C:/Users/Charles/PycharmProjects/untitled/pagelinks_small_4.sql"
output_file_1="C:/Users/Charles/PycharmProjects/untitled/shell_output_1.txt"
output_file_2="C:/Users/Charles/PycharmProjects/untitled/shell_output_2.txt"
output_file_3="C:/Users/Charles/PycharmProjects/untitled/shell_output_3.txt"
output_file_4="C:/Users/Charles/PycharmProjects/untitled/shell_output_4.txt"

time sed s/\)\,\(/\\n/g $input_file > $output_file_1		#parse by ),(
time sed /\,0\,.*\,0/!d $output_file_1 > $output_file_2
time sed s/\,0\,\'/\\t/ $output_file_2 > $output_file_3
time sed s/\'\,0/\\t/ $output_file_3 > $output_file_4