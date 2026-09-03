#!/bin/zsh

PATH_TO_IMAGES="$1"

find "$PATH_TO_IMAGES" -type f \( \
    -iname "*.jpg" -o \
    -iname "*.jpeg" -o \
    -iname "*.png" \
\) -print0 | while IFS= read -r -d '' file; do

  output="${file%.*}.webp"

  echo "Converting: $file -> $output"

  magick "$file" -alpha off -define webp:method=6 -quality 75 "$output"

done