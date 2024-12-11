import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import GridBackground from './components/ui/GridBackground.jsx';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',//url of our graphql server
  cache: new InMemoryCache(), //apollo client uses to cache query results after fetching them
  credentials:"include", //this tells apollo client to send cookies along with every request to the server
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <GridBackground>
      <ApolloProvider client={client}>
      <App />
      </ApolloProvider>
    </GridBackground>
    </BrowserRouter>
  </StrictMode>,
)
