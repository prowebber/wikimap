#!/usr/bin/env bash
input_file="720MB_page.sql"
output_file="shell_output.txt"
# String substitutions
remove_prefix="s/INSERT INTO \`page\` VALUES (//"
remove_suffix="s/);//"
parse_newline="s/),(/\\n/g"
remove_extra_shit="s/','*[^\\n]*[\\n$]/\\n/g"
omit_nonzero_namespace="s/\\n[^\\n]*,[1-9],\\W.*//gp"
# Parse that shit
time LC_ALL=C sed -n "$remove_prefix;$remove_suffix;$parse_newline;$remove_extra_shit;$omit_nonzero_namespace" $input_file > $output_file
