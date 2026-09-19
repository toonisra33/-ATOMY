#!/bin/bash
FONT_EN_BOLD="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_TH_BOLD="/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf"
FONT_TH_REG="/usr/share/fonts/truetype/tlwg/Loma.ttf"

# Target aspect ratio: 1200x630 (Standard OpenGraph Card 1.91:1)

# Step 1: Crop and resize team celebration photo to 1200x630
# team_presentation_cheer has an authentic modern team learning, smiling, celebrating together
convert /tmp/team_presentation_cheer.jpg -resize 1200x630^ -gravity center -extent 1200x630 /tmp/base_team.jpg

# Step 2: Create a rich, premium dark luxury gradient overlay (Navy & Deep Blue)
# Dark gradient on left for high contrast typography, translucent on right to reveal the authentic smiling team
convert -size 1200x630 gradient:"rgba(5,13,33,0.94)-rgba(5,13,33,0.38)" /tmp/navy_grad.png

# Step 3: Combine base image with gradient
convert /tmp/base_team.jpg /tmp/navy_grad.png -composite /tmp/step1.png

# Step 4: Add subtle golden/cyan ambient lighting glow accents
convert -size 400x400 radial-gradient:"rgba(0,160,233,0.3)-transparent" /tmp/cyan_glow.png
convert /tmp/step1.png /tmp/cyan_glow.png -gravity northwest -geometry -50-50 -composite /tmp/step2.png

# Step 5: Add Atomy Logo Badge (Top Left)
# Clean branded pill badge with Atomy logo
convert /tmp/atomy_logo_badge.png -resize 320x /tmp/atomy_badge_resized.png
convert /tmp/step2.png /tmp/atomy_badge_resized.png -gravity northwest -geometry +60+45 -composite /tmp/step3.png

# Step 6: Overlay Thai and English typography
convert /tmp/step3.png \
  -fill "#38bdf8" -font "$FONT_EN_BOLD" -pointsize 18 -draw "text 65,175 'ATOMY GLOBAL TEAM EMPOWERMENT'" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 38 -draw "text 65,230 'ส่งต่อความสำเร็จ และขยายทีมธุรกิจ'" \
  -fill "#06C755" -font "$FONT_TH_BOLD" -pointsize 26 -draw "text 65,280 'พลังแห่งการเติบโต ไร้ขีดจำกัด 26+ ประเทศ'" \
  -fill "#e2e8f0" -font "$FONT_TH_REG" -pointsize 22 -draw "text 65,340 'ระบบเว็บพ่วงส่งต่อสายงาน และวิดีโอแนะนำธุรกิจ 15 นาที'" \
  -fill "#94a3b8" -font "$FONT_TH_REG" -pointsize 18 -draw "text 65,385 'เคียงข้างทุกก้าวของทีมงาน ด้วยระบบสนับสนุนแบบมืออาชีพ'" \
  -fill "#0284c7" -draw "roundrectangle 65,430 380,485 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 19 -draw "text 95,465 'ระบบขยายทีมฟรี 100%'" \
  -fill "#06C755" -draw "roundrectangle 400,430 650,485 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 19 -draw "text 430,465 'LINE Official Connected'" \
  -fill "#64748b" -font "$FONT_TH_REG" -pointsize 15 -draw "text 65,585 'Absolute Quality, Absolute Price • ร่วมสร้าง Passive Income สู่ความสำเร็จไปด้วยกัน'" \
  -quality 92 public/og-image.jpg

ls -lh public/og-image.jpg
file public/og-image.jpg
