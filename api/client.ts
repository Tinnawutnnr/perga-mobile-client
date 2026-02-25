import axios from "axios";

const client = axios.create({
  baseURL: "http://10.44.169.2:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
