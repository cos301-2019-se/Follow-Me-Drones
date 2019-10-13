from exceptions.detection_exceptions import DetectionException
import random
class DetectionController():
    def __init__(self, socket):
        self.previousDetections = []
        self.lastDetectedFrame = 0
        self.newDetections = []

        self.io = socket
        
    def newDetection(self, data):
        # return self.filter(self.detection)
        return self.formatDetection(self.filter(data))

    def formatDetection(self, detection, isHerd):
        detection['image'] = 'img_' + str(detection['frame_id']).zfill(8) + '.jpg'

        if isHerd:
            detection['animal'] = 'multiple ' + detection['objects'][0]['name'] + 's detected'
        else:
            detection['animal'] = detection['objects'][0]['name'] + ' detected'

        return detection

    def filter(self, detection):
        # Server will only check first detection and then each 50th frame thereafter
        if abs(detection['frame_id'] - self.lastDetectedFrame) > 50 or self.lastDetectedFrame == 0:

            # If theres been over 100 frames without a detection, erase the list of old previousDetections as the camera has probably moved long past the last animal
            if abs(detection['frame_id'] - self.lastDetectedFrame) > 100:
                self.previousDetections = []

            self.lastDetectedFrame = detection['frame_id']

            dX = dY = threshX = threshY = 0
            animalAlreadyDetected = False

            # Count how many of each animal are present in the frame
            animalCounters = {}
            for detectedAnimal in detection['objects']:
                if detectedAnimal['name'] in animalCounters:
                    animalCounters[detectedAnimal['name']]['count'] += 1
                else:
                    # Initialise the animals details, saving its name as the index, a count for how many of them there are, and its coordinates
                    animalCounters[detectedAnimal['name']] = {}
                    animalCounters[detectedAnimal['name']]['count'] = 1
                    animalCounters[detectedAnimal['name']]['relative_coordinates'] = detectedAnimal['relative_coordinates']

            for detectedAnimal in animalCounters:

                # See if the old list of previousDetections contains the ones now detected
                animalAlreadyDetected = False

                # If there is more than 1 of this type of animal, then handle it as a herd. Else check if its the same animal as previously
                if animalCounters[detectedAnimal]['count'] > 1:
                    for animal in self.previousDetections:
                        # If there exists a previousDetections name equal to the newly detected animal and the herd flag is set, then that animal has already been detected
                        if animal['name'] == detectedAnimal and animal['herd']:
                            animalAlreadyDetected = True
                            break

                    # New detection of a herd
                    if not animalAlreadyDetected:
                        print('\n', '\033[36m', 'New detection!', '\033[37m') # Blue writing
                        print('\tFrame ->', detection['frame_id'])
                        print('\tMultiple ->', detectedAnimal, '\n')

                        detection['isHerd'] = True

                        self.io.emit(formatDetection(detection, True))
                        return detection

                    # Create a new list of the currently detected animals, with herd flag set to true
                    self.newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': True})
                else:
                    # Check if the list of detections animalAlreadyDetected an animal with the same name, and if its position is within the threshold
                    for animal in self.previousDetections:
                        dX = abs(animal['relative_coordinates']['center_x'] - animalCounters[detectedAnimal]['relative_coordinates']['center_x'])
                        dY = abs(animal['relative_coordinates']['center_y'] - animalCounters[detectedAnimal]['relative_coordinates']['center_y'])

                        threshX = 4*animalCounters[detectedAnimal]['relative_coordinates']['width']
                        threshY = 4*animalCounters[detectedAnimal]['relative_coordinates']['height']

                        # If names are the same, and their X and Y coords are within a range of the thresholds, then its considered the same animal
                        if animal['name'] == detectedAnimal and dX < threshX and dY < threshY:
                            animalAlreadyDetected = True

                            # Update the previousDetections center coordinates
                            animal['relative_coordinates']['center_x'] = animalCounters[detectedAnimal]['relative_coordinates']['center_x']
                            animal['relative_coordinates']['center_y'] = animalCounters[detectedAnimal]['relative_coordinates']['center_y']
                            break

                    # New detection of a single animal
                    if not animalAlreadyDetected:
                        print('\n', '\033[36m', 'New detection!', '\033[37m') # Blue writing
                        print('\tFrame ->', detection['frame_id'])
                        print('\tAnimal ->', detectedAnimal, '\n')

                        self.io.emit(formatDetection(detection, False))

                    # Create a new list of the currently detected animals, with the herd flag set to false
                    self.newDetections.append({'name': detectedAnimal, 'relative_coordinates': animalCounters[detectedAnimal]['relative_coordinates'], 'herd': False})

            # Replace the old list with the new list, since the camera is always moving 'forward', you can discard any previousDetections that have fallen out of frame
            self.previousDetections = self.newDetections
            self.newDetections = []