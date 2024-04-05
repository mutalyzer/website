<template>
  <div>
    <div class="overline">Affected Protein Description</div>
    <div>
      <Description
        :description="protein.description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{ descriptionRouter: protein.description }"
      />
    </div>
    <div class="overline">Affected Protein Reference Sequence</div>
    <div class="protein-seq">
      <span class="protein-equal">{{ reference[0].seq }}</span>
      <span class="protein-diff">{{ reference[1].seq }}</span>
      <span class="protein-equal">{{ reference[2].seq }}</span>
    </div>
    <div class="overline">Affected Protein Predicted Sequence</div>
    <div class="protein-seq">
      <span class="protein-equal">{{ predicted[0].seq }}</span>
      <span class="protein-diff">{{ predicted[1].seq }}</span>
      <span class="protein-equal">{{ predicted[2].seq }}</span>
      <div v-if="this.fancy_protein" class="overline">Fancy</div>
      <div v-if="this.fancy_protein" class="protein-seq">
        <pre v-html="this.fancy_protein"></pre>
      </div>
      <div v-if="this.fancy_protein_2" class="overline">Fancy</div>
      <div v-if="this.fancy_protein_2" class="protein-seq">
        <pre v-html="this.fancy_protein_2"></pre>
      </div>
    </div>
  </div>
</template>

<script>
import Description from "../components/Description.vue";

export default {
  name: "AffectedProtein",
  components: {
    Description,
  },
  props: {
    protein: null,
  },
  data() {
    return {
      reference: [],
      predicted: [],
      fancy_protein: null,
      fancy_protein_2: null,
    };
  },
  created: function () {
    [this.reference, this.predicted] = this.getParts(this.protein);
    this.fancy_protein = this.fancy(this.protein);
    this.fancy_protein_2 = this.fancy_2(this.protein);
  },
  methods: {
    reverseString(s) {
      return s.split("").reverse().join("");
    },
    getParts(protein) {
      let r = protein.reference;
      let p = protein.predicted;
      var r_prefix = r;
      var p_prefix = p;
      var r_middle = "";
      var p_middle = "";
      var r_suffix = "";
      var p_suffix = "";

      if (
        "position_first" in protein &&
        "position_last_original" in protein &&
        "position_last_predicted" in protein
      ) {
        r_prefix = r.slice(0, protein.position_first);
        p_prefix = p.slice(0, protein.position_first);

        r_middle = r.slice(
          protein.position_first,
          protein.position_last_original
        );
        r_suffix = r.slice(protein.position_last_original, r.length);

        p_middle = p.slice(
          protein.position_first,
          protein.position_last_predicted
        );
        p_suffix = p.slice(protein.position_last_predicted, p.length);
      }

      return [
        [
          { seq: r_prefix, type: "equal" },
          { seq: r_middle, type: "diff" },
          { seq: r_suffix, type: "equal" },
        ],

        [
          { seq: p_prefix, type: "equal" },
          { seq: p_middle, type: "diff" },
          { seq: p_suffix, type: "equal" },
        ],
      ];
    },
    fancy(protein) {
      let seq = protein.reference;
      let blocks = 10;
      let cols = 6;
      let last_pos_index =
        Math.floor(seq.length / (blocks * cols)) * (blocks * cols) + 1;
      let last_pos_index_length = last_pos_index.toString().length;
      let rows = [];
      for (let row = 0; row < Math.ceil(seq.length / (blocks * cols)); row++) {
        let current_seq = seq.slice(
          blocks * cols * row,
          blocks * cols * (row + 1)
        );
        let current_row_fancy = [];

        current_row_fancy.push(
          (blocks * cols * row + 1)
            .toString()
            .padStart(last_pos_index_length, " ")
        );

        for (let i = 0; i < current_seq.length; i += blocks) {
          current_row_fancy.push(current_seq.substr(i, blocks));
        }
        rows.push(current_row_fancy.join(" "));
      }
      return rows.join("<br>");
    },
    fancy_2(protein) {
      let chunk_length = 10;
      let columns = 6;
      console.log(columns);
      let chunks = this.chunkSplit(protein.reference, chunk_length);

      if (
        "position_first" in protein &&
        "position_last_original" in protein &&
        "position_last_predicted" in protein
      ) {
        console.log("we should get the chunk index and seq index");
        console.log(protein.position_first);
        console.log(protein.position_last_original);
        console.log(protein.position_last_predicted);

        let after_i = Math.floor(protein.position_last_original / chunk_length);
        let after_i_i =
          protein.position_last_original -
          Math.floor(protein.position_last_original / chunk_length) *
            chunk_length;
        if (after_i == chunks.length) {
          after_i--;
          after_i_i = chunks[chunks.length - 1].length;
        }
        console.log("should insert at ", after_i, after_i_i);
        chunks[after_i] = this.insertInto(chunks[after_i], after_i_i, "</b>");

        let before_i = Math.floor(protein.position_first / chunk_length);
        let before_i_i =
          protein.position_first -
          Math.floor(protein.position_first / chunk_length) * chunk_length;
        chunks[before_i] = this.insertInto(
          chunks[before_i],
          before_i_i,
          '<b style="color:#FF0000">'
        );
      }
      console.log(chunks);

      let last_pos_index =
        Math.floor(protein.reference.length / (chunk_length * columns)) *
          (chunk_length * columns) +
        1;
      let last_pos_index_length = last_pos_index.toString().length;
      let rows = [];
      for (
        let row = 0;
        row < Math.ceil(protein.reference.length / (chunk_length * columns));
        row++
      ) {
        console.log("row", row);
        let current_row_fancy = [];
        current_row_fancy.push(
          (chunk_length * columns * row + 1)
            .toString()
            .padStart(last_pos_index_length, " ")
        );
        for (let col = 0; col < columns; col++) {
          console.log(row * columns + col);
          current_row_fancy.push(chunks[row * columns + col]);
        }
        rows.push(current_row_fancy.join(" "));
      }
      console.log(rows);
      return rows.join("<br>");
    },
    insertInto(s, i, c) {
      return s.slice(0, i) + c + s.slice(i);
    },
    chunkSplit(s, chunk_length) {
      let chunks = [];
      for (let i = 0; i < s.length; i += chunk_length) {
        chunks.push(s.substr(i, chunk_length));
      }
      return chunks;
    },
  },
};
</script>
<style scoped src="../assets/main.css"></style>
<style lang="scss" scoped>
.protein-description {
  text-decoration: none;
  margin: 0;
  padding: 2px;
  font-family: monospace;
  display: inline;

  color: #004d40;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.protein-seq {
  margin-left: 5px;
  padding: 10px;
  text-decoration: none;
  font-size: 13px;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  display: block;
  color: #004d40;
  background-color: #efefef;
  overflow-x: auto;
}

.protein-equal {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  color: #000000;
  overflow-wrap: break-word;
}

.protein-diff {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  font-weight: bold;
  color: #990000;
  overflow-wrap: break-word;
}
</style>
