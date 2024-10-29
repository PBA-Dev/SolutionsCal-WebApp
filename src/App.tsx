import React, { useState } from "react";
import styled from "styled-components";
import Calendar from "./components/Calendar";
import EventPopup from "./components/EventPopup";
import AdminInterface from "./components/AdminInterface";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./contexts/AuthContext";

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
`;

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isAdmin } = useAuth();

  return (
    <AppContainer className="container">
      <h1 className="mb-4 d-flex justify-content-center align-items-center">
        <img
          src="https://pflegeberatung-allstars.de/wp-content/uploads/2024/04/Kopie-von-allstars-nobg.png"
          alt="Allstars Solutions Logo"
          style={{ width: "60px", height: "50px", marginRight: "20px" }}
        />
        Allstars Solutions Kalendar
        <img
          src="https://pflegeberatung-allstars.de/wp-content/uploads/2024/04/Kopie-von-allstars-nobg.png"
          alt="Allstars Solutions Logo"
          style={{ width: "60px", height: "50px", marginLeft: "20px" }}
        />
      </h1>

      <Calendar onDateSelect={setSelectedDate} />
      {selectedDate && (
        <EventPopup date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
      {isAdmin ? <AdminInterface /> : <LoginForm />}
    </AppContainer>
  );
};

export default App;
