#!/usr/bin/env bash
set -euo pipefail
FF=/tmp/pw/node_modules/ffmpeg-static/ffmpeg
cd /home/user/Tray
C=video/animatic/cards
S=video/animatic/seg
F=video/footage
SH=.screenshots
mkdir -p "$S"
COMMON=(-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 24 -video_track_timescale 24000 -an)

# card: full-bleed 1920x1080 PNG -> timed clip w/ fade
card () {
  local id=$1 dur=$2 out=$3
  local fo; fo=$(awk "BEGIN{printf \"%.2f\", $dur-0.30}")
  "$FF" -hide_banner -loglevel error -y -loop 1 -framerate 24 -t "$dur" -i "$C/$id.png" \
    -vf "setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=$fo:d=0.3,format=yuv420p" \
    "${COMMON[@]}" "$S/$out.mp4"; echo "seg $out  ($id, ${dur}s)"
}
# still: real screenshot, fit + pad on dark, fast fade (proof flash)
still () {
  local src=$1 dur=$2 out=$3
  local fo; fo=$(awk "BEGIN{printf \"%.2f\", $dur-0.15}")
  "$FF" -hide_banner -loglevel error -y -loop 1 -framerate 24 -t "$dur" -i "$src" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0e0a06,setsar=1,fade=t=in:st=0:d=0.15,fade=t=out:st=$fo:d=0.15,format=yuv420p" \
    "${COMMON[@]}" "$S/$out.mp4"; echo "seg $out  (flash ${dur}s)"
}
# footage: scale/pad to 1080p, optional speed, fade
foot () {
  local out=$1; shift
  "$FF" -hide_banner -loglevel error -y "$@" "${COMMON[@]}" "$S/$out.mp4"; echo "seg $out  (footage)"
}

card c01-hook    11  01
card c02-stakes  11  02
card c03-trap    13  03
card c04-reveal   8  04
# --- "it's real" proof triptych (real screens, ~0:40) ---
still "$SH/06-student-otp.png"    1.6 05
still "$SH/07-kitchen-ready.png"  1.6 06
still "$SH/08-admin-orders.png"   1.6 07
# --- demo act: student ---
card c05-student 1.3 08
foot 09 -i "$F/student-flow.mp4" -t 12.8 -vf "setpts=0.512*PTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xECE5D6,setsar=1,fps=24,fade=t=in:st=0:d=0.3,fade=t=out:st=12.5:d=0.3,format=yuv420p"
# --- demo act: kitchen ---
card c06-kitchen 1.3 10
foot 11 -ss 3 -t 8 -i "$F/kitchen-advance.mp4" -vf "scale=1920:1080,setsar=1,fps=24,fade=t=in:st=0:d=0.3,fade=t=out:st=7.7:d=0.3,format=yuv420p"
# --- demo act: admin ---
card c07-admin 1.3 12
foot 13 -ss 6 -t 10 -i "$F/admin-feed.mp4" -vf "scale=1920:1080,setsar=1,fps=24,fade=t=in:st=0:d=0.3,fade=t=out:st=9.7:d=0.3,format=yuv420p"
# --- credibility + impact + close ---
card c08-zero    6  14
card c09-rows    5  15
card c10-samosa  5  16
card c11-impact 12  17
card c12-end     9  18

LIST="$S/list.txt"; : > "$LIST"
for n in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18; do echo "file '$n.mp4'" >> "$LIST"; done
"$FF" -hide_banner -loglevel error -y -f concat -safe 0 -i "$LIST" -c copy "$S/_concat.mp4"
"$FF" -hide_banner -loglevel error -y -i "$S/_concat.mp4" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart video/animatic/tray-animatic.mp4

echo "----"; "$FF" -hide_banner -i video/animatic/tray-animatic.mp4 2>&1 | grep -E "Duration|Stream"; ls -la video/animatic/tray-animatic.mp4
