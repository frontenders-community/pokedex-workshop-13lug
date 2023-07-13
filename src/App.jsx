import { createContext, useContext, useEffect, useState } from "react";

const API_URL = "https://pokeapi.co/api/v2";

function SearchBar({ searchFn }) {
  const [searchInput, setSearchInput] = useState("pikachu");

  function handleChange(e) {
    // searchInput = e.target.value;
    const newSearchInput = e.target.value;
    setSearchInput(newSearchInput);
  }

  return (
    <div className="field has-addons">
      <div className="control is-expanded">
        <input
          type="text"
          className="input"
          value={searchInput}
          onChange={(e) => handleChange(e)}
        />
      </div>
      <div className="control">
        <button
          className="button is-info"
          onClick={() => searchFn(searchInput)}
        >
          Cerca Pokemon
        </button>
      </div>
    </div>
  )
}

function Pokemon({ pokemon }) {
  const { favorites, setFavorites } = useContext(AppContext);
  const isAlreadyFavorite = favorites.find(item => item.id === pokemon.id);

  function handleFavorite() {
    let newFavorites = [];
    if (isAlreadyFavorite) {
      // Rimuovo
      newFavorites = favorites.filter(item => item.id !== pokemon.id);
      setFavorites(newFavorites);
    } else {
      // Aggiunta
      newFavorites = [...favorites, pokemon]
      setFavorites(newFavorites)
    }
    localStorage.setItem("pokedex", JSON.stringify(newFavorites));
  }

  function getStatClass(value) {
    if (value < 40) {
      return "is-danger";
    } else if (value >= 40 && value < 65) {
      return "is-warning";
    } else {
      return "is-success";
    }
  }

  function getTypes() {
    return pokemon.types.map(item => {
      return (
        <span key={item.type.name} className="tag is-medium is-info">
          {item.type.name}
        </span>
      )
    })
  }

  function getStats() {
    return pokemon.stats.map(item => {
      return (
        <p key={item.stat.name}>
          <span>{item.stat.name} - {item.base_stat}</span>
          <progress
            className={`progress is-small ${getStatClass(item.base_stat)}`}
            value={item.base_stat}
            max="100"
          ></progress>
        </p>
      )
    })
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="media">
          <div className="media-left">
            <figure className="image is-128x128">
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            </figure>
          </div>
          <div className="media-content">
            <p className="title is-4">{pokemon.name}</p>
            <p className="subtitle is-6">{pokemon.intro}</p>
            <div className="content tags">
              {
                getTypes()
              }
            </div>
          </div>
        </div>

        <div className="content">
          {
            getStats()
          }
        </div>

        <div className="field has-addons">
          <p className="control">
            <button className="button is-danger is outlined" onClick={handleFavorite}>
              <span>{isAlreadyFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}</span>
              <span className="icon is-small">
                <i className="fas fa-heart"></i>
              </span>
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Favorites() {
  const { favorites } = useContext(AppContext);

  return (
    <div className="box">
      <p className="content">
        Attualmente hai {favorites.length} pokemon nei preferiti
      </p>

      <div className="is-flex">
        {
          favorites.map(item => {
            return (
              <figure key={item.name} className="image is-128x128">
                <img src={item.sprites.front_default} alt={item.name} />
              </figure>
            )
          })
        }
      </div>
    </div>
  )
}

function Pokedex({ pokemon, searchPokemon }) {
  function getPokemonLayout() {
    if (pokemon !== null) {
      return (
        <Pokemon pokemon={pokemon} />
      )
    } else {
      return (
        <h3 className="subtitle is-3">Cerca un pokemon</h3>
      )
    }
  }

  return (
    <>
      <Favorites />
      <SearchBar searchFn={searchPokemon} />

      {
        getPokemonLayout()
      }
    </>
  )
}

const AppContext = createContext(null);

function App() {
  const [pokemon, setPokemon] = useState(null);
  const [favorites, setFavorites] = useState([]);

  async function searchPokemon(pokemon) {
    try {
      const response = await fetch(`${API_URL}/pokemon/${pokemon.toLowerCase()}`);

      if (response.ok) {
        const result = await response.json();
        setPokemon(result);
      }
    } catch (error) {
      console.log("[ERROR]:", error);
    }
  }

  async function searchPokemonIntro(pokemonSpecie) {
    try {
      const response = await fetch(`${API_URL}/pokemon-species/${pokemonSpecie}`);

      if (response.ok) {
        const result = await response.json();
        const findIntro = result.flavor_text_entries
          .find(item => item.language.name === "it");

        if (findIntro) {
          setPokemon((currentPokemon) => {
            return {
              ...currentPokemon,
              intro: findIntro.flavor_text
            }
          })
        }
      }
    } catch (error) {
      console.log("[ERROR]:", error);
    }
  }

  useEffect(() => {
    if (pokemon !== null) {
      searchPokemonIntro(pokemon.species.name)
    }
  }, [pokemon])

  useEffect(() => {
    searchPokemon("bulbasaur");
  }, [])

  useEffect(() => {
    if (localStorage.getItem("pokedex")) {
      const items = JSON.parse(
        localStorage.getItem("pokedex")
      );
      setFavorites(items);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      favorites,
      setFavorites,
    }}>
      <Pokedex pokemon={pokemon} searchPokemon={searchPokemon} />
    </AppContext.Provider>
  )
}

export default App