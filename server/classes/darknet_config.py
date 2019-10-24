class DarknetConfig():
    def __init__(self, video='african-wildlife.mp4', cfg='animals.cfg', data='animals.data', weights='animals-tiny_last.weights', camera_id=0, url=''):
        self.cfg = 'cfg/' + cfg
        self.weights = 'backup/' + weights
        self.data = 'cfg/' + data
        self.camera_id = str(camera_id)

        if url != '':
            self.video = url
        else:
            self.video = 'data/videos/' + video

