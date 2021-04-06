import axios from "axios";

const ncbiDatasetsBaseUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`;

const apiClient = axios.create({
  baseURL: ncbiDatasetsBaseUrl,
  withCredentials: false, // This is the default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  get_gene_summary(id) {
    return apiClient.get("/esummary.fcgi?db=gene&id=" + id + "&retmode=json");
  },
};
