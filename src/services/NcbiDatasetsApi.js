import axios from "axios";

const ncbiDatasetsBaseUrl = `https://api.ncbi.nlm.nih.gov/datasets/v1alpha/`;

const apiClient = axios.create({
  baseURL: ncbiDatasetsBaseUrl,
  withCredentials: false, // This is the default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  gene_accession(id) {
    return apiClient.get("/gene/accession/" + encodeURIComponent(id));
  },
};
