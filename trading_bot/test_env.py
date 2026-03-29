import os 
from dotenv import load_dotenv 
load_dotenv() 
key = os.getenv("BINANCE_API_KEY", "") 
secret = os.getenv("BINANCE_API_SECRET", "") 
print("KEY LENGTH:", len(key)) 
print("KEY STARTS:", repr(key[:10])) 
print("KEY HAS SPACE:", " " in key) 
print("SECRET LENGTH:", len(secret)) 
print("SECRET STARTS:", repr(secret[:10])) 
print("SECRET HAS SPACE:", " " in secret) 
print("URL:", os.getenv("BINANCE_BASE_URL")) 
