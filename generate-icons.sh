#!/bin/bash

# LifeFundies PWA Icon Generator
# This script generates all required PWA icons from logo.jpeg

echo "🌱 Generating LifeFundies PWA Icons..."

# Source logo
SOURCE="public/logo.jpeg"
DEST_DIR="public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Array of icon sizes needed for PWA
sizes=(16 32 72 96 128 144 152 192 384 512)

# Generate each size
for size in "${sizes[@]}"
do
    echo "Creating icon-${size}x${size}.png..."
    sips -z $size $size "$SOURCE" --out "$DEST_DIR/icon-${size}x${size}.png" > /dev/null 2>&1
done

# Create favicon.ico (32x32)
echo "Creating favicon.ico..."
sips -z 32 32 "$SOURCE" --out "public/favicon.ico" > /dev/null 2>&1

echo "✅ All icons generated successfully!"
echo "📍 Icons saved in: $DEST_DIR"
echo ""
echo "Generated icons:"
ls -lh "$DEST_DIR"
