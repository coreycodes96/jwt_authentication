let accessToken = '';
let refreshToken = '';

const decodeJwt = token => {
    let base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

//login
document.querySelector('#loginBtn').addEventListener('click', () => {
    axios.post('http://192.168.1.114:5000/login',{
        username: "Username 1"
    },{
        headers:{
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        console.log(res);
        accessToken = res.data.accessToken;
        refreshToken = res.data.refreshToken;
    })
    .catch(error => {
        console.log(error.response);
    })
});

//posts
document.querySelector('#getPostsBtn').addEventListener('click', () => {
    if(new Date().getTime() > decodeJwt(accessToken).exp * 1000){
        axios.post('http://192.168.1.114:5000/refresh', {
            refreshToken
        }, {
            headers:{
                'Authorization': "Bearer "+ accessToken,
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            accessToken = res.data.newAccessToken;
        })
        .catch(error => {
            console.log(error.response);
        });
    }

    axios.get('http://192.168.1.114:5000/posts', {
        headers:{
            'Authorization': "Bearer "+ accessToken,
            'Content-Type': 'application/json',
        }
    })
    .then(res => {
        console.log(res.data);
    })
    .catch(error => {
        console.log(error.response);
    })
});