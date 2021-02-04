import axios from "axios";

const apiBaseUrl = `http://127.0.0.1:5000/api/`;
// const apiBaseUrl = `http://v3.mutalyzer.nl/api/`;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false, // This is the default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  nameCheck(description) {
    return apiClient.get("/name_check/" + encodeURIComponent(description));
  },
  positionConvert(params) {
    return apiClient.get("/position_convert/", { params });
  },
  descriptionExtract(params) {
    return apiClient.get("/description_extract/", { params });
  },
  referenceModel(params) {
    return apiClient.get("/reference_model/", { params });
  },
  getSelectors(referenceId) {
    return apiClient.get("/get_selectors/" + encodeURIComponent(referenceId));
  }
};
