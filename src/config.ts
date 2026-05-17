import axios from "axios";

export const BASE_URL = "https://baculiform-hypnotically-noah.ngrok-free.dev";

// Required to bypass ngrok browser warning page on all requests
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
