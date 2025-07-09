import { useState, useEffect } from 'react';
import './App.css';

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const MOCK_DOG = {
  name: "Beagle",
  breed_group: "Hound",
  origin: "United Kingdom",
  life_span: "12 - 15 years",
  image: "https://cdn2.thedogapi.com/images/Sy9t9QeEm.jpg"
};

function App() {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDog = async () => {
    setIsLoading(true);
    
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
        "x-api-key": ACCESS_KEY || "DEMO-API-KEY"
      });

      const response = await fetch(
        "https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&has_breeds=true&order=RANDOM&limit=1", 
        { headers }
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const [dog] = await response.json();
      
      if (!dog?.breeds?.[0]) {
        console.warn("No breed data - using mock data");
        setCurrentDog(MOCK_DOG);
        return;
      }

      const breed = dog.breeds[0];
      
      const bannedAttributes = [
        breed.name,
        breed.breed_group,
        breed.origin,
        breed.life_span
      ].filter(Boolean);

      if (bannedAttributes.some(attr => banList.includes(attr))) {
        console.log("Skipping banned breed");
        return fetchDog();
      }

      const processedDog = {
        name: breed.name || "Unknown Breed",
        breed_group: breed.breed_group || "Unknown Group",
        origin: breed.bred_for || "Unknown Purpose",
        life_span: breed.life_span || "Unknown Lifespan",
        image: dog.url
      };

      setCurrentDog(processedDog);
      setHistory(prev => [processedDog, ...prev]);

    } catch (error) {
      console.error("Fetch error:", error);
      setCurrentDog(MOCK_DOG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = (value) => {
    if (value && !banList.includes(value)) {
      setBanList([...banList, value]);
    }
  };

  const removeBan = (value) => {
    setBanList(banList.filter(item => item !== value));
  };

  useEffect(() => {
    
  }, []);

  return (
    <div className="app-container">
      <div className="sidebar history-sidebar">
        <h3>Who have we seen so far?</h3>
        <div className="scroll-container">
          {history.length === 0 ? (
            <p className="empty-message">No history yet</p>
          ) : (
            history.map((dog, index) => (
              <div 
                key={index} 
                className="history-item"
                onClick={() => setCurrentDog(dog)}
              >
                <img src={dog.image} alt={dog.name} />
                <div>
                  <p><strong>{dog.name}</strong></p>
                  <p>{dog.origin}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main-content">
        <header>
          <h1>Pawnder</h1>
          <p>Discover dogs from your wildest dreams!</p>
        </header>

        {currentDog ? (
          <div className={`dog-card ${isLoading ? 'fade-out' : 'fade-in'}`}>
            <h2>{currentDog.name}</h2>
            <img 
              src={currentDog.image} 
              alt={currentDog.name} 
              className="dog-image"
            />
            <div className="attributes">
              <button onClick={() => handleBan(currentDog.breed_group)}>
                {currentDog.breed_group}
              </button>
              <button onClick={() => handleBan(currentDog.origin)}>
                {currentDog.origin}
              </button>
              <button onClick={() => handleBan(currentDog.life_span)}>
                {currentDog.life_span}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Click the button to discover your first dog!</p>
          </div>
        )}

        {/* Moved Discover button below the card */}
        <button 
          onClick={fetchDog} 
          disabled={isLoading}
          className="discover-button"
        >
          {isLoading ? '🐕 Fetching...' : '🐶 Discover Dog'}
        </button>
      </div>

      <div className="sidebar ban-sidebar">
        <h3>Ban List</h3>
        <div className="scroll-container">
          {banList.length === 0 ? (
            <p className="empty-message">No banned items</p>
          ) : (
            banList.map((item, index) => (
              <button 
                key={index} 
                onClick={() => removeBan(item)}
                className="ban-item"
              >
                {item}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;