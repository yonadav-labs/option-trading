import React from "react";

const UserContext = React.createContext({
    username: "a",
    setUser: () => { }
});

export default UserContext;