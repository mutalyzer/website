<template>
  <div>
    <v-data-table :headers="headers" :items="values"></v-data-table>
  </div>
</template>

<script>
export default {
  name: "SelectorShort",
  props: {
    selector: null
  },
  data() {
    return {
      headers: [],
      values: []
    };
  },
  created: function() {
    this.getValues();
    this.getHeaders();
  },
  methods: {
    getValues() {
      var output = [];
      for (var i = 0; i < this.selector.exon.g.length; i++) {
        if (this.selector.exon.c) {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1],
            c_s: this.selector.exon.c[i][0],
            c_e: this.selector.exon.c[i][1]
          });
        } else if (this.selector.exon.n) {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1],
            n_s: this.selector.exon.n[i][0],
            n_e: this.selector.exon.n[i][1]
          });
        } else {
          output.push({
            name: i,
            g_s: this.selector.exon.g[i][0],
            g_e: this.selector.exon.g[i][1]
          });
        }
      }
      if (this.selector.cds) {
        output.push({
          name: "CDS",
          g_s: this.selector.cds.g[0][0],
          g_e: this.selector.cds.g[0][1],
          c_s: this.selector.cds.c[0][0],
          c_e: this.selector.cds.c[0][1]
        });
      }

      this.values = output;
    },
    getHeaders() {
      var output = [];
      if (this.selector.exon.c) {
        output.push(
          ...[
            {
              text: "Exon number / CDS",
              value: "name"
            },
            { text: "Start (g.)", value: "g_s" },
            { text: "End (g.)", value: "g_e" },
            { text: "Start (c.)", value: "c_s" },
            { text: "End (c.)", value: "c_e" }
          ]
        );
      } else if (this.selector.exon.n) {
        output.push(
          ...[
            {
              text: "Exon number",
              value: "name"
            },
            { text: "Start (n.)", value: "n_s" },
            { text: "End (n.)", value: "c_e" }
          ]
        );
      }
      this.headers = output;
    }
  }
};
</script>
