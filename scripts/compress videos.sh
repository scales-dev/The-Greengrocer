#!/bin/zsh

PATH_TO_VIDEOS="$1"

find "$PATH_TO_VIDEOS" -type f -iname "*.mp4" -print0 | while IFS= read -r -d '' file; do

    output="${file%.*}.webm"

    echo "Converting: $file"
    echo "        -> $output"

    ffmpeg -nostdin -i "$file" \
        -c:v libvpx-vp9 \
        -crf 35 \
        -b:v 0 \
        -an \
        -row-mt 1 \
        -y \
        "$output"

done