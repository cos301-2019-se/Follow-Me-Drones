sudo apt remove libreoffice-* thunderbird firefox
rm -rf ~/Documents ~/Pictures ~/Music ~/Videos ~/Desktop ~/example.desktop
sudo apt install p7zip python3-pip
git clone https://github.com/cos301-2019-se/Follow-Me-Drones.git ~/Follow-Me-Drones
pip3 install -r ~/Folow-Me-Drones/server/requirements.txt
ln -s /usr/local/cuda /opt/cuda
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib' >> ~/.bashrc 
echo 'export PATH=$PATH:/usr/local/cuda/bin' >> ~/.bashrc
echo 'export OPENCV_FFMPEG_CAPTURE_OPTIONS="protocol_whitelist;file,rtp,udp"' >> ~/.bashrc
echo 'alias pip=pip3' >> ~/.bashrc
echo 'alias python=python3' >> ~/.bashrc
source ~/.bashrc