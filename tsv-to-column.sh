#!/usr/bin/env bash
input_file="pagelinks_parsed.txt"

sed "s/\\t.*//g" $input_file > "pagelinks_id_tsv.txt"
sed "s/.*\\t//g" $input_file > "pagelinks_title_tsv.txt"
