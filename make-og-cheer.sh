#!/bin/bash
FONT_EN_BOLD="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_TH_BOLD="/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf"
FONT_TH_REG="/usr/share/fonts/truetype/tlwg/Loma.ttf"

# Base photo: happy_group_success or team_energy
convert /tmp/happy_group_success.jpg -resize 1200x630^ -gravity center -extent 1200x630 /tmp/base_cheer.jpg

# Dark luxury navy gradient from left to emphasize professional text
convert -size 1200x630 gradient:"rgba(6,16,38,0.95)-rgba(6,16,38,0.30)" /tmp/cheer_grad.png
convert /tmp/base_cheer.jpg /tmp/cheer_grad.png -composite /tmp/c_step1.png

# Ambient cyan accent
convert -size 450x450 radial-gradient:"rgba(0,160,233,0.32)-transparent" /tmp/c_glow.png
convert /tmp/c_step1.png /tmp/c_glow.png -gravity northwest -geometry -80-80 -composite /tmp/c_step2.png

# Add Atomy Logo Badge
convert /tmp/atomy_logo_badge.png -resize 310x /tmp/atomy_badge_c.png
convert /tmp/c_step2.png /tmp/atomy_badge_c.png -gravity northwest -geometry +60+40 -composite /tmp/c_step3.png

# Typography & Badges
convert /tmp/c_step3.png \
  -fill "#38bdf8" -font "$FONT_EN_BOLD" -pointsize 18 -draw "text 65,168 'ATOMY TEAM CELEBRATION & EMPOWERMENT'" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 38 -draw "text 65,225 'ส่งต่อความสำเร็จ และเฉลิมฉลองการเติบโต'" \
  -fill "#06C755" -font "$FONT_TH_BOLD" -pointsize 26 -draw "text 65,275 'ร่วมสร้างทีมธุรกิจระดับโลก 26+ ประเทศ'" \
  -fill "#e2e8f0" -font "$FONT_TH_REG" -pointsize 22 -draw "text 65,335 'ระบบเว็บพ่วงส่งต่อสายงาน และวิดีโอโมเดลธุรกิจ 15 นาที'" \
  -fill "#94a3b8" -font "$FONT_TH_REG" -pointsize 18 -draw "text 65,380 'เครื่องมือผลักดันทีมงานสู่ความสำเร็จ แอด LINE ร่วมสายงานทันที'" \
  -fill "#0284c7" -draw "roundrectangle 65,425 380,480 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 19 -draw "text 95,460 'ระบบขยายทีมฟรี 100%'" \
  -fill "#06C755" -draw "roundrectangle 400,425 650,480 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 19 -draw "text 430,460 'LINE Official Connected'" \
  -fill "#64748b" -font "$FONT_TH_REG" -pointsize 15 -draw "text 65,585 'Absolute Quality, Absolute Price • พลังแห่งการร่วมมือที่ไร้ขีดจำกัด'" \
  -quality 93 public/og-image.jpg

ls -lh public/og-image.jpg
