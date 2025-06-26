from mymodel import SentimentLSTM
from vectorizer import Word2Ind
import torch
from pipeline import Pipeline

"""
This code gives you an overview and a practical way to use the Sentiment Analysis model
"""

# load and instanciate model and Encoder
wti = Word2Ind()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#print(wti.encode(tokens))
model = SentimentLSTM(len(wti.get_vocabulary()), 200, 128).to(device)
print(f"Using device {device}")

#Try loading the net
try:
    model.load_state_dict(torch.load('C:/Users/justu/Documents/CS/Machine_Learning/sentiment_analysis/data/model_weights.pth'))
except FileNotFoundError:
    print("No trained weights found")
    exit(1)
    pass

# instanciate a data pipeline for manual import
mypipe = Pipeline("manual")
mypipe.manual_set_text(["I love your car"], [0.5])
mypipe.tokenize()
mypipe.vectorize()
print(mypipe.get_tensors())
mypipe.get_overview()

encoded_tokens, y_labels=mypipe.get_tensors()
inputs = torch.stack([encoded_tokens[0]]).to(device)

model.eval()

print(model.forward(inputs))
print("ERWARTET:", y_labels)





def eval_model(model):
    """
    Evaluate the model by displaying a F1 Score, accuracy and a confusion matrix

    Parameters:
        model: pytorch model for the specific data

    Return:
        accuracy(float): accuray of the model on the test data

    """
    test_pipe = Pipeline("test")
    test_pipe.create_and_split()
    test_pipe.tokenize()
    test_pipe.vectorize()
    print(test_pipe.get_tensors())
    test_pipe.get_overview()

    test_encoded_tokens, test_y_labels=test_pipe.get_tensors()

    model.eval()

    total_number_of_outputs = len(test_encoded_tokens)
    correct_number_of_outputs=0

    y_pred = []


    for i in range(len(test_encoded_tokens)):
        # batch size 1
        inputs = torch.stack([test_encoded_tokens[i]]).to(device)

        outs = model.forward(inputs)
        decision = 0
        #only 1 rep, since batch=1
        for out in outs:
            if out[0]>(2/3):
                decision = 1.0
            elif out[0]>(1/3):
                decision=0.5
            else:
                decision = 0.0
            
            y_pred.append(decision)

            if decision == test_y_labels[i]:
                correct_number_of_outputs+=1

    from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
    import numpy
    import matplotlib.pyplot as plt

    # make sure to copy tensors to cpu storage and remove gradients
    test_y_labels = test_y_labels.numpy()
    y_pred = numpy.array(y_pred)
    test_y_labels = test_y_labels.astype(str)
    y_pred = y_pred.astype(str)


    print(type(test_y_labels))  # type: np.darray
    print(type(y_pred))
    print(numpy.unique(test_y_labels))
    print(numpy.unique(y_pred))

    print(test_y_labels[:10])
    print(y_pred[:10])

    cm = confusion_matrix(test_y_labels, y_pred, labels=["0.0", "0.5", "1.0"])
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Negativ", "Neutral", "Positiv"])
    disp.plot()
    plt.show()

    from sklearn.metrics import classification_report

    
    # Erstelle das Report-Dictionary
    report = classification_report(test_y_labels, y_pred, target_names=["Negativ", "Neutral", "Positiv"], output_dict=True)

    # Extrahiere die F1-Werte pro Klasse
    f1_scores = [report[label]["f1-score"] for label in ["Negativ", "Neutral", "Positiv"]]
    labels = ["Negativ", "Neutral", "Positiv"]

    # Paint diagrams
    plt.figure(figsize=(6, 4))
    plt.bar(labels, f1_scores, color=['tomato', 'gold', 'mediumseagreen'])
    plt.ylim(0, 1)
    plt.title("F1-Score pro Klasse")
    plt.ylabel("F1-Score")
    plt.xlabel("Klasse")
    for i, v in enumerate(f1_scores):
        plt.text(i, v + 0.02, f"{v:.2f}", ha='center', fontsize=10)
    plt.tight_layout()
    plt.show()




    return correct_number_of_outputs/total_number_of_outputs



print("Akkurazität: ", eval_model(model))




