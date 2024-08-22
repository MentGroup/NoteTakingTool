import logo from './logo.svg';
import './App.css';

function App() {
  // Add console log statements here to check environment variables
  console.log("OpenAI API Key:", process.env.REACT_APP_OPENAI_API_KEY);
  console.log("Google Credentials Path:", process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
