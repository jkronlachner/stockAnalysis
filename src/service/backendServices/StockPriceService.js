import Axios from "axios";

const API_KEY = "d875033e2665cbb2597be493b4cabe9475c50916"
const USERNAME = "veskur_demo"
const PASSWORD = "Zl5HJYpljQlJNYreSh0w"


const ACCESS_TOKEN = null;
const REFRESH_TOKEN = null;
const setTokens = () => {
    const config = {
        url: `${BASE_URL}/gateway/deal/session`,
        method: "POST",
        headers: {
            'X-IG-API-KEY': API_KEY,
            'Version': 3,
        },
        body: JSON.stringify({
            "identifier": USERNAME,
            "password": PASSWORD
        })
    }
    Axios.request(config).then()
}
const requestHeaders = () => {
    if(!ACCESS_TOKEN && !REFRESH_TOKEN){
        setTokens();
    }
    return {
        'X-IG-API-KEY': API_KEY,
        'Version': 3,
    }
}

const BASE_URL = "https://demo-api.ig.com"

const searchMarket = (searchString) => {
    const config = {
        url: `${BASE_URL}/markets?searchTerm=${searchString}`,
        method: 'GET',
        headers: {
            'X-IG-API-KEY': API_KEY
        }
    }

}
