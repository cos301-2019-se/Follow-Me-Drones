sudo apt remove libreoffice-* thunderbird firefox
sudo rmdir Music/ Pictures/ Videos/
sudo apt install openssh-server p7zip python3-pip
pip install -r ~/Folow-Me-Drones/server/requirements.txt
git clone https://github.com/cos301-2019-se/Follow-Me-Drones.git ~/Follow-Me-Drones
ln -s /usr/local/cuda /opt/cuda
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib' >> ~/.bashrc 
echo 'export PATH=$PATH:/usr/local/cuda/bin' >> ~/.bashrc
echo 'export OPENCV_FFMPEG_CAPTURE_OPTIONS="protocol_whitelist;file,rtp,udp"' >> ~/.bashrc
source ~/.bashrc