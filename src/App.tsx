import React from 'react';
import logo from './logo.svg';
import './App.css';

interface Error {
  message: string;
}

interface Country {
  name: string;
  capital: string;
  population: number;
  area: number;
  region: string;
  flag: {
    emoji: string;
    emojiUnicode: string;
    svgFile: string;
    large: string;
    medium: string;
    small: string;
  };
  borders: string[];
  alpha3Code: string;
}

function App() {
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);

  const [query, setQuery] = React.useState('');

  const [filter, setFilter] = React.useState('');

  const [paginate, setPaginate] = React.useState(8);

  const request_headers = new Headers();
  const api_key = process.env.REACT_APP_API_KEY;
  request_headers.append("Authorization", `Bearer ${api_key}`);
  request_headers.append("Content-Type", "application/json");

  const request_options = {
    method: "GET",
    headers: request_headers,
  };

  function handlerErrorsIfAny(response: { ok: boolean; status: number; statusText: string | undefined; json: () => any; }){
    return response.json().then((json: any) => {
      if (!response.ok) {
        throw Error(JSON.parse(JSON.stringify(json)).message);
      }
      return json;
    });
  }

  React.useEffect(() => {
    fetch("https://countryapi.io/api/all", request_options)
      .then(handlerErrorsIfAny)
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        }
      )
      .catch(
        (error) => {
          console.log('catch:',error);
          setIsLoaded(true);
          setError(error);
        }
      )
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const data = Object.values(items);
  const search_parameters = Object.keys(Object.assign({}, ...data));

  function search(items: Country[]) {
    return items.filter(
      (item:Country) =>
        item.region.includes(filter) &&
        search_parameters.some((parameter) =>
          item[parameter as keyof typeof item].toString().toLowerCase().includes(query)
        )
    );
  }

  const filter_items = Array.from(new Set(data.map((item:Country) => item.region)));

  const load_more = () => {
    setPaginate((prevValue) => prevValue + 8);
  };

  return (
    <div className="App">
     <div className="wrapper">
        <div className="search-wrapper">
          <label htmlFor="search-form">
            <input
              type="search"
              name="search-form"
              id="search-form"
              className="search-input"
              placeholder="Search for..."
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="sr-only">Search countries here</span>
          </label>
        </div>
        <div className="select">
          <select
            onChange={(e) => setFilter(e.target.value)}
            className="custom-select"
            aria-label="Filter Countries By Region">
            <option value="">Filter By Region</option>
            {filter_items.map((item) => (
            <option value={item} key={item}>Filter By {item}</option>
            ))}
          </select>
          <span className="focus"></span>
        </div>
        <ul className="card-grid">
          {search(data).slice(0, paginate).map((item:Country) => (
            <li key={item.alpha3Code}>
              <article className="card">
                <div className="card-image">
                  <img src={item.flag.large} alt={item.name} />
                </div>
                <div className="card-content">
                  <h2 className="card-name">{item.name}</h2>
                  <p className="card-text">
                    <span className="card-text-label">Capital:</span>
                    {item.capital}
                  </p>
                  <p className="card-text">
                    <span className="card-text-label">Population:</span>
                    {item.population}
                  </p>
                  <p className="card-text">
                    <span className="card-text-label">Area:</span>
                    {item.area}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <button onClick={load_more}>Load More</button>
      </div>
    </div>
  );
}

export default App;
