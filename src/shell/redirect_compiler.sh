#!/usr/bin/env bash
input_file="C:/Users/Charles/PycharmProjects/untitled/shell_output.txt"
while IFS=$'\t' read -r -a myArray
do
 "${myArray[0]}"
 "${myArray[1]}"
done < $input_file
echo "$myArray[0])"