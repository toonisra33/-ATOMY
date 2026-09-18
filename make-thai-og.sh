#!/bin/bash
FONT_EN_BOLD="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_TH_BOLD="/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf"
FONT_TH_REG="/usr/share/fonts/truetype/tlwg/Loma.ttf"

# 1. Base dark luxury canvas 1200x630
convert -size 1200x630 xc:"#071126" /tmp/bg.png

# 2. Product cutout resize and enhance
convert public/images/atomy-masstige-products.png -resize 650x /tmp/prod.png

# 3. Composite product on the right side
convert /tmp/bg.png /tmp/prod.png -gravity east -geometry +20+0 -composite /tmp/step1.png

# 4. Soft deep gradient from left to ensure perfect text readability
convert -size 1200x630 gradient:"rgba(7,17,38,0.95)-rgba(7,17,38,0.25)" /tmp/grad.png
convert /tmp/step1.png /tmp/grad.png -composite /tmp/step2.png

# 5. Composite Typography & Badges
convert /tmp/step2.png \
  -fill "#38bdf8" -font "$FONT_EN_BOLD" -pointsize 20 -draw "text 65,95 'ATOMY GLOBAL NETWORK'" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 42 -draw "text 65,160 'Atomy Satellite Funnel'" \
  -fill "#06C755" -font "$FONT_TH_BOLD" -pointsize 26 -draw "text 65,215 'Absolute Quality, Absolute Price'" \
  -fill "#e2e8f0" -font "$FONT_TH_REG" -pointsize 24 -draw "text 65,280 'ระบบเว็บพ่วงส่งต่อสายงาน และขยายทีมธุรกิจ'" \
  -fill "#94a3b8" -font "$FONT_TH_REG" -pointsize 20 -draw "text 65,325 'วิดีโอบรรยาย 15 นาที • รับลิงก์สมัคร • แอด LINE ทันที'" \
  -fill "#0284c7" -draw "roundrectangle 65,370 380,430 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 20 -draw "text 95,407 'เครื่องมือทำธุรกิจฟรีสำหรับทีม'" \
  -fill "#06C755" -draw "roundrectangle 400,370 650,430 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 20 -draw "text 430,407 'LINE Official Connected'" \
  -fill "#64748b" -font "$FONT_TH_REG" -pointsize 15 -draw "text 65,580 'สมัครฟรี ไม่มีค่าธรรมเนียม • สิทธิ์สมาชิก 26+ ประเทศทั่วโลก'" \
  -quality 92 public/og-image.jpg

ls -lh public/og-image.jpg
file public/og-image.jpg
