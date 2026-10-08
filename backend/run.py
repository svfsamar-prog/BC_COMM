import uvicorn
import sys
import os

# Add project root to sys.path
sys.path.insert(0, r"c:\Users\Samar Raj\Desktop\bc comm")

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
