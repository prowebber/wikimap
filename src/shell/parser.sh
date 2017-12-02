#!/usr/bin/env bash
input_file="C:/Users/Charles/PycharmProjects/untitled/pagelinks_small_4.sql"
output_file="C:/Users/Charles/PycharmProjects/untitled/shell_output.txt"
# String substitutions
remove_prefix="s/INSERT INTO \`pagelinks\` VALUES (//"
remove_suffix="s/);//"
parse_newline="s/),(/\\n/g"
omit_nonzero_namespace1="s/\\n[^\\n]*,[^0]*,*[^\\n]*\\n/\\n/g"
omit_nonzero_namespace2="s/\\n[^\\n]*',[^0]\\n/\\n/g"
parse_tab1="s/,0,'/\\t/g"
parse_tab2="s/',0/\\t/gp"
# Parse that shit
time LC_ALL=C sed -n "$remove_prefix;$remove_suffix;$parse_newline;$omit_nonzero_namespace1;$omit_nonzero_namespace2;$parse_tab1;$parse_tab2" $input_file > $output_file
