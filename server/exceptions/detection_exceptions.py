class DetectionException(Exception):
    def __init__(self, err):
        self.strerror = err
        self.args = {err}
    def getMessage(self):
        # super().defualtError()
        return self.strerror

