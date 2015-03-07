MYIP=`ip address show wlan0 | grep '192.168' | awk '{ print $2 }' | awk -F '/' '{ print $1 }'`
sed -e "s/<%= IP %>/$MYIP/" < play.html.tmpl > play.html;
node play.js
