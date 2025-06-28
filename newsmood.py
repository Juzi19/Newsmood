"""
Backend API for newsmood to perform sentiment analysis on news data
"""

import requests
from tokenizer import Tokenizer
from vectorizer import Word2Ind
import torch
from mymodel import SentimentLSTM
from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font
import math

BATCH_SIZE=32

# inits global variables

tokenizer = Tokenizer()
vectorizer = Word2Ind()

#Loading the Sentiment model on GPU if possible
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# vocab size (from the vectorizer), dimensions for the embedding and hidden_dim (fc layer in the NN) as parameters
model = SentimentLSTM(len(vectorizer.get_vocabulary()), 200, 128).to(device)
print(f"Using device {device}")

#Try loading the net
try:
    model.load_state_dict(torch.load('data/model_weights.pth',map_location=device))
    print("Model successfully loaded")
except FileNotFoundError:
    print("No trained weights found")
    exit(1)
    pass

#
# Methods
#

def fetch_news_articles(subject:str, date:str):
    """
    Fetching the latest news and returning it as a json object
    """
    url = ('https://newsapi.org/v2/everything?'
           f'q={subject}&'
           f'from={date}&'
           'language=en&'
           'sortBy=popularity&'
           'apiKey=9bce3bbb520746c78b0564c02f633b76'
           )
    try:
        response = requests.get(url)
    except Exception as error:
        print(f"Error occured when trying to fetch resources \n See log: {error}")
        raise Exception("Error when trying to fetch data from the API")
    
    return response.json()



def evaluate_articles(articles:list):
    """
    Core method to evaluate articles based on their sentiment.

    Parameters:
        articles(list): list of dictionary with latest news articles (keys: title, descritption)
    Return:
        data(dict): Dictionary with the most relevant information (including sentiment) for the articles
    """

    data = {
        "length": len(articles),
        "articles": articles,
        "sentiment": []
    }

    #splitting the articles array up to use them in the model
    print("Analyze sentiment")
    features:list[torch.Tensor] = []
    for i,article in enumerate(articles):
        if article == None or article["title"] == None or article["description"] == None:
            continue
        # tokenize title and description
        title_tokens = tokenizer.load_text(article["title"])
        description_tokens = tokenizer.load_text(article["description"])

        # encode tokens
        title_features = vectorizer.encode([title_tokens]).squeeze()[:30]
        description_features = vectorizer.encode([description_tokens]).squeeze()[:30]

        features.append(title_features)
        features.append(description_features)
    
    # stack tensors together
    features = torch.stack(features).to(device)

    model.eval()

    #Forward Data thorugh the model
    
    for i in range(0,math.ceil(len(articles)*2/BATCH_SIZE)):

        start = i * BATCH_SIZE
        end = min((i + 1) * BATCH_SIZE, len(features))

        batch = [features[j] for j in range(start, end)]  # Liste von 1D-Tensoren
        batch = torch.stack(batch)
        batch.to(device)

        targets = model.forward(batch) #[title2, desc1, title2, desc2]

        for x in range(0, end-start, 2):


            art_ind = i*0.5*BATCH_SIZE


            #add targets from the model to the dictionary
            data["sentiment"].append({
                "date": articles[int(x/2+art_ind)]["publishedAt"],
                "title": articles[int(x/2+art_ind)]["title"],
                "title_sentiment": float(targets[x]),
                "description": articles[int(x/2+art_ind)]["description"],
                "description_sentiment": float(targets[x+1])
            })    
    
    return data

def get_latest_news(subject, date):
    """
    Function to fetch the latest news regarding a specific keyword/subject. Manages API calls and dates
    """
    res = evaluate_articles(fetch_news_articles(subject, date)["articles"])
    #print(res)
    return res


def create_excel(subject:str, sentiment_data:list[dict])->BytesIO:
    """
    Creates an Excel file from the sentiment data
    """
    file_stream = BytesIO()

    # init excel workbook to save data
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = subject
    sheet.append(["Date", "Title", "Title sentiment", "Description", "Description sentiment"])

    # add data to the sheet
    for item in sentiment_data:
        sheet.append([item["date"], item["title"], item["title_sentiment"], item["description"], item["description_sentiment"]])

    # add some comments
    sheet.append(["---", "---", "---", "---", "---"])
    sheet.append(["Negative Sentiment", "Neutral Sentiment", "Positive Sentiment", "", ""])
    sheet.append(["0", "0.5", "1", "", ""])
    sheet.append(["---", "---", "---", "---", "---"])
    sheet.append(["Created by newsmood AI", "", "", "", ""])



    style_sheet(sheet)

    # save the excel file
    file_stream.seek(0)
    workbook.save(file_stream)
    file_stream.seek(0)

    return file_stream

def style_sheet(sheet):
    bold = Font(bold=True)
    # applies font bold to the first row in the sheet
    for cell in next(sheet.iter_rows(min_row=1, max_row=1)):
        cell.font = bold
        

if __name__ == "__main__":
    print(evaluate_articles(fetch_news_articles(subject="Apple", date='2025-06-03')["articles"]))
