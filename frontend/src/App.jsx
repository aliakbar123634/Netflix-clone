import AppRouter from "./router/AppRouter";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  ProfileProvider,
} from "./context/ProfileContext";


const App = () => {

  return (

    <AuthProvider>

      <ProfileProvider>

        <AppRouter />

      </ProfileProvider>

    </AuthProvider>

  );

};


export default App;