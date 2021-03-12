import util
import sys
import numpy
from tensorflow import keras
from keras import backend
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Dropout, LeakyReLU
from keras.layers import LSTM
from keras.optimizers import SGD

##########################
# ----- Input Vars ----- #
##########################


#trainDataFile = "/Users/paulkrenn/Documents/Schule/POS/JWT_Demo/veskurCoreBackend/targetData.csv"
#inputColumnsVAR = "1,3,4,5,6,7,8,9"
#outputColumnVAR = 0

trainDataFile = sys.argv[1]
inputColumnsVAR = sys.argv[2]
outputColumnVAR = int(sys.argv[3])
filePath = sys.argv[4]
inputColumnsVAR = list(map(int, inputColumnsVAR.split(",")))

print('arg', inputColumnsVAR)


#####################
# ----- HINTS ----- #
#####################

# number of neurons in hidden layers ...
# ... = 2 x numberOfFeatures + 1
# ... ~ trainingSetSize         (aka neurons = number of weights = unknown variables, training set size = number of equations)
# ... = mean(inputNeurons + outputNeurons)
# ... < inputNeurons & > outputNeurons
#
# see also:
# > https://stats.stackexchange.com/questions/181/how-to-choose-the-number-of-hidden-layers-and-nodes-in-a-feedforward-neural-netw


# number of hidden layers ...
# ... = 0: Only capable of representing linear separable functions or decisions.
# ... = 1: Can approximate any function that contains a continuous mapping from one finite space to another.
# ... = 2: Can represent an arbitrary decision boundary to arbitrary accuracy with rational activation functions and can approximate any smooth mapping to any accuracy.
# ... > 2: Additional layers can learn complex representations (sort of automatic feature engineering) for layers.
#
# see also:
# > https://www.heatonresearch.com/2017/06/01/hidden-layers.html
# > https://stats.stackexchange.com/questions/181/how-to-choose-the-number-of-hidden-layers-and-nodes-in-a-feedforward-neural-netw

import enum


class NetworkType(enum.Enum):
    REGRESSION = 1
    BINARY_CLASSIFICATION = 2
    MULTI_CLASSIFICATION = 3


# https://machinelearningmastery.com/custom-metrics-deep-learning-keras-python/
def rmse(y_true, y_pred):
    return backend.sqrt(backend.mean(backend.square(y_pred - y_true), axis=-1))


# from tensorflow.python.client import device_lib
# print(device_lib.list_local_devices())

######################
# ----- CONFIG ----- #
######################

#      0: DATE
#  1: CLOSE.ORIGINAL
#  2: CLOSE.RELATIVIZED
#  3: VOLUME.ORIGINAL
#  4: VOLUME.RELATIVIZED
#      5: TREND_MANU.OFFSET
#      6: TREND_MANU.DISCARD_NEGATIVE
#      7: TREND_MANU.DISCARD_POSITIVE
#      8: TREND_AUTO.OFFSET
#      9: TREND_AUTO.DISCARD_NEGATIVE
#     10: TREND_AUTO.DISCARD_POSITIVE

inputColumns = [
    #    1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30
    #   -----------------------------------------------------------------------------------------------------------------------
    1, 2, 3, 4,  # DAX  (1+10)
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    # MTI    (30) RELA
    #    41, 42,                                                                                                                 # MTI_dt  (2) NORM
    #    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,                                     # IFO    (21) NORM
    #    64, 65,                                                                                                                 # ZEW     (2) NORM
    #    66, 67, 68, 69, 70, 71, 72                                                                                              # HA      (7) NORM
]

# REGRESSION:            5, 6, 7, 8, 9, 10
# BINARY_CLASSIFICATION:    6, 7,    9, 10
# MULTI_CLASSIFICATION:  5,       8
outputColumn = outputColumnVAR
inputColumns = inputColumnsVAR

networkType = NetworkType.REGRESSION
numberOfNeurons = 2 * numpy.size(inputColumns) + 1
dropout = 0.5
# TODO : numberOfLayers = 3

epochs = 150
validationSplit = 0.25

phaseStart = 0
phaseEnd = 4659

data = util.readData(trainDataFile)

#####################
# ----- START ----- #
#####################

