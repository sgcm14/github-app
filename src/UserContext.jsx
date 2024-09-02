import { createContext, useEffect, useState } from "react";

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

// Creamos el proveedor del contexto que nos permitirá
// compartir dicho contexto a los componentes hijos.
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
