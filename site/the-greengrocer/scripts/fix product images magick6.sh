#!/bin/zsh

INPUT_DIR="$1"

cd "$INPUT_DIR" || {
    echo "Folder does NOT exist."
    exit 1
}

for file in *.jpg(N) *.jpeg(N) *.png(N) *.webp(N); do
    echo
    echo "$file"

    base="${file%.*}"
    temp="/tmp/${file:t}.webp"
    trimmed="/tmp/${file:t}-trimmed.webp"

    # get top-left pixel alpha
    alpha=$(convert "$file" \
        -alpha on \
        -format "%[fx:1-a]" \
        -crop 1x1+0+0 \
        info:)

    if [[ "$alpha" == "1" ]]; then
        echo "already transparent - skipping background removal"

        # Convert to WebP rather than just renaming/copying the file.
        convert "$file" \
            -alpha on \
            -define webp:lossless=true \
            "WEBP:$temp"
    else
        # get top-left pixel color
        color=$(convert "$file" \
            -format "%[pixel:p{0,0}]" \
            info:)

        # remove background
        convert "$file" \
            -alpha off \
            -bordercolor "$color" \
            -border 1 \
            \( +clone \
                -fuzz 10% \
                -fill none \
                -floodfill +0+0 "$color" \
                -alpha extract \
                -geometry 200% \
                -blur 0x0.5 \
                -morphology erode square:1 \
                -geometry 50% \
            \) \
            -compose CopyOpacity \
            -composite \
            -shave 1 \
            -define webp:lossless=true \
            "WEBP:$temp"

        echo "removed background!"
    fi

    # find actual image bounds
    geo=$(convert "$temp" \
        -alpha on \
        -channel A \
        -threshold 50% \
        +channel \
        -trim \
        -format "%wx%h+%X+%Y" \
        info:)

    # trim the image
    convert "$temp" \
        -alpha on \
        -crop "$geo" \
        +repage \
        -background none \
        "$trimmed"

    # resize to fit within 256x256
    convert "$trimmed" \
        -resize "256x256>" \
        "$trimmed"

    # centre on 256x256 transparent canvas
    convert \
        -size 256x256 xc:none \
        "$trimmed" \
        -gravity center \
        -composite \
        -define webp:lossless=false \
        -quality 85 \
        "WEBP:$temp"

    # replace original
    mv "$temp" "${base}.webp"

    if [[ "$file" != "${base}.webp" ]]; then
        rm "$file"
    fi

    rm -f "$trimmed"

    echo "cropped $file"
done

echo
echo "done!"