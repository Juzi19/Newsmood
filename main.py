from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from newsmood import get_latest_news, create_excel
from datetime import date, timedelta
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO

app = FastAPI()

@app.post("/")
async def root(request: Request):
    # Methode ist POST
    # Lese json value für key name aus dem Body und übergib ihn in die getlatestnews methode
    # lass alles andere unangerühtz
    data = await request.json()
    subject = data.get("name")
    date = data.get("date")
    news_response = get_latest_news(subject, date)
    return JSONResponse(news_response)

@app.post('/xlsx')
async def create_xlsx(request:Request):
    data = await request.json()
    subject = data.get("name")
    sentiment_data = data.get("sentiment_data")
    file_stream:BytesIO  = create_excel(subject, sentiment_data)
    return StreamingResponse(file_stream, media_type="application/octet-stream", headers={
        "Content-Disposition": "attachment; filename=example.xlsx"
    })
