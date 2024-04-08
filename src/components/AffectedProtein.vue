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
    <div v-if="this.fancy_protein_reference" class="overline">
      AFFECTED PROTEIN REFERENCE SEQUENCE
    </div>
    <div v-if="this.fancy_protein_reference" class="protein-seq">
      <pre v-html="this.fancy_protein_reference"></pre>
    </div>
    <div v-if="this.fancy_protein_predicted" class="overline">
      AFFECTED PROTEIN PREDICTED SEQUENCE
    </div>
    <div v-if="this.fancy_protein_predicted" class="protein-seq">
      <pre v-html="this.fancy_protein_predicted"></pre>
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
      fancy_protein_reference: null,
      fancy_protein_predicted: null,
    };
  },
  created: function () {
    [this.reference, this.predicted] = this.getParts(this.protein);
    this.fancy_protein_reference = this.fancy(
      this.protein.reference,
      10,
      6,
      this.protein.position_first,
      this.protein.position_last_original
    );
    this.fancy_protein_predicted = this.fancy(
      this.protein.predicted,
      10,
      6,
      this.protein.position_first,
      this.protein.position_last_predicted
    );
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
    fancy(
      sequence,
      block_length,
      columns,
      position_change_first = null,
      position_change_last = null
    ) {
      let blocks = this.blockSplit(sequence, block_length);

      let after_i = Math.floor(position_change_last / block_length);
      let after_i_i =
        position_change_last -
        Math.floor(position_change_last / block_length) * block_length;
      if (after_i == blocks.length) {
        after_i--;
        after_i_i = blocks[blocks.length - 1].length;
      }
      blocks[after_i] = this.insertInto(blocks[after_i], after_i_i, "</b>");

      let before_i = Math.floor(position_change_first / block_length);
      let before_i_i =
        position_change_first -
        Math.floor(position_change_first / block_length) * block_length;
      blocks[before_i] = this.insertInto(
        blocks[before_i],
        before_i_i,
        '<b style="color:#990000">'
      );
      let rows = this.addPositions(
        sequence,
        blocks,
        block_length,
        columns,
        position_change_first,
        position_change_last
      );
      return rows.join("<br>");
    },
    insertInto(s, i, c) {
      return s.slice(0, i) + c + s.slice(i);
    },
    addPositions(
      sequence,
      blocks,
      block_length,
      columns,
      position_change_first = null,
      position_change_last = null
    ) {
      let last_column_position =
        Math.floor(sequence.length / (block_length * columns)) *
          (block_length * columns) +
        1;
      let last_column_position_length = last_column_position.toString().length;

      let rows = [];
      for (
        let row_i = 0;
        row_i < Math.ceil(sequence.length / (block_length * columns));
        row_i++
      ) {
        let current_row_fancy = [
          (block_length * columns * row_i + 1)
            .toString()
            .padStart(last_column_position_length, " "),
        ];

        let row_position_start = row_i * columns * block_length;
        let row_position_end =
          row_i * columns * block_length + columns * block_length;

        if (position_change_first != null && position_change_last != null) {
          if (
            row_position_start > position_change_first &&
            row_position_start < position_change_last
          ) {
            blocks[row_i * columns] = this.insertInto(
              blocks[row_i * columns],
              0,
              '<b style="color:#990000">'
            );
          }
          if (
            (row_position_start < position_change_first &&
              row_position_end < position_change_last) ||
            (row_position_start > position_change_first &&
              row_position_end < position_change_last)
          ) {
            blocks[row_i * columns + columns - 1] = this.insertInto(
              blocks[row_i * columns + columns - 1],
              blocks[row_i * columns + columns - 1].length,
              "</b>"
            );
          }
        }

        for (let column_i = 0; column_i < columns; column_i++) {
          current_row_fancy.push(blocks[row_i * columns + column_i]);
        }
        rows.push(current_row_fancy.join(" "));
      }
      return rows;
    },
    blockSplit(s, block_length) {
      let chunks = [];
      for (let i = 0; i < s.length; i += block_length) {
        chunks.push(s.substr(i, block_length));
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
  font-size: 0.9em;
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
