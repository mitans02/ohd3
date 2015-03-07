tar cvf /tmp/play.tar *
scp /tmp/play.tar 192.168.11.38:/home/oimatsu/client
ssh 192.168.11.38 'cd /home/oimatsu/client; tar xvf play.tar; node play.js'
