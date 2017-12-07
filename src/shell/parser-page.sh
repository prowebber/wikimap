#!/usr/bin/env bash
input_file="10MB_page.sql"
output_file="shell_output.txt"
# String substitutions
remove_prefix="s/INSERT INTO \`page\` VALUES (//"
remove_suffix="s/);/\\n/"
parse_newline="s/),(/\\n/gp"
#omit_nonzero_namespace1="s/\\n[^\\n]*,[^0]*,*[^\\n]*\\n/\\n/g"
#omit_nonzero_namespace2="s/\\n[^\\n]*',[^0]\\n/\\n/g"
#parse_tab1="s/,0,'/\\t/g"
#parse_tab2="s/',0/\\t/gp"
# Parse that shit
time LC_ALL=C sed -n "$remove_prefix;$remove_suffix;$parse_newline" $input_file > $output_file
