import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get host and port from environment variables or use defaults
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

if __name__ == "__main__":
    print(f"Starting FlexiFi Budget API server at http://{HOST}:{PORT}")
    print("API documentation available at http://localhost:8000/docs")
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True
    )