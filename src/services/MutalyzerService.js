import axios from "axios";

const apiBaseUrl = process.env.VUE_APP_API_URL;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false, // This is the default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  compare(params) {
    return apiClient.get("/compare/", { params });
  },
  nameCheckHgvs(description) {
    return apiClient.get("/name_check/" + encodeURIComponent(description));
  },
  nameCheckSequence(description, params) {
    return apiClient.get("/name_check/" + encodeURIComponent(description), {
      params,
    });
  },
  normalizeAltHgvs(description) {
    return apiClient.get("/normalize_alt/" + encodeURIComponent(description));
  },
  normalizeAltSequence(description, params) {
    return apiClient.get("/normalize_alt/" + encodeURIComponent(description), {
      params,
    });
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
  },
  map(params) {
    return apiClient.get("/map/", { params });
  },
  view(description, params) {
    return apiClient.get("/view_variants/" + encodeURIComponent(description), {
      params,
    });
  },
  relatedReferences(reference_id) {
    return apiClient.get(
      "/related_references/" + encodeURIComponent(reference_id)
    );
  },
};
