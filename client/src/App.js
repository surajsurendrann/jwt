import "./App.css";
import { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);

    try {
      await axios.delete("http://localhost:5000/api/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <>
      <Container>
        {user ? (
          <LoginBox>
            <span>
              Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
              <b>{user.username}</b>.
            </span>
            <span>Delete Users:</span>
            <Button onClick={() => handleDelete(1)}>Delete suraj</Button>
            <Button onClick={() => handleDelete(2)}>Delete vib</Button>
            {error && (
              <span className="error">
                You are not allowed to delete this user!
              </span>
            )}
            {success && (
              <span className="success">
                User has been deleted successfully...
              </span>
            )}
          </LoginBox>
        ) : (
          <LoginBox>
            <Title>Login</Title>
            <Form onSubmit={handleSubmit}>
              <Label htmlFor="">Username</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
              <Label htmlFor="">Password</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <Button type="submit">Login</Button>
            </Form>
          </LoginBox>
        )}
      </Container>
    </>
  );
}

export default App;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgb(36, 0, 12);
  background: linear-gradient(
    90deg,
    rgba(36, 0, 12, 1) 0%,
    rgba(121, 9, 118, 1) 43%,
    rgba(0, 212, 255, 1) 100%
  );
`;

const LoginBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: " center";
  align-items: center;
  border: 1px solid green;
  background-color: white;
  padding: 0px 10px 30px 10px;
  border-radius: 10px;
  width: 300px;
  height: 200px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  height: 25px;
  border: 1px solid;
  border-radius: 10px;
  margin: 5px 0px;
  padding-left: 7px;
`;

const Label = styled.label`
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 7px;
  background-color: cyan;
  border: none;
  border-radius: 10px;
`;

const Title = styled.h2``;
