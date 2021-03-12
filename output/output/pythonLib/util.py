import csv
import os
import constants
import numpy
from matplotlib import pyplot

def readData(fileName):
    data = []
    with open(fileName) as csv_file:
        csvReader = csv.reader(csv_file, delimiter=',') # fill_main: ','
        lineCount = 0
        for row in csvReader:
            if lineCount == 0:
                print(f'Column names are {", ".join(row)}')
                lineCount += 1
            else:
                data.append(row)
                lineCount += 1
        print(f'Processed {lineCount} lines.')
    data = numpy.array(data) # numpy arrays support multi-dimensional slicing
    data = data.astype(numpy.float)
    return data

def plotChart(name, chart):
    pyplot.plot(chart)
    pyplot.xlabel('Time')
    pyplot.ylabel(name)
    pyplot.grid(True)
    pyplot.show()


def writeCSV(filepath, name, keys, dict_data):
    print("writeCSV: " + filepath + "/" + name)

    csv_file = filepath + "/"+name
    try:
        with open(csv_file, "w") as outfile:
            writer = csv.writer(outfile)
            writer.writerow(keys)
            writer.writerows(zip(*dict_data.values()))
    except IOError:
        print("I/O error")
    full_path = os.path.abspath(csv_file)
    print("[path]", full_path)

def plotHistory(history, filepath):
    pyplot.figure(figsize=(constants.X_RES / constants.DPI, constants.Y_RES / constants.DPI), dpi=constants.DPI)
    evaluations = history.history.keys()
    i = 1
    writeCSV(filepath, "history.csv", evaluations, history.history)


def plotPrediction(original, prediction, filepath):
    pyplot.figure(figsize=(constants.X_RES / constants.DPI, constants.Y_RES / constants.DPI), dpi=constants.DPI)
    data = {'original': original, 'prediction': prediction, 'difference': original - prediction}
    keys = data.keys()
    writeCSV(filepath, "plotPrediction.csv", keys, data)

# see https://stackoverflow.com/questions/41327601/why-is-binary-crossentropy-more-accurate-than-categorical-crossentropy-for-multi/46004661
def recomputeBinaryAccuracy(output, predict):
    null = 0
    nullTrue = 0;
    nullFalse = 0;
    for i in range(numpy.size(output)):
        if output[i] == 0:
            null += 1
        if output[i] == 0 and predict[i] < 0.5:
            nullTrue += 1
        if output[i] == 0 and predict[i] > 0.5:
            nullFalse += 1
    nullTrue /= null
    nullFalse /= null

    one = 0
    oneTrue = 0;
    oneFalse = 0;
    for i in range(numpy.size(output)):
        if output[i] == 1:
            one += 1
        if output[i] == 1 and predict[i] > 0.5:
            oneTrue += 1
        if output[i] == 1 and predict[i] < 0.5:
            oneFalse += 1
    oneTrue /= one;
    oneFalse /= one;

    print()
    print("macc : %.2f%%" % ((oneTrue * one + nullTrue * null) / (one + null) * 100))
    print("fpos : %.2f%% (vs. %.2f%%)" % (oneFalse * 100, oneTrue * 100))
    print("fneg : %.2f%% (vs. %.2f%%)" % (nullFalse * 100, nullTrue * 100))
