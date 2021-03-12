<template>
  <div>
    <v-expansion-panels multiple flat class="mb-5" tile v-model="panel">
      <v-expansion-panel>
        <v-expansion-panel-header
          class="overline blue-grey--text text--lighten-2"
          value="true"
        >
          Exon positions
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pt-5">
          <v-data-table
            dense
            :items-per-page="5"
            :headers="exon_headers"
            :items="exon_values"
          ></v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="cds_values">
        <v-expansion-panel-header
          class="overline blue-grey--text text--lighten-2"
        >
          CDS positions
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-data-table
            dense
            :items-per-page="5"
            :headers="cds_headers"
            :items="cds_values"
            :hide-default-footer="true"
          ></v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
export default {
  name: "SelectorShort",
  props: {
    selector: null,
  },
  data() {
    return {
      panel: [0, 1],
      exon_headers: [],
      exon_values: [],
      cds_headers: [],
      cds_values: null,
    };
  },
  created: function () {
    this.getExonValues();
    this.getExonHeaders();
    this.getCdsValues();
    this.getCdsHeaders();
  },
  methods: {
    getExonValues() {
      var output = [];
      for (var i = 0; i < this.selector.exon.g.length; i++) {
        if (this.selector.exon.c) {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1],
            c_s: this.selector.exon.c[i][0],
            c_e: this.selector.exon.c[i][1],
          });
        } else if (this.selector.exon.n) {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1],
            n_s: this.selector.exon.n[i][0],
            n_e: this.selector.exon.n[i][1],
          });
        } else {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1],
          });
        }
      }

      this.exon_values = output;
    },
    getCdsValues() {
      var output = [];
      if (this.selector.cds) {
        output.push({
          name: "0",
          g_s: this.selector.cds.g[0][0],
          g_e: this.selector.cds.g[0][1],
          c_s: this.selector.cds.c[0][0],
          c_e: this.selector.cds.c[0][1],
        });
      }

      if (output.length > 0) {
        this.cds_values = output;
      }
    },
    getExonHeaders() {
      var output = [];
      if (this.selector.exon.c) {
        output.push(
          ...[
            {
              text: "Number",
              value: "name",
              sortable: false,
            },
            { text: "Start (g.)", value: "g_s" },
            { text: "End (g.)", value: "g_e" },
            { text: "Start (c.)", value: "c_s", sortable: false },
            { text: "End (c.)", value: "c_e", sortable: false },
          ]
        );
      } else if (this.selector.exon.n) {
        output.push(
          ...[
            {
              text: "Number",
              value: "name",
            },
            { text: "Start (g.)", value: "g_s" },
            { text: "End (g.)", value: "g_e" },
            { text: "Start (n.)", value: "n_s" },
            { text: "End (n.)", value: "n_e" },
          ]
        );
      }
      this.exon_headers = output;
    },
    getCdsHeaders() {
      var output = [];
      if (this.selector.exon.c) {
        output.push(
          ...[
            {
              text: "Number",
              value: "name",
              sortable: false,
            },
            { text: "Start (g.)", value: "g_s", sortable: false },
            { text: "End (g.)", value: "g_e", sortable: false },
            { text: "Start (c.)", value: "c_s", sortable: false },
            { text: "End (c.)", value: "c_e", sortable: false },
          ]
        );
      }
      this.cds_headers = output;
    },
  },
};
</script>
