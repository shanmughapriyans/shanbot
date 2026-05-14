// API calls to FastAPI backend
const API_BASE_URL = "http://localhost:8000";

export const sendMessage = async (message) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data; // Expected { response: "text" }
    } catch (error) {
        console.error("Error communicating with twin backend:", error);
        return { response: "error: unable to connect to the digital twin core." };
    }
};
