import { createContext, useEffect, useReducer, useState } from "react";

// Creamos el contexto utilizando createContext()
export const UserContext = createContext();

// Creamos una función para obtener los datos del storage
// y otra para almacenarlos
const getUserFromStorage = () => {
  const localData = localStorage.getItem("user");
  return localData ? JSON.parse(localData) : [];
};
const setUserInStorage = (user) =>
  localStorage.setItem("user", JSON.stringify(user));

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

// Creamos el proveedor del contexto que nos permitirá
// compartir dicho contexto a los componentes hijos.
const UserContextProvider = ({ children }) => {
  // Almacenamos la información del usuario para poder
  // compartirla a nuestros componentes. El valor inicial
  // es la información que obtenemos del localStorage
  // const [user, setUser] = useState(getUserFromStorage());

  // Reemplazamos el useState por useReducer.
  const [user, dispatch] = useReducer(
    githubUserReducer, // Pasamos nuestro reducer
    {}, // Pasamos un objeto vacío, ya que lo inicializamos en forma diferida
    getUserFromStorage // Pasamos la funcion para inicializar el estado en forma diferida
  );

  // En caso de que cambie el usuario seleccionado
  // actualizamos la información que se encuentre en
  // el storage
  useEffect(() => {
    setUserInStorage(user);
  }, [user]);

  // Creamos una función para actualizar el usuario
  // const changeUser = (user) => setUser(user);

  // Nuestra función ahora dispara una acción del tipo CHANGE_USER
  const changeUser = (user) => dispatch({ type: "CHANGE_USER", payload: user });
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
