# UserContext / useReducer

Para este ejemplo, pensemos en una pequeña aplicación que obtiene el perfil de github de un determinado usuario. En este caso, es evidente que la primera vez que accedemos a dicha aplicación, vamos a necesitar realizar una petición a la API de Github para obtener la información correspondiente. Pero, por otra parte, una vez obtenida la información podríamos almacenar la misma en navegador (utilizando localStorage) de forma que en sucesivas veces podemos mostrarla en forma inmediata y sin necesidad de repetir la petición.
Veamos, entonces, de qué manera implementar esta funcionalidad.
En primer lugar, vamos a crear nuestro contexto sobre la base de lo que vimos en la clase anterior, dentro de un archivo context.js:

    import { createContext, useEffect, useState } from "react";

    // Creamos el contexto utilizando createContext()
    export const UserContext = createContext();

    // Creamos el proveedor del contexto que nos permitirá
    // compartir dicho contexto a los componentes hijos.
    const UserContextProvider = ({ children }) => {
    return (
    <UserContext.Provider value={{ user, changeUser }}>
    {children}
    </UserContext.Provider>
    );
    };
    export default UserContextProvider;

Para utilizar dicho contexto dentro de los componentes de nuestra aplicación, vamos a
envolver la misma dentro del proveedor. Esto lo haremos en el archivo index.js:

    root.render(
    <StrictMode>
    {/* Envolvemos nuestra aplicación en el
    proveedor para poder luego utilizar el contexto
    en nuestros componentes */}
    <UserContextProvider>
    <App />
    </UserContextProvider>
    </StrictMode>
    );

Ya hemos creado nuestro contexto. Ahora, es momento de ocuparnos de su contenido.
En este caso, deseamos poder almacenar y compartir la información de un usuario de Github. Además, queremos poder almacenar dicha información utilizando localStorage y poder obtenerla cuando se recarga la página o se ingresa nuevamente en la aplicación.
Para lograr esto, primero vamos a crear dos funciones que nos van a permitir almacenar la información en el localStorage y obtenerla:

    // Creamos una función para obtener los datos del storage
    // y otra para almacenarlos
    const getUserFromStorage = () => {
    const localData = localStorage.getItem("user");
    return localData ? JSON.parse(localData) : [];
    };

    const setUserInStorage = (user) =>
    localStorage.setItem("user", JSON.stringify(user));

Dentro del proveedor de nuestro contexto, vamos a crear un estado que nos permita compartir dicha información y actualizarla en caso de que deseemos cambiar de usuario.
Nuestro proveedor quedaría de la siguiente manera:

    const UserContextProvider = ({ children }) => {
    // Almacenamos la información del usuario para poder
    // compartirla a nuestros componentes. El valor inicial
    // es la información que obtenemos del localStorage
    const [user, setUser] = useState(getUserFromStorage());

    // En caso de que cambie el usuario seleccionado
    // actualizamos la información que se encuentre en
    // el storage
    useEffect(() => {
    setUserInStorage(user);
    }, [user]);

    // Creamos una función para actualizar el usuario
    const changeUser = (user) => setUser(user);

    return (
    // Compartimos el usuario y la función de
    // actualización para poder emplearla en los componentes
    // dentro del contexto
    <UserContext.Provider value={{ user, changeUser }}>
    {children}
    </UserContext.Provider>
    );
    };

    export default UserContextProvider;

Nuestro contexto ya está listo para almacenar la información de un usuario en el storage y
obtenerla como datos iniciales cuando se carga la aplicación.
El último paso es emplear los valores del contexto dentro de un componente de la
aplicación. Para ello, vamos a crear una vista simple que nos permita buscar un usuario y
visualizar su información básica:

    export default function App() {
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
    // que se ocupará de obtener la data de la API de github e
    // invocar a la función de actualización dentro de
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

¡Listo! Ya podemos ingresar un nombre de usuario de github y ver cómo la información
aparece en la pantalla. Además, si recargamos la página vemos que se obtiene dicha
información directamente desde el storage, sin necesidad de realizar una nueva petición a
la API.

De vuelta en nuestra mini aplicación de perfiles de GitHub, vamos a reemplazar el uso de
useState por useReducer.
Comencemos creando nuestra función reductora dentro del archivo context.js:

    // Creamos un reducer para manipular la información y
    // almacenarla en el estado
    export const githubUserReducer = (state, action) => {
    switch (action.type) {
    case "CHANGE_USER":
    // Validamos si el usuario es el mismo que ya tenemos almacenado
    const existingUser = state.username === action.payload.login;
    // Si es un usuario distinto, extraemos las propiedades
    // que deseamos almacenar y las guardamos en el estado
    if (!existingUser) {
    const { name, avatar_url, html_url, login } = action.payload;
    // Nuestro estado es un objeto con estas propiedades
    const newUser = { name, avatar_url, html_url, username: login };
    // En caso de que cambie el usuario seleccionado
    // actualizamos la información que se encuentre en
    // el storage
    setUserInStorage(newUser);

    return newUser;
    }
    return state;
    default:
    return state;
    }
    };

Ahora que ya tenemos definida nuestra acción junto a la forma en la que deseamos
actualizar el estado, reemplazamos el uso de useState dentro del proveedor del contexto:

    const UserContextProvider = ({ children }) => {
    // Reemplazamos el useState por useReducer.
    const [user, dispatch] = useReducer(
    githubUserReducer, // Pasamos nuestro reducer
    {}, // Pasamos un objeto vacío, ya que lo inicializamos en forma
    diferida
    getUserFromStorage // Pasamos la funcion para inicializar el estado en
    forma diferida
    );

    // Nuestra función ahora dispara una acción del tipo CHANGE_USER
    const changeUser = (user) => dispatch({ type: "CHANGE_USER", payload:
    user });

    return (
        // Compartimos el usuario y la función de
    // actualización para poder emplearla en los componentes
    // dentro del contexto
    <UserContext.Provider value={{ user, changeUser }}>
    {children}
    </UserContext.Provider>
    );
    };

Finalmente, al utilizar la función changeUser ya no debemos preocuparnos por extraer las
propiedades que deseamos almacenar en el estado, puesto que de ello se ocupará nuestro
reducer. Por ello, podemos modificar el comportamiento de nuestro componente,
pasándole toda la información tal y como la recibimos de la API:

    const onClick = async () => {
    const data = await fetch(`https://api.github.com/users/${input}`);
    const json = await data.json();

    // Aquí ya no debemos ocuparnos de extraer las propiedades
    // que deseamos almacenar, ya que de ello se
    // ocupará el reducer
    changeUser(json);
    };

De esta manera, veremos que la aplicación sigue funcionando de la forma esperada, pero
hemos simplificado el uso del contexto en los componentes, extrayendo la lógica dentro de
nuestro propio reducer.

**Realizado por :** Sammy Gigi Cantoral Montejo (sgcm14)

<img src ="https://raw.githubusercontent.com/sgcm14/sgcm14/main/sammy.jpg" width="200">