# define input
input = data[:, inputColumnsVAR]
# util.plotChart('input[' + str(phaseStart) + ':' + str(phaseEnd) + ',0]', input[phaseStart:phaseEnd, 0])

# define output
output = data[:, outputColumn]  # extracts the fourth column
# util.plotChart('output', output[phaseStart:phaseEnd])


if networkType == NetworkType.REGRESSION:

    # define model
    model = Sequential()
    model.add(Dense(numberOfNeurons, activation='relu', input_dim=numpy.size(input, 1)))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(1))
    model.compile(loss='mse', optimizer='adam', metrics=[rmse])  # 'acc', 'mae'

    # fit model
    history = model.fit(input, output, epochs=epochs, verbose=2, validation_split=validationSplit)
    util.plotHistory(history, filePath)

    # evaluate model
    scores = model.evaluate(input, output, verbose=2)
    for i in range(len(scores)):
        print("%s: %.2f%%" % (model.metrics_names[i], scores[i] * 100))

    # demonstrate prediction
    predict = model.predict(input, verbose=2)
    predict = predict[:, 0]  # predict is a matrix with one column
    predict = numpy.transpose(predict)
    util.plotPrediction(output[phaseStart:phaseEnd], predict[phaseStart:phaseEnd], filePath)

elif networkType == NetworkType.BINARY_CLASSIFICATION:

    numberOfClasses = 2

    model = Sequential()
    model.add(Dense(numberOfNeurons, activation='relu', input_dim=numpy.size(input, 1)))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(1, activation='sigmoid'))
    model.compile(loss='binary_crossentropy', optimizer='rmsprop', metrics=[rmse])  # 'accuracy'

    history = model.fit(input, output, epochs=epochs, verbose=2, validation_split=validationSplit)
    util.plotHistory(history, filePath)

    scores = model.evaluate(input, output, verbose=2)
    for i in range(len(scores)):
        print("%s: %.2f%%" % (model.metrics_names[i], scores[i] * 100))

    predict = model.predict(input, verbose=2)
    predict = predict[:, 0]
    predict = numpy.transpose(predict)
    util.plotPrediction(output[phaseStart:phaseEnd], predict[phaseStart:phaseEnd], filePath)

    util.recomputeBinaryAccuracy(output, predict)

elif networkType == NetworkType.MULTI_CLASSIFICATION:

    numberOfClasses = 3

    for i in range(numpy.size(output)):
        output[i] = output[i] * (numberOfClasses - 1)
    output = keras.utils.to_categorical(output, num_classes=numberOfClasses)

    model = Sequential()
    model.add(Dense(numberOfNeurons, activation='relu', input_dim=numpy.size(input, 1)))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(numberOfNeurons, activation='relu'))
    model.add(Dropout(dropout))
    model.add(Dense(numpy.size(output, 1), activation='softmax'))
    model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=[rmse])  # 'accuracy'

    history = model.fit(input, output, epochs=epochs, verbose=2, validation_split=validationSplit)
    util.plotHistory(history, filePath)

    scores = model.evaluate(input, output, verbose=2)
    for i in range(len(scores)):
        print("%s: %.2f%%" % (model.metrics_names[i], scores[i] * 100))

    predict = model.predict(input, verbose=2)
    for i in range(numberOfClasses):
        util.plotPrediction(numpy.transpose(output[phaseStart:phaseEnd, i]),
                            numpy.transpose(predict[phaseStart:phaseEnd, i]),
                            filePath)

# serialize model
modelJson = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(modelJson)
model.save_weights("model.h5")

print("[finished]")

#####################
# ----- TODOS ----- #
#####################

# LSTM
#
# input = input.reshape((input.shape[0], input.shape[1], 1))
# model.add(LSTM(50, activation='softplus', input_shape=(3, 1)))

# LAYERS
#
# model.add(LeakyReLU(alpha=0.2))
# model.add(Dense(2048, activation='relu'))
# model.add(Dense(64, activation='tanh'))

# screenshot
# model.add(Dense(2048, activation='relu', input_dim=numpy.size(input,1)))
# model.add(Dropout(0.5))
# model.add(Dense(2048, activation='relu'))
# model.add(Dropout(0.5))
# model.add(Dense(numpy.size(output,1), activation='softmax'))
# # sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
# model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=['accuracy'])
