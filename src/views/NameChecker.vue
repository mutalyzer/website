<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Name Checker</h1>
        <p>
          The Name Checker takes the variant description as input and checks
          whether it is correct.
        </p>
        <v-sheet elevation="2" class="pa-10 mt-10">
          <v-text-field
            :rules="rules"
            ref="descriptionInput"
            v-on:keydown.enter="nameCheck"
            v-model="description"
            :label="label"
            :hint="hint"
            :placeholder="placeholder"
            :clearable="true"
            autofocus
          ></v-text-field>

          <div class="examples-list">
            Examples:
            <code
              v-for="(example, index) in examples"
              :key="index"
              @click.prevent="selectExample(index)"
            >
              <span class="example-item">{{ example }}</span>
            </code>
          </div>

          <v-btn
            ref="nameCheck"
            :disabled="!valid"
            class="mt-5"
            :to="{
              name: 'NameChecker',
              params: { descriptionRouter: description }
            }"
          >
            Normalize
          </v-btn>

          <v-overlay :absolute="true" :value="loadingOverlay">
            <div class="text-center">
              <v-progress-circular
                :size="50"
                indeterminate
              ></v-progress-circular>
            </div>
            <div class="text-center">
              <v-btn @click="loadingOverlay = false" class="mt-5">
                Cancel
              </v-btn>
            </div>
          </v-overlay>
        </v-sheet>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          <div v-if="normalizedDescription">
            <h4>Normalized Description</h4>
            <code>
              <span class="example-item">
                <router-link
                  :to="{
                    name: 'NameChecker',
                    params: { descriptionRouter: normalizedDescription }
                  }"
                  >{{ normalizedDescription }}</router-link
                >
              </span></code
            >
          </div>
        </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
const CancelToken = axios.CancelToken;
let cancel;

export default {
  props: ["descriptionRouter"],
  created: function() {
    if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
      this.description = this.descriptionRouter;
      this.nameCheck();
    }
  },
  watch: {
    $route() {
      if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
        this.description = this.descriptionRouter;
        this.nameCheck();
      }
    }
  },
  data: () => ({
    description: null,
    descriptionModel: null,
    referenceModel: null,
    normalizedDescription: null,
    equivalentDescriptions: null,
    proteinDescriptions: null,
    visualize: null,
    sequence: null,
    summary: null,
    errors: null,
    loadingOverlay: false,
    valid: true,
    model: "",
    label: "HGVS Description",
    hint: "",
    placeholder: "",
    rules: [value => !!value || "Required."],
    examples: [
      "NG_012337.1:g.7125G>T",
      // 'NG_012337.1:g.10_11ins[T;10_20inv;NG_008835.1:159_170]',
      // 'NG_008835.1(NR_120672.1):n.159dup',
      // 'NG_012337.1(NM_003002.2):c.274G>T',
      // 'LRG_23:c.159dup',
      "LRG_24:g.5525_5532del"
      // 'LRG_24:c.159dup',
      // 'LRG_24(t3):c.159dup',
      // 'LRG_24(t1):c.159dup',
      // 'LRG_24:g.[5A>T;10_12del]',
      // 'LRG_24:g.[5A>T;13_15del]',
      // 'NC_000024.10:g.100del',
      // 'NG_008835.1:n.100del',
      // 'NM_003002.4:c.1del',
      // 'NR_120672.1:n.159dup'
    ]
  }),
  methods: {
    selectExample: function(index) {
      this.description = this.examples[index];
      this.$refs.descriptionInput.focus();
    },
    nameCheck: function() {
      if (this.description !== null) {
        this.loadingOverlay = true;
        this.summary = null;
        this.errors = null;
        this.equivalentDescriptions = null;
        this.proteinDescriptions = null;
        this.visualize = null;
        this.descriptionModel = null;
        this.referenceModel = null;
        axios
          // .get('http://145.88.35.44/api/name_check/' + this.description, {
          .get("http://127.0.0.1:5000/api/name_check/" + this.description, {
            cancelToken: new CancelToken(function executor(c) {
              // An executor function receives a cancel function as a parameter
              cancel = c;
            })
          })
          .then(response => {
            if (response.data) {
              this.summary = response.data;
              this.loadingOverlay = false;
              this.normalizedDescription =
                response.data["normalized description"];
              if (response.data["errors"]) {
                this.errors = response.data["errors"];
              }
              if (response.data["equivalent descriptions"]) {
                this.equivalentDescriptions =
                  response.data["equivalent descriptions"];
              }
              if (response.data["protein descriptions"]) {
                this.proteinDescriptions =
                  response.data["protein descriptions"];
              }
              if (response.data["visualize"]) {
                this.visualize = response.data["visualize"];
              }
            }
          });
      }
    },
    onShown() {
      // Focus the cancel button when the overlay is showing
      this.$refs.cancel.focus();
    },
    onHidden() {},
    cancel() {
      cancel();
      this.loadingOverlay = false;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.btn {
  margin-top: 5px;
}

.examples-list {
  margin-top: 5px;
}

.example-item {
  display: inline-block;
  color: #1e90ff;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.example-item:hover {
  color: #f2f9f3;
  background-color: #1e90ff;
  cursor: pointer;
}

.v-application code {
  background-color: #ffffff;
}

.v-text-field {
  font-family: monospace;
}

.normalized-description {
  color: #0b9b33;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
