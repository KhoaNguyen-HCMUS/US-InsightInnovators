import { ThemeProvider } from './context/themeContext'

function App() {

  return (
    <ThemeProvider> 
      <div className="App">
        <h1>Hello, World!</h1>
      </div>
    </ThemeProvider>
  )
}

export default App
