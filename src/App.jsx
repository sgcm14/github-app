import { useContext, useState } from "react";
import { UserContext } from "./UserContext"; 
import "./App.css";

function App() {
  // Accedemos al contexto creado
  const userContext = useContext(UserContext);

  // Obtenemos la información del usuario y la
  // función de actualización.
  const { user, changeUser } = userContext;

  // Creamos un estado para controlar el input que nos permitirá
  // buscar un usuario de Github
  const [input, setInput] = useState(user.username);

  // Vamos a tener un botón que nos permitirá buscar el usuario.
  // Para ello, creamos el controlador del evento "click",
  // que se ocupará de obtener la data de la API de github e // invocar a la función de actualización dentro de
  // nuestro contexto.
  const onClick = async () => {
    const data = await fetch(`https://api.github.com/users/${input}`);
    const json = await data.json();

    const { name, avatar_url, html_url, login } = json;

    changeUser({ name, avatar_url, html_url, username: login });
  };

  return (
    <div className="App">
      <h1>Perfil de Github</h1>
      <div>
        {/* Tendremos un input y un botón que nos permitirá
    buscar cualquier usuario de GH
    */}
        <input
          placeholder="Ingresa el nombre de usuario"
          defaultValue={user.username}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={onClick}>Ver Perfil</button>

        {/* Mostramos la información básica del usuario y un
    enlace a su perfil de GH 
    */}
        <section>
          <h3>{user.name}</h3>
          <h4>{user.username}</h4>
          <img src={user.avatar_url} alt={user.name} />
          <a href={user.html_url} target="_blank" rel="noreferrer">
            Ver perfil completo
          </a>
        </section>
      </div>
    </div>
  );
}

export default App;
