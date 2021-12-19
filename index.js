let accessToken = "";
let refreshToken = "";

axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.headers["Content-Type"] = "application/json";

axios.interceptors.response.use(
  (res) => {
    console.log("REQUEST: ", res);

    if (res.headers["x-access"]) {
      axios.defaults.headers["authorization"] = `Bearer ${res.headers["x-access"]}`;
    }
    if (res.config.url === "/login" && res.status === 200) {
      axios.defaults.headers["authorization"] = `Bearer ${res.data.accessToken}`;
      axios.defaults.headers["x-refresh"] = `Bearer ${res.data.refreshToken}`;
    }
    return res;
  },
  (err) => {
    console.error("err: ", err);
    return Promise.reject(err);
  }
);

(function () {
  //login
  document.querySelector("#loginBtn").addEventListener("click", () => {
    axios
      .post("/login", {
        username: "Username 1",
      })
      .catch((error) => {
        console.error(error.response);
      });
  });

  const getPosts = async () => {
    const res = await axios.get("/posts");

    return res.data;
  };

  document.querySelector("#getPostsBtn").addEventListener("click", () => {
    getPosts().then((res) => console.log(res));
  });
})();
