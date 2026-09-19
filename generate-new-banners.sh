#!/bin/bash
set -e

FONT_TH_BOLD="/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf"
FONT_TH_REG="/usr/share/fonts/truetype/tlwg/Loma.ttf"
FONT_EN_BOLD="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

# ==========================================
# 1. GENERATE DESKTOP BANNER (1200 x 630)
# ==========================================
# Base background: Deep premium navy (#07132b to #020817)
convert -size 1200x630 gradient:"#0a1936-#020817" /tmp/d_bg.png

# Ambient cyan and gold lighting glows
convert -size 500x500 radial-gradient:"rgba(14,165,233,0.32)-transparent" /tmp/d_glow1.png
convert -size 400x400 radial-gradient:"rgba(56,189,248,0.2)-transparent" /tmp/d_glow2.png
convert /tmp/d_bg.png /tmp/d_glow1.png -gravity northwest -geometry -80-80 -composite /tmp/d_step1.png
convert /tmp/d_step1.png /tmp/d_glow2.png -gravity southeast -geometry -50-50 -composite /tmp/d_step2.png

# Product lineup on right
convert public/images/atomy-masstige-products.png -resize 620x /tmp/d_prod.png
convert /tmp/d_step2.png /tmp/d_prod.png -gravity east -geometry +20+10 -composite /tmp/d_step3.png

# Subtle gradient overlay to guarantee text legibility on the left
convert -size 1200x630 gradient:"rgba(5,13,31,0.95)-rgba(5,13,31,0.25)" /tmp/d_dark_grad.png
convert /tmp/d_step3.png /tmp/d_dark_grad.png -composite /tmp/d_step4.png

# Typography & Badges on Desktop
convert /tmp/d_step4.png \
  -fill "#38bdf8" -font "$FONT_EN_BOLD" -pointsize 18 -draw "text 60,85 'ATOMY GLOBAL OPPORTUNITY • ระบบเรียนรู้ออนไลน์ฟรี'" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 38 -draw "text 60,150 'โอกาสสร้างรายได้เสริมควบคู่กับงานประจำ'" \
  -fill "#38bdf8" -font "$FONT_TH_BOLD" -pointsize 30 -draw "text 60,205 'และโอกาสที่แสนเรียบง่าย ที่ใครก็เริ่มได้'" \
  -fill "#cbd5e1" -font "$FONT_TH_REG" -pointsize 22 -draw "text 60,265 'ระบบเรียนรู้ออนไลน์ ดูฟรี 15 นาที พร้อมที่ปรึกษาคอยดูแล'" \
  -fill "#0284c7" -draw "roundrectangle 60,315 280,365 10,10" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 18 -draw "text 80,347 '✓ ไม่มีค่าสมัคร'" \
  -fill "#0369a1" -draw "roundrectangle 295,315 540,365 10,10" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 18 -draw "text 315,347 '✓ ไม่ต้องสต็อกสินค้า'" \
  -fill "#0f766e" -draw "roundrectangle 555,315 760,365 10,10" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 18 -draw "text 575,347 '✓ มีโค้ชดูแล 1:1'" \
  -fill "#dc2626" -draw "roundrectangle 60,395 440,460 14,14" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 22 -draw "text 90,437 'คลิกเลย ดูข้อมูลฟรี 15 นาที'" \
  -fill "#06C755" -draw "roundrectangle 455,395 720,460 14,14" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 20 -draw "text 485,437 'LINE Official ที่ปรึกษา'" \
  -fill "#64748b" -font "$FONT_TH_REG" -pointsize 16 -draw "text 60,580 'SPONSOR-ATOMY.WEB.APP • สินค้าคุณภาพระดับเคาน์เตอร์แบรนด์ ในราคาจับต้องได้'" \
  -quality 93 public/og-image.jpg

# ==========================================
# 2. GENERATE MOBILE SAFE-ZONE BANNER (1080 x 720)
# ==========================================
# Aspect ratio 3:2 with centered tight safe margins (safe from any 1:1 square crop on mobile apps)
convert -size 1080x720 gradient:"#07132b-#020817" /tmp/m_bg.png
convert -size 450x450 radial-gradient:"rgba(14,165,233,0.35)-transparent" /tmp/m_glow.png
convert /tmp/m_bg.png /tmp/m_glow.png -gravity center -composite /tmp/m_step1.png

# Place products compactly at the bottom center-right
convert public/images/atomy-masstige-products.png -resize 440x /tmp/m_prod.png
convert /tmp/m_step1.png /tmp/m_prod.png -gravity southeast -geometry +40+40 -composite /tmp/m_step2.png

# Mobile Gradient overlay
convert -size 1080x720 gradient:"rgba(5,13,31,0.92)-rgba(5,13,31,0.4)" /tmp/m_dark.png
convert /tmp/m_step2.png /tmp/m_dark.png -composite /tmp/m_step3.png

# Mobile Safe typography: Kept away from all edges (safe padding > 70px)
convert /tmp/m_step3.png \
  -fill "#38bdf8" -font "$FONT_EN_BOLD" -pointsize 16 -draw "text 75,95 'ATOMY GLOBAL NETWORK • ดูวิดีโอฟรี 15 นาที'" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 34 -draw "text 75,160 'โอกาสสร้างรายได้เสริมควบคู่กับงานประจำ'" \
  -fill "#38bdf8" -font "$FONT_TH_BOLD" -pointsize 28 -draw "text 75,215 'และโอกาสที่แสนเรียบง่าย'" \
  -fill "#e2e8f0" -font "$FONT_TH_REG" -pointsize 22 -draw "text 75,275 'ระบบเรียนรู้ออนไลน์ ดูฟรี 15 นาที พร้อมที่ปรึกษาคอยดูแล'" \
  -fill "#0284c7" -draw "roundrectangle 75,320 285,370 10,10" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 17 -draw "text 95,352 '✓ สมัครฟรี 100%'" \
  -fill "#0369a1" -draw "roundrectangle 300,320 540,370 10,10" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 17 -draw "text 320,352 '✓ ไม่ต้องสต็อกของ'" \
  -fill "#dc2626" -draw "roundrectangle 75,405 440,465 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 20 -draw "text 105,444 'คลิกดูข้อมูลฟรี 15 นาที'" \
  -fill "#06C755" -draw "roundrectangle 455,405 700,465 12,12" \
  -fill "#ffffff" -font "$FONT_TH_BOLD" -pointsize 19 -draw "text 480,444 'LINE Official ที่ปรึกษา'" \
  -fill "#94a3b8" -font "$FONT_TH_REG" -pointsize 15 -draw "text 75,660 'SPONSOR-ATOMY.WEB.APP • ลิงก์ระบบส่งต่อสายงาน Atomy Satellite'" \
  -quality 93 public/og-image-mobile.jpg

# Copy to dist if dist exists
if [ -d "dist" ]; then
  cp public/og-image.jpg dist/og-image.jpg
  cp public/og-image-mobile.jpg dist/og-image-mobile.jpg
fi

echo "=== Generated Desktop & Mobile Banners Successfully ==="
ls -lh public/og-image*.jpg
