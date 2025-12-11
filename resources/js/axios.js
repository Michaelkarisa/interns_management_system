import axios from "axios";

// Always send XHR headers for Laravel to treat as web request
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Read CSRF token from <meta>
const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

if (token) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
} else {
    console.error("CSRF token missing");
}

export default axios;
