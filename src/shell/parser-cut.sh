#!/usr/bin/env bash
input_file="C:/Users/Charles/PycharmProjects/untitled/all_page_links.sql"
output_file="C:/Users/Charles/PycharmProjects/untitled/shell_output.txt"
# time, locale to C, Remove prefix ; remove last character ; replace "),(" with newline '\n' ; replace any string within ',0,
time LC_ALL=C sed -n "s/INSERT INTO \`pagelinks\` VALUES (// ; s/.$// ; s/),(/\\n/g ; s/\\n[^\\n]*,0,'[^']*',0[^0]*\\n/\\n/g ; s/,0,'/\\t/g ; s/',0/\\t/gp" $input_file > $output_file
