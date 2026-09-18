#!/bin/bash
# 1. Base background 1200x630
convert -size 1200x630 xc:"#071126" /tmp/bg.png

# 2. Products image resize and position
convert public/images/atomy-masstige-products.png -resize 680x /tmp/prod.png

# 3. Combine bg with product on right
convert /tmp/bg.png /tmp/prod.png -gravity east -geometry +30+0 -composite /tmp/step1.png

# 4. Add subtle gradient overlay
convert -size 1200x630 gradient:"#071126-transparent" /tmp/grad.png
convert /tmp/step1.png /tmp/grad.png -compose blend -define compose:args=85,15 -composite /tmp/step2.png

# 5. Add Text Badges
convert /tmp/step2.png \
  -fill "#38bdf8" -font "DejaVu-Sans-Bold" -pointsize 22 -draw "text 70,120 'ATOMY THAILAND NETWORK'" \
  -fill "#ffffff" -font "DejaVu-Sans-Bold" -pointsize 46 -draw "text 70,185 'Atomy Satellite Platform'" \
  -fill "#06C755" -font "DejaVu-Sans-Bold" -pointsize 30 -draw "text 70,235 'Absolute Quality, Absolute Price'" \
  -fill "#cbd5e1" -font "DejaVu-Sans" -pointsize 20 -draw "text 70,300 'ระบบเว็บพ่วงส่งต่อสายงาน และวิดีโอโมเดลธุรกิจ 15 นาที'" \
  -fill "#94a3b8" -font "DejaVu-Sans" -pointsize 18 -draw "text 70,340 'เครื่องมือขยายทีมงานออนไลน์ พร้อมช่องทางติดต่อ LINE Official'" \
  -fill "#0284c7" -draw "roundrectangle 70,390 350,445 10,10" \
  -fill "#ffffff" -font "DejaVu-Sans-Bold" -pointsize 20 -draw "text 95,425 'Official Partner Hub'" \
  -quality 90 public/og-image.jpg

ls -lh public/og-image.jpg
file public/og-image.jpg
