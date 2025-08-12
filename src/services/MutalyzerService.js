import axios from "axios";

const apiBaseUrl = process.env.VUE_APP_API_URL;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  compare(params, config = {}) {
    return apiClient.get("/compare/", { params, ...config });
  },
  normalizeHgvs(description, config = {}) {
    return apiClient.get(`/normalize/${encodeURIComponent(description)}`, {
      ...config,
    });
  },
  normalizeSequence(description, params, config = {}) {
    return apiClient.get(`/normalize/${encodeURIComponent(description)}`, {
      params,
      ...config,
    });
  },
  normalizeAltHgvs(description, config = {}) {
    return apiClient.get(`/normalize_alt/${encodeURIComponent(description)}`, {
      ...config,
    });
  },
  normalizeAltSequence(description, params, config = {}) {
    return apiClient.get(`/normalize_alt/${encodeURIComponent(description)}`, {
      params,
      ...config,
    });
  },
  positionConvert(params, config = {}) {
    return apiClient.get("/position_convert/", { params, ...config });
  },
  descriptionExtract(params, config = {}) {
    return apiClient.get("/description_extract/", { params, ...config });
  },
  referenceModel(params, config = {}) {
    return apiClient.get("/reference_model/", { params, ...config });
  },
  getSelectors(referenceId, config = {}) {
    return apiClient.get(`/get_selectors/${encodeURIComponent(referenceId)}`, {
      ...config,
    });
  },
  map(params, config = {}) {
    return apiClient.get("/map/", { params, ...config });
  },
  view(description, params, config = {}) {
    return apiClient.get(`/view_variants/${encodeURIComponent(description)}`, {
      params,
      ...config,
    });
  },
  relatedReferences(reference_id, config = {}) {
    return apiClient.get(
      `/related_references/${encodeURIComponent(reference_id)}`,
      { ...config },
    );
  },
  spdiConverter(description, config = {}) {
    return apiClient.get(`/spdi_converter/${encodeURIComponent(description)}`, {
      ...config,
    });
  },
  version(config = {}) {
    return apiClient.get("/version", { ...config });
  },
};
