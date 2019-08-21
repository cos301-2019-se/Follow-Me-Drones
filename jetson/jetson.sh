sudo apt remove libreoffice-* thunderbird firefox
rm -rf ~/Documents ~/Pictures ~/Music ~/Videos ~/Desktop ~/example.desktop
sudo apt install p7zip python3-pip
git clone https://github.com/cos301-2019-se/Follow-Me-Drones.git ~/Follow-Me-Drones
#TODO uncomment in merge to master
#wget -P ~/Follow-Me-Drones/object-recognition/src/darknet_/ https://raw.githubusercontent.com/cos301-2019-se/Follow-Me-Drones/master/jetson/Makefile
#wget -P /etc/systemd/system/ https://raw.githubusercontent.com/cos301-2019-se/Follow-Me-Drones/master/jetson/commserver.service
#wget -P ~/ https://raw.githubusercontent.com/cos301-2019-se/Follow-Me-Drones/master/jetson/checkServer.sh
#wget -P ~/ https://raw.githubusercontent.com/cos301-2019-se/Follow-Me-Drones/master/jetson/serverOutput.sh
pip3 install -r ~/Folow-Me-Drones/server/requirements.txt
ln -s /usr/local/cuda /opt/cuda
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib' >> ~/.bashrc 
echo 'export PATH=$PATH:/usr/local/cuda/bin' >> ~/.bashrc
echo 'export OPENCV_FFMPEG_CAPTURE_OPTIONS="protocol_whitelist;file,rtp,udp"' >> ~/.bashrc
echo 'alias pip=pip3' >> ~/.bashrc
echo 'alias python=python3' >> ~/.bashrc
#TODO uncomment when merge into master
#sudo systemctl enable commserver.service
#sudo systemctl start commserver.service
source ~/.bashrc