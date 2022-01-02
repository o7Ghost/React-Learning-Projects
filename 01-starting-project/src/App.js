import React, {useState} from 'react';
import AddUser from './components/UI/Users/AddUsers';
import UsersList from './components/UI/Users/UserList';

function App() {

  const [usersList, setUsersList] = useState([])

  const addUserHandler = (uName, uAge) => {

    console.log(uName, uAge)

    setUsersList((prevUserList) => {
      return [...prevUserList, {name: uName, age:uAge, id: Math.random.toString()}];
    });
  }

  return (
    <div>
      <AddUser onAddUser={addUserHandler}/>
      <UsersList users={usersList}/>
    </div>
  );
}

export default App;
